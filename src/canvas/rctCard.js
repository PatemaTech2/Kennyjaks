import { BaseCanvas } from "./BaseCanvas.js"
import { COLORS } from "./constants.js"

export class RCTCard extends BaseCanvas {
  constructor() {
    super()
    this.setTheme("rct")
  }

  async render(player) {
    await this.ensureFonts()
    const W = 1200
    const H = 700
    const canvas = this.createCanvas(W, H)
    const ctx = canvas.getContext("2d")

    this.drawBackground(ctx, W, H)
    this.drawHeader(ctx, "🩸 REVERSE CURSED TECHNIQUE", "Healing & Reversal Arts", W)

    const unlocked = player.hasRCT || (player.rct && player.rct.unlocked)
    this.drawPanel(ctx, 55, 130, W - 110, 160, "STATUS")
    ctx.fillStyle = unlocked ? COLORS.hp : this.theme.muted
    ctx.font = "bold 36px sans-serif"
    ctx.textAlign = "center"
    ctx.fillText(unlocked ? "✓ UNLOCKED" : "✗ LOCKED", W / 2, 215)

    if (unlocked) {
      ctx.fillStyle = COLORS.white
      ctx.font = "bold 22px sans-serif"
      ctx.fillText(`Reversed Technique: ${this.truncate(player.rct?.reversedTechnique?.name || "Void Reversal", 30)}`, W / 2, 260)
    }

    this.drawPanel(ctx, 55, 320, W - 110, 240, "ABILITIES")
    const abilities = [
      ["RCT Burst", unlocked ? "READY" : "LOCKED"],
      ["RCT Slow", unlocked ? "READY" : "LOCKED"],
      ["RCT Auto", player.rct?.auto ? "READY" : "LOCKED"]
    ]
    let ay = 355
    for (const [name, status] of abilities) {
      const color = status === "READY" ? COLORS.hp : this.theme.muted
      ctx.fillStyle = COLORS.white
      ctx.font = "bold 20px sans-serif"
      ctx.textAlign = "left"
      ctx.fillText(name, 75, ay)
      ctx.fillStyle = color
      ctx.font = "bold 20px sans-serif"
      ctx.textAlign = "right"
      ctx.fillText(status, W - 75, ay)
      ay += 55
    }

    this.drawFooter(ctx, "KENNYJAKS • Reverse Cursed Technique", W, H)
    return this.toBuffer(canvas)
  }
}
