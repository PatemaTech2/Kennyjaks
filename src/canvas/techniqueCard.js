import { BaseCanvas } from "./BaseCanvas.js"
import { COLORS } from "./constants.js"

export class TechniqueCard extends BaseCanvas {
  constructor() {
    super()
    this.setTheme("technique")
  }

  async render(player) {
    await this.ensureFonts()
    const W = 1200
    const H = 780
    const canvas = this.createCanvas(W, H)
    const ctx = canvas.getContext("2d")

    this.drawBackground(ctx, W, H)
    this.drawHeader(ctx, "⚡ CURSED TECHNIQUE", this.formatCanvasValue(player.technique?.name || "Unknown", "Unknown"), W)

    await this.drawAvatar(ctx, player, 55, 130, 130)

    const infoX = 210
    let iy = 140
    ctx.fillStyle = COLORS.white
    ctx.font = "bold 28px sans-serif"
    ctx.textAlign = "left"
    ctx.fillText(this.formatCanvasValue(player.name, "Unknown"), infoX, iy)
    iy += 28
    ctx.fillStyle = this.theme.muted
    ctx.font = "16px sans-serif"
    ctx.fillText(`Branch: ${this.truncate(player.technique?.branch || "—", 30)}`, infoX, iy)
    iy += 28
    ctx.fillText(`Grade: ${player.sorcererGrade || "Grade 4"}`, infoX, iy)

    const mastery = this.getTechniqueMastery(player)
    if (mastery != null) {
      this.drawProgressBar(ctx, infoX, iy + 15, 400, 22, mastery, 100, "MASTERY", { color: this.theme.accent })
    }

    this.drawPanel(ctx, 55, 290, W - 110, 440, "SKILL TREE")
    const skills = player.technique?.unlockedSkills || player.technique?.skillTree || []
    const cols = 3
    const cardW = (W - 120) / cols
    for (let i = 0; i < Math.min(skills.length, 12); i++) {
      const col = i % cols
      const row = Math.floor(i / cols)
      const x = 60 + col * cardW
      const y = 320 + row * 90
      const skill = typeof skills[i] === "string" ? skills[i] : skills[i]?.name || "Skill"
      this.drawSkillCard(ctx, x, y, cardW - 12, "✦", this.truncate(skill, 22), "UNLOCKED", 100, { height: 70 })
    }
    if (skills.length === 0) {
      ctx.fillStyle = this.theme.muted
      ctx.font = "16px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText("No skills unlocked yet.", W / 2, 400)
    }

    this.drawFooter(ctx, "KENNYJAKS • Technique System", W, H)
    return this.toBuffer(canvas)
  }

  getTechniqueMastery(player) {
    if (!player.techniqueMastery && !player.progression) return null
    const total = (player.technique?.branches || []).reduce((sum, b) => sum + (b.skillTree || []).length, 0) || (player.technique?.skillTree || []).length || 1
    const unlocked = new Set([...(player.technique?.unlockedSkills || []), ...(player.progression?.unlockedSkills || [])]).size
    return Math.round((unlocked / Math.max(1, total)) * 100)
  }
}
