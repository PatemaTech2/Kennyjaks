import { BaseCanvas } from "./BaseCanvas.js"
import { COLORS } from "./constants.js"

export class PvPCard extends BaseCanvas {
  constructor() {
    super()
    this.setTheme("battle")
  }

  async render(playerA, playerB, round, turn) {
    await this.ensureFonts()
    const W = 1200
    const H = 700
    const canvas = this.createCanvas(W, H)
    const ctx = canvas.getContext("2d")

    this.drawBackground(ctx, W, H)
    this.drawHeader(ctx, "⚔ PvP DUEL", `ROUND ${round || 1}`, W)

    this.drawBattlePanel(ctx, 55, 130, 490, this.truncate(playerA?.name || "PLAYER A", 18), playerA?.health || 0, playerA?.maxHealth || 1, playerA?.cursedEnergy || 0, playerA?.maxCursedEnergy || 1, { hpColor: COLORS.hp, ceColor: COLORS.ce })
    this.drawBattlePanel(ctx, 655, 130, 490, this.truncate(playerB?.name || "PLAYER B", 18), playerB?.health || 0, playerB?.maxHealth || 1, playerB?.cursedEnergy || 0, playerB?.maxCursedEnergy || 1, { hpColor: COLORS.red, ceColor: COLORS.crimson })

    ctx.fillStyle = this.theme.accent
    ctx.font = "bold 28px sans-serif"
    ctx.textAlign = "center"
    ctx.fillText(`VS`, W / 2, 210)

    ctx.fillStyle = this.theme.subText
    ctx.font = "bold 18px sans-serif"
    ctx.fillText(`Turn: ${turn === "a" ? (playerA?.name || "Player A") : (playerB?.name || "Player B")}`, W / 2, 540)

    this.drawFooter(ctx, "KENNYJAKS • PvP Arena", W, H)
    return this.toBuffer(canvas)
  }
}
