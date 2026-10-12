import { BaseCanvas } from "./BaseCanvas.js"

export class LootCard extends BaseCanvas {
  constructor() {
    super()
    this.setTheme("loot")
  }

  async render(player, drops, bonus) {
    await this.ensureFonts()
    const W = 1200
    const H = 780
    const canvas = this.createCanvas(W, H)
    const ctx = canvas.getContext("2d")

    this.drawBackground(ctx, W, H)
    this.drawHeader(ctx, "🎁 LOOT ACQUIRED", this.formatCanvasValue(player.name, "Unknown"), W)

    this.drawPanel(ctx, 55, 130, W - 110, 340, "REWARDS")
    for (let i = 0; i < Math.min(drops.length, 8); i++) {
      const y = 160 + i * 38
      this.drawRewardCard(ctx, 75, y, W - 150, drops[i].icon || "📦", this.truncate(drops[i].name || "Unknown", 28), drops[i].quantity || 1)
    }
    if (drops.length === 0) {
      ctx.fillStyle = this.theme.muted
      ctx.font = "16px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText("No loot this time.", W / 2, 300)
    }

    if (bonus) {
      this.drawGlow(ctx, 55, 495, W - 110, 80, this.theme.accent, 15)
      this.drawPanel(ctx, 55, 495, W - 110, 80, "BONUS")
      ctx.fillStyle = this.theme.accent
      ctx.font = "bold 20px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText(`Bonus: ${bonus}`, W / 2, 545)
    }

    this.drawFooter(ctx, "KENNYJAKS • Loot System", W, H)
    return this.toBuffer(canvas)
  }
}
