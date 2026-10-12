import { BaseCanvas } from "./BaseCanvas.js"
import { COLORS } from "./constants.js"
import { ProgressionService } from "../services/progression/ProgressionService.js"
import { calculateDerivedStats } from "../services/AttributeService.js"

export class ProfileCard extends BaseCanvas {
  constructor() {
    super()
    this.setTheme("profile")
  }

  async render(player) {
    await this.ensureFonts()
    const W = 1200
    const H = 1060
    const canvas = this.createCanvas(W, H)
    const ctx = canvas.getContext("2d")

    this.drawBackground(ctx, W, H)
    this.drawHeader(ctx, "KENNYJAKS PROFILE", "JUJUTSU HIGH — SORCERER DATABASE", W)

    await this.drawAvatar(ctx, player, 55, 115, 165)

    const infoX = 245
    let iy = 118
    const name = this.formatCanvasValue(player.name, "Unknown Sorcerer")
    ctx.fillStyle = COLORS.white
    ctx.font = "bold 38px sans-serif"
    ctx.textAlign = "left"
    ctx.fillText(this.truncate(name, 22), infoX, iy)

    iy += 34
    ctx.fillStyle = this.theme.muted
    ctx.font = "17px sans-serif"
    ctx.fillText("@" + this.formatCanvasValue(player.phoneNumber, "unknown"), infoX, iy)

    iy += 44
    ctx.fillStyle = this.theme.accent
    ctx.font = "bold 26px sans-serif"
    ctx.fillText(`LEVEL ${player.level || 1}`, infoX, iy)

    iy += 32
    const gradeLabels = { 0: "SPECIAL GRADE", 1: "GRADE 1", 2: "GRADE 2", 3: "GRADE 3", 4: "GRADE 4" }
    const gradeStr = player.sorcererGrade || gradeLabels[player.grade] || "GRADE 4"
    ctx.fillStyle = this.theme.accent
    ctx.font = "bold 22px sans-serif"
    ctx.fillText(`GRADE: ${gradeStr}`, infoX, iy)

    iy += 32
    const rep = player.reputation || 0
    ctx.fillStyle = this.theme.accent
    ctx.font = "bold 22px sans-serif"
    ctx.fillText(`REP: ${rep.toLocaleString()}`, infoX, iy)

    iy += 34
    const potentialGrade = this.formatCanvasValue(player.potential, "F")
    const potentialInfo = { A: { label: "Exceptional", color: "#ffd700" }, B: { label: "Strong", color: "#ff8c00" }, C: { label: "Average", color: "#aaaaff" }, D: { label: "Below Average", color: "#888899" }, E: { label: "Weak", color: "#667766" }, F: { label: "None", color: "#555555" } }[potentialGrade] || { label: "Unknown", color: "#888888" }
    this.drawBadge(ctx, infoX - 5, iy - 12, `POTENTIAL: ${potentialGrade}`, potentialInfo.color, { width: 240, bg: `${potentialInfo.color}15`, border: `${potentialInfo.color}44`, textColor: potentialInfo.color })
    iy += 52
    const bfRate = player.blackFlashAffinity != null ? `${player.blackFlashAffinity.toFixed(3)}%` : "—"
    ctx.fillStyle = this.theme.muted
    ctx.font = "15px sans-serif"
    ctx.fillText(`BLACK FLASH: ${bfRate}`, infoX, iy)

    this.drawXPBar(ctx, 55, 315, W - 110, 36, player)

    const derived = calculateDerivedStats(player)

    this.drawPanel(ctx, 55, 380, 550, 165, "COMBAT")
    const combatStats = [
      ["❤️", "HP", `${(player.health || 0).toLocaleString()} / ${(player.maxHealth || 0).toLocaleString()}`, COLORS.hp],
      ["💨", "SPD", `${derived.speed}`, this.theme.accent],
      ["⚔️", "STR", `${derived.strength}`, COLORS.crimson],
      ["🧠", "INT", `${derived.intelligence}`, COLORS.purple]
    ]
    const cw = 550 / 2 - 28
    for (let i = 0; i < combatStats.length; i++) {
      const col = i % 2
      const row = Math.floor(i / 2)
      const sx = 75 + col * (cw + 24)
      const sy = 410 + row * 42
      this.drawMiniStat(ctx, sx, sy, cw, combatStats[i][1], combatStats[i][2], { color: combatStats[i][3], icon: combatStats[i][0] })
    }

    this.drawPanel(ctx, 595, 380, 550, 165, "ENERGY")
    const ceVal = `${(player.cursedEnergy || 0).toLocaleString()} / ${(player.maxCursedEnergy || 0).toLocaleString()}`
    const rctUnlocked = player.hasRCT || (player.rct && player.rct.unlocked)
    const domainUnlocked = player.domains?.unlocked
    const energyRows = [
      ["⚡", "CE", ceVal, COLORS.ce],
      ["🩸", "RCT", rctUnlocked ? "UNLOCKED" : "LOCKED", rctUnlocked ? COLORS.purple : this.theme.muted],
      ["🏯", "DOMAIN", domainUnlocked ? "UNLOCKED" : "LOCKED", domainUnlocked ? COLORS.purple : this.theme.muted]
    ]
    for (let i = 0; i < energyRows.length; i++) {
      const sy = 410 + i * 42
      this.drawMiniStat(ctx, 615, sy, 510, energyRows[i][1], energyRows[i][2], { color: energyRows[i][3], icon: energyRows[i][0] })
    }

    this.drawPanel(ctx, 55, 570, W - 110, 100, "TECHNIQUE")
    const techniqueName = this.truncate(player.technique?.name || "Unknown", 30)
    const branch = this.truncate(player.technique?.branch || "—", 34)
    ctx.fillStyle = COLORS.white
    ctx.font = "bold 24px sans-serif"
    ctx.textAlign = "left"
    ctx.fillText(techniqueName, 75, 618)
    ctx.fillStyle = this.theme.muted
    ctx.font = "17px sans-serif"
    ctx.fillText(`Branch: ${branch}`, 75, 646)

    const mastery = this.getTechniqueMastery(player)
    if (mastery != null) {
      ctx.fillStyle = this.theme.accent
      ctx.font = "bold 17px sans-serif"
      ctx.textAlign = "right"
      ctx.fillText(`Mastery: ${mastery}%`, W - 75, 618)
    }

    this.drawPanel(ctx, 55, 695, 550, 130, "PROGRESSION")
    const progRows = [
      ["☠️", "CK", `${player.curseKills || 0}`],
      ["🎯", "Skills", `${(player.technique?.unlockedSkills || []).length}`],
      ["🥊", "Training", `${player.yujiTrainingLevel || 0}`],
      ["🏆", "Reputation", `${(player.reputation || 0).toLocaleString()}`]
    ]
    for (let i = 0; i < progRows.length; i++) {
      const sy = 725 + i * 30
      this.drawMiniStat(ctx, 75, sy, 510, progRows[i][1], progRows[i][2], { icon: progRows[i][0] })
    }

    this.drawPanel(ctx, 595, 695, 550, 130, "ACHIEVEMENTS")
    const achRows = [
      ["⚡", "Black Flashes", `${player.blackFlashes || 0}`, COLORS.ce],
      ["🏆", "PvP Wins", `${player.pvpWins || 0}`, this.theme.accent],
      ["💀", "PvP Losses", `${player.pvpLosses || 0}`, this.theme.muted]
    ]
    for (let i = 0; i < achRows.length; i++) {
      const sy = 725 + i * 30
      this.drawMiniStat(ctx, 615, sy, 510, achRows[i][1], achRows[i][2], { color: achRows[i][3], icon: achRows[i][0] })
    }

    this.drawFooter(ctx, "KENNYJAKS • Jujutsu High • Sorcerer Database", W, H)
    return this.toBuffer(canvas)
  }

  drawXPBar(ctx, x, y, width, height, player) {
    const progress = ProgressionService.getLevelProgress(player)
    const label = `XP PROGRESS — Level ${progress.level}`
    this.drawProgressBar(ctx, x, y, width, height, progress.current, progress.needed, label, { color: this.theme.accent })

    ctx.fillStyle = COLORS.white
    ctx.font = "bold 14px sans-serif"
    ctx.textAlign = "right"
    ctx.fillText(`${progress.current.toLocaleString()} / ${progress.needed.toLocaleString()}`, x + width - 10, y + height + 18)
    ctx.textAlign = "left"
    ctx.fillText(`${progress.toNext.toLocaleString()} XP to Level ${progress.level + 1}`, x + 10, y + height + 18)
  }

  getTechniqueMastery(player) {
    if (!player.techniqueMastery && !player.progression) return null
    const total = (player.technique?.branches || []).reduce((sum, b) => sum + (b.skillTree || []).length, 0) ||
      (player.technique?.skillTree || []).length ||
      1
    const unlocked = new Set([
      ...(player.technique?.unlockedSkills || []),
      ...(player.progression?.unlockedSkills || [])
    ]).size
    return Math.round((unlocked / Math.max(1, total)) * 100)
  }
}
