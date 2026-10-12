import { createCanvas } from "canvas"

const CARD_WIDTH = 1200
const CARD_HEIGHT = 1000

export class InventoryCanvasRenderer {
  async renderInventory(player, maxSlots) {
    const canvas = createCanvas(CARD_WIDTH, CARD_HEIGHT)
    const ctx = canvas.getContext("2d")

    this.drawBackground(ctx)
    this.drawHeader(ctx, player, maxSlots)
    this.drawBagInfo(ctx, player)
    this.drawItems(ctx, player)
    this.drawFooter(ctx, player)

    const buffer = canvas.toBuffer("image/png")
    return buffer
  }

  drawBackground(ctx) {
    const gradient = ctx.createLinearGradient(0, 0, CARD_WIDTH, CARD_HEIGHT)
    gradient.addColorStop(0, "#0a0a1a")
    gradient.addColorStop(0.5, "#0f0f2e")
    gradient.addColorStop(1, "#1a0a2e")
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT)
  }

  drawHeader(ctx, player, maxSlots) {
    ctx.fillStyle = "#ffffff"
    ctx.font = "bold 48px sans-serif"
    ctx.textAlign = "center"
    ctx.fillText("🎒 INVENTORY", CARD_WIDTH / 2, 60)

    const slotsUsed = (player.inventory || []).reduce((sum, i) => sum + (i.quantity || 1), 0)
    ctx.fillStyle = "#aaaaff"
    ctx.font = "24px sans-serif"
    ctx.fillText(`Inventory: ${slotsUsed} / ${maxSlots}`, CARD_WIDTH / 2, 100)
  }

  drawBagInfo(ctx, player) {
    const bagName = player.equippedBag || "No Bag"
    const bagUsed = (player.bagInventory || []).length
    const bagMax = player.bagCapacity === 9999 ? "∞" : player.bagCapacity

    ctx.fillStyle = "#ffffff"
    ctx.font = "bold 28px sans-serif"
    ctx.textAlign = "left"
    ctx.fillText(`🎒 Bag: ${bagName}`, 80, 150)

    ctx.fillStyle = "#aaaaff"
    ctx.font = "22px sans-serif"
    ctx.fillText(`Bag Slots: ${bagUsed} / ${bagMax}`, 80, 180)

    ctx.strokeStyle = "#333355"
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(80, 195)
    ctx.lineTo(CARD_WIDTH - 80, 195)
    ctx.stroke()
  }

  drawItems(ctx, player) {
    const items = player.inventory || []
    const grouped = this.groupItems(items)

    const categories = [
      { key: "weapon", label: "⚔️ Weapons" },
      { key: "armor", label: "🛡️ Armor" },
      { key: "consumable", label: "🍖 Food" },
      { key: "egg", label: "🥚 Eggs" },
      { key: "material", label: "📦 Materials" },
      { key: "quest", label: "📜 Quest Items" },
      { key: "misc", label: "🔮 Misc" }
    ]

    let y = 220
    ctx.textAlign = "left"
    ctx.font = "bold 22px sans-serif"

    for (const cat of categories) {
      const catItems = grouped[cat.key] || []
      if (catItems.length === 0) continue

      if (y > 850) break

      ctx.fillStyle = "#ffdd44"
      ctx.fillText(cat.label, 80, y)
      y += 35

      ctx.fillStyle = "#ffffff"
      ctx.font = "20px sans-serif"
      catItems.slice(0, 4).forEach(item => {
        const qty = item.quantity > 1 ? ` x${item.quantity}` : ""
        ctx.fillText(`• ${item.name || "Unknown Item"}${qty}`, 100, y)
        y += 28
      })

      y += 15
    }
  }

  drawFooter(ctx, player) {
    const y = CARD_HEIGHT - 60

    ctx.fillStyle = "#ffdd44"
    ctx.font = "bold 22px sans-serif"
    ctx.textAlign = "left"
    ctx.fillText(`💰 Wallet: ¥${(player.wallet || 0).toLocaleString()}`, 80, y)

    ctx.fillStyle = "#aaaaff"
    ctx.font = "20px sans-serif"
    ctx.fillText(`HP: ${player.health || 0} / ${player.maxHealth || 0}`, 500, y)
  }

  groupItems(items) {
    return items.reduce((acc, item) => {
      const type = item.type || "misc"
      if (!acc[type]) acc[type] = []
      acc[type].push(item)
      return acc
    }, {})
  }
}
