import { BaseCanvas } from "./BaseCanvas.js"
import { COLORS } from "./constants.js"
import path from "path"
import fsExtra from "fs-extra"

const GROUP_PFP_DIR = path.resolve("database/groupPfps")

export class BattleScreenCard extends BaseCanvas {
  constructor() {
    super()
    this.setTheme("battle")
  }

  async render(player, opponent, round, battle, narrativeState) {
    await this.ensureFonts()
    const W = 1200
    const H = 700
    const canvas = this.createCanvas(W, H)
    const ctx = canvas.getContext("2d")

    this.drawBackground(ctx, W, H)
    this.drawHeader(ctx, "⚔ KENNYJAKS ⚔", `ROUND ${round || 1}`, W)

    const pName = this.formatCanvasValue(player.name, "YOU")
    const eName = this.formatCanvasValue(opponent?.name, "ENEMY")
    const pGrade = this.formatCanvasValue(player.sorcererGrade || `Grade ${player.grade || 4}`, "Grade 4")
    const eGrade = this.formatCanvasValue(opponent?.grade != null ? `Grade ${opponent.grade}` : opponent?.sorcererGrade, "Grade 4")

    ctx.fillStyle = COLORS.white
    ctx.font = "bold 22px sans-serif"
    ctx.textAlign = "left"
    ctx.fillText(pName, 55, 118)
    ctx.textAlign = "right"
    ctx.fillText(eName, W - 55, 118)

    ctx.fillStyle = this.theme.muted
    ctx.font = "16px sans-serif"
    ctx.textAlign = "left"
    ctx.fillText(pGrade, 55, 138)
    ctx.textAlign = "right"
    ctx.fillText(eGrade, W - 55, 138)

    await this.drawAvatar(ctx, player, 55, 150, 140)
    if (battle?.type === "GROUP_CURSE" && battle?.groupId) {
      await this.drawGroupPfp(ctx, battle.groupId, W - 195, 150, 140)
    } else {
      this.drawEnemyArt(ctx, opponent, W - 195, 150, 140)
    }

    const pHp = player.health || 0
    const pMaxHp = player.maxHealth || 1
    const pCe = player.cursedEnergy || 0
    const pMaxCe = player.maxCursedEnergy || 1
    const eHp = opponent?.hp || opponent?.health || 0
    const eMaxHp = opponent?.maxHp || opponent?.maxHealth || 1
    const eCe = opponent?.ce || opponent?.cursedEnergy || 0
    const eMaxCe = opponent?.maxCe || opponent?.maxCursedEnergy || 1

    this.drawBar(ctx, 55, 310, 490, 26, "HP", pHp, pMaxHp, COLORS.hp)
    this.drawBar(ctx, 55, 350, 490, 26, "CE", pCe, pMaxCe, COLORS.ce)
    this.drawBar(ctx, 655, 310, 490, 26, "HP", eHp, eMaxHp, COLORS.red)
    this.drawBar(ctx, 655, 350, 490, 26, "CE", eCe, eMaxCe, COLORS.crimson)

    if (narrativeState) {
      const phase = narrativeState.phase || "normal"
      const momentum = Math.floor(narrativeState.momentum || 50)
      const hype = narrativeState.hype || 0
      const emotionalState = narrativeState.emotionalState || "calm"
      ctx.fillStyle = COLORS.white
      ctx.font = "bold 18px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText(`PHASE: ${phase.toUpperCase()}`, W / 2, 530)

      const barW = 400
      const barH = 12
      const barX = (W - barW) / 2
      const barY = 545
      const pct = Math.max(0, Math.min(1, momentum / 100))
      ctx.fillStyle = COLORS.muted
      ctx.fillRect(barX, barY, barW, barH)
      ctx.fillStyle = COLORS.ce
      ctx.fillRect(barX, barY, Math.floor(barW * pct), barH)
      ctx.fillStyle = COLORS.white
      ctx.font = "14px sans-serif"
      ctx.fillText(`Momentum: ${momentum}%`, W / 2, barY + 22)

      const hypeBarY = barY + 40
      const hypePct = Math.max(0, Math.min(1, hype / 100))
      ctx.fillStyle = COLORS.muted
      ctx.fillRect(barX, hypeBarY, barW, barH)
      ctx.fillStyle = COLORS.hp
      ctx.fillRect(barX, hypeBarY, Math.floor(barW * hypePct), barH)
      ctx.fillStyle = COLORS.white
      ctx.font = "14px sans-serif"
      ctx.fillText(`Hype: ${hype}% — ${emotionalState.toUpperCase()}`, W / 2, hypeBarY + 22)
    }

    const pStatus = this.statusLine(player)
    const eStatus = this.statusLine(opponent, true)
    if (pStatus && pStatus !== "No status") {
      ctx.fillStyle = this.theme.subText
      ctx.font = "bold 14px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText(pStatus, 300, narrativeState ? 590 : 530)
    }
    if (eStatus && eStatus !== "No status") {
      ctx.fillStyle = this.theme.subText
      ctx.font = "bold 14px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText(eStatus, 900, narrativeState ? 590 : 530)
    }

    this.drawFooter(ctx, "KENNYJAKS • Battle System", W, H)
    return this.toBuffer(canvas)
  }

  async drawGroupPfp(ctx, groupId, x, y, size) {
    const safeId = String(groupId).replace(/[@.]/g, "_")
    const exts = ["png", "jpg", "jpeg"]
    let filePath = null
    for (const ext of exts) {
      const candidate = path.join(GROUP_PFP_DIR, `${safeId}.${ext}`)
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

  statusLine(entity, isEnemy = false) {
    if (!entity) return ""
    const effects = isEnemy ? (entity.statusEffects || []) : (globalThis.__battleStatuses__ || [])
    if (effects && effects.length > 0) {
      return effects.map(s => s.emoji || "⚠️").join(" ")
    }
    return ""
  }
}

