import { BaseCanvas } from "./BaseCanvas.js"
import { COLORS } from "./constants.js"
import path from "path"
import fsExtra from "fs-extra"

const CURSE_PFP_DIR = path.resolve("database/groupPfps")

export class CurseCanvas extends BaseCanvas {
  constructor() {
    super()
    this.setTheme("battle")
  }

  async render(curse, groupId) {
    await this.ensureFonts()
    const W = 900
    const H = 700
    const canvas = this.createCanvas(W, H)
    const ctx = canvas.getContext("2d")

    this.drawBackground(ctx, W, H)
    this.drawHeader(ctx, "👹 CURSED ENCOUNTER", "A curse has manifested", W)

    const gradeLabel = curse.gradeLabel || `Grade ${curse.grade ?? 4}`
    const name = curse.name || "Unknown Curse"

    ctx.fillStyle = COLORS.white
    ctx.font = "bold 28px sans-serif"
    ctx.textAlign = "center"
    ctx.fillText(name, W / 2, 140)

    ctx.fillStyle = COLORS.crimson
    ctx.font = "bold 22px sans-serif"
    ctx.fillText(gradeLabel, W / 2, 170)

    await this.drawGroupPfp(ctx, groupId, W / 2 - 80, 190, 160)

    const panelX = 60
    const panelY = 370
    const panelW = W - 120
    const panelH = 260
    this.drawPanel(ctx, panelX, panelY, panelW, panelH, "Curse Stats")

    const stats = [
      { label: "HP", value: `${curse.maxHp || curse.hp || 0}` },
      { label: "CE", value: `${curse.maxCe || curse.ce || 0}` },
      { label: "STR", value: `${curse.strength || 0}` },
      { label: "DEF", value: `${curse.defense || 0}` },
      { label: "SPD", value: `${curse.speed || 0}` }
    ]

    const colW = panelW / stats.length
    stats.forEach((stat, i) => {
      const x = panelX + i * colW + colW / 2
      const y = panelY + 50
      ctx.fillStyle = COLORS.white
      ctx.font = "bold 16px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText(stat.label, x, y)
      ctx.fillStyle = COLORS.crimson
      ctx.font = "bold 22px sans-serif"
      ctx.fillText(stat.value, x, y + 30)
    })

    const skills = curse.skills || []
    if (skills.length > 0) {
      ctx.fillStyle = COLORS.white
      ctx.font = "bold 16px sans-serif"
      ctx.textAlign = "left"
      ctx.fillText(`Skills: ${skills.slice(0, 3).join(", ")}`, panelX + 20, panelY + 110)
    }

    if (curse.dialogue) {
      ctx.fillStyle = COLORS.muted
      ctx.font = "italic 15px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText(`"${curse.dialogue}"`, W / 2, panelY + 160)
    }

    ctx.fillStyle = COLORS.white
    ctx.font = "bold 18px sans-serif"
    ctx.textAlign = "center"
    ctx.fillText("Use /fight to engage this curse", W / 2, H - 50)

    this.drawFooter(ctx, "KENNYJAKS • Cursed Encounter", W, H)
    return this.toBuffer(canvas)
  }

  async drawGroupPfp(ctx, groupId, x, y, size) {
    const safeId = String(groupId).replace(/[@.]/g, "_")
    const extns = ["png", "jpg", "jpeg"]
    let filePath = null
    for (const ext of extns) {
      const candidate = path.join(CURSE_PFP_DIR, `${safeId}.${ext}`)
      if (await fsExtra.pathExists(candidate)) {
        filePath = candidate
        break
      }
    }

    ctx.fillStyle = "#12122a"
    this.roundRect(ctx, x, y, size, size, 16)
    ctx.fill()

    ctx.strokeStyle = `${COLORS.crimson}88`
    ctx.lineWidth = 5
    this.roundRect(ctx, x - 2, y - 2, size + 4, size + 4, 18)
    ctx.stroke()

    if (filePath) {
      try {
        const { readFile } = await import("fs-extra")
        const { loadImage } = await import("canvas")
        const buffer = await readFile(filePath)
        const img = await loadImage(buffer)
        ctx.save()
        this.roundRect(ctx, x + 5, y + 5, size - 10, size - 10, 12)
        ctx.clip()
        const s = Math.max(size / img.width, size / img.height)
        const drawW = img.width * s
        const drawH = img.height * s
        ctx.drawImage(img, x + (size - drawW) / 2, y + (size - drawH) / 2, drawW, drawH)
        ctx.restore()
        return
      } catch {
        // fallback to initial
      }
    }

    const initial = "👹"
    ctx.fillStyle = COLORS.white
    ctx.font = "bold 72px sans-serif"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText(initial, x + size / 2, y + size / 2)
  }
}
