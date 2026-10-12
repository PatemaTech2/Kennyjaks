import { BaseCanvas } from "./BaseCanvas.js"
import { COLORS } from "./constants.js"

export class BankCard extends BaseCanvas {
  constructor() {
    super()
    this.setTheme("bank")
  }

  async render(player) {
    await this.ensureFonts()
    const W = 1200
    const H = 780
    const canvas = this.createCanvas(W, H)
    const ctx = canvas.getContext("2d")

    this.drawBackground(ctx, W, H)
    this.drawHeader(ctx, "🏦 KENNYJAKS BANK", this.formatCanvasValue(player.name, "Sorcerer"), W)

    await this.drawAvatar(ctx, player, 55, 120, 120)

    const infoX = 195
    let iy = 135
    ctx.fillStyle = COLORS.white
    ctx.font = "bold 30px sans-serif"
    ctx.textAlign = "left"
    ctx.fillText(this.formatCanvasValue(player.name, "Unknown"), infoX, iy)
    iy += 28
    ctx.fillStyle = this.theme.muted
    ctx.font = "16px sans-serif"
    ctx.fillText("@" + this.formatCanvasValue(player.phoneNumber, "unknown"), infoX, iy)

    const panelW = W - 100
    this.drawPanel(ctx, 55, 265, panelW, 130, "BANK BALANCE")
    ctx.fillStyle = this.theme.accent
    ctx.font = "bold 54px sans-serif"
    ctx.textAlign = "left"
    ctx.fillText(`¥${(player.bank || 0).toLocaleString()}`, 75, 340)

    ctx.fillStyle = this.theme.muted
    ctx.font = "bold 22px sans-serif"
    ctx.textAlign = "right"
    ctx.fillText(`Wallet: ¥${(player.wallet || 0).toLocaleString()}`, W - 75, 340)
    ctx.fillText(`Net Worth: ¥${((player.wallet || 0) + (player.bank || 0)).toLocaleString()}`, W - 75, 368)

    this.drawPanel(ctx, 55, 420, panelW, 90, "ACCOUNT INFO")
    ctx.fillStyle = this.theme.muted
    ctx.font = "16px sans-serif"
    ctx.textAlign = "left"
    ctx.fillText(`Account: ${this.formatCanvasValue(player.playerId, "N/A")}`, 75, 455)
    ctx.fillText(`Member Since: ${new Date(player.registrationDate || Date.now()).toLocaleDateString()}`, 75, 478)
    ctx.fillText(`Grade: ${player.sorcererGrade || "Grade 4"}  |  Level: ${player.level || 1}`, 450, 455)

    this.drawPanel(ctx, 55, 530, panelW, 210, "TRANSACTION SUMMARY")
    const totalEarned = player.lifetimeEarned || 0
    const totalSpent = player.lifetimeSpent || 0
    const net = totalEarned - totalSpent
    ctx.fillStyle = COLORS.white
    ctx.font = "bold 18px sans-serif"
    ctx.textAlign = "left"
    ctx.fillText("Total Deposits", 75, 565)
    ctx.fillStyle = COLORS.hp
    ctx.font = "bold 20px sans-serif"
    ctx.fillText(`¥${totalEarned.toLocaleString()}`, 280, 565)

    ctx.fillStyle = COLORS.white
    ctx.font = "bold 18px sans-serif"
    ctx.fillText("Total Withdrawals", 75, 598)
    ctx.fillStyle = COLORS.red
    ctx.font = "bold 20px sans-serif"
    ctx.fillText(`¥${totalSpent.toLocaleString()}`, 280, 598)

    ctx.fillStyle = COLORS.white
    ctx.font = "bold 18px sans-serif"
    ctx.fillText("Net Balance", 75, 631)
    ctx.fillStyle = net >= 0 ? COLORS.hp : COLORS.red
    ctx.font = "bold 22px sans-serif"
    ctx.fillText(`¥${net.toLocaleString()}`, 220, 631)

    ctx.fillStyle = this.theme.muted
    ctx.font = "15px sans-serif"
    ctx.textAlign = "right"
    ctx.fillText("Interest Rate: 5%", W - 75, 565)
    ctx.fillText("APY: 5.12%", W - 75, 598)
    ctx.fillText("Safety: FDIC Insured", W - 75, 631)

    this.drawFooter(ctx, "KENNYJAKS NATIONAL BANK • Member FDIC • Kenny Bank Corp", W, H)
    return this.toBuffer(canvas)
  }
}
