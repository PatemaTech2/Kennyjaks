import { BaseCanvas } from "./BaseCanvas.js"
import { COLORS } from "./constants.js"

export class TransferReceipt extends BaseCanvas {
  constructor() {
    super()
    this.setTheme("wallet")
  }

  async render(sender, recipient, amount, walletBefore, walletAfter, bankBefore, bankAfter) {
    await this.ensureFonts()
    const W = 1200
    const H = 720
    const canvas = this.createCanvas(W, H)
    const ctx = canvas.getContext("2d")

    this.drawBackground(ctx, W, H)
    this.drawHeader(ctx, "💸 TRANSFER RECEIPT", "Funds Sent", W)

    this.drawPanel(ctx, 55, 140, W - 110, 160, "TRANSFER")
    ctx.fillStyle = COLORS.gold
    ctx.font = "bold 54px sans-serif"
    ctx.textAlign = "center"
    ctx.fillText(`¥${(amount || 0).toLocaleString()}`, W / 2, 220)

    ctx.fillStyle = COLORS.white
    ctx.font = "bold 20px sans-serif"
    ctx.textAlign = "left"
    ctx.fillText(`From: ${this.formatCanvasValue(sender.name, "Unknown")} (@${this.formatCanvasValue(sender.phoneNumber, "")})`, 75, 175)
    ctx.fillText(`To:   ${this.formatCanvasValue(recipient.name, "Unknown")} (@${this.formatCanvasValue(recipient.phoneNumber, "")})`, 75, 200)

    this.drawPanel(ctx, 55, 325, W - 110, 140, "ACCOUNTS")
    const rows = [
      ["Sender Wallet", `¥${(walletBefore || 0).toLocaleString()}`, `¥${(walletAfter || 0).toLocaleString()}`, COLORS.red],
      ["Recipient Wallet", "—", `¥${(walletAfter || 0).toLocaleString()}`, COLORS.hp]
    ]
    let ry = 360
    for (const [label, before, after, color] of rows) {
      ctx.fillStyle = this.theme.muted
      ctx.font = "15px sans-serif"
      ctx.textAlign = "left"
      ctx.fillText(label, 75, ry)
      ctx.fillStyle = COLORS.white
      ctx.font = "bold 18px sans-serif"
      ctx.textAlign = "right"
      ctx.fillText(before, 380, ry)
      ctx.fillStyle = color
      ctx.fillText("→", 430, ry)
      ctx.fillStyle = color
      ctx.fillText(after, 480, ry)
      ry += 50
    }

    this.drawPanel(ctx, 55, 490, W - 110, 80, "INFO")
    ctx.fillStyle = this.theme.muted
    ctx.font = "15px sans-serif"
    ctx.textAlign = "left"
    ctx.fillText(`Transaction ID: ${Date.now().toString().slice(-8)}`, 75, 525)
    ctx.fillText(`Date: ${new Date().toLocaleDateString()}  |  Time: ${new Date().toLocaleTimeString()}`, 75, 550)
    ctx.fillStyle = COLORS.hp
    ctx.font = "bold 16px sans-serif"
    ctx.textAlign = "right"
    ctx.fillText("STATUS: ✅ COMPLETED", W - 75, 540)

    this.drawFooter(ctx, "KENNYJAKS • Secure Transfer Service", W, H)
    return this.toBuffer(canvas)
  }
}
