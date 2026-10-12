import { BaseCanvas } from "./BaseCanvas.js"

export class DomainCard extends BaseCanvas {
  constructor() {
    super()
    this.setTheme("domain")
  }

  async render(player) {
    await this.ensureFonts()
    const W = 1200
    const H = 780
    const canvas = this.createCanvas(W, H)
    const ctx = canvas.getContext("2d")

    this.drawBackground(ctx, W, H)
    this.drawHeader(ctx, "「 DOMAIN EXPANSION 」", this.formatCanvasValue(player.domains?.name || "Unknown Domain", "Domain"), W)

    this.drawPanel(ctx, 55, 130, W - 110, 300, "DOMAIN STATUS")
    ctx.fillStyle = this.theme.accent
    ctx.font = "bold 48px sans-serif"
    ctx.textAlign = "center"
    ctx.fillText(player.domains?.unlocked ? "READY" : "LOCKED", W / 2, 220)

    ctx.fillStyle = COLORS.white
    ctx.font = "bold 26px sans-serif"
    ctx.fillText(`Domain: ${this.truncate(player.domains?.name || "Unknown", 28)}`, W / 2, 270)
    ctx.fillStyle = this.theme.muted
    ctx.font = "20px sans-serif"
    ctx.fillText(`Technique: ${this.truncate(player.technique?.name || "Unknown", 30)}`, W / 2, 310)

    if (player.domains?.unlocked) {
      ctx.fillStyle = this.theme.accent
      ctx.font = "bold 20px sans-serif"
      ctx.fillText("SURE-HIT EFFECT: ACTIVE", W / 2, 360)
      ctx.fillText(`Special Effect: ${this.truncate(player.domains?.specialEffect || "All shikigami may manifest", 36)}`, W / 2, 390)
    }

    this.drawPanel(ctx, 55, 460, W - 110, 100, "REQUIREMENTS")
    ctx.fillStyle = this.theme.muted
    ctx.font = "16px sans-serif"
    ctx.textAlign = "center"
    ctx.fillText("Requires Grade 1 or higher  |  Full CE  |  High mastery", W / 2, 520)

    this.drawFooter(ctx, "KENNYJAKS • Domain Expansion", W, H)
    return this.toBuffer(canvas)
  }
}
