import { BaseCanvas } from "./BaseCanvas.js"
import { getSpriteBuffer } from "../services/sprite/SpriteService.js"
import { loadImage } from "canvas"
import fs from "fs-extra"

const WHITE = "#ffffff"
const MUTED = "#777777"
const GRID = "rgba(255,255,255,0.08)"
const ACCENT = "#00ff88"

function drawHexagon(ctx, cx, cy, r, fill, stroke) {
  ctx.beginPath()
  for (let i = 0; i < 6; i++) {
    const angle = Math.PI / 180 * (60 * i - 30)
    const x = cx + r * Math.cos(angle)
    const y = cy + r * Math.sin(angle)
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.closePath()
  if (fill) {
    ctx.fillStyle = fill
    ctx.fill()
  }
  if (stroke) {
    ctx.strokeStyle = stroke
    ctx.lineWidth = 1
    ctx.stroke()
  }
}

function drawTechGrid(ctx, x, y, w, h) {
  ctx.strokeStyle = GRID
  ctx.lineWidth = 1
  for (let gx = x; gx <= x + w; gx += 24) {
    ctx.beginPath()
    ctx.moveTo(gx, y)
    ctx.lineTo(gx, y + h)
    ctx.stroke()
  }
  for (let gy = y; gy <= y + h; gy += 24) {
    ctx.beginPath()
    ctx.moveTo(x, gy)
    ctx.lineTo(x + w, gy)
    ctx.stroke()
  }
}

function drawCornerBrackets(ctx, x, y, w, h, color = WHITE, size = 18, lineWidth = 3) {
  ctx.strokeStyle = color
  ctx.lineWidth = lineWidth
  const corners = [
    [x, y, 1, 1],
    [x + w, y, -1, 1],
    [x, y + h, 1, -1],
    [x + w, y + h, -1, -1]
  ]
  for (const [cx, cy, dx, dy] of corners) {
    ctx.beginPath()
    ctx.moveTo(cx + dx * size, cy)
    ctx.lineTo(cx, cy)
    ctx.lineTo(cx, cy + dy * size)
    ctx.stroke()
  }
}

export class ProfileTechCanvas extends BaseCanvas {
  constructor() {
    super()
    this.setTheme("profile")
  }

  async render(player) {
    await this.ensureFonts()
    const W = 900
    const H = 560
    const canvas = this.createCanvas(W, H)
    const ctx = canvas.getContext("2d")

    ctx.fillStyle = "#000000"
    ctx.fillRect(0, 0, W, H)

    drawTechGrid(ctx, 0, 0, W, H)

    ctx.strokeStyle = WHITE
    ctx.lineWidth = 2
    ctx.strokeRect(20, 20, W - 40, H - 40)

    drawHexagon(ctx, 50, 45, 16, WHITE, WHITE)
    drawHexagon(ctx, 78, 45, 16, null, WHITE)
    drawHexagon(ctx, 106, 45, 16, null, WHITE)

    const name = this.cleanText(player.name || "SORCERER")
    ctx.fillStyle = WHITE
    ctx.font = "bold 48px monospace"
    ctx.textAlign = "left"
    ctx.fillText(name.slice(0, 16), 40, 95)

    const title = this.cleanText(player.profileTitle || "SORCERER")
    ctx.font = "bold 20px monospace"
    ctx.fillText(title.slice(0, 22), 40, 125)

    ctx.font = "14px monospace"
    ctx.fillStyle = MUTED
    ctx.fillText(`ID: ${player.playerId || "UNKNOWN"}`, 40, 155)

    const avatarX = 40
    const avatarY = 180
    const avatarW = 240
    const avatarH = 320
    ctx.strokeStyle = WHITE
    ctx.lineWidth = 2
    ctx.strokeRect(avatarX, avatarY, avatarW, avatarH)
    drawCornerBrackets(ctx, avatarX, avatarY, avatarW, avatarH)

    ctx.save()
    ctx.beginPath()
    ctx.rect(avatarX + 8, avatarY + 8, avatarW - 16, avatarH - 16)
    ctx.clip()
    drawTechGrid(ctx, avatarX + 8, avatarY + 8, avatarW - 16, avatarH - 16)

    let img = null
    const avatarUrl = player.profilePic || player.avatar
    if (avatarUrl) {
      try {
        if (avatarUrl.startsWith("http")) {
          const buffer = await this.getRemoteAvatar(avatarUrl)
          if (buffer) img = await loadImage(buffer)
        } else {
          const buffer = await fs.readFile(avatarUrl)
          img = await loadImage(buffer)
        }
      } catch {}
    }
    if (!img && player.currentSprite) {
      try {
        const buffer = getSpriteBuffer(player.currentSprite)
        if (buffer) img = await loadImage(buffer)
      } catch {}
    }

    if (img) {
      const s = Math.min((avatarW - 24) / img.width, (avatarH - 24) / img.height)
      const drawW = img.width * s
      const drawH = img.height * s
      const drawX = avatarX + (avatarW - drawW) / 2
      const drawY = avatarY + (avatarH - drawH) / 2
      ctx.drawImage(img, drawX, drawY, drawW, drawH)
    } else {
      ctx.fillStyle = "#111111"
      ctx.fillRect(avatarX + 8, avatarY + 8, avatarW - 16, avatarH - 16)
      ctx.fillStyle = WHITE
      ctx.font = "bold 36px monospace"
      ctx.textAlign = "center"
      const initials = (player.name || "??").slice(0, 2).toUpperCase()
      ctx.fillText(initials, avatarX + avatarW / 2, avatarY + avatarH / 2 + 12)
    }
    ctx.restore()

    const panelX = 310
    const panelY = 180
    const panelW = 570
    const panelH = 160
    ctx.strokeStyle = WHITE
    ctx.lineWidth = 2
    ctx.strokeRect(panelX, panelY, panelW, panelH)

    ctx.fillStyle = MUTED
    ctx.font = "14px monospace"
    ctx.fillText("STATS", panelX + 20, panelY + 30)

    const rows = [
      ["GRADE", player.sorcererGrade || "GRADE 4", "LEVEL", String(player.level || 1)],
      ["XP", String(player.xp || 0), "WALLET", `¥${(player.wallet || 0).toLocaleString()}`],
      ["BANK", `¥${(player.bank || 0).toLocaleString()}`, "REPUTATION", String(player.reputation || 0)],
      ["POTENTIAL", player.potential || "F", "CURSE KILLS", String(player.curseKills || 0)]
    ]

    let ry = panelY + 60
    for (const [l1, v1, l2, v2] of rows) {
      ctx.fillStyle = MUTED
      ctx.font = "13px monospace"
      ctx.fillText(l1, panelX + 20, ry)
      ctx.fillStyle = WHITE
      ctx.font = "bold 15px monospace"
      ctx.fillText(this.truncate(v1, 22), panelX + 20, ry + 22)

      ctx.fillStyle = MUTED
      ctx.font = "13px monospace"
      ctx.fillText(l2, panelX + 300, ry)
      ctx.fillStyle = WHITE
      ctx.font = "bold 15px monospace"
      ctx.fillText(this.truncate(v2, 22), panelX + 300, ry + 22)

      ry += 38
    }

    const achPanelY = 360
    const achPanelH = 160
    ctx.strokeStyle = WHITE
    ctx.lineWidth = 2
    ctx.strokeRect(panelX, achPanelY, panelW, achPanelH)

    ctx.fillStyle = ACCENT
    ctx.font = "14px monospace"
    ctx.fillText("ACHIEVEMENTS", panelX + 20, achPanelY + 30)

    const achievements = player.achievements || []
    if (achievements.length === 0) {
      ctx.fillStyle = MUTED
      ctx.font = "14px monospace"
      ctx.fillText("No achievements unlocked yet.", panelX + 20, achPanelY + 70)
    } else {
      let ay = achPanelY + 60
      const maxShow = Math.min(achievements.length, 5)
      for (let i = 0; i < maxShow; i++) {
        const ach = achievements[i]
        const achText = typeof ach === "string" ? ach : (ach.name || ach.id || "Unknown")
        ctx.fillStyle = WHITE
        ctx.font = "14px monospace"
        ctx.fillText(`${i + 1}. ${this.truncate(achText, 42)}`, panelX + 30, ay)
        ay += 28
      }
      if (achievements.length > 5) {
        ctx.fillStyle = MUTED
        ctx.font = "13px monospace"
        ctx.fillText(`...and ${achievements.length - 5} more`, panelX + 30, ay)
      }
    }

    const footerY = H - 45
    ctx.strokeStyle = WHITE
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(40, footerY)
    ctx.lineTo(W - 40, footerY)
    ctx.stroke()

    ctx.fillStyle = WHITE
    ctx.font = "bold 18px monospace"
    ctx.textAlign = "center"
    ctx.fillText("KENNYJAKS", W / 2, footerY + 25)

    ctx.fillStyle = MUTED
    ctx.font = "11px monospace"
    ctx.fillText("SORCERER DATABASE // TECH PROFILE", W / 2, footerY + 42)

    return this.toBuffer(canvas)
  }

  async getRemoteAvatar(url) {
    try {
      const response = await fetch(url)
      if (!response.ok) return null
      return Buffer.from(await response.arrayBuffer())
    } catch {
      return null
    }
  }

  cleanText(text) {
    if (!text) return ""
    return text
      .replace(/[\u{1F000}-\u{1FFFF}]/gu, "")
      .replace(/[\u{2600}-\u{27FF}]/gu, "")
      .replace(/\uFE0F/gu, "")
      .replace(/\s+/g, " ")
      .trim()
  }

  truncate(text, max) {
    if (text.length <= max) return text
    return text.slice(0, max - 1) + "…"
  }
}