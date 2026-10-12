import { createCanvas } from "canvas"

const CARD_WIDTH = 1200
const CARD_HEIGHT = 900

export class BagCanvasRenderer {
  async renderBag(player) {
    const canvas = createCanvas(CARD_WIDTH, CARD_HEIGHT)
    const ctx = canvas.getContext("2d")

    this.drawBackground(ctx)
    this.drawHeader(ctx, player)
    this.drawItems(ctx, player)
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
  }

  drawHeader(ctx, player) {
    const bagName = player.equippedBag || "No Bag"
    ctx.fillStyle = "#ffffff"
    ctx.font = "bold 48px sans-serif"
    ctx.textAlign = "center"
    ctx.fillText(`🎒 ${bagName.toUpperCase()}`, CARD_WIDTH / 2, 60)

    const used = (player.bagInventory || []).length
    const max = player.bagCapacity === 9999 ? "∞" : player.bagCapacity
    ctx.fillStyle = "#aaaaff"
    ctx.font = "24px sans-serif"
    ctx.fillText(`Slots: ${used} / ${max}`, CARD_WIDTH / 2, 100)
  }

  drawItems(ctx, player) {
    const items = player.bagInventory || []
    ctx.textAlign = "left"
    ctx.font = "bold 24px sans-serif"

    if (items.length === 0) {
      ctx.fillStyle = "#888888"
      ctx.fillText("Your bag is empty.", 120, 200)
      return
    }

    let y = 160
    items.forEach((item, index) => {
      if (y > 800) return
      ctx.fillStyle = "#ffffff"
      ctx.font = "bold 24px sans-serif"
      ctx.fillText(`${index + 1}. ${item.icon || "📦"} ${item.name}`, 120, y)
      y += 35
      if (item.quantity > 1) {
        ctx.fillStyle = "#aaaaff"
        ctx.font = "20px sans-serif"
        ctx.fillText(`   Qty: ${item.quantity}`, 120, y)
        y += 30
      }
    })
  }

  drawFooter(ctx) {
    const y = CARD_HEIGHT - 60
    ctx.fillStyle = "#ffdd44"
    ctx.font = "bold 22px sans-serif"
    ctx.textAlign = "center"
    ctx.fillText("Use /b2i <item> to move to inventory", CARD_WIDTH / 2, y)
  }
}
