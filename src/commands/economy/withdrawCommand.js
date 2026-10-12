import { sendQuotedWithFooter } from "../../utils/messageHelper.js"
import { loadPlayerByPhone, savePlayer } from "../../database/playerRepo.js"
import { globalEconomy } from "../../services/economy/EconomyService.js"
import { WithdrawReceipt } from "../../canvas/withdrawReceipt.js"

export async function handleWithdraw(sock, message) {
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
  const raw = (args[1] || "").toLowerCase()
  let amount = 0
  if (raw === "all") amount = player.bank
  else if (raw === "half") amount = Math.floor(player.bank / 2)
  else amount = parseInt(raw, 10)

  if (!amount || amount <= 0) {
    await sendQuotedWithFooter(sock, remoteJid, "Usage: /withdraw <amount|all|half>", message)
    return
  }

  if (amount > player.bank) {
    await sendQuotedWithFooter(sock, remoteJid, "Insufficient bank balance.", message)
    return
  }

  const walletBefore = player.wallet
  const bankBefore = player.bank
  globalEconomy.withdraw(player, amount)
  await savePlayer(player)

  const renderer = new WithdrawReceipt()
  renderer.setAvatarContext(sock, sender)
  let imageBuffer
  try {
    imageBuffer = await renderer.render(player, amount, walletBefore, player.wallet, bankBefore, player.bank)
  } catch (err) {
    console.error("WithdrawReceipt render failed:", err)
    await sendQuotedWithFooter(sock, remoteJid, `❌ Withdrawal receipt failed.\n${err.message}`, message)
    return
  }

  await sock.sendMessage(remoteJid, { image: imageBuffer }, { quoted: message })
}
