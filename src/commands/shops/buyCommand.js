import { sendQuotedWithFooter } from "../../utils/messageHelper.js"
import { loadPlayerByPhone } from "../../database/playerRepo.js"
import { ShopService } from "../../services/shop/ShopService.js"
import { ReceiptRenderer } from "../../services/shop/ReceiptRenderer.js"
import { parseItemName, formatItemNotFound } from "../../utils/itemNameParser.js"

export async function handleBuy(sock, message) {
  const remoteJid = message.key.remoteJid
  const sender = message.key.participant || remoteJid
  const phoneNumber = sender.split("@")[0]

  const player = await loadPlayerByPhone(phoneNumber)
  if (!player) {
    await sendQuotedWithFooter(sock, remoteJid, "You need to register first.\n\nUse /start to begin.", message)
    return
  }

  const rawCommand = message.parsedCommand?.raw || (message.message.conversation || message.message.extendedTextMessage?.text || "")
  const args = rawCommand.trim().split(/\s+/)
  if (args.length < 2) {
    await sendQuotedWithFooter(sock, remoteJid, "Usage: /buy <item> [quantity]\nExample: /buy water\nExample: /buy water 10", message)
    return
  }

  let quantity = 1
  let itemArgs = args.slice(1)

  if (itemArgs.length > 1 && /^\d+$/.test(itemArgs[itemArgs.length - 1])) {
    quantity = Math.max(1, parseInt(itemArgs.pop(), 10) || 1)
  }

  let shopId = null
  let itemId = null
  const explicitShopCandidate = parseItemName(itemArgs[0])
  if (itemArgs.length >= 2) {
    shopId = ShopService.resolveShopId(explicitShopCandidate) || explicitShopCandidate
    itemId = parseItemName(itemArgs.slice(1).join(" "))
  } else {
    itemId = parseItemName(itemArgs[0])
    const shopMatch = ShopService.findShopByItem(itemId)
    if (!shopMatch) {
      await sendQuotedWithFooter(sock, remoteJid, formatItemNotFound(itemId), message)
      return
    }
    shopId = shopMatch
  }

  const shop = ShopService.getShop(shopId)
  if (!shop) {
    await sendQuotedWithFooter(sock, remoteJid, "Shop not found.", message)
    return
  }

  const result = await ShopService.buy(player, shopId, itemId, quantity)
  if (result.error) {
    if (result.error === "Item not found.") {
      await sendQuotedWithFooter(sock, remoteJid, formatItemNotFound(itemId, shop.items), message)
    } else {
      await sendQuotedWithFooter(sock, remoteJid, result.error, message)
    }
    return
  }

  const renderer = new ReceiptRenderer()
  const imageBuffer = await renderer.renderReceipt(result.item.name || "Unknown Item", result.totalCost || result.item.price || 0, (result.newWallet || 0), result.item.icon || "🛒")

  const caption = quantity > 1
    ? `Purchased ${quantity}x ${result.item.name}\nTotal: ¥${(result.totalCost || 0).toLocaleString()}`
    : "Purchase complete."

  await sock.sendMessage(remoteJid, { image: imageBuffer, caption }, { quoted: message })
}
