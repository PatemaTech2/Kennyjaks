import { BaseCanvas } from "./BaseCanvas.js"
import { COLORS } from "./constants.js"
import { getPlayerTransactions } from "../services/TransactionService.js"

export class WalletCard extends BaseCanvas {
  constructor() {
    super()
    this.setTheme("wallet")
  }

  async render(player) {
    await this.ensureFonts()
    const W = 1200
    const H = 780
    const canvas = this.createCanvas(W, H)
    const ctx = canvas.getContext("2d")

    this.drawBackground(ctx, W, H)
    this.drawHeader(ctx, "💰 WALLET", this.formatCanvasValue(player.name, "Sorcerer"), W)

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
    this.drawPanel(ctx, 55, 265, panelW, 130, "BALANCE")
    ctx.fillStyle = COLORS.white
    ctx.font = "bold 54px sans-serif"
    ctx.textAlign = "left"
    ctx.fillText(`¥${(player.wallet || 0).toLocaleString()}`, 75, 340)

    ctx.fillStyle = this.theme.muted
    ctx.font = "bold 24px sans-serif"
    ctx.textAlign = "right"
    ctx.fillText(`Bank: ¥${(player.bank || 0).toLocaleString()}`, W - 75, 340)
    ctx.fillText(`Net: ¥${((player.wallet || 0) + (player.bank || 0)).toLocaleString()}`, W - 75, 368)

    this.drawPanel(ctx, 55, 420, panelW, 90, "STATS")
    ctx.fillStyle = this.theme.muted
    ctx.font = "16px sans-serif"
    ctx.textAlign = "left"
    ctx.fillText(`Rank: ${player.sorcererGrade || "Grade 4"}`, 75, 455)
    ctx.fillText(`Level: ${player.level || 1}`, 75, 478)
    ctx.fillText(`CK: ${player.curseKills || 0}`, 300, 455)
    ctx.fillText(`RCT: ${player.hasRCT || (player.rct && player.rct.unlocked) ? "✓ Mastered" : "✗ Locked"}`, 300, 478)

    this.drawPanel(ctx, 55, 530, panelW, 210, "RECENT ACTIVITY")
    const txns = await this.getRecentTransactions(player)
    if (txns.length === 0) {
      ctx.fillStyle = this.theme.muted
      ctx.font = "16px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText("No recent transactions", W / 2, 600)
    } else {
      let ty = 560
      for (const txn of txns.slice(0, 5)) {
        const isIncome = txn.type === "income" || txn.type === "xp"
        ctx.fillStyle = isIncome ? COLORS.hp : COLORS.red
        ctx.font = "bold 15px sans-serif"
        ctx.textAlign = "left"
        ctx.fillText(this.truncate(txn.desc, 36), 75, ty)
        ctx.textAlign = "right"
        ctx.fillText(`${isIncome ? "+" : "-"}¥${(txn.amount || 0).toLocaleString()}`, W - 75, ty)
        ty += 32
      }
    }

    this.drawFooter(ctx, "KENNYJAKS • Wallet Service • Secure Banking", W, H)
    return this.toBuffer(canvas)
  }

  async getRecentTransactions(player) {
    const txns = await getPlayerTransactions(player.playerId || player.phoneNumber, 8)
    if (txns.length > 0) return txns
    const fallback = []
    if (player.lifetimeEarned > 0) fallback.push({ type: "income", desc: "Battle Rewards", amount: player.lifetimeEarned, timestamp: "Lifetime" })
    if (player.lifetimeSpent > 0) fallback.push({ type: "spending", desc: "Equipment Purchases", amount: player.lifetimeSpent, timestamp: "Lifetime" })
    return fallback
  }
}
