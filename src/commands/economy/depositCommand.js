import { sendQuotedWithFooter } from "../../utils/messageHelper.js"
import { loadPlayerByPhone, savePlayer } from "../../database/playerRepo.js"
import { globalEconomy } from "../../services/economy/EconomyService.js"
import { DepositReceipt } from "../../canvas/depositReceipt.js"

export async function handleDeposit(sock, message) {
  const remoteJid = message.key.remoteJid
  const sender = message.key.participant || remoteJid
  const phoneNumber = sender.split("@")[0]

  const player = await loadPlayerByPhone(phoneNumber)
  if (!player) {
    await sendQuotedWithFooter(sock, remoteJid, "You need to register first.\n\nUse /start to begin.", message)
    return
  }

  const text = (message.message.conversation || message.message.extendedTextMessage?.text || "").trim()
  const args = text.split(" ")
  if (args.length < 2) {
    await sendQuotedWithFooter(sock, remoteJid, "Usage: /deposit <amount|all|half>", message)
    return
  }

  const raw = args[1].toLowerCase()
  let amount = 0
  if (raw === "all") amount = player.wallet
  else if (raw === "half") amount = Math.floor(player.wallet / 2)
  else amount = parseInt(raw, 10)

  if (!amount || amount <= 0) {
    await sendQuotedWithFooter(sock, remoteJid, "Invalid amount.", message)
    return
  }

  if (amount > player.wallet) {
    await sendQuotedWithFooter(sock, remoteJid, "Insufficient wallet balance.", message)
    return
  }

  const walletBefore = player.wallet
  const bankBefore = player.bank
  globalEconomy.deposit(player, amount)
  await savePlayer(player)

  const renderer = new DepositReceipt()
  renderer.setAvatarContext(sock, sender)
  let imageBuffer
  try {
    imageBuffer = await renderer.render(player, amount, walletBefore, player.wallet, bankBefore, player.bank)
  } catch (err) {
    console.error("DepositReceipt render failed:", err)
    await sendQuotedWithFooter(sock, remoteJid, `❌ Deposit receipt failed.\n${err.message}`, message)
    return
  }

  await sock.sendMessage(remoteJid, { image: imageBuffer }, { quoted: message })
}
