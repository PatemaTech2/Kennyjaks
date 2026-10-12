import { sendQuotedWithFooter } from "../utils/messageHelper.js"
import { loadPlayerByPhone } from "../database/playerRepo.js"
import { BagCanvasRenderer } from "../services/bag/BagCanvasRenderer.js"

export async function handleBag(sock, message) {
  const remoteJid = message.key.remoteJid
  const sender = message.key.participant || remoteJid
  const phoneNumber = sender.split("@")[0]

  const player = await loadPlayerByPhone(phoneNumber)
  if (!player) {
    await sendQuotedWithFooter(sock, remoteJid, "You need to register first.\n\nUse /start to begin.", message)
    return
  }

  if (!player.equippedBag) {
    await sendQuotedWithFooter(sock, remoteJid, "You don't have a bag equipped.\nPurchase one from /shop-bag", message)
    return
  }

  const renderer = new BagCanvasRenderer()
  const imageBuffer = await renderer.renderBag(player)

  await sock.sendMessage(remoteJid, { image: imageBuffer }, { quoted: message })
}
