import { sendQuotedWithFooter } from "../../utils/messageHelper.js"
import { loadPlayerByPhone } from "../../database/playerRepo.js"
import { BlackMarketService } from "../../services/shop/BlackMarketService.js"
import { DailyService } from "../../services/daily/DailyService.js"

export async function handleBlackMarket(sock, message) {
  const remoteJid = message.key.remoteJid
  const sender = message.key.participant || remoteJid
  const phoneNumber = sender.split("@")[0]

  const player = await loadPlayerByPhone(phoneNumber)
  if (!player) {
    await sendQuotedWithFooter(sock, remoteJid, "You need to register first.\n\nUse /start to begin.", message)
    return
  }

  const text = (message.message.conversation || message.message.extendedTextMessage?.text || "").trim().toLowerCase()
  const args = text.split(" ")

  if (args[0] === "/blackmarket" && args[1] === "buy") {
    const itemId = args[2]
    if (!itemId) {
      await sendQuotedWithFooter(sock, remoteJid, "Usage: /blackmarket buy <item-id>", message)
      return
    }

    const result = await BlackMarketService.buy(player, itemId)
    if (result.error) {
      await sendQuotedWithFooter(sock, remoteJid, result.error, message)
      return
    }

    await sendQuotedWithFooter(sock, remoteJid, `Purchased ${result.item.name || "Unknown Item"} for ¥${(result.item.price || 0).toLocaleString()}`, message)
    return
  }

  const items = BlackMarketService.getItems()
  const lines = [
    "━━━━━━━━━━━━━━━━━━━━━━",
    "    🏪 BLACK MARKET",
    "━━━━━━━━━━━━━━━━━━━━━━",
    ""
  ]

  items.forEach(item => {
    const stock = (item.stock || 0) > 0 ? `[${item.stock} left]` : "[SOLD OUT]"
    lines.push(`${item.icon || "🔮"} ${item.name || "Unknown Item"} ${stock}`)
    lines.push(`¥${(item.price || 0).toLocaleString()}`)
    lines.push(item.description || "No description.")
    lines.push("")
  })

  lines.push("Buy: /blackmarket buy <item-id>")

  await sendQuotedWithFooter(sock, remoteJid, lines.join("\n"), message)
}
