import { makeWASocket, useMultiFileAuthState, DisconnectReason } from "@whiskeysockets/baileys"
import pino from "pino"
import qrcode from "qrcode-terminal"
import readline from "readline"
import path from "path"
import chalk from "chalk"

const SESSION_PATH = "data/sessions"
const BOT_NAME = "KENNYJAKS"
const BOT_NUMBER = process.env.BOT_NUMBER || ""

const logger = pino({ level: "silent" })

const question = (text) => {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  return new Promise((resolve) => {
    rl.question(text, (answer) => {
      resolve(answer)
      rl.close()
    })
  })
}

async function generatePairingCode(sock, phoneNumber) {
  console.log(chalk.cyan.bold("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"))
  console.log(chalk.cyan.bold(BOT_NAME))
  console.log(chalk.cyan.bold("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"))
  console.log(chalk.yellow("Generating pairing code..."))
  try {
    const code = await sock.requestPairingCode(phoneNumber)
    console.log("")
    console.log(chalk.yellow(`\nYour Pairing Code: \x1b[33m${code}\x1b[0m\n`))
    console.log(chalk.gray("Enter this code in WhatsApp > Linked Devices > Link with phone number"))
    console.log(chalk.gray("Or click on your phone number in WhatsApp to pair:"))
    console.log(chalk.gray("https://wa.me/" + phoneNumber))
    console.log(chalk.gray("\nAfter entering the code on your phone, your bot is connected!"))
    console.log(chalk.cyan.bold("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"))
    return true
  } catch (err) {
    console.error(chalk.red("Failed to generate pairing code."))
    console.error(chalk.gray(err.message || err))
    console.log(chalk.gray("Try re-running the bot or check your WhatsApp number format."))
    return false
  }
}

export async function startWhatsApp(onMessage, onGroupJoin) {
  const { state, saveCreds } = await useMultiFileAuthState(SESSION_PATH)

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: false,
    logger,
    syncFullHistory: false,
    markOnlineOnConnect: true
  })

  let qrDisplayed = false
  let pairingDone = false
  let pendingChoice = false

  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect, qr, registered } = update

    if (qr && !qrDisplayed && !pairingDone && !pendingChoice) {
      pendingChoice = true
      qrDisplayed = true
      console.log(chalk.cyan.bold("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"))
      console.log(chalk.cyan.bold(BOT_NAME))
      console.log(chalk.cyan.bold("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"))
      console.log(chalk.yellow("Not registered with WhatsApp. Choose auth method:"))
      console.log(chalk.green("  1) QR Code (default)"))
      console.log(chalk.green("  2) Pairing Code"))
      const choice = await question("Enter choice (1 or 2): ")

      if (choice.trim().toLowerCase() === "2") {
        const phoneNumber = await question("Enter your phone number (with country code, e.g., 911234567890): ")
        await generatePairingCode(sock, phoneNumber.trim())
        pairingDone = true
      } else {
        console.log(chalk.cyan.bold("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"))
        console.log(chalk.cyan.bold(BOT_NAME))
        console.log(chalk.cyan.bold("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"))
        console.log(chalk.yellow("Connecting..."))
        console.log(chalk.gray("██████████████"))
        console.log(chalk.yellow("Scan QR Code"))
        console.log("")
        qrcode.generate(qr, { small: true })
        console.log("")
        console.log(chalk.cyan.bold("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"))
      }
    }

    if (connection === "close") {
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut
      const isBadMac = lastDisconnect?.error?.message?.includes("Bad MAC")
      qrDisplayed = false
      pairingDone = false
      pendingChoice = false
      if (isBadMac) {
        console.log(chalk.red(`Session error - run "npm run clear-session" and restart to fix`))
      } else {
        console.log(chalk.red(`Connection closed. Reconnecting: ${shouldReconnect}`))
      }
      if (shouldReconnect) {
        setTimeout(() => startWhatsApp(onMessage, onGroupJoin), 3000)
      }
    } else if (connection === "open") {
      qrDisplayed = false
      pairingDone = false
      pendingChoice = false
      console.log(chalk.cyan.bold("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"))
      console.log(chalk.cyan.bold(BOT_NAME))
      console.log(chalk.cyan.bold("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"))
      console.log(chalk.green("Status:"))
      console.log(chalk.green.bold("CONNECTED"))
      console.log("")
      console.log(chalk.green("Phone:"))
      const me = sock.user
      if (me) {
        const jid = me.id || ""
        const number = jid.split(":")[0]
        console.log(number)
      } else {
        console.log("Unknown")
      }
      console.log(chalk.cyan.bold("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"))
    }
  })

  sock.ev.on("creds.update", saveCreds)

  if (typeof onGroupJoin === "function") {
    sock.ev.on("group-participants.update", async (update) => {
      try {
        await onGroupJoin(sock, update)
      } catch (err) {
        console.error("Group participant handling error:", err.message || err)
      }
    })
  }

  sock.ev.on("messages.upsert", async ({ messages, type }) => {
    console.log("[KENNYJAKS] messages.upsert fired:", type, "count:", messages?.length)
    for (const msg of messages) {
      console.log("[KENNYJAKS] incoming message id:", msg.key?.id, "from:", msg.key?.remoteJid, "participant:", msg.key?.participant, "fromMe:", msg.key?.fromMe)
      if (!msg.message) {
        console.log("[KENNYJAKS] skipping: no msg.message")
        continue
      }
      try {
        await onMessage(sock, msg)
      } catch (err) {
        console.error("[KENNYJAKS ERROR] onMessage threw:", err)
      }
    }
  })

  // Also try the alternative event name used in some Baileys versions
  sock.ev.on("message:create", async (msg) => {
    console.log("[KENNYJAKS] message:create event fired:", !!msg)
    try {
      await onMessage(sock, msg)
    } catch (err) {
      console.error("[KENNYJAKS ERROR] message:create handling error:", err.message || err)
    }
  })

  sock.ev.on("message", async (msg) => {
    console.log("[KENNYJAKS] message event fired:", !!msg)
    try {
      await onMessage(sock, msg)
    } catch (err) {
      console.error("[KENNYJAKS ERROR] message handling error:", err.message || err)
    }
  })

  // Log all socket events for debugging
  sock.ev.on("connection.update", (update) => {
    console.log("[KENNYJAKS] Connection update:", JSON.stringify(update).substring(0, 200))
  })

  sock.ev.on("creds.update", () => {
    console.log("[KENNYJAKS] Credentials updated")
  })

  // Log any other events
  sock.ev.on("message-receipt.update", (update) => {
    console.log("[KENNYJAKS] Message receipt update:", JSON.stringify(update).substring(0, 200))
  })

  sock.ev.on("chat-unread", (update) => {
    console.log("[KENNYJAKS] Chat unread update:", JSON.stringify(update).substring(0, 200))
  })

  return sock
}