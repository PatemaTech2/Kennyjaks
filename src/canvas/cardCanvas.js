import { BaseCanvas } from "../canvas/BaseCanvas.js"
import { COLORS } from "../canvas/constants.js"
import { loadImageFromUrl } from "../utils/imageLoader.js"

const TIER_COLORS = {
  "1": "#a0a0a0",
  "2": "#4fc3f7",
  "3": "#ffb74d",
  "4": "#f06292",
  "5": "#ff5252",
  "6": "#ffd700"
}

const RARITY_COLORS = {
  "Common": "#a0a0a0",
  "Rare": "#4fc3f7",
  "Super Rare": "#7ee081",
  "Ultra Rare": "#f06292",
  "Secret Rare": "#c9a0ff",
  "Ultimate Rare": "#ffd700"
}

export class CardCanvas extends BaseCanvas {
  constructor() {
    super()
    this.setTheme("card")
  }

  async renderCard(card, playerName = "Sorcerer") {
    await this.ensureFonts()
    const W = 800
    const H = 1000
    const canvas = this.createCanvas(W, H)
    const ctx = canvas.getContext("2d")

    const isYugioh = card.isYugioh || card.category === "monster" || card.category === "spell" || card.category === "trap"
    const tierColor = isYugioh ? (RARITY_COLORS[card.rarity] || COLORS.muted) : (TIER_COLORS[card.tier] || COLORS.muted)

    ctx.fillStyle = "#000000"
    ctx.fillRect(0, 0, W, H)

    // Outer glow
    ctx.shadowColor = tierColor
    ctx.shadowBlur = 30
    ctx.strokeStyle = tierColor
    ctx.lineWidth = 6
    ctx.strokeRect(10, 10, W - 20, H - 20)
    ctx.shadowBlur = 0

    // Header
    ctx.fillStyle = "#1a1a1a"
    ctx.fillRect(30, 30, W - 60, 110)
    ctx.strokeStyle = tierColor
    ctx.lineWidth = 2
    ctx.strokeRect(30, 30, W - 60, 110)

    ctx.fillStyle = tierColor
    ctx.font = "bold 24px sans-serif"
    ctx.textAlign = "left"
    ctx.fillText(isYugioh ? (card.rarity || "Rare") : (card.tierLabel || card.tier || ""), 50, 65)

    if (isYugioh) {
      ctx.fillStyle = "#ffffff"
      ctx.font = "bold 20px sans-serif"
      ctx.textAlign = "right"
      ctx.fillText(card.attribute || "", W - 50, 65)
    }

    ctx.fillStyle = "#ffffff"
    ctx.font = "bold 26px sans-serif"
    ctx.textAlign = "center"
    const name = card.name || "Unknown Card"
    ctx.fillText(name.length > 28 ? name.slice(0, 28) + "..." : name, W / 2, 105)

    // Image area
    const imgX = 50
    const imgY = 170
    const imgW = W - 100
    const imgH = 480
    ctx.fillStyle = "#000000"
    ctx.fillRect(imgX, imgY, imgW, imgH)
    ctx.strokeStyle = tierColor
    ctx.lineWidth = 3
    ctx.strokeRect(imgX, imgY, imgW, imgH)

    let img = null
    if (card.image_url || card.image) {
      img = await loadImageFromUrl(card.image_url || card.image)
    }

    if (img) {
      const scale = Math.min(imgW / img.width, imgH / img.height)
      const drawW = img.width * scale
      const drawH = img.height * scale
      const drawX = imgX + (imgW - drawW) / 2
      const drawY = imgY + (imgH - drawH) / 2
      ctx.drawImage(img, drawX, drawY, drawW, drawH)
    } else {
      ctx.fillStyle = COLORS.muted
      ctx.font = "18px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText("[ Image unavailable ]", W / 2, imgY + imgH / 2)
    }

    // Stats area
    if (isYugioh) {
      ctx.fillStyle = "#1a1a1a"
      ctx.fillRect(50, 670, W - 100, 160)
      ctx.strokeStyle = tierColor
      ctx.lineWidth = 2
      ctx.strokeRect(50, 670, W - 100, 160)

      ctx.fillStyle = "#ffffff"
      ctx.font = "bold 22px sans-serif"
      ctx.textAlign = "left"
      ctx.fillText(`ATK: ${card.atv || 1000}`, 70, 715)
      ctx.fillText(`DEF: ${card.def || 500}`, 70, 755)
      ctx.fillText(`Level: ${card.level || 0}`, 70, 795)
      ctx.fillText(`Type: ${card.type || "Unknown"}`, 70, 835)

      ctx.fillStyle = tierColor
      ctx.font = "bold 18px sans-serif"
      ctx.textAlign = "right"
      ctx.fillText(card.category ? card.category.toUpperCase() : "MONSTER", W - 70, 715)
      ctx.fillText("YuGiOh", W - 70, 755)
    } else {
      ctx.fillStyle = "#1a1a1a"
      ctx.fillRect(50, 670, W - 100, 160)
      ctx.strokeStyle = tierColor
      ctx.lineWidth = 2
      ctx.strokeRect(50, 670, W - 100, 160)

      ctx.fillStyle = "#ffffff"
      ctx.font = "bold 22px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText(`Tier: ${card.tierLabel || card.tier || ""}`, W / 2, 715)
      ctx.fillText(`Worth: ¥${(card.worth || 0).toLocaleString()}`, W / 2, 755)
      ctx.fillText(`Series: ${card.series || "JJK"}`, W / 2, 795)
    }

    // Description
    ctx.fillStyle = "#2a2a2a"
    ctx.fillRect(50, 850, W - 100, 120)
    ctx.strokeStyle = tierColor
    ctx.lineWidth = 1
    ctx.strokeRect(50, 850, W - 100, 120)

    ctx.fillStyle = "#ffffff"
    ctx.font = "16px sans-serif"
    ctx.textAlign = "left"
    const desc = card.description || "No description available."
    const words = desc.split(" ")
    let line = ""
    let y = 878
    for (const word of words) {
      const testLine = line + word + " "
      if (ctx.measureText(testLine).width > W - 120 && line !== "") {
        ctx.fillText(line, 60, y)
        y += 24
        line = word + " "
      } else {
        line = testLine
      }
    }
    ctx.fillText(line, 60, y)

    return this.toBuffer(canvas)
  }

  async renderDeck(cards, playerName = "Sorcerer") {
    await this.ensureFonts()
    const W = 1200
    const cardW = (W - 120) / 3
    const cardH = Math.floor(cardW * 1.5)
    const H = 80 + Math.ceil(cards.length / 3) * (cardH + 30) + 80

    const canvas = this.createCanvas(W, H)
    const ctx = canvas.getContext("2d")

    ctx.fillStyle = COLORS.dark
    ctx.fillRect(0, 0, W, H)

    for (const [i, card] of cards.entries()) {
      const col = i % 3
      const row = Math.floor(i / 3)
      const x = 60 + col * (cardW + 20)
      const y = 100 + row * (cardH + 30)

      const isYugioh = card.isYugioh || card.category === "monster" || card.category === "spell" || card.category === "trap"
      const tierColor = isYugioh ? (RARITY_COLORS[card.rarity] || COLORS.muted) : (TIER_COLORS[card.tier] || COLORS.muted)

      ctx.fillStyle = tierColor
      ctx.fillRect(x, y, cardW, cardH)

      ctx.fillStyle = "#000000"
      const innerPadding = 8
      ctx.fillRect(x + innerPadding, y + innerPadding, cardW - innerPadding * 2, cardH - innerPadding * 2)

      let img = null
      if (card.image_url || card.image) {
        img = await loadImageFromUrl(card.image_url || card.image)
      }

      if (img) {
        const innerW = cardW - innerPadding * 2
        const innerH = cardH - innerPadding * 2
        const scale = Math.min(innerW / img.width, innerH / img.height)
        const drawW = img.width * scale
        const drawH = img.height * scale
        const drawX = x + innerPadding + (innerW - drawW) / 2
        const drawY = y + innerPadding + (innerH - drawH) / 2
        ctx.drawImage(img, drawX, drawY, drawW, drawH)
      } else {
        ctx.fillStyle = COLORS.muted
        ctx.font = "14px sans-serif"
        ctx.textAlign = "center"
        ctx.fillText("[ Image unavailable ]", x + cardW / 2, y + cardH / 2)
      }

      ctx.fillStyle = tierColor
      ctx.font = "bold 14px sans-serif"
      ctx.textAlign = "left"
      ctx.fillText(isYugioh ? (card.rarity || "Rare") : (card.tierLabel || card.tier || ""), x + 10, y + 20)

      ctx.fillStyle = "#ffffff"
      ctx.font = "bold 13px sans-serif"
      ctx.textAlign = "right"
      ctx.fillText(isYugioh ? `${card.atv || 1000} ATK` : `¥${(card.worth || 0).toLocaleString()}`, x + cardW - 10, y + 20)
    }

    return this.toBuffer(canvas)
  }
}