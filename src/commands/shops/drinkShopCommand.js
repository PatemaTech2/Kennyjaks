import { sendQuotedWithFooter } from "../../utils/messageHelper.js"
import { loadPlayerByPhone } from "../../database/playerRepo.js"
import { ShopService } from "../../services/shop/ShopService.js"
import { ShopPageRenderer } from "../../services/shop/ShopPageRenderer.js"
import { parseShopPage } from "../../utils/shopUtils.js"

export async function handleShopDrink(sock, message) {
  const remoteJid = message.key.remoteJid
  const sender = message.key.participant || remoteJid
  const phoneNumber = sender.split("@")[0]

  const player = await loadPlayerByPhone(phoneNumber)
  if (!player) {
    await sendQuotedWithFooter(sock, remoteJid, "You need to register first.\n\nUse /start to begin.", message)
    return
  }

  const text = (message.parsedCommand?.raw || message.message?.conversation || message.message?.extendedTextMessage?.text || "").trim().toLowerCase()
  const safePage = parseShopPage(text, /\/shop-drink-(\d+)/)

  const shop = ShopService.getShop("drinks")
  if (!shop) {
    await sendQuotedWithFooter(sock, remoteJid, "Shop not found.", message)
    return
  }

  const { items, totalPages, currentPage } = ShopService.getPaginatedItems("drinks", safePage)
  if (items.length === 0) {
    await sendQuotedWithFooter(sock, remoteJid, "This shop has no items.", message)
    return
  }

  const renderer = new ShopPageRenderer()
  const imageBuffer = await renderer.renderShopPage(shop, items, currentPage, totalPages, player.wallet)

  await sock.sendMessage(remoteJid, { image: imageBuffer, caption: "Buy using /buy drinks <item-id>" }, { quoted: message })
}
