import { createCanvas, loadImage } from "canvas"
import path from "path"
import fs from "fs-extra"

const CARD_WIDTH = 1200
const CARD_HEIGHT = 900
const ITEMS_PER_PAGE = 8

const GRADES = {
  Common: { emoji: "⚪", color: "#9ca3af" },
  Rare: { emoji: "🔵", color: "#3b82f6" },
  Epic: { emoji: "🟣", color: "#a855f7" },
  Legendary: { emoji: "🟠", color: "#f59e0b" },
  "Special Grade": { emoji: "🟡", color: "#eab308" }
}

const SHOP_ICONS = {
  weapon: "🗡️",
  armor: "🛡️",
  outfit: "👕",
  accessory: "💎",
  food: "🍜",
  drinks: "🥤",
  medicine: "💊",
  egg: "🥚",
  blackmarket: "⚫",
  bag: "🎒"
}

export class ShopPageRenderer {
  async renderShopPage(shop, items, page, totalPages, playerWallet) {
    const canvas = createCanvas(CARD_WIDTH, CARD_HEIGHT)
    const ctx = canvas.getContext("2d")

    await this.drawBackground(ctx)
    this.drawHeader(ctx, shop)
    this.drawWallet(ctx, playerWallet)
    this.drawItems(ctx, items, page)
    this.drawFooter(ctx, shop, page, totalPages)

    return canvas.toBuffer("image/png")
  }

  async drawBackground(ctx) {
    const gradient = ctx.createLinearGradient(0, 0, CARD_WIDTH, CARD_HEIGHT)
    gradient.addColorStop(0, "#0a0a1a")
    gradient.addColorStop(0.5, "#0f071f")
    gradient.addColorStop(1, "#050215")
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT)

    ctx.strokeStyle = "#ffd700"
    ctx.lineWidth = 3
    ctx.strokeRect(8, 8, CARD_WIDTH - 16, CARD_HEIGHT - 16)
  }

  drawHeader(ctx, shop) {
    const shopIcon = SHOP_ICONS[shop.id] || shop.emoji || "🛒"
    const shopName = shop.name || "SHOP"

    const panelGradient = ctx.createLinearGradient(0, 70, CARD_WIDTH, 70)
    panelGradient.addColorStop(0, "rgba(170, 68, 255, 0.15)")
    panelGradient.addColorStop(1, "rgba(0, 183, 255, 0.15)")
    ctx.fillStyle = panelGradient
    ctx.fillRect(50, 70, CARD_WIDTH - 100, 100)
    ctx.strokeStyle = "#8b5cf6"
    ctx.lineWidth = 2
    ctx.strokeRect(50, 70, CARD_WIDTH - 100, 100)

    ctx.fillStyle = "#ffffff"
    ctx.font = "bold 48px sans-serif"
    ctx.textAlign = "center"
    ctx.fillText(`${shopIcon} ${shopName.toUpperCase()}`, CARD_WIDTH / 2, 120)

    ctx.fillStyle = "#aaaaff"
    ctx.font = "italic 22px sans-serif"
    ctx.fillText(shop.description, CARD_WIDTH / 2, 145)

    ctx.strokeStyle = "#4a90d9"
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(80, 170)
    ctx.lineTo(CARD_WIDTH - 80, 170)
    ctx.stroke()
  }

  drawWallet(ctx, wallet) {
    const walletStr = wallet.toLocaleString()
    const textWidth = ctx.measureText(`💰 Wallet: ¥${walletStr}`).width + 20

    ctx.fillStyle = "rgba(255, 215, 0, 0.1)"
    ctx.strokeStyle = "rgba(255, 215, 0, 0.3)"
    ctx.lineWidth = 2
    const badgeX = CARD_WIDTH - textWidth - 20
    const badgeY = 15
    const badgeW = textWidth + 10
    const badgeH = 32
    this.roundRect(ctx, badgeX, badgeY, badgeW, badgeH, 8)
    ctx.fill()
    ctx.stroke()

    ctx.fillStyle = "#ffd700"
    ctx.font = "bold 22px sans-serif"
    ctx.textAlign = "right"
    ctx.fillText(`💰 Wallet: ¥${walletStr}`, badgeX + badgeW - 10, badgeY + badgeH / 2 + 6)
  }

  drawItems(ctx, items, page) {
    const startY = 195
    const cardH = 130
    const indexOffset = page * ITEMS_PER_PAGE
    const pageItems = items.slice(indexOffset, indexOffset + ITEMS_PER_PAGE)

    pageItems.forEach((item, index) => {
      const y = startY + index * (cardH + 15)
      const itemIndex = indexOffset + index + 1
      this.drawItemCard(ctx, item, itemIndex, y, cardH)
    })
  }

  drawItemCard(ctx, item, number, y, height) {
    const cardX = 80
    const cardW = CARD_WIDTH - 160

    const rarity = item.rarity || "Common"
    const rarityInfo = GRADES[rarity] || GRADES.Common
    const rarityColor = rarityInfo.color
    const stars = this.getStars(rarity)

    const shadowGradient = ctx.createLinearGradient(cardX, y, cardX, y + height)
    shadowGradient.addColorStop(0, "rgba(0, 0, 0, 0.6)")
    shadowGradient.addColorStop(1, "rgba(0, 0, 0, 0.3)")
    ctx.fillStyle = shadowGradient
    this.roundRect(ctx, cardX + 3, y + 3, cardW, height, 12)
    ctx.fill()

    const bgGradient = ctx.createLinearGradient(cardX, y, cardX + cardW, y)
    bgGradient.addColorStop(0, "rgba(20, 20, 40, 0.8)")
    bgGradient.addColorStop(1, "rgba(35, 35, 55, 0.8)")
    ctx.fillStyle = bgGradient
    this.roundRect(ctx, cardX, y, cardW, height, 12)
    ctx.fill()
    ctx.strokeStyle = rarityColor
    ctx.lineWidth = 3
    this.roundRect(ctx, cardX, y, cardW, height, 12)
    ctx.stroke()

    const innerX = cardX + 15
    const innerY = y + 15
    const contentW = cardW - 30
    const contentH = height - 30

    ctx.fillStyle = "rgba(0, 0, 0, 0.3)"
    ctx.fillRect(innerX, innerY, contentW, contentH)
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)"
    ctx.strokeRect(innerX, innerY, contentW, contentH)

    const rarityBadgeX = innerX + 10
    const rarityBadgeY = innerY + 10
    const rarityBadgeW = 130
    const rarityBadgeH = 32

    const badgeGradient = ctx.createLinearGradient(rarityBadgeX, rarityBadgeY, rarityBadgeX, rarityBadgeY + rarityBadgeH)
    badgeGradient.addColorStop(0, rarityColor + "40")
    badgeGradient.addColorStop(1, rarityColor + "20")
    ctx.fillStyle = badgeGradient
    this.roundRect(ctx, rarityBadgeX, rarityBadgeY, rarityBadgeW, rarityBadgeH, 8)
    ctx.fill()
    ctx.strokeStyle = rarityColor
    ctx.lineWidth = 1.5
    this.roundRect(ctx, rarityBadgeX, rarityBadgeY, rarityBadgeW, rarityBadgeH, 8)
    ctx.stroke()

    ctx.fillStyle = rarityColor
    ctx.font = "bold 20px sans-serif"
    ctx.textAlign = "left"
    ctx.textBaseline = "middle"
    ctx.fillText(`${rarityInfo.emoji} ${rarity} ${stars}`, rarityBadgeX + 10, rarityBadgeY + rarityBadgeH / 2)

    ctx.fillStyle = "#ffffff"
    ctx.font = "bold 26px sans-serif"
    ctx.textAlign = "left"
    ctx.textBaseline = "top"
    ctx.fillText(`${item.icon || "📦"} ${item.name}`, innerX + 150, innerY + 15)

    const nameLines = this.wrapText(ctx, item.name || "Unknown Item", 20, 500)
    ctx.font = "bold 26px sans-serif"
    nameLines.forEach((line, i) => {
      ctx.fillText(`${item.icon || "📦"} ${line}`, innerX + 150, innerY + 15 + i * 30)
    })

    ctx.fillStyle = "#aaaaff"
    ctx.font = "18px sans-serif"
    const desc = (item.description || "No description available.").slice(0, 60)
    ctx.fillText(desc, innerX + 150, innerY + 55)

    const statsText = this.formatStats(item)
    if (statsText) {
      ctx.fillStyle = "#44ff88"
      ctx.font = "17px sans-serif"
      ctx.fillText(statsText.slice(0, 80), innerX + 150, innerY + 80)
    }

    if (item.skills && item.skills.length > 0) {
      ctx.fillStyle = "#aa88ff"
      ctx.font = "16px sans-serif"
      ctx.fillText(`Skills: ${item.skills.join(", ")}`, innerX + 150, innerY + 100)
    }

    if (item.passive) {
      ctx.fillStyle = "#ffaa88"
      ctx.font = "16px sans-serif"
      ctx.fillText(`Passive: ${item.passive}`, innerX + 150, item.skills ? innerY + 120 : innerY + 100)
    }

    const reqText = this.formatRequirements(item)
    if (reqText) {
      ctx.fillStyle = "#ff88aa"
      ctx.font = "16px sans-serif"
      ctx.fillText(reqText, innerX + 150, innerY + 100)
    }

    const priceX = cardX + cardW - 15
    const priceY = innerY + 18
    const priceGradient = ctx.createLinearGradient(priceX - 180, priceY - 15, priceX, priceY + 15)
    priceGradient.addColorStop(0, "rgba(255, 215, 0, 0.2)")
    priceGradient.addColorStop(1, "rgba(255, 215, 0, 0.1)")
    ctx.fillStyle = priceGradient
    this.roundRect(ctx, priceX - 180, priceY - 15, 180, 30, 8)
    ctx.fill()
    ctx.strokeStyle = "#ffd700"
    ctx.lineWidth = 1
    this.roundRect(ctx, priceX - 180, priceY - 15, 180, 30, 8)
    ctx.stroke()

    ctx.fillStyle = "#ffd700"
    ctx.font = "bold 22px sans-serif"
    ctx.textAlign = "right"
    ctx.textBaseline = "middle"
    ctx.fillText(`¥${item.price.toLocaleString()}`, priceX - 10, priceY + 1)

    if (item.category) {
      ctx.fillStyle = "#8888ff"
      ctx.font = "15px sans-serif"
      ctx.textAlign = "left"
      ctx.textBaseline = "top"
      ctx.fillText(`[${item.category}]`, innerX + 10, innerY + contentH - 20)
    } else {
      ctx.fillStyle = "#ffffff"
      ctx.font = "bold 20px sans-serif"
      ctx.textAlign = "left"
      ctx.textBaseline = "top"
      ctx.fillText(`#${number}`, innerX + 10, innerY + contentH - 30)
    }
    if (!item.category) {
      ctx.fillStyle = "#8888aa"
      ctx.font = "14px sans-serif"
      ctx.fillText("/buy " + (item.shopId || ""), innerX + 45, innerY + contentH - 26)
    }
  }

  formatStats(item) {
    const parts = []
    const stats = item.stats || item.effect || {}
    if (stats.attack) parts.push(`ATK +${stats.attack}`)
    if (stats.defense) parts.push(`DEF +${stats.defense}`)
    if (stats.speed) parts.push(`SPD +${stats.speed}`)
    if (stats.cursedEnergy) parts.push(`CE +${stats.cursedEnergy}`)
    if (stats.critRate) parts.push(`CRIT +${stats.critRate}%`)
    if (stats.heal) parts.push(`HP +${stats.heal}`)
    if (stats.restoreCE) parts.push(`CE +${stats.restoreCE}`)
    if (stats.restoreThirst) parts.push(`THIRST +${stats.restoreThirst}`)
    if (stats.buff) parts.push(`Buffs: ${stats.buff.type} +${stats.buff.amount}`)
    if (stats.fullHeal) parts.push(`FULL HP RESTORE`)
    if (stats.fullRestoreCE) parts.push(`FULL CE RESTORE`)
    if (stats.cureAll) parts.push(`CURE ALL STATUS`)
    if (stats.adrenaline) parts.push(`IGNORE FATAL HIT`)
    if (stats.randomBuff) parts.push(`RANDOM BUFF`)
    return parts.join(", ")
  }

  formatRequirements(item) {
    const reqs = []
    if (item.gradeReq !== undefined) {
      const labels = ["Special Grade", "Grade 1", "Grade 2", "Grade 3", "Grade 4"]
      reqs.push(`Grade: ${labels[item.gradeReq]}+`)
    }
    if (item.levelReq) reqs.push(`Lv: ${item.levelReq}`)
    return reqs.join(" ")
  }

  roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath()
    ctx.moveTo(x + radius, y)
    ctx.lineTo(x + width - radius, y)
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
    ctx.lineTo(x + width, y + height - radius)
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
    ctx.lineTo(x + radius, y + height)
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
    ctx.lineTo(x, y + radius)
    ctx.quadraticCurveTo(x, y, x + radius, y)
    ctx.closePath()
  }

  wrapText(ctx, text, fontSize, maxWidth) {
    const words = text.split(" ")
    const lines = []
    let currentLine = words[0]
    for (let i = 1; i < words.length; i++) {
      const word = words[i]
      ctx.font = `bold ${fontSize}px sans-serif`
      const width = ctx.measureText(currentLine + " " + word).width
      if (width < maxWidth) {
        currentLine += " " + word
      } else {
        lines.push(currentLine)
        currentLine = word
      }
    }
    lines.push(currentLine)
    return lines
  }

  getStars(rarity) {
    const tiers = ["Common", "Rare", "Epic", "Legendary", "Special Grade"]
    const idx = tiers.indexOf(rarity)
    if (idx === -1) return ""
    return "★".repeat(idx + 1)
  }

  drawFooter(ctx, shop, page, totalPages) {
    const footerY = CARD_HEIGHT - 90

    const bgGradient = ctx.createLinearGradient(80, footerY, CARD_WIDTH - 80, footerY)
    bgGradient.addColorStop(0, "rgba(170, 68, 255, 0.1)")
    bgGradient.addColorStop(1, "rgba(0, 183, 255, 0.1)")
    ctx.fillStyle = bgGradient
    this.roundRect(ctx, 80, footerY, CARD_WIDTH - 160, 50, 10)
    ctx.fill()
    ctx.strokeStyle = "rgba(170, 68, 255, 0.3)"
    ctx.lineWidth = 1
    this.roundRect(ctx, 80, footerY, CARD_WIDTH - 160, 50, 10)
    ctx.stroke()

    ctx.fillStyle = "#ffdd44"
    ctx.font = "bold 22px sans-serif"
    ctx.textAlign = "center"
    const cmdText = `/buy ${shop.id} <item-name>`
    ctx.fillText(cmdText, CARD_WIDTH / 2, footerY + 20)

    ctx.fillStyle = "#aaaaff"
    ctx.font = "18px sans-serif"
    ctx.fillText(`Page ${page + 1} / ${totalPages}`, CARD_WIDTH / 2, footerY + 38)
  }
}
