import { BaseCanvas } from "./BaseCanvas.js"
import { COLORS } from "./constants.js"

const RARITY_COLORS = { common: "#aaaacc", uncommon: "#00d26a", rare: "#00b7ff", epic: "#aa44ff", legendary: "#ffd700", mythic: "#dc143c" }

export class InventoryCard extends BaseCanvas {
  constructor() {
    super()
    this.setTheme("profile")
  }

  async render(player, items, page = 0) {
    await this.ensureFonts()
    const W = 1200
    const H = 780
    const canvas = this.createCanvas(W, H)
    const ctx = canvas.getContext("2d")

    this.drawBackground(ctx, W, H)
    this.drawHeader(ctx, "🎒 INVENTORY", this.formatCanvasValue(player.name, "Sorcerer"), W)

    const totalSlots = player.inventoryCapacity || 20
    const used = items.length
    this.drawBadge(ctx, W - 180, 130, `${used} / ${totalSlots} SLOTS`, this.theme.accent, { width: 150 })

    const start = page * 16
    const pageItems = items.slice(start, start + 16)
    const cols = 4
    const rows = 4
    const cellW = (W - 120) / cols
    const cellH = 120
    const startY = 180

    for (let i = 0; i < pageItems.length; i++) {
      const col = i % cols
      const row = Math.floor(i / cols)
      const x = 60 + col * cellW
      const y = startY + row * cellH
      this.drawItemCard(ctx, x, y, cellW - 12, pageItems[i].icon || "📦", this.truncate(pageItems[i].name || "Unknown", 18), `x${pageItems[i].quantity || 1}`, pageItems[i].rarity || "common", { height: 90 })
    }

    if (pageItems.length === 0) {
      ctx.fillStyle = this.theme.muted
      ctx.font = "18px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText("Your inventory is empty.", W / 2, H / 2)
    }

    this.drawFooter(ctx, "KENNYJAKS • Inventory", W, H)
    return this.toBuffer(canvas)
  }
}
