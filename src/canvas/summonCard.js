import { BaseCanvas } from "./BaseCanvas.js"

export class SummonCard extends BaseCanvas {
  constructor() {
    super()
    this.setTheme("loot")
  }

  async render(player, summon) {
    await this.ensureFonts()
    const W = 1200
    const H = 700
    const canvas = this.createCanvas(W, H)
    const ctx = canvas.getContext("2d")

    this.drawBackground(ctx, W, H)
    this.drawHeader(ctx, "🔮 SUMMON", this.formatCanvasValue(summon?.name || "Unknown", "Creature"), W)

    this.drawPanel(ctx, 55, 130, W - 110, 300, `${(summon?.rarity || "Common").toUpperCase()} SHIKIGAMI`)
    ctx.fillStyle = COLORS.white
    ctx.font = "bold 38px sans-serif"
    ctx.textAlign = "center"
    ctx.fillText(this.truncate(summon?.name || "Unknown", 22), W / 2, 195)

    ctx.fillStyle = this.theme.muted
    ctx.font = "20px sans-serif"
    ctx.fillText(`Rank: ${summon?.rank || "?"}  |  Level: ${summon?.level || 1}`, W / 2, 230)

    const leftX = 120
    const rightX = W / 2 + 80
    let ly = 265
    const leftInfo = [["❤️", "HP", `${summon?.maxHealth || 0}`, COLORS.hp], ["⚔️", "ATK", `${summon?.attack || 0}`, COLORS.red]]
    const rightInfo = [["⚡", "SPD", `${summon?.speed || 0}`, COLORS.ce], ["🛡️", "DEF", `${summon?.defense || 0}`, COLORS.blue]]
    for (const [icon, label, val, color] of leftInfo) {
      ctx.fillStyle = this.theme.muted
      ctx.font = "15px sans-serif"
      ctx.textAlign = "left"
      ctx.fillText(`${icon} ${label}`, leftX, ly)
      ctx.fillStyle = color
      ctx.font = "bold 20px sans-serif"
      ctx.fillText(val, leftX, ly + 22)
      ly += 55
    }
    ly = 265
    for (const [icon, label, val, color] of rightInfo) {
      ctx.fillStyle = this.theme.muted
      ctx.font = "15px sans-serif"
      ctx.textAlign = "left"
      ctx.fillText(`${icon} ${label}`, rightX, ly)
      ctx.fillStyle = color
      ctx.font = "bold 20px sans-serif"
      ctx.fillText(val, rightX, ly + 22)
      ly += 55
    }

    this.drawPanel(ctx, 55, 460, W - 110, 90, "OWNER")
    ctx.fillStyle = this.theme.muted
    ctx.font = "16px sans-serif"
    ctx.textAlign = "center"
    ctx.fillText(`Trainer: ${this.formatCanvasValue(player.name, "Unknown")}`, W / 2, 510)

    this.drawFooter(ctx, "KENNYJAKS • Summon System", W, H)
    return this.toBuffer(canvas)
  }
}
