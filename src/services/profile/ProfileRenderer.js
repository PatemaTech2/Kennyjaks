import { createCanvas, loadImage, registerFont } from "canvas"
import path from "path"
import fs from "fs-extra"
import { xpForLevel } from "../GradeService.js"

const CARD_WIDTH = 1200
const CARD_HEIGHT = 700

export class ProfileRenderer {
  constructor() {
    this.fontsLoaded = false
  }

  async ensureFonts() {
    if (this.fontsLoaded) return
    try {
      registerFont(path.join(process.cwd(), "assets/profile", "fonts.ttf"), { family: "main" })
    } catch {
      // fallback to default
    }
    this.fontsLoaded = true
  }

  async render(player) {
    await this.ensureFonts()
    const canvas = createCanvas(CARD_WIDTH, CARD_HEIGHT)
    const ctx = canvas.getContext("2d")

    this.drawBackground(ctx)
    this.drawHeader(ctx, player)
    this.drawAvatar(ctx, player)
    this.drawInfo(ctx, player)
    this.drawBars(ctx, player)
    this.drawStats(ctx, player)
    this.drawMoney(ctx, player)
    this.drawFooter(ctx)

    const buffer = canvas.toBuffer("image/png")
    return buffer
  }

  drawBackground(ctx) {
    const gradient = ctx.createLinearGradient(0, 0, CARD_WIDTH, CARD_HEIGHT)
    gradient.addColorStop(0, "#0a0a1a")
    gradient.addColorStop(0.5, "#0f0f2e")
    gradient.addColorStop(1, "#1a0a2e")
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT)

    ctx.fillStyle = "rgba(0, 150, 255, 0.03)"
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * CARD_WIDTH
      const y = Math.random() * CARD_HEIGHT
      const r = Math.random() * 2 + 1
      ctx.beginPath()
      ctx.arc(x, y, r, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  drawHeader(ctx, player) {
    ctx.fillStyle = "#ffffff"
    ctx.font = "bold 48px sans-serif"
    ctx.textAlign = "center"
    ctx.fillText("JUJUTSU HIGH", CARD_WIDTH / 2, 60)

    ctx.font = "24px sans-serif"
    ctx.fillStyle = "#8888ff"
    ctx.fillText("Student Identification", CARD_WIDTH / 2, 90)

    const gradeLabels = { 4: "GRADE 4", 3: "GRADE 3", 2: "GRADE 2", 1: "GRADE 1", 0: "SPECIAL GRADE" }
    ctx.font = "bold 20px sans-serif"
    ctx.fillStyle = "#ff4444"
    ctx.textAlign = "right"
    ctx.fillText(gradeLabels[player.grade] || "GRADE 4", CARD_WIDTH - 40, 50)
  }

  drawAvatar(ctx, player) {
    const x = 80
    const y = 130
    const size = 180

    ctx.fillStyle = "#1a1a3e"
    ctx.beginPath()
    ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2)
    ctx.fill()

    ctx.strokeStyle = "#4444ff"
    ctx.lineWidth = 4
    ctx.beginPath()
    ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2)
    ctx.stroke()

    const initials = (player.name || "??").slice(0, 2).toUpperCase()
    ctx.fillStyle = "#ffffff"
    ctx.font = "bold 60px sans-serif"
    ctx.textAlign = "center"
    ctx.fillText(initials, x + size / 2, y + size / 2 + 20)
  }

  drawInfo(ctx, player) {
    const x = 300
    let y = 150

    ctx.textAlign = "left"
    ctx.fillStyle = "#ffffff"
    ctx.font = "bold 36px sans-serif"
    ctx.fillText(player.name || "Unknown", x, y)

    y += 50
    ctx.font = "20px sans-serif"
    ctx.fillStyle = "#aaaaff"
    ctx.fillText(`Technique: ${player.technique?.name || "Unknown"}`, x, y)

    y += 35
    ctx.fillText(`Branch: ${player.technique?.branch || "Unknown"}`, x, y)

    y += 35
    ctx.fillText(`Level: ${player.level}`, x, y)

    y += 35
    ctx.fillText(`Age: 18`, x, y)
  }

  drawBars(ctx, player) {
    const x = 80
    let y = 340
    const barWidth = CARD_WIDTH - 160
    const barHeight = 30

    this.drawBar(ctx, x, y, barWidth, barHeight, "HP", player.health, player.maxHealth, "#00ff44")
    y += 50
    this.drawBar(ctx, x, y, barWidth, barHeight, "CE", player.cursedEnergy, player.maxCursedEnergy, "#0088ff")
    y += 50
    this.drawBar(ctx, x, y, barWidth, barHeight, "EXP", player.xp, xpForLevel(player.level), "#aa44ff")
  }

  drawBar(ctx, x, y, width, height, label, current, max, color) {
    ctx.fillStyle = "#222244"
    ctx.fillRect(x, y, width, height)

    const pct = Math.max(0, Math.min(1, current / Math.max(1, max)))
    const fillWidth = width * pct

    const gradient = ctx.createLinearGradient(x, y, x + fillWidth, y)
    gradient.addColorStop(0, color)
    gradient.addColorStop(1, "#ffffff")
    ctx.fillStyle = gradient
    ctx.fillRect(x, y, fillWidth, height)

    ctx.fillStyle = "#ffffff"
    ctx.font = "bold 16px sans-serif"
    ctx.textAlign = "center"
    ctx.fillText(`${label}: ${Math.floor(current)} / ${Math.floor(max)}`, x + width / 2, y + 20)
  }

  drawStats(ctx, player) {
    const x = 80
    let y = 490
    const stats = [
      ["Strength", player.strength],
      ["Speed", player.speed],
      ["HP", player.health],
      ["CE", player.cursedEnergy],
      ["Intelligence", player.intelligence],
      ["Skill Points", player.skillPoints || 0]
    ]

    ctx.font = "18px sans-serif"
    ctx.textAlign = "left"

    for (let i = 0; i < stats.length; i++) {
      const [name, value] = stats[i]
      ctx.fillStyle = "#aaaaff"
      ctx.fillText(`${name}:`, x + (i % 3) * 350, y + Math.floor(i / 3) * 30)
      ctx.fillStyle = "#ffffff"
      ctx.fillText(String(value), x + (i % 3) * 350 + 120, y + Math.floor(i / 3) * 30)
    }
  }

  drawMoney(ctx, player) {
    const x = 80
    const y = 590

    ctx.font = "20px sans-serif"
    ctx.textAlign = "left"
    ctx.fillStyle = "#ffdd44"
    ctx.fillText(`Wallet: ¥${(player.wallet || 0).toLocaleString()}`, x, y)
    ctx.fillText(`Bank: ¥${(player.bank || 0).toLocaleString()}`, x + 300, y)
    ctx.fillStyle = "#ffffff"
    ctx.fillText(`Wins: ${player.pvpWins || 0}`, x + 600, y)
    ctx.fillText(`Losses: ${player.pvpLosses || 0}`, x + 750, y)
  }

  drawFooter(ctx) {
    ctx.fillStyle = "#444466"
    ctx.font = "16px sans-serif"
    ctx.textAlign = "center"
    ctx.fillText("KENNYJAKS - The Shattered Sea - Jujutsu High", CARD_WIDTH / 2, CARD_HEIGHT - 20)
  }
}
