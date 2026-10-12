import { createCanvas, loadImage } from "canvas"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const CARD_WIDTH = 1200
const CARD_HEIGHT = 900

const SHOP_CATEGORIES = {
  outfit: { emoji: "⚔️", name: "Outfit Shop", desc: "Weapons, Armor, Uniforms, Accessories", color: "#ff6b6b" },
  egg: { emoji: "🥚", name: "Egg Shop", desc: "Mysterious cursed eggs", color: "#4ec9b0" },
  food: { emoji: "🍜", name: "Food Shop", desc: "Recovery food and meals", color: "#ff8c00" },
  drinks: { emoji: "🥤", name: "Drinks Shop", desc: "Thirst-restoring beverages", color: "#4169e1" },
  medicine: { emoji: "💊", name: "Medicine Shop", desc: "Potions and remedies", color: "#9370db" },
  weapon: { emoji: "🗡️", name: "Weapon Shop", desc: "Cursed weapons and blades", color: "#dc143c" },
  armor: { emoji: "🛡️", name: "Armor Shop", desc: "Protective gear and uniforms", color: "#4682b4" },
  accessory: { emoji: "💎", name: "Accessory Shop", desc: "Rings, necklaces and charms", color: "#ffd700" },
  blackmarket: { emoji: "⚫", name: "Black Market", desc: "Rare and forbidden items", color: "#ff0088" },
  bag: { emoji: "🎒", name: "Bag Shop", desc: "Storage and utility items", color: "#32cd32" }
}

export class ShopCanvasRenderer {
  async renderShopDistrict() {
    const canvas = createCanvas(CARD_WIDTH, CARD_HEIGHT)
    const ctx = canvas.getContext("2d")

    await this.drawBackground(ctx)
    this.drawTitle(ctx)

    const shops = [
      { emoji: "⚔️", name: "Outfit Shop", desc: "Weapons, Armor, Uniforms, Accessories", cmd: "/shop-outfit", y: 190, category: "outfit" },
      { emoji: "🥚", name: "Egg Shop", desc: "Mysterious cursed eggs", cmd: "/shop-egg", y: 310, category: "egg" },
      { emoji: "🍜", name: "Food Shop", desc: "Recovery food and meals", cmd: "/shop-food", y: 430, category: "food" },
      { emoji: "🥤", name: "Drinks Shop", desc: "Thirst-restoring beverages", cmd: "/shop-drink", y: 550, category: "drinks" },
      { emoji: "💊", name: "Medicine Shop", desc: "Potions, elixirs, and remedies", cmd: "/shop-medicine", y: 670, category: "medicine" },
      { emoji: "🗡️", name: "Weapon Shop", desc: "Cursed weapons and blades", cmd: "/shop-weapon", y: 790, category: "weapon" },
      { emoji: "🛡️", name: "Armor Shop", desc: "Protective gear and uniforms", cmd: "/shop-armor", y: 850, category: "armor" }
    ]

    shops.forEach(shop => {
      this.drawShopCard(ctx, shop, shop.y)
    })

    return canvas.toBuffer("image/png")
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

  drawTitle(ctx) {
    const gradient = ctx.createLinearGradient(100, 50, CARD_WIDTH - 100, 50)
    gradient.addColorStop(0, "rgba(218, 165, 32, 0.2)")
    gradient.addColorStop(0.5, "rgba(138, 43, 226, 0.2)")
    gradient.addColorStop(1, "rgba(0, 183, 255, 0.2)")
    ctx.fillStyle = gradient
    this.roundRect(ctx, 80, 50, CARD_WIDTH - 160, 70, 14)
    ctx.fill()
    ctx.strokeStyle = "#8b00ff"
    ctx.lineWidth = 2
    this.roundRect(ctx, 80, 50, CARD_WIDTH - 160, 70, 14)
    ctx.stroke()

    ctx.fillStyle = "#ffffff"
    ctx.font = "bold 52px sans-serif"
    ctx.textAlign = "center"
    ctx.fillText("🏪 SHOP DISTRICT 🏪", CARD_WIDTH / 2, 100)

    ctx.fillStyle = "#aaaaff"
    ctx.font = "italic 22px sans-serif"
    ctx.fillText("Everything you need for your sorcery journey", CARD_WIDTH / 2, 122)

    ctx.strokeStyle = "#8b00ff"
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(100, 140)
    ctx.lineTo(CARD_WIDTH - 100, 140)
    ctx.stroke()
  }

  drawShopCard(ctx, shop, y) {
    const cardW = CARD_WIDTH - 160
    const cardH = 100
    const x = 80
    const catInfo = SHOP_CATEGORIES[shop.category] || { color: "#888" }

    const shadowGrad = ctx.createLinearGradient(x, y, x, y + cardH)
    shadowGrad.addColorStop(0, "rgba(0, 0, 0, 0.7)")
    shadowGrad.addColorStop(1, "rgba(0, 0, 0, 0.4)")
    ctx.fillStyle = shadowGrad
    this.roundRect(ctx, x + 3, y + 3, cardW, cardH, 14)
    ctx.fill()

    const bgGradient = ctx.createLinearGradient(x, y, x + cardW, y)
    bgGradient.addColorStop(0, "rgba(25, 25, 45, 0.7)")
    bgGradient.addColorStop(1, "rgba(35, 35, 55, 0.7)")
    ctx.fillStyle = bgGradient
    this.roundRect(ctx, x, y, cardW, cardH, 14)
    ctx.fill()
    ctx.strokeStyle = catInfo.color
    ctx.lineWidth = 2
    this.roundRect(ctx, x, y, cardW, cardH, 14)
    ctx.stroke()

    ctx.fillStyle = catInfo.color
    ctx.font = "bold 32px sans-serif"
    ctx.textAlign = "left"
    ctx.fillText(shop.emoji, x + 15, y + 35)

    ctx.fillStyle = "#ffffff"
    ctx.font = "bold 28px sans-serif"
    ctx.textAlign = "left"
    ctx.fillText(shop.name || "Unknown Shop", x + 65, y + 35)

    ctx.fillStyle = "#aaaaff"
    ctx.font = "18px sans-serif"
    ctx.fillText(shop.desc || "", x + 65, y + 60)

    ctx.fillStyle = catInfo.color
    ctx.font = "bold 18px sans-serif"
    ctx.textAlign = "right"
    ctx.fillText(shop.cmd || "", x + cardW - 15, y + 35)

    ctx.fillStyle = "#44ff88"
    ctx.font = "bold 16px sans-serif"
    ctx.fillText("/buy ready", x + cardW - 15, y + 60)
  }
}
