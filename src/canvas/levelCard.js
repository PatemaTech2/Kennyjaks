import { BaseCanvas } from "./BaseCanvas.js"
import { calculateDerivedStats } from "../services/AttributeService.js"

export class LevelCard extends BaseCanvas {
  constructor() {
    super()
    this.setTheme("profile")
  }

  async render(player, oldLevel, newLevel) {
    await this.ensureFonts()
    const W = 1200
    const H = 780
    const canvas = this.createCanvas(W, H)
    const ctx = canvas.getContext("2d")

    this.drawBackground(ctx, W, H)
    this.drawHeader(ctx, "⚡ LEVEL UP", this.formatCanvasValue(player.name, "Unknown"), W)

    await this.drawAvatar(ctx, player, W / 2 - 90, 130, 140)

    this.drawPanel(ctx, 55, 295, W - 110, 170, "PROGRESSION")
    ctx.fillStyle = COLORS.white
    ctx.font = "bold 36px sans-serif"
    ctx.textAlign = "center"
    ctx.fillText(`${oldLevel} → ${newLevel}`, W / 2, 340)

    const statsX = 100
    let statsY = 380
    const derived = calculateDerivedStats(player)
    const statItems = [
      ["⚔️", "STR", derived.strength, COLORS.red],
      ["🛡️", "DEF", derived.defense, COLORS.blue],
      ["💨", "SPD", derived.speed, COLORS.ce],
      ["🧠", "INT", derived.intelligence, COLORS.purple]
    ]
    const colW = (W - 200) / 4
    for (let i = 0; i < statItems.length; i++) {
      const x = statsX + i * colW
      this.drawMiniStat(ctx, x + 10, statsY, colW - 20, statItems[i][1], statItems[i][2], { color: statItems[i][3], icon: statItems[i][0], align: "between" })
    }

    this.drawBadge(ctx, W / 2 - 80, 490, "⭐ +1 SKILL POINT", this.theme.accent, { width: 160 })

    this.drawFooter(ctx, "KENNYJAKS • Level Up", W, H)
    return this.toBuffer(canvas)
  }
}
