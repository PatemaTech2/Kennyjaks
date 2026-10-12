import { BaseCanvas } from "./BaseCanvas.js"
import { COLORS } from "./constants.js"

const RARITY_STARS = { Common: "⭐", Rare: "⭐⭐", Epic: "⭐⭐⭐", Legendary: "⭐⭐⭐⭐", "Special Grade": "⭐⭐⭐⭐⭐" }
const RARITY_COLORS = { Common: "#9ca3af", Rare: "#3b82f6", Epic: "#a855f7", Legendary: "#f59e0b", "Special Grade": "#ffd700" }

export class EggRevealCard extends BaseCanvas {
  constructor() {
    super()
    this.setTheme("loot")
  }

  async render(player, pet) {
    await this.ensureFonts()
    const W = 1200
    const H = 780
    const canvas = this.createCanvas(W, H)
    const ctx = canvas.getContext("2d")

    this.drawBackground(ctx, W, H)
    this.drawHeader(ctx, "🥚 SHIKIGAMI HATCHED!", this.formatCanvasValue(pet.name, "Unknown"), W)

    const rarity = pet.rarity || "Common"
    const rarityColor = RARITY_COLORS[rarity] || this.theme.muted
    const stars = RARITY_STARS[rarity] || "⭐"

    ctx.fillStyle = rarityColor
    ctx.font = "bold 28px sans-serif"
    ctx.textAlign = "center"
    ctx.fillText(stars, W / 2, 125)

    this.drawPanel(ctx, 55, 150, W - 110, 320, `${rarity.toUpperCase()} SHIKIGAMI`)
    ctx.fillStyle = COLORS.white
    ctx.font = "bold 38px sans-serif"
    ctx.textAlign = "center"
    ctx.fillText(this.truncate(pet.name || "Unknown", 22), W / 2, 210)

    ctx.fillStyle = this.theme.muted
    ctx.font = "20px sans-serif"
    ctx.fillText(`Rank: ${pet.rank || "?"}`, W / 2, 245)

    const leftX = 120
    const rightX = W / 2 + 80
    let ly = 280
    const leftInfo = [
      ["⚔️", "Attack", `${pet.attack || 0}`, COLORS.red],
      ["🛡️", "Defense", `${pet.defense || 0}`, COLORS.blue]
    ]
    const rightInfo = [
      ["⚡", "Speed", `${pet.speed || 0}`, COLORS.ce],
      ["❤️", "HP", `${pet.maxHealth || 0}`, COLORS.hp]
    ]
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
    ly = 280
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

    this.drawPanel(ctx, 55, 495, W - 110, 80, "OWNER")
    ctx.fillStyle = this.theme.muted
    ctx.font = "16px sans-serif"
    ctx.textAlign = "center"
    ctx.fillText(`Trainer: ${this.formatCanvasValue(player.name, "Unknown")}`, W / 2, 545)

    this.drawFooter(ctx, "KENNYJAKS • Shikigami Hatchery", W, H)
    return this.toBuffer(canvas)
  }
}
