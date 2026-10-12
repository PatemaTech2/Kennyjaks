import { BaseCanvas } from "./BaseCanvas.js"

export class BagCard extends BaseCanvas {
  constructor() {
    super()
    this.setTheme("bank")
  }

  async render(player, items, bag) {
    await this.ensureFonts()
    const W = 1200
    const H = 780
    const canvas = this.createCanvas(W, H)
    const ctx = canvas.getContext("2d")

    this.drawBackground(ctx, W, H)
    this.drawHeader(ctx, "👜 DIMENSIONAL BAG", this.formatCanvasValue(bag?.name || "Bag", "Storage"), W)

    const capacity = bag?.capacity || 100
    const used = items.length
    this.drawBadge(ctx, W - 200, 130, `${used} / ${capacity} SLOTS`, this.theme.accent, { width: 160 })

    const cols = 5
    const cellW = (W - 120) / cols
    const cellH = 110
    const startY = 180
    for (let i = 0; i < items.length; i++) {
      const col = i % cols
      const row = Math.floor(i / cols)
      const x = 60 + col * cellW
      const y = startY + row * cellH
      this.drawItemCard(ctx, x, y, cellW - 10, items[i].icon || "📦", this.truncate(items[i].name || "Unknown", 16), `x${items[i].quantity || 1}`, items[i].rarity || "common", { height: 80 })
    }

    if (items.length === 0) {
      ctx.fillStyle = this.theme.muted
      ctx.font = "18px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText("Your dimensional bag is empty.", W / 2, H / 2)
    }

    this.drawFooter(ctx, "KENNYJAKS • Dimensional Storage", W, H)
    return this.toBuffer(canvas)
  }
}
