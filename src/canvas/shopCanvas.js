import { BaseCanvas } from "./BaseCanvas.js"

export class ShopCanvas extends BaseCanvas {
  constructor() {
    super()
    this.setTheme("wallet")
  }

  async render(player, items, title, subtitle) {
    await this.ensureFonts()
    const W = 1200
    const H = 780
    const canvas = this.createCanvas(W, H)
    const ctx = canvas.getContext("2d")

    this.drawBackground(ctx, W, H)
    this.drawHeader(ctx, title || "🛒 SHOP", subtitle || this.formatCanvasValue(player.name, "Sorcerer"), W)

    const cols = 2
    const cardW = (W - 120) / cols
    for (let i = 0; i < Math.min(items.length, 10); i++) {
      const col = i % cols
      const row = Math.floor(i / cols)
      const x = 60 + col * cardW
      const y = 130 + row * 160
      const item = items[i]
      this.drawItemCard(ctx, x, y, cardW - 12, item.icon || "📦", this.truncate(item.name || "Unknown", 22), `¥${(item.price || 0).toLocaleString()}`, item.rarity || "common", { height: 130 })
      ctx.fillStyle = this.theme.muted
      ctx.font = "14px sans-serif"
      ctx.textAlign = "left"
      ctx.fillText(this.truncate(item.description || "", 30), x + 14, y + 95)
    }

    if (items.length === 0) {
      ctx.fillStyle = this.theme.muted
      ctx.font = "18px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText("No items available.", W / 2, H / 2)
    }

    this.drawFooter(ctx, "KENNYJAKS • Marketplace", W, H)
    return this.toBuffer(canvas)
  }
}
