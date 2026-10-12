import { BaseCanvas } from "./BaseCanvas.js"
import { COLORS } from "./constants.js"

const GRADE_COLORS = { 0: "#ffd700", 1: "#fb923c", 2: "#f97316", 3: "#4a90d9", 4: "#6b7280" }
const GRADE_LABELS = { 0: "SPECIAL GRADE", 1: "GRADE 1", 2: "GRADE 2", 3: "GRADE 3", 4: "GRADE 4" }

export class BattleCard extends BaseCanvas {
  constructor() {
    super()
  }

  async renderVictory(player, battleStats, rewards, xpInfo) {
    this.setTheme("victory")
    await this.ensureFonts()
    const W = 1200
    const H = 780
    const canvas = this.createCanvas(W, H)
    const ctx = canvas.getContext("2d")

    this.drawBackground(ctx, W, H)
    this.drawHeader(ctx, "⚔ VICTORY", "Curse Defeated", W)

    await this.drawAvatar(ctx, player, W / 2 - 90, 125, 150)

    // Level Up Info Section
    if (xpInfo?.levelUps > 0) {
      this.drawPanel(ctx, 55, 180, W - 110, 120, "⚡ LEVEL UP!")
      ctx.fillStyle = COLORS.white
      ctx.font = "bold 24px sans-serif"
      ctx.textAlign = "left"
      ctx.fillText(`Level Up!`, 75, 220)
      ctx.fillText(`${xpInfo.levelUps} Level${xpInfo.levelUps > 1 ? 's' : ''} Gained`, 75, 250)
      
      ctx.fillStyle = COLORS.hp
      ctx.font = "20px sans-serif"
      ctx.fillText(`Skill Points: +${xpInfo.levelUps}`, 75, 280)
      
      if (xpInfo.gradePromoted) {
        const gradeColor = GRADE_COLORS[xpInfo.newGrade] || COLORS.gray
        ctx.fillStyle = gradeColor
        ctx.font = "20px sans-serif"
        ctx.fillText(`Grade Promoted: ${GRADE_LABELS[xpInfo.newGrade] || "GRADE 4"}`, 75, 310)
      }
    }

    // XP Progress Section
    this.drawPanel(ctx, 55, 320, W - 110, 140, "XP PROGRESS")
    const currentLevel = xpInfo?.level || player.level || 1
    const progressPercent = xpInfo?.level > currentLevel ? 100 : Math.min(100, Math.round(((player.xp || 0) / (xpInfo?.nextLevelXp || (currentLevel * 1000))) * 100))
    const progressBar = "█".repeat(Math.round(progressPercent / 5)) + "░".repeat(20 - Math.round(progressPercent / 5))
    
    ctx.fillStyle = COLORS.white
    ctx.font = "bold 20px sans-serif"
    ctx.textAlign = "left"
    ctx.fillText(`Current: Level ${player.level || 1}`, 75, 380)
    ctx.fillText(`Next: Level ${currentLevel + 1}`, 75, 410)
    ctx.fillText(`${progressBar} ${progressPercent}%`, 75, 440)

    this.drawPanel(ctx, 55, 480, W - 110, 220, "BATTLE & REWARDS")
    const cols = 4
    const colW = (W - 120) / cols
    const stats = [
      ["🔥", "DAMAGE", `${(battleStats?.totalDamage || 0).toLocaleString()}`, COLORS.red],
      ["⚡", "BLACK FLASH", `${battleStats?.finalCombo || 0}`, COLORS.ce],
      ["⭐", "XP", `+${xpInfo?.xpGained || 0}`, this.theme.accent],
      ["🏆", "RANK", `+${xpInfo?.rankPoints || 0}`, COLORS.gold]
    ]
    for (let i = 0; i < stats.length; i++) {
      const x = 75 + i * colW
      this.drawMiniStat(ctx, x, 540, colW - 20, stats[i][1], stats[i][2], { color: stats[i][3], icon: stats[i][0] })
    }

    this.drawPanel(ctx, 55, 730, W - 110, 40, "MONEY & ITEMS")
    ctx.fillStyle = COLORS.white
    ctx.font = "bold 18px sans-serif"
    ctx.textAlign = "left"
    ctx.fillText(`+¥${rewards?.yen || 0} (Yen)`, 75, 770)
    ctx.fillText(`+${rewards?.ken || 0} Ken Tokens`, 75, 795)

    this.drawFooter(ctx, "KENNYJAKS • Victory", W, H)
    return this.toBuffer(canvas)
  }

async renderDefeat(player, battleStats, rewards, xpInfo) {
    this.setTheme("defeat")
    await this.ensureFonts()
    const W = 1200
    const H = 780
    const canvas = this.createCanvas(W, H)
    const ctx = canvas.getContext("2d")

    this.drawBackground(ctx, W, H)
    this.drawHeader(ctx, "💀 DEFEATED", "Better luck next time...", W)

    await this.drawAvatar(ctx, player, W / 2 - 90, 125, 150)

    this.drawPanel(ctx, 55, 295, W - 110, 170, "DEFEAT STATS")
    ctx.fillStyle = COLORS.white
    ctx.font = "bold 28px sans-serif"
    ctx.textAlign = "center"
    ctx.fillText("You fell to the curse...", W / 2, 360)

    const gradeColor = GRADE_COLORS[player.grade] || COLORS.gray
    ctx.fillStyle = gradeColor
    ctx.font = "bold 24px sans-serif"
    ctx.fillText(GRADE_LABELS[player.grade] || "GRADE 4", W / 2, 400)

    ctx.fillStyle = this.theme.muted
    ctx.font = "18px sans-serif"
    ctx.fillText(`Total Battles: ${(player.pvpWins || 0) + (player.pvpLosses || 0)}`, W / 2 - 200, 460)
    ctx.fillStyle = COLORS.hp
    ctx.font = "18px sans-serif"
    ctx.fillText(`Wins: ${player.pvpWins || 0}`, W / 2, 460)
    ctx.fillStyle = COLORS.red
    ctx.font = "18px sans-serif"
    ctx.fillText(`Losses: ${player.pvpLosses || 0}`, W / 2 + 200, 460)

    // Participation Rewards
    if (xpInfo?.xpGained > 0 || rewards?.yen > 0 || rewards?.ken > 0) {
      this.drawPanel(ctx, 55, 480, W - 110, 170, "PARTICIPATION REWARDS")
      let ypos = 520
      
      ctx.fillStyle = COLORS.white
      ctx.font = "bold 20px sans-serif"
      ctx.textAlign = "left"
      
      if (xpInfo?.xpGained > 0) {
        ctx.fillText(`+${xpInfo.xpGained} XP`, 75, ypos)
        ypos += 25
      }
      
      ctx.fillStyle = COLORS.gold
      ctx.font = "18px sans-serif"
      if (rewards?.yen > 0) {
        ctx.fillText(`+${rewards.yen} Yen`, 75, ypos)
        ypos += 25
      }
      
      ctx.fillStyle = COLORS.ce
      ctx.font = "18px sans-serif"
      if (rewards?.ken > 0) {
        ctx.fillText(`+${rewards.ken} Ken Tokens`, 75, ypos)
      }

      // Level up info if gained
      if (xpInfo?.levelUps > 0) {
        ctx.fillStyle = COLORS.hp
        ctx.font = "18px sans-serif"
        ctx.fillText(`Skill Points: +${xpInfo.levelUps}`, 75, ypos + 25)
      }
    }

    this.drawFooter(ctx, "KENNYJAKS • Defeat", W, H)
    return this.toBuffer(canvas)
  }
}
