import { BaseCanvas } from "./BaseCanvas.js"
import { createCanvas, loadImage } from "canvas"
import path from "path"
import fs from "fs-extra"
import { getSpriteBuffer } from "../services/sprite/SpriteService.js"

const COLORS = {
  darkBg: "#0a1428",
  cardBg: "#1a2a45",
  heroBg: "#0f1f3a",
  accentBg: "#1a3a5a",
  primary: "#00d9ff",
  primaryGlow: "#00b8d4",
  secondary: "#00a8cc",
  accent: "#ff006e",
  gold: "#ffd700",
  textPrimary: "#ffffff",
  textSecondary: "#a0d9ff",
  textTertiary: "#6a9aaa"
}

const RANK_COLORS = {
  "SPECIAL GRADE": "#ffd700",
  "GRADE 1": "#ff006e",
  "GRADE 2": "#00d9ff",
  "GRADE 3": "#00a8cc",
  "GRADE 4": "#6a9aaa"
}

export class ProfileCharacterSheet extends BaseCanvas {
  constructor() {
    super()
    this.setTheme("profile")
  }

  async render(player) {
    await this.ensureFonts()
    const W = 1400
    const H = 1800
    const canvas = this.createCanvas(W, H)
    const ctx = canvas.getContext("2d")

    const accent = player.profileAccent || RANK_COLORS[player.sorcererGrade] || COLORS.primary
    const gradeBadge = this.getGradeBadge(player.level || 1)
    const avatarImg = await this.loadAvatar(player)

    this.drawBackground(ctx, W, H, accent)
    this.drawHeroSection(ctx, player, avatarImg, accent, gradeBadge)
    this.drawThemeSong(ctx, player, 50, 510, 1300, accent)
    this.drawInfoColumns(ctx, player, 620, accent)
    this.drawDetailedInfoGrid(ctx, player, 950, accent)
    this.drawAchievementsSection(ctx, player, 1450, accent)
    this.drawFooter(ctx, "KENNYJAKS • Jujutsu High • Sorcerer Database", W, H)

    return this.toBuffer(canvas)
  }

  drawBackground(ctx, W, H, accent) {
    const grad = ctx.createLinearGradient(0, 0, 0, H)
    grad.addColorStop(0, COLORS.darkBg)
    grad.addColorStop(1, COLORS.cardBg)
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, W, H)

    ctx.fillStyle = `${accent}08`
    for (let i = 0; i < 80; i++) {
      const x = Math.random() * W
      const y = Math.random() * H
      const size = Math.random() * 1.5 + 0.3
      ctx.beginPath()
      ctx.arc(x, y, size, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  drawHeroSection(ctx, player, avatarImg, accent, gradeBadge) {
    const sectionHeight = 500

    if (avatarImg) {
      ctx.save()
      ctx.filter = "blur(40px) brightness(0.4)"
      ctx.drawImage(avatarImg, 0, 0, 1400, sectionHeight)
      ctx.restore()
    }

    ctx.fillStyle = "rgba(10, 20, 40, 0.7)"
    ctx.fillRect(0, 0, 1400, sectionHeight)

    const avatarX = 80
    const avatarY = 90
    const avatarSize = 320

    this.drawGlowRings(ctx, avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, accent, 3)

    ctx.save()
    ctx.beginPath()
    ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2 - 8, 0, Math.PI * 2)
    ctx.clip()
    if (avatarImg) {
      ctx.drawImage(avatarImg, avatarX, avatarY, avatarSize, avatarSize)
    } else {
      const pGrad = ctx.createRadialGradient(
        avatarX + avatarSize / 2, avatarY + avatarSize / 2, 0,
        avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2
      )
      pGrad.addColorStop(0, "#1a4a6a")
      pGrad.addColorStop(1, "#0a1a3a")
      ctx.fillStyle = pGrad
      ctx.fillRect(avatarX, avatarY, avatarSize, avatarSize)
    }
    ctx.restore()

    ctx.strokeStyle = accent
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2 - 8, 0, Math.PI * 2)
    ctx.stroke()

    const titleX = 480
    const titleY = 120

    ctx.save()
    ctx.shadowColor = accent
    ctx.shadowBlur = 20
    ctx.shadowOffsetX = 2
    ctx.shadowOffsetY = 2
    ctx.font = "bold 80px sans-serif"
    ctx.fillStyle = COLORS.textPrimary
    ctx.fillText(player.name || "Player", titleX, titleY + 80)
    ctx.restore()

    ctx.font = "bold 20px sans-serif"
    ctx.fillStyle = accent
    ctx.fillText((player.sorcererGrade || "GRADE 4").toUpperCase(), titleX, titleY + 120)

    ctx.font = "bold 14px sans-serif"
    ctx.fillStyle = COLORS.textSecondary
    ctx.fillText(`Grade Badge: ${gradeBadge}`, titleX, titleY + 145)

    ctx.font = "bold 24px serif"
    ctx.fillStyle = accent
    ctx.fillText((player.name || "P")[0] + " Power", titleX, titleY + 190)

    this.drawGlowLine(ctx, titleX, titleY + 210, 300, accent)

    this.drawBioPreview(ctx, player, 50, sectionHeight - 140, 1300, 130, accent)
  }

  drawGlowRings(ctx, cx, cy, radius, color, ringCount) {
    for (let i = 0; i < ringCount; i++) {
      const r = radius + i * 12
      const opacity = (1 - i / ringCount) * 0.5
      ctx.save()
      ctx.strokeStyle = color + Math.round(opacity * 255).toString(16).padStart(2, "0")
      ctx.shadowColor = color
      ctx.shadowBlur = 15 + i * 5
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(cx, cy, r, 0, Math.PI * 2)
      ctx.stroke()
      ctx.restore()
    }
  }

  drawGlowLine(ctx, x, y, length, color) {
    ctx.save()
    ctx.shadowColor = color
    ctx.shadowBlur = 10
    ctx.strokeStyle = color
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineTo(x + length, y)
    ctx.stroke()
    ctx.restore()
  }

  drawBioPreview(ctx, player, x, y, w, h, accent) {
    const grad = ctx.createLinearGradient(x, y, x + w, y + h)
    grad.addColorStop(0, "rgba(26, 42, 69, 0.95)")
    grad.addColorStop(1, "rgba(15, 31, 58, 0.95)")
    ctx.fillStyle = grad
    ctx.fillRect(x, y, w, h)

    ctx.strokeStyle = accent + "33"
    ctx.lineWidth = 1
    ctx.strokeRect(x, y, w, h)

    this.drawGlowLine(ctx, x, y, w, accent)

    ctx.font = "13px sans-serif"
    ctx.fillStyle = COLORS.textSecondary
    const bioText = player.profileBio || "No bio set"
    const maxLen = 150
    const displayBio = bioText.length > maxLen ? bioText.substring(0, maxLen) + "..." : bioText
    const lines = this.wrapText(ctx, displayBio, w - 40)
    lines.slice(0, 2).forEach((line, i) => {
      ctx.fillText(line, x + 20, y + 25 + i * 18)
    })

    ctx.font = "bold 11px sans-serif"
    ctx.fillStyle = accent
    ctx.fillText("> VIEW FULL PROFILE", x + 20, y + h - 15)
  }

  drawThemeSong(ctx, player, x, y, w, accent) {
    const songTitle = player.profileSongTitle || player.profileSong
    if (!songTitle) return

    const h = 50
    const grad = ctx.createLinearGradient(x, y, x + w, y + h)
    grad.addColorStop(0, "rgba(26, 42, 69, 0.95)")
    grad.addColorStop(1, "rgba(15, 31, 58, 0.95)")
    ctx.fillStyle = grad
    ctx.fillRect(x, y, w, h)

    ctx.strokeStyle = accent + "33"
    ctx.lineWidth = 1
    ctx.strokeRect(x, y, w, h)

    this.drawGlowLine(ctx, x, y, w, accent)

    ctx.font = "bold 12px sans-serif"
    ctx.fillStyle = accent
    ctx.fillText("🎵 THEME SONG", x + 20, y + 20)

    ctx.font = "11px sans-serif"
    ctx.fillStyle = COLORS.textSecondary
    const displayTitle = songTitle.length > 70 ? songTitle.substring(0, 70) + "..." : songTitle
    ctx.fillText(displayTitle, x + 20, y + 38)
  }

  drawInfoColumns(ctx, player, y, accent) {
    const colWidth = 1300 / 3
    const colHeight = 400
    this.drawProfileImagesGrid(ctx, 50, y, colWidth - 30, colHeight, accent)
    this.drawBiographicalSection(ctx, 50 + colWidth, y, colWidth - 30, colHeight, player, accent)
    this.drawGameStatsSection(ctx, 50 + colWidth * 2, y, colWidth - 30, colHeight, player, accent)
  }

  drawProfileImagesGrid(ctx, x, y, w, h, accent) {
    ctx.font = "bold 14px sans-serif"
    ctx.fillStyle = accent
    ctx.fillText("PLAYER GALLERY", x + 10, y + 25)

    this.drawCardBackground(ctx, x, y + 35, w, h - 35, accent)

    const imgSize = (w - 30) / 2
    const imgY = y + 50
    for (let i = 0; i < 4; i++) {
      const imgX = x + 15 + (i % 2) * (imgSize + 10)
      const imgRowY = imgY + Math.floor(i / 2) * (imgSize + 10)
      ctx.fillStyle = accent + "1a"
      ctx.fillRect(imgX, imgRowY, imgSize, imgSize)
      ctx.strokeStyle = accent + "66"
      ctx.lineWidth = 1
      ctx.strokeRect(imgX, imgRowY, imgSize, imgSize)
      ctx.fillStyle = accent + "0d"
      ctx.fillRect(imgX + 2, imgRowY + 2, imgSize - 4, imgSize - 4)
    }
  }

  drawBiographicalSection(ctx, x, y, w, h, player, accent) {
    ctx.font = "bold 14px sans-serif"
    ctx.fillStyle = accent
    ctx.fillText("BIOGRAPHICAL INFORMATION", x + 10, y + 25)

    this.drawCardBackground(ctx, x, y + 35, w, h - 35, accent)

    const items = [
      { label: "USERNAME", value: player.name || "Unknown" },
      { label: "GUILD", value: "None" },
      { label: "RANK", value: player.sorcererGrade || "GRADE 4" },
      { label: "STATUS", value: "ACTIVE" },
      { label: "JOINED", value: new Date(player.registrationDate || Date.now()).toLocaleDateString() }
    ]

    let itemY = y + 65
    items.forEach(item => {
      ctx.font = "11px sans-serif"
      ctx.fillStyle = accent
      ctx.fillText(">", x + 20, itemY)
      ctx.font = "bold 11px sans-serif"
      ctx.fillStyle = accent
      ctx.fillText(item.label, x + 35, itemY)
      ctx.font = "12px sans-serif"
      ctx.fillStyle = COLORS.textSecondary
      ctx.fillText(item.value, x + 170, itemY)
      itemY += 30
    })
  }

  drawGameStatsSection(ctx, x, y, w, h, player, accent) {
    ctx.font = "bold 14px sans-serif"
    ctx.fillStyle = accent
    ctx.fillText("GAME STATISTICS", x + 10, y + 25)

    this.drawCardBackground(ctx, x, y + 35, w, h - 35, accent)

    const stats = [
      { label: "LEVEL", value: String(player.level || 1) },
      { label: "TOTAL XP", value: (player.lifetimeXp || 0).toLocaleString() },
      { label: "BATTLES", value: String(player.pvpWins + player.pvpLosses || 0) },
      { label: "WIN RATE", value: this.calculateWinRate(player) + "%" },
      { label: "STREAK", value: `${player.dailyCheckInStreak || 0} days` },
      { label: "KEN TOKENS", value: `${(player.kenTokens || 0).toFixed(2)}` }
    ]

    let statY = y + 65
    stats.forEach(stat => {
      ctx.font = "11px sans-serif"
      ctx.fillStyle = accent
      ctx.fillText(">", x + 20, statY)
      ctx.font = "bold 11px sans-serif"
      ctx.fillStyle = accent
      ctx.fillText(stat.label, x + 35, statY)
      ctx.font = "bold 14px sans-serif"
      ctx.fillStyle = COLORS.textPrimary
      ctx.textAlign = "right"
      ctx.fillText(String(stat.value), x + w - 20, statY)
      ctx.textAlign = "left"
      statY += 30
    })
  }

  drawCardBackground(ctx, x, y, w, h, accent) {
    const grad = ctx.createLinearGradient(x, y, x + w, y + h)
    grad.addColorStop(0, "rgba(26, 42, 69, 0.6)")
    grad.addColorStop(1, "rgba(15, 31, 58, 0.6)")
    ctx.fillStyle = grad
    ctx.fillRect(x, y, w, h)

    ctx.strokeStyle = accent + "33"
    ctx.lineWidth = 1
    ctx.strokeRect(x, y, w, h)

    ctx.save()
    ctx.shadowColor = accent
    ctx.shadowBlur = 8
    ctx.strokeStyle = accent
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineTo(x + w, y)
    ctx.stroke()
    ctx.restore()
  }

  drawDetailedInfoGrid(ctx, player, y, accent) {
    const spacing = 20
    const colWidth = (1300 - spacing) / 2
    const rowHeight = 220

    this.drawInfoBox(ctx, 50, y, colWidth, rowHeight, "SORCERER INFORMATION", this.getSorcererInfo(player), accent)
    this.drawInfoBox(ctx, 50 + colWidth + spacing, y, colWidth, rowHeight, "BATTLE STATISTICS", this.getBattleStats(player), accent)
    this.drawInfoBox(ctx, 50, y + rowHeight + spacing, colWidth, rowHeight, "ECONOMY OVERVIEW", this.getEconomyInfo(player), accent)
    this.drawInfoBox(ctx, 50 + colWidth + spacing, y + rowHeight + spacing, colWidth, rowHeight, "PROGRESSION TRACKER", this.getProgressionInfo(player), accent)
  }

  drawInfoBox(ctx, x, y, w, h, title, items, accent) {
    const grad = ctx.createLinearGradient(x, y, x + w, y + h)
    grad.addColorStop(0, "rgba(26, 42, 69, 0.8)")
    grad.addColorStop(1, "rgba(15, 31, 58, 0.8)")
    ctx.fillStyle = grad
    ctx.fillRect(x, y, w, h)

    ctx.strokeStyle = accent + "44"
    ctx.lineWidth = 2
    ctx.strokeRect(x, y, w, h)

    ctx.save()
    ctx.shadowColor = accent
    ctx.shadowBlur = 15
    ctx.strokeStyle = accent + "22"
    ctx.lineWidth = 1
    ctx.strokeRect(x, y, w, h)
    ctx.restore()

    ctx.fillStyle = accent + "26"
    ctx.fillRect(x, y, w, 35)

    ctx.font = "bold 13px sans-serif"
    ctx.fillStyle = accent
    ctx.fillText(title, x + 20, y + 24)

    ctx.strokeStyle = accent + "44"
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(x, y + 35)
    ctx.lineTo(x + w, y + 35)
    ctx.stroke()

    let itemY = y + 60
    items.forEach(item => {
      ctx.font = "11px sans-serif"
      ctx.fillStyle = accent
      ctx.fillText("├─ " + item.label, x + 20, itemY)
      ctx.font = "bold 12px sans-serif"
      ctx.fillStyle = COLORS.textPrimary
      ctx.textAlign = "right"
      ctx.fillText(String(item.value), x + w - 20, itemY)
      ctx.textAlign = "left"
      itemY += 28
    })
  }

  drawAchievementsSection(ctx, player, y, accent) {
    const x = 50
    const w = 1300
    const h = 200

    const grad = ctx.createLinearGradient(x, y, x + w, y + h)
    grad.addColorStop(0, "rgba(26, 42, 69, 0.8)")
    grad.addColorStop(1, "rgba(15, 31, 58, 0.8)")
    ctx.fillStyle = grad
    ctx.fillRect(x, y, w, h)

    ctx.strokeStyle = accent + "44"
    ctx.lineWidth = 2
    ctx.strokeRect(x, y, w, h)

    ctx.font = "bold 14px sans-serif"
    ctx.fillStyle = accent
    ctx.fillText("NOTABLE ACHIEVEMENTS", x + 20, y + 30)

    ctx.strokeStyle = accent + "44"
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(x, y + 40)
    ctx.lineTo(x + w, y + 40)
    ctx.stroke()

    const achievements = this.getAchievements(player)
    let badgeX = x + 20
    const badgeY = y + 70
    const badgeSize = 60
    const badgeSpacing = 90

    achievements.forEach(achievement => {
      if (badgeX + badgeSize > x + w - 20) return
      ctx.save()
      ctx.shadowColor = accent
      ctx.shadowBlur = 10
      ctx.fillStyle = accent + "33"
      ctx.beginPath()
      ctx.arc(badgeX + badgeSize / 2, badgeY + badgeSize / 2, badgeSize / 2, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = accent
      ctx.lineWidth = 2
      ctx.stroke()
      ctx.restore()

      ctx.font = "bold 32px sans-serif"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText(achievement.icon, badgeX + badgeSize / 2, badgeY + badgeSize / 2 - 5)
      ctx.textAlign = "left"

      ctx.font = "10px sans-serif"
      ctx.fillStyle = COLORS.textSecondary
      ctx.textAlign = "center"
      ctx.fillText(achievement.name, badgeX + badgeSize / 2, badgeY + badgeSize + 18)
      ctx.textAlign = "left"

      badgeX += badgeSpacing
    })

    this.drawStatusBadges(ctx, player, x + 20, badgeY + 100, w - 40, accent)
  }

  getAchievements(player) {
    const achievements = []
    if ((player.pvpWins || 0) >= 1) achievements.push({ icon: "🏆", name: "First Win" })
    if ((player.pvpWins || 0) >= 10) achievements.push({ icon: "⭐", name: "Warrior" })
    if ((player.pvpWins || 0) >= 50) achievements.push({ icon: "💫", name: "Champion" })
    if ((player.level || 1) >= 30) achievements.push({ icon: "🔥", name: "Power Level" })
    if (player.premiumTier > 0) achievements.push({ icon: "👑", name: "Premium" })
    return achievements.length > 0 ? achievements : [{ icon: "🎮", name: "Player" }]
  }

  drawStatusBadges(ctx, player, x, y, w, accent) {
    const badges = []
    if (player.premiumTier > 0) badges.push(`Premium Tier ${player.premiumTier}`)
    if (player.blocks && player.blocks > 0) badges.push("Banned")
    if ((player.dailyChecklist?.cursesDefeated || 0) >= 7) badges.push("Streaker")

    if (badges.length === 0) return

    ctx.font = "11px sans-serif"
    let badgeX = x
    badges.forEach(badge => {
      const badgeWidth = ctx.measureText(badge).width + 20
      const badgeHeight = 22
      ctx.fillStyle = accent + "33"
      this.roundRect(ctx, badgeX, y - badgeHeight / 2, badgeWidth, badgeHeight, 10)
      ctx.fill()
      ctx.strokeStyle = accent
      ctx.lineWidth = 1
      this.roundRect(ctx, badgeX, y - badgeHeight / 2, badgeWidth, badgeHeight, 10)
      ctx.stroke()

      ctx.fillStyle = accent
      ctx.textAlign = "center"
      ctx.fillText(badge, badgeX + badgeWidth / 2, y + 4)
      ctx.textAlign = "left"
      badgeX += badgeWidth + 15
    })
  }

  getSorcererInfo(player) {
    return [
      { label: "Grade", value: player.sorcererGrade || "GRADE 4" },
      { label: "Rank", value: `Level ${player.level || 1}` },
      { label: "Status", value: "ACTIVE" },
      { label: "Affiliation", value: player.faction || "sorcerer" }
    ]
  }

  getBattleStats(player) {
    const battles = (player.pvpWins || 0) + (player.pvpLosses || 0)
    const wins = player.pvpWins || 0
    const losses = player.pvpLosses || 0
    const winRate = battles > 0 ? Math.round((wins / battles) * 100) : 0
    return [
      { label: "Battles", value: battles },
      { label: "Wins", value: wins },
      { label: "Losses", value: losses },
      { label: "Win Rate", value: winRate + "%" }
    ]
  }

  getEconomyInfo(player) {
    return [
      { label: "Wallet", value: (player.wallet || 0).toLocaleString() + " Yen" },
      { label: "Bank", value: (player.bank || 0).toLocaleString() + " Yen" },
      { label: "Lifetime", value: (player.lifetimeEarned || 0).toLocaleString() + " Yen" }
    ]
  }

  getProgressionInfo(player) {
    const xpReq = (player.level || 1) * 1000
    const nextLevelXp = Math.min(player.xp || 0, xpReq)
    const xpPercent = Math.round((nextLevelXp / xpReq) * 100)
    return [
      { label: "Level", value: `${player.level || 1} / 100` },
      { label: "XP Progress", value: xpPercent + "%" },
      { label: "Cards", value: `${(player.cards || []).length} collected` },
      { label: "Potential", value: player.potential || "F" }
    ]
  }

  getGradeBadge(level) {
    if (level >= 50) return "SPECIAL GRADE"
    if (level >= 40) return "GRADE 1"
    if (level >= 30) return "GRADE 2"
    if (level >= 20) return "GRADE 3"
    return "GRADE 4"
  }

  calculateWinRate(player) {
    const battles = (player.pvpWins || 0) + (player.pvpLosses || 0)
    if (battles === 0) return 0
    return Math.round((player.pvpWins || 0) / battles * 100)
  }

  wrapText(ctx, text, maxWidth) {
    const words = text.split(" ")
    const lines = []
    let currentLine = ""
    words.forEach(word => {
      const testLine = currentLine ? currentLine + " " + word : word
      if (ctx.measureText(testLine).width > maxWidth && currentLine) {
        lines.push(currentLine)
        currentLine = word
      } else {
        currentLine = testLine
      }
    })
    if (currentLine) lines.push(currentLine)
    return lines
  }

  async loadAvatar(player) {
    try {
      const avatarPath = player.profilePic
      if (avatarPath && await fs.pathExists(avatarPath)) {
        const buffer = await fs.readFile(avatarPath)
        return await loadImage(buffer)
      }
    } catch {
      // ignore
    }
    
    // Fallback to current sprite
    if (player.currentSprite) {
      try {
        const buffer = getSpriteBuffer(player.currentSprite)
        if (buffer) {
          return await loadImage(buffer)
        }
      } catch {}
    }
    
    return null
  }
}
