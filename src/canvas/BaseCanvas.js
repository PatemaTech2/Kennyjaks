import { createCanvas, registerFont, loadImage } from "canvas"
import path from "path"
import fs from "fs-extra"
import { COLORS } from "./constants.js"
import { getPlayerAvatar } from "../services/avatar/WhatsAppAvatarService.js"

const CARD_WIDTH = 1200
const CARD_HEIGHT = 700

export const THEME = {
  profile: {
    bg1: "#0a0a12",
    bg2: "#0d0715",
    bg3: "#0a0720",
    bg4: "#050210",
    accent: COLORS.gold,
    panel: "rgba(13, 17, 23, 0.85)",
    border: "rgba(218, 165, 32, 0.25)",
    glow: COLORS.gold,
    headerText: COLORS.gold,
    subText: COLORS.gray,
    bodyText: COLORS.white,
    muted: COLORS.gray
  },
  battle: {
    bg1: "#0a0008",
    bg2: "#150510",
    bg3: "#0a0515",
    bg4: "#050208",
    accent: COLORS.crimson,
    panel: "rgba(10, 0, 5, 0.85)",
    border: "rgba(220, 20, 60, 0.3)",
    glow: COLORS.crimson,
    headerText: COLORS.crimson,
    subText: "#8888aa",
    bodyText: COLORS.white,
    muted: "#666688"
  },
  wallet: {
    bg1: "#0a0f1a",
    bg2: "#0a0a14",
    bg3: "#0d0d20",
    bg4: "#060612",
    accent: COLORS.ce,
    panel: "rgba(10, 15, 26, 0.85)",
    border: "rgba(0, 183, 255, 0.25)",
    glow: COLORS.ce,
    headerText: COLORS.ce,
    subText: "#8899bb",
    bodyText: COLORS.white,
    muted: "#667788"
  },
  bank: {
    bg1: "#0a0d0a",
    bg2: "#0a120a",
    bg3: "#0d150d",
    bg4: "#050805",
    accent: COLORS.gold,
    panel: "rgba(10, 13, 10, 0.85)",
    border: "rgba(255, 215, 0, 0.25)",
    glow: COLORS.gold,
    headerText: COLORS.gold,
    subText: "#99aa88",
    bodyText: COLORS.white,
    muted: "#778866"
  },
  technique: {
    bg1: "#0d0a15",
    bg2: "#100a1e",
    bg3: "#0a0520",
    bg4: "#050210",
    accent: COLORS.purple,
    panel: "rgba(13, 10, 21, 0.85)",
    border: "rgba(170, 68, 255, 0.25)",
    glow: COLORS.purple,
    headerText: COLORS.purple,
    subText: "#9988cc",
    bodyText: COLORS.white,
    muted: "#7766aa"
  },
  domain: {
    bg1: "#08000f",
    bg2: "#100018",
    bg3: "#0a0020",
    bg4: "#030008",
    accent: COLORS.crimson,
    panel: "rgba(8, 0, 15, 0.9)",
    border: "rgba(220, 20, 60, 0.4)",
    glow: COLORS.crimson,
    headerText: COLORS.crimson,
    subText: "#cc88aa",
    bodyText: COLORS.white,
    muted: "#884466"
  },
  rct: {
    bg1: "#0a0808",
    bg2: "#120a0a",
    bg3: "#150808",
    bg4: "#080505",
    accent: "#ff6b6b",
    panel: "rgba(18, 10, 10, 0.85)",
    border: "rgba(255, 107, 107, 0.3)",
    glow: "#ff6b6b",
    headerText: "#ff6b6b",
    subText: "#cc8888",
    bodyText: COLORS.white,
    muted: "#aa6666"
  },
  leaderboard: {
    bg1: "#0d0d12",
    bg2: "#101018",
    bg3: "#0a0a14",
    bg4: "#050508",
    accent: COLORS.gold,
    panel: "rgba(16, 16, 24, 0.85)",
    border: "rgba(218, 165, 32, 0.2)",
    glow: COLORS.gold,
    headerText: COLORS.gold,
    subText: "#888899",
    bodyText: COLORS.white,
    muted: "#666677"
  },
  loot: {
    bg1: "#0a0a10",
    bg2: "#0f0f18",
    bg3: "#0a0a14",
    bg4: "#040408",
    accent: COLORS.xp,
    panel: "rgba(15, 15, 24, 0.85)",
    border: "rgba(170, 68, 255, 0.25)",
    glow: COLORS.xp,
    headerText: COLORS.xp,
    subText: "#9988cc",
    bodyText: COLORS.white,
    muted: "#7766aa"
  },
  victory: {
    bg1: "#050a05",
    bg2: "#081208",
    bg3: "#0a150a",
    bg4: "#020502",
    accent: COLORS.gold,
    panel: "rgba(8, 18, 8, 0.85)",
    border: "rgba(255, 215, 0, 0.3)",
    glow: COLORS.gold,
    headerText: COLORS.gold,
    subText: "#88aa66",
    bodyText: COLORS.white,
    muted: "#667744"
  },
  defeat: {
    bg1: "#0a0505",
    bg2: "#120808",
    bg3: "#150a0a",
    bg4: "#080404",
    accent: COLORS.red,
    panel: "rgba(18, 8, 8, 0.85)",
    border: "rgba(255, 68, 68, 0.25)",
    glow: COLORS.red,
    headerText: COLORS.red,
    subText: "#aa6666",
    bodyText: COLORS.white,
    muted: "#884444"
  }
}

export class BaseCanvas {
  constructor() {
    this.fontsLoaded = false
    this.avatarSock = null
    this.avatarJid = null
    this.theme = THEME.profile
  }

  setTheme(name) {
    this.theme = THEME[name] || THEME.profile
  }

  setAvatarContext(sock, jid) {
    this.avatarSock = sock
    this.avatarJid = jid
  }

  async ensureFonts() {
    if (this.fontsLoaded) return
    try {
      const fontPath = path.join(process.cwd(), "src", "canvas", "assets", "fonts", "main.ttf")
      if (await fs.pathExists(fontPath)) {
        registerFont(fontPath, { family: "main" })
      }
    } catch {
      // fallback to default
    }
    this.fontsLoaded = true
  }

  createCanvas(width = CARD_WIDTH, height = CARD_HEIGHT) {
    return createCanvas(width, height)
  }

  drawBackground(ctx, width = CARD_WIDTH, height = CARD_HEIGHT) {
    const g = this.theme
    const gradient = ctx.createLinearGradient(0, 0, 0, height)
    gradient.addColorStop(0, g.bg1)
    gradient.addColorStop(0.4, g.bg2)
    gradient.addColorStop(0.7, g.bg3)
    gradient.addColorStop(1, g.bg4)
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, width, height)

    ctx.fillStyle = `${g.accent}08`
    for (let i = 0; i < 60; i++) {
      const x = Math.random() * width
      const y = Math.random() * height
      const size = Math.random() * 1.2 + 0.4
      ctx.beginPath()
      ctx.arc(x, y, size, 0, Math.PI * 2)
      ctx.fill()
    }

    ctx.strokeStyle = `${g.accent}33`
    ctx.lineWidth = 3
    this.roundRect(ctx, 10, 10, width - 20, height - 20, 12)
    ctx.stroke()
  }

  roundRect(ctx, x, y, width, height, radius) {
    radius = Math.min(radius, width / 2, height / 2)
    ctx.beginPath()
    ctx.moveTo(x + radius, y)
    ctx.lineTo(x + width - radius, y)
    ctx.quadraticCurveTo(x + width, y, x + width, y + height - radius)
    ctx.lineTo(x + width - radius, y + height)
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
    ctx.lineTo(x + radius, y + height)
    ctx.quadraticCurveTo(x, y + height, x + radius, y + height)
    ctx.lineTo(x, y + height - radius)
    ctx.quadraticCurveTo(x, y, x + radius, y)
    ctx.closePath()
  }

  drawPanel(ctx, x, y, width, height, title, opts = {}) {
    const g = this.theme
    const pad = opts.padding ?? 18
    const radius = opts.radius ?? 14

    const bg = ctx.createLinearGradient(x, y, x, y + height)
    bg.addColorStop(0, g.panel)
    bg.addColorStop(1, `${g.panel}dd`)
    ctx.fillStyle = bg
    this.roundRect(ctx, x, y, width, height, radius)
    ctx.fill()

    ctx.strokeStyle = g.border
    ctx.lineWidth = 1.5
    this.roundRect(ctx, x, y, width, height, radius)
    ctx.stroke()

    if (title) {
      ctx.fillStyle = g.subText
      ctx.font = "bold 15px sans-serif"
      ctx.textAlign = "left"
      ctx.fillText(title.toUpperCase(), x + pad, y + 22)
    }
  }

  drawHeader(ctx, title, subtitle, width = CARD_WIDTH) {
    const g = this.theme
    const barHeight = 110
    const gradient = ctx.createLinearGradient(0, 0, width, 0)
    gradient.addColorStop(0, `${g.accent}18`)
    gradient.addColorStop(0.5, `${g.accent}08`)
    gradient.addColorStop(1, `${g.accent}18`)
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, width, barHeight)

    ctx.strokeStyle = `${g.accent}55`
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(0, barHeight)
    ctx.lineTo(width, barHeight)
    ctx.stroke()

    ctx.fillStyle = g.headerText
    ctx.font = "bold 42px sans-serif"
    ctx.textAlign = "center"
    ctx.fillText(title, width / 2, 58)

    if (subtitle) {
      ctx.fillStyle = g.subText
      ctx.font = "20px sans-serif"
      ctx.fillText(subtitle, width / 2, 86)
    }
  }

  drawFooter(ctx, text, width = CARD_WIDTH, height = CARD_HEIGHT) {
    const g = this.theme
    const barHeight = 36
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)"
    ctx.fillRect(0, height - barHeight, width, barHeight)

    ctx.strokeStyle = `${g.accent}33`
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(0, height - barHeight)
    ctx.lineTo(width, height - barHeight)
    ctx.stroke()

    ctx.fillStyle = g.accent
    ctx.font = "15px sans-serif"
    ctx.textAlign = "center"
    ctx.fillText(text || "KENNYJAKS", width / 2, height - 12)
  }

  drawProgressBar(ctx, x, y, width, height, current, max, label, opts = {}) {
    const g = this.theme
    const color = opts.color || g.accent
    const safeMax = Math.max(1, max || 1)
    const safeCurrent = Math.max(0, Math.min(current || 0, safeMax))
    const pct = Math.min(1, safeCurrent / safeMax)
    const barH = height || 28
    const radius = barH / 2

    if (label) {
      ctx.fillStyle = g.bodyText
      ctx.font = "bold 14px sans-serif"
      ctx.textAlign = "left"
      ctx.fillText(label, x, y - 8)
    }

    ctx.fillStyle = "#1a1a30"
    this.roundRect(ctx, x, y, width, barH, radius)
    ctx.fill()

    if (pct > 0.001) {
      const fillW = width * pct
      const grd = ctx.createLinearGradient(x, y, x + fillW, y)
      grd.addColorStop(0, color)
      grd.addColorStop(1, `${color}aa`)
      ctx.fillStyle = grd
      this.roundRect(ctx, x, y, fillW, barH, radius)
      ctx.fill()
    }

    ctx.strokeStyle = `${color}55`
    ctx.lineWidth = 1
    this.roundRect(ctx, x, y, width, barH, radius)
    ctx.stroke()

    const pctText = `${Math.round(pct * 100)}%`
    ctx.fillStyle = COLORS.white
    ctx.font = "bold 13px sans-serif"
    ctx.textAlign = "center"
    ctx.fillText(pctText, x + width / 2, y + barH / 2 + 5)
  }

  drawMiniStat(ctx, x, y, width, label, value, opts = {}) {
    const g = this.theme
    const color = opts.color || g.bodyText
    const icon = opts.icon || ""
    const align = opts.align || "between"

    ctx.fillStyle = g.muted
    ctx.font = "13px sans-serif"
    ctx.textAlign = "left"
    ctx.fillText(`${icon} ${label}`, x, y + 14)

    ctx.fillStyle = color
    ctx.font = "bold 14px sans-serif"
    if (align === "right") {
      ctx.textAlign = "right"
      ctx.fillText(String(value ?? "—"), x + width, y + 14)
    } else {
      ctx.textAlign = "right"
      ctx.fillText(String(value ?? "—"), x + width, y + 14)
    }
  }

  drawBadge(ctx, x, y, text, color, opts = {}) {
    const g = this.theme
    const bg = opts.bg || `${color || g.accent}22`
    const border = opts.border || `${color || g.accent}66`
    const textColor = opts.textColor || color || g.accent

    ctx.fillStyle = bg
    this.roundRect(ctx, x, y, opts.width || 120, 28, 8)
    ctx.fill()
    ctx.strokeStyle = border
    ctx.lineWidth = 1.2
    this.roundRect(ctx, x, y, opts.width || 120, 28, 8)
    ctx.stroke()

    ctx.fillStyle = textColor
    ctx.font = "bold 13px sans-serif"
    ctx.textAlign = "center"
    ctx.fillText(text, x + (opts.width || 120) / 2, y + 18)
  }

  drawDivider(ctx, x, y, width, color) {
    const g = this.theme
    ctx.strokeStyle = color || `${g.accent}33`
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineTo(x + width, y)
    ctx.stroke()
  }

  async drawAvatar(ctx, player, x, y, size = 140) {
    const g = this.theme
    const borderWidth = 5
    const radius = 16

    ctx.fillStyle = "#12122a"
    this.roundRect(ctx, x, y, size, size, radius)
    ctx.fill()

    ctx.strokeStyle = `${g.accent}88`
    ctx.lineWidth = borderWidth
    this.roundRect(ctx, x - 2, y - 2, size + 4, size + 4, radius + 2)
    ctx.stroke()

    ctx.strokeStyle = `${g.accent}44`
    ctx.lineWidth = 1.5
    this.roundRect(ctx, x + 1, y + 1, size - 2, size - 2, radius - 1)
    ctx.stroke()

    const profilePic = player.profilePic || player.avatar || null

    if (profilePic) {
      try {
        let img = null
        if (profilePic.startsWith("http")) {
          if (this.avatarSock) {
            const avatarBuffer = await getPlayerAvatar(this.avatarSock, this.avatarJid)
            if (avatarBuffer) {
              img = await loadImage(avatarBuffer)
            }
          }
        } else {
          const { readFile } = await import("fs-extra")
          const buffer = await readFile(profilePic)
          img = await loadImage(buffer)
        }

        if (img) {
          ctx.save()
          this.roundRect(ctx, x + borderWidth, y + borderWidth, size - borderWidth * 2, size - borderWidth * 2, radius - 4)
          ctx.clip()
          const s = Math.max((size - borderWidth * 2) / img.width, (size - borderWidth * 2) / img.height)
          const drawW = img.width * s
          const drawH = img.height * s
          ctx.drawImage(img, x + borderWidth + (size - borderWidth * 2 - drawW) / 2, y + borderWidth + (size - borderWidth * 2 - drawH) / 2, drawW, drawH)
          ctx.restore()
          return
        }
      } catch (err) {
        console.error("[KENNYJAKS ERROR] Avatar draw failed:", err.message)
      }
    }

    if (this.avatarSock && this.avatarJid) {
      try {
        const avatarBuffer = await getPlayerAvatar(this.avatarSock, this.avatarJid)
        if (avatarBuffer) {
          const img = await loadImage(avatarBuffer)
          ctx.save()
          this.roundRect(ctx, x + borderWidth, y + borderWidth, size - borderWidth * 2, size - borderWidth * 2, radius - 4)
          ctx.clip()
          ctx.drawImage(img, x + borderWidth, y + borderWidth, size - borderWidth * 2, size - borderWidth * 2)
          ctx.restore()
          return
        }
      } catch (err) {
        console.error("[KENNYJAKS ERROR] Avatar draw failed:", err.message)
      }
    }

    const name = (player.name || "??").slice(0, 2).toUpperCase()
    ctx.fillStyle = COLORS.white
    ctx.font = "bold 52px sans-serif"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText(name, x + size / 2, y + size / 2)
  }

  drawEnemyArt(ctx, opponent, x, y, size) {
    const g = this.theme
    const radius = size / 2

    ctx.fillStyle = `${g.accent}15`
    ctx.beginPath()
    ctx.arc(x + radius, y + radius, radius, 0, Math.PI * 2)
    ctx.fill()

    ctx.strokeStyle = `${g.accent}88`
    ctx.lineWidth = 4
    ctx.beginPath()
    ctx.arc(x + radius, y + radius, radius - 4, 0, Math.PI * 2)
    ctx.stroke()

    const initial = (opponent.name || "?").slice(0, 1).toUpperCase()
    ctx.fillStyle = COLORS.white
    ctx.font = "bold 56px sans-serif"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText(initial, x + radius, y + radius)
  }

  drawBar(ctx, x, y, width, height, label, current, max, color) {
    const g = this.theme
    const safeMax = Math.max(1, max || 1)
    const safeCurrent = Math.max(0, Math.min(current || 0, safeMax))
    const pct = Math.min(1, safeCurrent / safeMax)
    const fillWidth = width * pct
    const barRadius = Math.min(6, height / 2)

    ctx.fillStyle = "#18182a"
    this.roundRect(ctx, x, y, width, height, barRadius)
    ctx.fill()

    if (fillWidth > 0.5) {
      const grd = ctx.createLinearGradient(x, y, x + fillWidth, y)
      grd.addColorStop(0, color)
      grd.addColorStop(1, this.lightenColor(color, 0.3))
      ctx.fillStyle = grd
      this.roundRect(ctx, x, y, fillWidth, height, barRadius)
      ctx.fill()
    }

    ctx.strokeStyle = `${color}44`
    ctx.lineWidth = 1
    this.roundRect(ctx, x, y, width, height, barRadius)
    ctx.stroke()

    ctx.fillStyle = COLORS.white
    ctx.font = "bold 13px sans-serif"
    ctx.textAlign = "center"
    ctx.fillText(`${label} ${Math.floor(safeCurrent)} / ${Math.floor(safeMax)}`, x + width / 2, y + height / 2 + 5)
  }

  drawBattlePanel(ctx, x, y, width, title, hp, maxHp, ce, maxCe, opts = {}) {
    const g = this.theme
    const pad = 18
    const panelH = 140

    const bg = ctx.createLinearGradient(x, y, x, y + panelH)
    bg.addColorStop(0, `${g.accent}0d`)
    bg.addColorStop(1, `${g.accent}05`)
    ctx.fillStyle = bg
    this.roundRect(ctx, x, y, width, panelH, 14)
    ctx.fill()

    ctx.strokeStyle = g.border
    ctx.lineWidth = 1.2
    this.roundRect(ctx, x, y, width, panelH, 14)
    ctx.stroke()

    ctx.fillStyle = g.headerText
    ctx.font = "bold 22px sans-serif"
    ctx.textAlign = "left"
    ctx.fillText(title, x + pad, y + 32)

    const barY = y + 48
    const barW = width - pad * 2
    this.drawBar(ctx, x + pad, barY, barW, 22, "HP", hp, maxHp, opts.hpColor || COLORS.hp)
    this.drawBar(ctx, x + pad, barY + 34, barW, 22, "CE", ce, maxCe, opts.ceColor || COLORS.ce)
  }

  drawItemCard(ctx, x, y, width, icon, name, subtitle, rarity, opts = {}) {
    const g = this.theme
    const h = opts.height || 70
    const pad = 14
    const rarityColors = {
      common: "#aaaacc",
      uncommon: COLORS.hp,
      rare: COLORS.ce,
      epic: COLORS.purple,
      legendary: COLORS.gold,
      mythic: COLORS.crimson
    }
    const rc = rarityColors[rarity] || g.muted

    ctx.fillStyle = `${g.accent}08`
    this.roundRect(ctx, x, y, width, h, 10)
    ctx.fill()
    ctx.strokeStyle = `${rc}44`
    ctx.lineWidth = 1
    this.roundRect(ctx, x, y, width, h, 10)
    ctx.stroke()

    if (icon) {
      ctx.fillStyle = COLORS.white
      ctx.font = "26px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText(icon, x + 30, y + h / 2 + 8)
    }

    ctx.fillStyle = COLORS.white
    ctx.font = "bold 16px sans-serif"
    ctx.textAlign = "left"
    ctx.fillText(this.truncate(name, 22), x + pad + (icon ? 30 : 0), y + 26)

    if (subtitle) {
      ctx.fillStyle = g.muted
      ctx.font = "14px sans-serif"
      ctx.fillText(this.truncate(subtitle, 30), x + pad + (icon ? 30 : 0), y + 46)
    }

    if (rarity) {
      ctx.fillStyle = rc
      ctx.font = "bold 12px sans-serif"
      ctx.textAlign = "right"
      ctx.fillText((rarity || "").toUpperCase(), x + width - pad, y + h / 2 + 4)
    }
  }

  drawSkillCard(ctx, x, y, width, icon, name, status, mastery, opts = {}) {
    const g = this.theme
    const h = opts.height || 56
    const pad = 14
    const statusColor = status === "UNLOCKED" ? COLORS.hp : status === "LOCKED" ? COLORS.red : g.muted

    ctx.fillStyle = `${g.accent}06`
    this.roundRect(ctx, x, y, width, h, 10)
    ctx.fill()
    ctx.strokeStyle = `${g.accent}22`
    ctx.lineWidth = 1
    this.roundRect(ctx, x, y, width, h, 10)
    ctx.stroke()

    ctx.fillStyle = COLORS.white
    ctx.font = "bold 16px sans-serif"
    ctx.textAlign = "left"
    ctx.fillText(`${icon || "✦"} ${this.truncate(name, 24)}`, x + pad, y + 26)

    ctx.fillStyle = statusColor
    ctx.font = "bold 13px sans-serif"
    ctx.textAlign = "right"
    ctx.fillText(status || "—", x + width - pad, y + 26)

    if (mastery != null && status === "UNLOCKED") {
      this.drawProgressBar(ctx, x + pad, y + 34, width - pad * 2, 10, mastery, 100, "", { color: g.accent })
    }
  }

  drawRewardCard(ctx, x, y, width, icon, name, amount, opts = {}) {
    const g = this.theme
    const h = 48
    const pad = 14

    ctx.fillStyle = `${g.accent}08`
    this.roundRect(ctx, x, y, width, h, 8)
    ctx.fill()

    ctx.fillStyle = COLORS.white
    ctx.font = "bold 15px sans-serif"
    ctx.textAlign = "left"
    ctx.fillText(`${icon || "✦"} ${this.truncate(name, 24)}`, x + pad, y + 20)

    ctx.fillStyle = g.accent
    ctx.font = "bold 15px sans-serif"
    ctx.textAlign = "right"
    ctx.fillText(`+${(amount || 0).toLocaleString()}`, x + width - pad, y + 20)
  }

  drawGlow(ctx, x, y, width, height, color, blur) {
    ctx.save()
    ctx.shadowColor = color || this.theme.accent
    ctx.shadowBlur = blur || 20
    ctx.strokeStyle = `${color || this.theme.accent}44`
    ctx.lineWidth = 2
    this.roundRect(ctx, x, y, width, height, 14)
    ctx.stroke()
    ctx.restore()
  }

  formatCanvasValue(value, fallback = "—") {
    if (value === null || value === undefined) return fallback
    if (Number.isNaN(value)) return fallback
    if (typeof value === "number" && !Number.isFinite(value)) return fallback
    return String(value)
  }

  truncate(text, max) {
    const str = String(text || "")
    return str.length > max ? str.slice(0, max - 1) + "…" : str
  }

  lightenColor(hex, amount) {
    const num = parseInt(hex.replace("#", ""), 16)
    const r = Math.min(255, (num >> 16) + Math.floor(255 * amount))
    const g = Math.min(255, ((num >> 8) & 0x00ff00) + Math.floor(255 * amount))
    const b = Math.min(255, (num & 0x0000ff) + Math.floor(255 * amount))
    return `rgb(${r}, ${g}, ${b})`
  }

  toBuffer(canvas, format = "image/png") {
    return canvas.toBuffer(format)
  }
}
