import { sendQuotedWithFooter } from "../../utils/messageHelper.js"
import { loadPlayerByPhone } from "../../database/playerRepo.js"
import { ShopService } from "../../services/shop/ShopService.js"
import { ShopCanvasRenderer } from "../../services/shop/ShopCanvasRenderer.js"

export async function handleShops(sock, message) {
  const remoteJid = message.key.remoteJid
  const sender = message.key.participant || remoteJid
  const phoneNumber = sender.split("@")[0]

  const player = await loadPlayerByPhone(phoneNumber)
  if (!player) {
    await sendQuotedWithFooter(sock, remoteJid, "You need to register first.\n\nUse /start to begin.", message)
    return
  }

  const renderer = new ShopCanvasRenderer()
  const imageBuffer = await renderer.renderShopDistrict()

   await sock.sendMessage(remoteJid, { image: imageBuffer, caption: `💴 Wallet: ¥${(player.wallet || 0).toLocaleString()}` }, { quoted: message })
}
