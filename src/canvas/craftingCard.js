import { BaseCanvas } from "./BaseCanvas.js"

export class CraftingCard extends BaseCanvas {
  constructor() {
    super()
    this.setTheme("profile")
  }

  async render(player, recipe, canCraft, cost, accuracy) {
    await this.ensureFonts()
    const W = 1200
    const H = 780
    const canvas = this.createCanvas(W, H)
    const ctx = canvas.getContext("2d")

    this.drawBackground(ctx, W, H)
    this.drawHeader(ctx, "🔨 CRAFTING STATION", this.formatCanvasValue(recipe?.name || "Craft", "Recipe"), W)

    this.drawPanel(ctx, 55, 130, W - 110, 200, "MATERIALS")
    const materials = recipe?.materials || []
    for (let i = 0; i < Math.min(materials.length, 5); i++) {
      const y = 160 + i * 36
      this.drawMiniStat(ctx, 75, y, 400, materials[i].name || "?", `${materials[i].quantity || 0}`, { icon: materials[i].icon || "📦" })
    }

    this.drawPanel(ctx, 55, 355, W - 110, 160, "RESULT")
    ctx.fillStyle = COLORS.white
    ctx.font = "bold 28px sans-serif"
    ctx.textAlign = "center"
    ctx.fillText(this.truncate(recipe?.result?.name || "Unknown Item", 26), W / 2, 410)

    if (recipe?.result?.rarity) {
      const rc = { common: "#aaaacc", uncommon: "#00d26a", rare: "#00b7ff", epic: "#aa44ff", legendary: "#ffd700", mythic: "#dc143c" }[recipe.result.rarity] || this.theme.muted
      this.drawBadge(ctx, W / 2 - 60, 430, (recipe.result.rarity || "").toUpperCase(), rc, { width: 120, bg: `${rc}15`, border: `${rc}44`, textColor: rc })
    }

    ctx.fillStyle = this.theme.muted
    ctx.font = "18px sans-serif"
    ctx.fillText(`DMG: ${recipe?.result?.damage || 0}  |  CE: ${recipe?.result?.cursedEnergy || 0}`, W / 2, 490)

    this.drawPanel(ctx, 55, 540, W - 110, 90, "CRAFT DETAILS")
    ctx.fillStyle = this.theme.muted
    ctx.font = "16px sans-serif"
    ctx.textAlign = "left"
    ctx.fillText(`Cost: ¥${(cost || 0).toLocaleString()}`, 75, 580)
    ctx.fillText(`Accuracy: ${accuracy || "NORMAL"}`, 350, 580)
    ctx.fillText(`Status: ${canCraft ? "CAN CRAFT" : "INSUFFICIENT FUNDS"}`, 600, 580)

    this.drawFooter(ctx, "KENNYJAKS • Crafting", W, H)
    return this.toBuffer(canvas)
  }
}
