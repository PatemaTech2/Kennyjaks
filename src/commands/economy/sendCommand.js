import { sendQuotedWithFooter } from "../../utils/messageHelper.js"
import { loadPlayerByPhone, savePlayer } from "../../database/playerRepo.js"
import { resolveTarget } from "../../utils/targetResolver.js"
import { TransferReceipt } from "../../canvas/transferReceipt.js"

export async function handleSend(sock, message) {
  const remoteJid = message.key.remoteJid
  const sender = message.key.participant || remoteJid
  const phoneNumber = sender.split("@")[0]

  const player = await loadPlayerByPhone(phoneNumber)
  if (!player) {
    await sendQuotedWithFooter(sock, remoteJid, "You need to register first.\n\nUse /start to begin.", message)
    return
  }

  const text = (message.message?.conversation || message.message?.extendedTextMessage?.text || "").trim()
  const args = text.split(" ")

  if (args.length < 2) {
    await sendQuotedWithFooter(sock, remoteJid, "Usage: /send @user <amount>\nExample: /send @Benimaru 5000", message)
    return
  }

  const target = await resolveTarget(message, phoneNumber)
  if (!target) {
    await sendQuotedWithFooter(sock, remoteJid, "Mention a player with @username or reply to their message.\n\nUsage: /send @Benimaru 5000", message)
    return
  }

  const receiver = target.player
  const amount = parseInt(args[args.length - 1], 10)

  if (!Number.isFinite(amount) || amount <= 0) {
    await sendQuotedWithFooter(sock, remoteJid, "Amount must be a positive number.", message)
    return
  }

  if (receiver.phoneNumber === player.phoneNumber) {
    await sendQuotedWithFooter(sock, remoteJid, "You cannot send money to yourself.", message)
    return
  }

  if (amount > player.wallet) {
    await sendQuotedWithFooter(sock, remoteJid, `Insufficient funds. You have ¥${player.wallet.toLocaleString()}.`, message)
    return
  }

  const walletBefore = player.wallet
  const bankBefore = player.bank
  player.wallet -= amount
  receiver.wallet += amount
  await savePlayer(player)
  await savePlayer(receiver)

  const renderer = new TransferReceipt()
  renderer.setAvatarContext(sock, sender)
  let imageBuffer
  try {
    imageBuffer = await renderer.render(player, receiver, amount, walletBefore, player.wallet, bankBefore, player.bank)
  } catch (err) {
    console.error("TransferReceipt render failed:", err)
    await sendQuotedWithFooter(sock, remoteJid, `❌ Transfer receipt failed.\n${err.message}`, message)
    return
  }

  await sock.sendMessage(remoteJid, { image: imageBuffer }, { quoted: message })

  await sock.sendMessage(receiver.phoneNumber + "@s.whatsapp.net", {
    text: `💴 ${player.name || "Unknown"} sent you ¥${(amount || 0).toLocaleString()}\n\nCurrent Wallet: ¥${(receiver.wallet || 0).toLocaleString()}`
  })
}