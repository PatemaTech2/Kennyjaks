import { BaseCanvas } from "./BaseCanvas.js"
import { COLORS } from "./constants.js"
import { getSpriteBuffer } from "../services/sprite/SpriteService.js"

export class CombinedBattleCanvas extends BaseCanvas {
  constructor() {
    super()
  }

  async render(player, opponent, round, battleLog) {
    await this.ensureFonts()
    const W = 1200
    const H = 800
    const canvas = this.createCanvas(W, H)
    const ctx = canvas.getContext("2d")

    // Black background
    this.drawBackground(ctx, W, H)

    // Header with round
    this.drawHeader(ctx, "⚔ KENNYJAKS BATTLE ⚔", `ROUND ${round || 1}`, W)

    // Draw player sprite (left side, large)
    const spriteSize = 320
    const playerSpriteX = 80
    const enemySpriteX = W - 80 - spriteSize
    const spriteY = 150

    // Load and draw player sprite full-size
    await this.drawSpriteFull(ctx, player, playerSpriteX, spriteY, spriteSize)

    // Load and draw enemy sprite full-size
    await this.drawSpriteFull(ctx, opponent, enemySpriteX, spriteY, spriteSize)

    // Names and grades above sprites
    const pName = player.name || "Player"
    const eName = opponent.name || "Curse"
    const pGradeLabel = this.getGradeLabel(player.grade || 4)
    const eGradeLabel = this.getGradeLabel(opponent.grade || 4)

    ctx.fillStyle = COLORS.white
    ctx.font = "bold 24px sans-serif"
    ctx.textAlign = "center"
    ctx.fillText(pName, playerSpriteX + spriteSize / 2, spriteY - 20)

    ctx.fillStyle = COLORS.gray
    ctx.font = "16px sans-serif"
    ctx.fillText(pGradeLabel, playerSpriteX + spriteSize / 2, spriteY - 5)

    ctx.fillStyle = COLORS.white
    ctx.font = "bold 24px sans-serif"
    ctx.fillText(eName, enemySpriteX + spriteSize / 2, spriteY - 20)

    ctx.fillStyle = COLORS.gray
    ctx.font = "16px sans-serif"
    ctx.fillText(eGradeLabel, enemySpriteX + spriteSize / 2, spriteY - 5)

    // Stats panel below sprites
    const panelY = spriteY + spriteSize + 30
    const panelH = 180
    const panelW = W - 160

    // Draw panel background
    ctx.fillStyle = "rgba(10, 0, 5, 0.7)"
    this.roundRect(ctx, 80, panelY, panelW, panelH, 12)
    ctx.fill()

    ctx.strokeStyle = COLORS.crimson
    ctx.lineWidth = 1.5
    this.roundRect(ctx, 80, panelY, panelW, panelH, 12)
    ctx.stroke()

    // Player stats (left)
    const playerX = 100

    // Player HP
    ctx.fillStyle = COLORS.white
    ctx.font = "bold 20px sans-serif"
    ctx.textAlign = "left"
    ctx.fillText("HP", playerX, panelY + 30)
    this.drawBar(ctx, playerX, panelY + 40, 350, 24, "", player.hp, player.maxHp, COLORS.hp)

    // Player CE
    ctx.fillStyle = COLORS.white
    ctx.font = "bold 20px sans-serif"
    ctx.textAlign = "left"
    ctx.fillText("CE", playerX, panelY + 90)
    this.drawBar(ctx, playerX, panelY + 100, 350, 24, "", player.cursedEnergy, player.maxCursedEnergy, COLORS.ce)

    // Player ATK/DEF
    ctx.fillStyle = COLORS.white
    ctx.font = "18px sans-serif"
    ctx.textAlign = "left"
    ctx.fillText(`ATK: ${player.strength}`, playerX, panelY + 145)
    ctx.fillText(`DEF: ${player.defense}`, playerX, panelY + 165)

    // Enemy stats (right)
    const enemyX = W - 100

    // Enemy HP
    ctx.fillStyle = COLORS.white
    ctx.font = "bold 20px sans-serif"
    ctx.textAlign = "right"
    ctx.fillText("HP", enemyX, panelY + 30)
    this.drawBarRight(ctx, enemyX - 350, panelY + 40, 350, 24, "", opponent.hp, opponent.maxHp, COLORS.crimson)

    // Enemy CE
    ctx.fillStyle = COLORS.white
    ctx.font = "bold 20px sans-serif"
    ctx.textAlign = "right"
    ctx.fillText("CE", enemyX, panelY + 90)
    this.drawBarRight(ctx, enemyX - 350, panelY + 100, 350, 24, "", opponent.ce || 0, opponent.maxCe || 150, COLORS.crimson)

    // Enemy ATK/DEF
    ctx.fillStyle = COLORS.white
    ctx.font = "18px sans-serif"
    ctx.textAlign = "right"
    ctx.fillText(`ATK: ${opponent.strength}`, enemyX, panelY + 145)
    ctx.fillText(`DEF: ${opponent.defense}`, enemyX, panelY + 165)

    // VS text in center
    ctx.fillStyle = COLORS.crimson
    ctx.font = "bold 48px sans-serif"
    ctx.textAlign = "center"
    ctx.fillText("VS", W / 2, panelY + 100)

    // Battle log section
    const logY = panelY + panelH + 20
    const logH = 140

    ctx.fillStyle = "rgba(10, 0, 5, 0.5)"
    this.roundRect(ctx, 80, logY, panelW, logH, 10)
    ctx.fill()

    ctx.strokeStyle = COLORS.crimson
    ctx.lineWidth = 1
    this.roundRect(ctx, 80, logY, panelW, logH, 10)
    ctx.stroke()

    ctx.fillStyle = COLORS.white
    ctx.font = "bold 18px sans-serif"
    ctx.textAlign = "left"
    ctx.fillText("BATTLE LOG", 100, logY + 30)

    const recentLogs = (battleLog || []).slice(-2)
    ctx.font = "14px sans-serif"
    let logOffset = logY + 50
    recentLogs.forEach((log, index) => {
      const cleanLog = log.replace(/『[^』]*』/g, "").trim()
      if (cleanLog) {
        ctx.fillText(`▶ ${cleanLog}`, 100, logOffset + index * 20)
      }
    })

    // Action prompt
    ctx.fillStyle = COLORS.crimson
    ctx.font = "bold 20px sans-serif"
    ctx.textAlign = "center"
    ctx.fillText("⚔️ Your turn - Choose an action", W / 2, H - 40)

    // Footer
    this.drawFooter(ctx, "KENNYJAKS • Battle System", W, H)

    return this.toBuffer(canvas)
  }

  async drawSpriteFull(ctx, entity, x, y, size) {
    // Try currentSprite first
    if (entity.currentSprite) {
      const spriteBuf = getSpriteBuffer(entity.currentSprite)
      if (spriteBuf) {
        try {
          const img = await this.loadImageFromBuffer(spriteBuf)
          if (img) {
            // Draw full sprite without cropping, centered
            const s = Math.min(size / img.width, size / img.height)
            const drawW = img.width * s
            const drawH = img.height * s
            ctx.drawImage(img, x + (size - drawW) / 2, y + (size - drawH) / 2, drawW, drawH)
            return
          }
        } catch (e) {
          console.error("[CombinedBattleCanvas] Failed to draw sprite:", e.message)
        }
      }
    }

    // Try profilePic/avatar
    if (entity.profilePic || entity.avatar) {
      try {
        let img = null
        const pic = entity.profilePic || entity.avatar
        if (pic.startsWith("http") && this.avatarSock && this.avatarJid) {
          const avatarBuffer = await import("../services/avatar/WhatsAppAvatarService.js").then(m => m.getPlayerAvatar(this.avatarSock, this.avatarJid))
          if (avatarBuffer) {
            const { loadImage } = await import("canvas")
            img = await loadImage(avatarBuffer)
          }
        } else if (pic) {
          const { readFile } = await import("fs-extra")
          const buffer = await readFile(pic)
          const { loadImage } = await import("canvas")
          img = await loadImage(buffer)
        }
        if (img) {
          const s = Math.min(size / img.width, size / img.height)
          const drawW = img.width * s
          const drawH = img.height * s
          ctx.drawImage(img, x + (size - drawW) / 2, y + (size - drawH) / 2, drawW, drawH)
          return
        }
      } catch (e) {
        console.error("[CombinedBattleCanvas] Failed to draw avatar:", e.message)
      }
    }

    // Fallback
    this.drawFallbackSprite(ctx, entity.name || "??", x, y, size)
  }

  async loadImageFromBuffer(buffer) {
    const { loadImage } = await import("canvas")
    return loadImage(buffer)
  }

  drawFallbackSprite(ctx, label, x, y, size) {
    ctx.fillStyle = "#12122a"
    ctx.fillRect(x, y, size, size)

    ctx.strokeStyle = COLORS.crimson
    ctx.lineWidth = 4
    ctx.strokeRect(x, y, size, size)

    ctx.fillStyle = COLORS.white
    ctx.font = "bold 80px sans-serif"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText(label.slice(0, 1).toUpperCase(), x + size / 2, y + size / 2)
  }

  drawBarRight(ctx, x, y, width, height, label, current, max, color) {
    const safeMax = Math.max(1, max || 1)
    const safeCurrent = Math.max(0, Math.min(current || 0, safeMax))
    const pct = Math.min(1, safeCurrent / safeMax)
    const fillWidth = width * pct
    const barRadius = Math.min(6, height / 2)

    // Background
    ctx.fillStyle = "#18182a"
    this.roundRect(ctx, x, y, width, height, barRadius)
    ctx.fill()

    // Fill
    if (fillWidth > 0.5) {
      const grd = ctx.createLinearGradient(x, y, x + fillWidth, y)
      grd.addColorStop(0, color)
      grd.addColorStop(1, this.lightenColor(color, 0.3))
      ctx.fillStyle = grd
      this.roundRect(ctx, x, y, fillWidth, height, barRadius)
      ctx.fill()
    }

    // Border
    ctx.strokeStyle = `${color}44`
    ctx.lineWidth = 1
    this.roundRect(ctx, x, y, width, height, barRadius)
    ctx.stroke()

    // Text (right-aligned)
    ctx.fillStyle = COLORS.white
    ctx.font = "bold 13px sans-serif"
    ctx.textAlign = "right"
    ctx.fillText(`${Math.floor(safeCurrent)} / ${Math.floor(safeMax)}`, x + width, y + height / 2 + 5)
  }

  getGradeLabel(grade) {
    const gradeLabels = { 0: "SPECIAL GRADE", 1: "GRADE 1", 2: "GRADE 2", 3: "GRADE 3", 4: "GRADE 4" }
    return gradeLabels[grade] || "GRADE 4"
  }

  roundRect(ctx, x, y, width, height, radius) {
    return super.roundRect(ctx, x, y, width, height, radius)
  }

  drawBar(ctx, x, y, width, height, label, current, max, color) {
    return super.drawBar(ctx, x, y, width, height, label, current, max, color)
  }

  drawBackground(ctx, width, height) {
    const gradient = ctx.createLinearGradient(0, 0, 0, height)
    gradient.addColorStop(0, "#000000")
    gradient.addColorStop(0.4, "#000000")
    gradient.addColorStop(0.7, "#000000")
    gradient.addColorStop(1, "#000000")
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, width, height)

    ctx.fillStyle = "#ffffff08"
    for (let i = 0; i < 30; i++) {
      const x = Math.random() * width
      const y = Math.random() * height
      const size = Math.random() * 1.2 + 0.4
      ctx.beginPath()
      ctx.arc(x, y, size, 0, Math.PI * 2)
      ctx.fill()
    }

    ctx.strokeStyle = "#ffffff22"
    ctx.lineWidth = 2
    this.roundRect(ctx, 10, 10, width - 20, height - 20, 12)
    ctx.stroke()
  }

  drawHeader(ctx, title, subtitle, width) {
    const barHeight = 100
    const gradient = ctx.createLinearGradient(0, 0, width, 0)
    gradient.addColorStop(0, `${COLORS.crimson}18`)
    gradient.addColorStop(0.5, `${COLORS.crimson}08`)
    gradient.addColorStop(1, `${COLORS.crimson}18`)
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, width, barHeight)

    ctx.strokeStyle = `${COLORS.crimson}55`
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(0, barHeight)
    ctx.lineTo(width, barHeight)
    ctx.stroke()

    ctx.fillStyle = COLORS.crimson
    ctx.font = "bold 36px sans-serif"
    ctx.textAlign = "center"
    ctx.fillText(title, width / 2, 50)

    if (subtitle) {
      ctx.fillStyle = COLORS.white
      ctx.font = "18px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText(subtitle, width / 2, 80)
    }
  }

  drawFooter(ctx, text, width, height) {
    const barHeight = 30
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)"
    ctx.fillRect(0, height - barHeight, width, barHeight)

    ctx.strokeStyle = `${COLORS.crimson}33`
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(0, height - barHeight)
    ctx.lineTo(width, height - barHeight)
    ctx.stroke()

    ctx.fillStyle = COLORS.crimson
    ctx.font = "12px sans-serif"
    ctx.textAlign = "center"
    ctx.fillText(text || "KENNYJAKS", width / 2, height - 12)
  }
}