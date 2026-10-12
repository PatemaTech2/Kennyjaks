import { sendQuotedWithFooter } from "../../utils/messageHelper.js"
import { loadPlayerByPhone } from "../../database/playerRepo.js"
import { resolveTarget } from "../../utils/targetResolver.js"
import { WalletCard } from "../../canvas/walletCard.js"

export async function handleWallet(sock, message) {
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

  let targetPlayer = player
  if (args.length > 1) {
    const target = await resolveTarget(message, phoneNumber)
    if (target) {
      targetPlayer = target.player
    } else {
      await sendQuotedWithFooter(sock, remoteJid, "Player not found.", message)
      return
    }
  }

  const renderer = new WalletCard()
  renderer.setAvatarContext(sock, sender)
  let imageBuffer
  try {
    imageBuffer = await renderer.render(targetPlayer)
  } catch (err) {
    console.error("WalletCard render failed:", err)
    await sendQuotedWithFooter(sock, remoteJid, `❌ Wallet card failed.\n${err.message}`, message)
    return
  }

  await sock.sendMessage(remoteJid, { image: imageBuffer }, { quoted: message })
}