import { BaseCanvas } from "./BaseCanvas.js"

export class TrainingCard extends BaseCanvas {
  constructor() {
    super()
    this.setTheme("profile")
  }

  async render(player, skill, current, target, xpGained) {
    await this.ensureFonts()
    const W = 1200
    const H = 700
    const canvas = this.createCanvas(W, H)
    const ctx = canvas.getContext("2d")

    this.drawBackground(ctx, W, H)
    this.drawHeader(ctx, "🥊 TRAINING", this.formatCanvasValue(skill || "General", "Training"), W)

    this.drawPanel(ctx, 55, 130, W - 110, 160, "PROGRESS")
    const pct = Math.min(1, (current || 0) / Math.max(1, target || 1))
    this.drawProgressBar(ctx, 75, 170, W - 150, 28, current, target, `${current || 0} / ${target || 0}`, { color: this.theme.accent })

    this.drawPanel(ctx, 55, 320, W - 110, 160, "REWARD")
    ctx.fillStyle = this.theme.accent
    ctx.font = "bold 36px sans-serif"
    ctx.textAlign = "center"
    ctx.fillText(`+${(xpGained || 0).toLocaleString()} XP`, W / 2, 410)

    this.drawPanel(ctx, 55, 510, W - 110, 120, "STATUS")
    ctx.fillStyle = COLORS.white
    ctx.font = "bold 22px sans-serif"
    ctx.textAlign = "center"
    ctx.fillText(`Level: ${player.level || 1}  |  Grade: ${player.sorcererGrade || "Grade 4"}`, W / 2, 570)

    this.drawFooter(ctx, "KENNYJAKS • Training Grounds", W, H)
    return this.toBuffer(canvas)
  }
}
