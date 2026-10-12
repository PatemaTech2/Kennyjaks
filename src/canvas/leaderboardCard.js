import { BaseCanvas } from "./BaseCanvas.js"

const GRADE_LABELS = { 0: "SPECIAL GRADE", 1: "GRADE 1", 2: "GRADE 2", 3: "GRADE 3", 4: "GRADE 4" }
const GRADE_COLORS = { 0: "#ffd700", 1: "#c0c0c0", 2: "#4a90d9", 3: "#50a050", 4: "#d97706" }
const POTENTIAL_COLORS = { A: "#ffd700", B: "#c0c0c0", C: "#4a90d9", D: "#50a050", E: "#d97706", F: "#6b7280" }

export class LeaderboardCanvas extends BaseCanvas {
  constructor() {
    super()
    this.setTheme("leaderboard")
  }

  async render(players) {
    await this.ensureFonts()
    const W = 1200
    const H = 800
    const canvas = this.createCanvas(W, H)
    const ctx = canvas.getContext("2d")

    this.drawBackground(ctx, W, H)
    this.drawHeader(ctx, "🏆 STRONGEST SORCERERS", "KENNYJAKS SORCERER RANKINGS", W)

    const top3 = players.slice(0, 3)
    const rest = players.slice(3, 10)

    let y = 120
    for (let i = 0; i < top3.length; i++) {
      y = await this.drawTopPlayer(ctx, top3[i], i, y)
    }

    y = Math.max(y + 20, 430)
    this.drawDivider(ctx, 55, y, W - 110, this.theme.border)
    y += 20
    ctx.fillStyle = this.theme.subText
    ctx.font = "bold 16px sans-serif"
    ctx.textAlign = "left"
    ctx.fillText("RANK", 65, y)
    ctx.fillText("SORCERER", 200, y)
    ctx.fillText("GRADE", 520, y)
    ctx.fillText("LEVEL", 680, y)
    ctx.fillText("POTENTIAL", 800, y)
    ctx.fillText("CK", 950, y)
    ctx.fillText("PvP W", 1080, y)
    y += 30

    for (let i = 0; i < rest.length; i++) {
      y = this.drawRestPlayer(ctx, rest[i], i + 4, y)
    }

    this.drawFooter(ctx, "KENNYJAKS • Sorcerer Rankings", W, H)
    return this.toBuffer(canvas)
  }

  async drawTopPlayer(ctx, player, rank, y) {
    const medals = ["🥇", "🥈", "🥉"]
    const medal = medals[rank] || "🏅"
    const cardW = W - 120
    const cardH = 150
    const x = 60

    const gradeColor = GRADE_COLORS[player.grade] || "#d97706"

    this.drawGlow(ctx, x, y, cardW, cardH, gradeColor, 18)

    this.drawPanel(ctx, x, y, cardW, cardH, "", { padding: 16, radius: 16 })

    ctx.fillStyle = gradeColor
    ctx.font = "bold 40px sans-serif"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText(medal, x + 40, y + cardH / 2)

    await this.drawAvatar(ctx, player, x + 65, y + 20, 110)

    const infoX = x + 185
    ctx.fillStyle = COLORS.white
    ctx.font = "bold 28px sans-serif"
    ctx.textAlign = "left"
    ctx.fillText(this.truncate(player.name || "Unknown", 20), infoX, y + 40)

    ctx.fillStyle = this.theme.muted
    ctx.font = "17px sans-serif"
    ctx.fillText(GRADE_LABELS[player.grade] || "GRADE 4", infoX, y + 68)

    ctx.fillStyle = this.theme.accent
    ctx.font = "bold 20px sans-serif"
    ctx.fillText(`LV: ${player.level || 1}`, infoX, y + 96)

    const potGrade = player.potential || "F"
    const potColor = POTENTIAL_COLORS[potGrade] || "#6b7280"
    this.drawBadge(ctx, infoX, y + 108, `Potential: ${potGrade}`, potColor, { width: 140, bg: `${potColor}15`, border: `${potColor}44`, textColor: potColor })

    const rightX = x + cardW - 25
    ctx.fillStyle = this.theme.accent
    ctx.font = "bold 20px sans-serif"
    ctx.textAlign = "right"
    ctx.fillText(`XP: ${(player.xp || 0).toLocaleString()}`, rightX, y + 38)
    ctx.fillStyle = COLORS.red
    ctx.fillText(`CK: ${player.curseKills || 0}`, rightX, y + 65)
    ctx.fillStyle = COLORS.hp
    ctx.fillText(`W: ${player.pvpWins || 0}`, rightX, y + 92)

    return y + cardH + 18
  }

  drawRestPlayer(ctx, player, rank, y) {
    const gradeColor = GRADE_COLORS[player.grade] || "#d97706"
    const potGrade = player.potential || "F"
    const potColor = POTENTIAL_COLORS[potGrade] || "#6b7280"

    ctx.fillStyle = "rgba(255, 255, 255, 0.03)"
    ctx.fillRect(60, y - 2, W - 120, 36)

    ctx.fillStyle = COLORS.white
    ctx.font = "bold 17px sans-serif"
    ctx.textAlign = "left"
    ctx.fillText(`#${rank}`, 65, y + 22)
    ctx.fillText(this.truncate(player.name || "Unknown", 20), 200, y + 22)
    ctx.fillStyle = gradeColor
    ctx.fillText(GRADE_LABELS[player.grade] || "GRADE 4", 520, y + 22)
    ctx.fillStyle = this.theme.accent
    ctx.fillText(`${player.level || 1}`, 680, y + 22)
    ctx.fillStyle = potColor
    ctx.fillText(potGrade, 800, y + 22)
    ctx.fillStyle = COLORS.red
    ctx.textAlign = "right"
    ctx.fillText(`${player.curseKills || 0}`, 950, y + 22)
    ctx.fillStyle = COLORS.hp
    ctx.fillText(`${player.pvpWins || 0}`, 1080, y + 22)

    return y + 42
  }
}
