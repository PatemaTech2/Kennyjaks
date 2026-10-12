import { BaseCanvas } from "./BaseCanvas.js"

const GRADE_LABELS = { 0: "SPECIAL GRADE", 1: "GRADE 1", 2: "GRADE 2", 3: "GRADE 3", 4: "GRADE 4" }
const GRADE_STARS = { 0: "⭐⭐⭐⭐⭐", 1: "⭐⭐⭐⭐", 2: "⭐⭐⭐", 3: "⭐⭐", 4: "⭐" }
const GRADE_COLORS = { 0: "#ffd700", 1: "#fb923c", 2: "#f97316", 3: "#4a90d9", 4: "#6b7280" }

export class MissionCard extends BaseCanvas {
  constructor() {
    super()
    this.setTheme("victory")
  }

  async renderComplete(player, mission, rewards) {
    await this.ensureFonts()
    const W = 1200
    const H = 780
    const canvas = this.createCanvas(W, H)
    const ctx = canvas.getContext("2d")

    this.drawBackground(ctx, W, H)
    this.drawHeader(ctx, "🎯 MISSION COMPLETE", this.formatCanvasValue(mission.name, "Unknown Mission"), W)

    await this.drawAvatar(ctx, player, W / 2 - 90, 130, 140)

    this.drawPanel(ctx, 55, 295, W - 110, 170, "DETAILS")
    const gradeColor = GRADE_COLORS[mission.rank] || this.theme.muted
    const leftX = 75
    const rightX = W / 2 + 30
    let ly = 325
    const leftInfo = [
      ["📍 Location", this.formatCanvasValue(mission.location, "Unknown"), this.theme.muted],
      ["👹 Rank", GRADE_LABELS[mission.rank] || "Unknown", gradeColor],
      ["⚔ Difficulty", this.formatCanvasValue(mission.difficulty, "?"), this.theme.accent]
    ]
    for (const [label, val, color] of leftInfo) {
      ctx.fillStyle = this.theme.muted
      ctx.font = "14px sans-serif"
      ctx.textAlign = "left"
      ctx.fillText(label, leftX, ly)
      ctx.fillStyle = color || COLORS.white
      ctx.font = "bold 16px sans-serif"
      ctx.fillText(val, leftX, ly + 18)
      ly += 48
    }

    ly = 325
    const rightInfo = [
      ["💰 Yen", `¥${(rewards.yen || 0).toLocaleString()}`, COLORS.gold],
      ["⭐ XP", `+${rewards.xp || 0}`, this.theme.accent],
      ["🎁 Items", `${rewards.items?.length || 0}`, this.theme.muted]
    ]
    for (const [label, val, color] of rightInfo) {
      ctx.fillStyle = this.theme.muted
      ctx.font = "14px sans-serif"
      ctx.textAlign = "left"
      ctx.fillText(label, rightX, ly)
      ctx.fillStyle = color || COLORS.white
      ctx.font = "bold 16px sans-serif"
      ctx.fillText(val, rightX, ly + 18)
      ly += 48
    }

    this.drawPanel(ctx, 55, 490, W - 110, 90, "MISSION INFO")
    ctx.fillStyle = this.theme.muted
    ctx.font = "16px sans-serif"
    ctx.textAlign = "center"
    ctx.fillText(`Level: ${mission.level || "?"}  |  Potential: ${mission.potential || "?"}  |  ${GRADE_STARS[mission.rank] || "⭐"}`, W / 2, 540)

    this.drawFooter(ctx, "KENNYJAKS • Mission Complete", W, H)
    return this.toBuffer(canvas)
  }
}
