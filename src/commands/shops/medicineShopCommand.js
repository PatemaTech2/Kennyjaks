import { sendQuotedWithFooter } from "../../utils/messageHelper.js"
import { loadPlayerByPhone } from "../../database/playerRepo.js"
import { ShopService } from "../../services/shop/ShopService.js"
import { ShopPageRenderer } from "../../services/shop/ShopPageRenderer.js"

export async function handleShopMedicine(sock, message) {
  const remoteJid = message.key.remoteJid
  const sender = message.key.participant || remoteJid
  const phoneNumber = sender.split("@")[0]

  const player = await loadPlayerByPhone(phoneNumber)
  if (!player) {
    await sendQuotedWithFooter(sock, remoteJid, "You need to register first.\n\nUse /start to begin.", message)
    return
  }

  const text = (message.parsedCommand?.raw || message.message?.conversation || message.message?.extendedTextMessage?.text || "").trim().toLowerCase()

  let page = 0
  const suffixMatch = text.match(/\/shop-medicine-(\d+)/)
  if (suffixMatch) {
    page = parseInt(suffixMatch[1], 10) - 1
  } else {
    const args = text.split(" ")
    if (args.length > 1 && /^\d+$/.test(args[1])) {
      page = parseInt(args[1], 10) - 1
    }
  }
  const safePage = Math.max(0, page)

  const shop = ShopService.getShop("medicine")
  if (!shop) {
    await sendQuotedWithFooter(sock, remoteJid, "Shop not found.", message)
    return
  }

  const { items, totalPages, currentPage } = ShopService.getPaginatedItems("medicine", safePage)
  if (items.length === 0) {
    await sendQuotedWithFooter(sock, remoteJid, "This shop has no items.", message)
    return
  }

  const renderer = new ShopPageRenderer()
  const imageBuffer = await renderer.renderShopPage(shop, items, currentPage, totalPages, player.wallet)

  await sock.sendMessage(remoteJid, { image: imageBuffer, caption: "Buy using /buy medicine <item-name>" }, { quoted: message })
}
