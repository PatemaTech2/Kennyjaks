import { createCanvas } from "canvas"

const CARD_WIDTH = 1200
const CARD_HEIGHT = 720

export class ReceiptRenderer {
  async renderReceipt(itemName, price, remainingWallet, itemIcon = "🛒") {
    const canvas = createCanvas(CARD_WIDTH, CARD_HEIGHT)
    const ctx = canvas.getContext("2d")

    this.drawBackground(ctx)
    this.drawHeader(ctx)
    this.drawItem(ctx, itemName, price, itemIcon)
    this.drawTreasuryNote(ctx, price)
    this.drawFooter(ctx, remainingWallet)

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

    ctx.strokeStyle = "#aa44ff"
    ctx.lineWidth = 4
    ctx.strokeRect(20, 20, CARD_WIDTH - 40, CARD_HEIGHT - 40)
    ctx.strokeStyle = "#444466"
    ctx.lineWidth = 2
    ctx.strokeRect(40, 40, CARD_WIDTH - 80, CARD_HEIGHT - 80)
  }

  drawHeader(ctx) {
    ctx.fillStyle = "#ffdd44"
    ctx.font = "bold 42px sans-serif"
    ctx.textAlign = "center"
    ctx.fillText("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", CARD_WIDTH / 2, 90)
    ctx.fillText("✅ PURCHASE COMPLETE ✅", CARD_WIDTH / 2, 150)
    ctx.fillText("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", CARD_WIDTH / 2, 210)
  }

  drawItem(ctx, itemName, price, itemIcon) {
    ctx.fillStyle = "#ffffff"
    ctx.font = "bold 28px sans-serif"
    ctx.textAlign = "center"
    ctx.fillText(`${itemIcon} ${itemName}`, CARD_WIDTH / 2, 310)

    ctx.fillStyle = "#ffdd44"
    ctx.font = "bold 36px sans-serif"
    ctx.fillText(`Price: ¥${price.toLocaleString()}`, CARD_WIDTH / 2, 380)
  }

  drawTreasuryNote(ctx, price) {
    ctx.fillStyle = "#aaaaff"
    ctx.font = "italic 20px sans-serif"
    ctx.textAlign = "center"
    ctx.fillText(`¥${price.toLocaleString()} credited to KennyJaks Treasury`, CARD_WIDTH / 2, 440)
  }

  drawFooter(ctx, remainingWallet) {
    ctx.fillStyle = "#aaaaff"
    ctx.font = "24px sans-serif"
    ctx.textAlign = "center"
    ctx.fillText(`Remaining Wallet: 💴 ¥${remainingWallet.toLocaleString()}`, CARD_WIDTH / 2, 530)

    ctx.fillStyle = "#444466"
    ctx.font = "18px sans-serif"
    ctx.fillText("KENNYJAKS • SHOP DISTRICT", CARD_WIDTH / 2, CARD_HEIGHT - 40)
  }
}
