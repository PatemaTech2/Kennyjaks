import { BaseCanvas } from "./BaseCanvas.js"
import { COLORS } from "./constants.js"

export class WithdrawReceipt extends BaseCanvas {
  constructor() {
    super()
    this.setTheme("wallet")
  }

  async render(player, amount, walletBefore, walletAfter, bankBefore, bankAfter) {
    await this.ensureFonts()
    const W = 1200
    const H = 700
    const canvas = this.createCanvas(W, H)
    const ctx = canvas.getContext("2d")

    this.drawBackground(ctx, W, H)
    this.drawHeader(ctx, "💵 WITHDRAWAL RECEIPT", this.formatCanvasValue(player.name, "Unknown"), W)

    this.drawPanel(ctx, 55, 140, W - 110, 180, "TRANSACTION")
    ctx.fillStyle = COLORS.gold
    ctx.font = "bold 56px sans-serif"
    ctx.textAlign = "center"
    ctx.fillText(`¥${(amount || 0).toLocaleString()}`, W / 2, 230)

    this.drawPanel(ctx, 55, 345, W - 110, 160, "ACCOUNTS")
    const rows = [
      ["Bank Before", `¥${(bankBefore || 0).toLocaleString()}`, "→", `¥${(bankAfter || 0).toLocaleString()}`, this.theme.accent],
      ["Wallet Before", `¥${(walletBefore || 0).toLocaleString()}`, "→", `¥${(walletAfter || 0).toLocaleString()}`, COLORS.ce]
    ]
    let ry = 380
    for (const [label, before, arrow, after, color] of rows) {
      ctx.fillStyle = this.theme.muted
      ctx.font = "15px sans-serif"
      ctx.textAlign = "left"
      ctx.fillText(label, 75, ry)
      ctx.fillStyle = COLORS.white
      ctx.font = "bold 20px sans-serif"
      ctx.textAlign = "right"
      ctx.fillText(before, 350, ry)
      ctx.fillStyle = color
      ctx.fillText(arrow, 430, ry)
      ctx.fillStyle = color
      ctx.fillText(after, 480, ry)
      ry += 55
    }

    this.drawPanel(ctx, 55, 530, W - 110, 80, "INFO")
    ctx.fillStyle = this.theme.muted
    ctx.font = "15px sans-serif"
    ctx.textAlign = "left"
    ctx.fillText(`Transaction ID: ${Date.now().toString().slice(-8)}`, 75, 565)
    ctx.fillText(`Date: ${new Date().toLocaleDateString()}  |  Time: ${new Date().toLocaleTimeString()}`, 75, 590)
    ctx.fillStyle = COLORS.hp
    ctx.font = "bold 16px sans-serif"
    ctx.textAlign = "right"
    ctx.fillText("STATUS: ✅ COMPLETED", W - 75, 580)

    this.drawFooter(ctx, "KENNYJAKS • Secure Withdrawal Service", W, H)
    return this.toBuffer(canvas)
  }
}
