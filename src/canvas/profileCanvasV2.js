import { BaseCanvas } from "./BaseCanvas.js"
import { COLORS } from "./constants.js"
import { ProgressionService } from "../services/progression/ProgressionService.js"
import { calculateDerivedStats } from "../services/AttributeService.js"
import { getSpriteBuffer } from "../services/sprite/SpriteService.js"
import { loadImage } from "canvas"

const RANK_COLORS = {
  "SPECIAL GRADE": "#ef4444",
  "GRADE 1": "#f97316",
  "GRADE 2": "#fbbf24",
  "GRADE 3": "#a3e635",
  "GRADE 4": "#94a3b8"
}

const PREMIUM_META = {
  1: { label: "RESONANT AURA", crest: "🥈 Silver Crest", accent: "#c0c0c0" },
  2: { label: "AMPLIFIED AURA", crest: "🥇 Gold Crest", accent: "#ffd700" },
  3: { label: "TRANSCENDANT AURA", crest: "💠 Crimson Crest", accent: "#dc2626" }
}

export class ProfileCanvasV2 extends BaseCanvas {
  constructor() {
    super()
    this.setTheme("profile")
  }

  async render(player) {
    await this.ensureFonts()
    const variant = (player.profileStyle || "E").toUpperCase()
    if (variant === "B") return this.renderB(player)
    if (variant === "C") return this.renderC(player)
    if (variant === "D") return this.renderD(player)
    return this.renderA(player)
  }

  async renderA(player) {
    const W = 860
    const H = 560
    const LP = 268
    const canvas = this.createCanvas(W, H)
    const ctx = canvas.getContext("2d")

    const accent = player.profileAccent || RANK_COLORS[player.sorcererGrade] || this.theme.accent
    const isPremium = player.premiumTier > 0 && player.premiumExpiry && player.premiumExpiry > Date.now()
    const premiumAccent = isPremium ? PREMIUM_META[player.premiumTier].accent : null

    this.drawBackground(ctx, W, H, accent)
    if (isPremium) this.drawPremiumAura(ctx, W, H, player.premiumTier, premiumAccent)
    this.drawGlowStrips(ctx, W, H, accent)

    ctx.save()
    this.roundRect(ctx, 14, 14, LP - 6, H - 28, 14)
    ctx.fillStyle = "rgba(6,10,20,0.85)"
    ctx.fill()
    ctx.strokeStyle = accent + "2e"
    ctx.lineWidth = 1.5
    ctx.stroke()
    ctx.restore()

    await this.drawAvatar(ctx, player, LP / 2, 108, 70, accent, premiumAccent)

    let rY = 108 + 70 + 16

    if (isPremium) {
      const pm = PREMIUM_META[player.premiumTier]
      ctx.save()
      ctx.shadowColor = premiumAccent
      ctx.shadowBlur = 10
      ctx.fillStyle = premiumAccent
      ctx.font = "bold 8px sans-serif"
      const tierT = this.cleanText(pm.label)
      ctx.fillText(tierT, LP / 2 - ctx.measureText(tierT).width / 2, rY - 2)
      ctx.restore()
      ctx.fillStyle = "#cbd5e1"
      ctx.font = "bold 8px sans-serif"
      const crestT = this.cleanText(pm.crest)
      ctx.fillText(crestT, LP / 2 - ctx.measureText(crestT).width / 2, rY + 10)
      rY += 16
    }

    const displayTitle = player.profileTitle || player.name
    const badge = player.profileBadge ? `${player.profileBadge} ` : ""
    const rankText = this.cleanText(`${badge}${displayTitle}`)
    ctx.font = "bold 10px sans-serif"
    const rbW = Math.min(ctx.measureText(rankText).width + 28, LP - 38)
    this.roundRect(ctx, LP / 2 - rbW / 2, rY, rbW, 22, 5)
    const rbg = ctx.createLinearGradient(LP / 2 - rbW / 2, rY, LP / 2 + rbW / 2, rY + 22)
    rbg.addColorStop(0, accent + "45")
    rbg.addColorStop(1, "#8b5cf645")
    ctx.save()
    ctx.shadowColor = accent
    ctx.shadowBlur = 12
    ctx.fillStyle = rbg
    ctx.fill()
    ctx.strokeStyle = accent + "99"
    ctx.lineWidth = 1
    ctx.stroke()
    ctx.restore()
    ctx.fillStyle = accent
    ctx.font = "bold 10px sans-serif"
    ctx.fillText(rankText, LP / 2 - ctx.measureText(rankText).width / 2, rY + 15)
    rY += 42

    ctx.save()
    ctx.shadowColor = accent
    ctx.shadowBlur = 18
    ctx.fillStyle = "#ffffff"
    ctx.font = "bold 20px sans-serif"
    const nm = this.fitText(ctx, this.cleanText(player.name) || "Player", LP - 34)
    ctx.fillText(nm, LP / 2 - ctx.measureText(nm).width / 2, rY)
    ctx.restore()

    ctx.fillStyle = "#94a3b8"
    ctx.font = "bold 10px sans-serif"
    const tg = "#" + (player.playerId || "0")
    ctx.fillText(tg, LP / 2 - ctx.measureText(tg).width / 2, rY + 15)

    const bio = this.cleanText(player.profileBio || "No bio set")
    if (bio && bio !== "No bio set") {
      ctx.fillStyle = "#cbd5e1"
      ctx.font = "bold 9px sans-serif"
      const bt = this.fitText(ctx, bio, LP - 34)
      ctx.fillText(bt, LP / 2 - ctx.measureText(bt).width / 2, rY + 32)
    }

    const songTitle = this.cleanText(player.profileSongTitle || player.profileSong || "")
    if (songTitle) {
      ctx.fillStyle = accent
      ctx.font = "bold 8px sans-serif"
      ctx.fillText("🎵 " + this.fitText(ctx, songTitle, LP - 34), 24, rY + 44)
    }

    const dY = rY + 50
    this.glowLine(ctx, 24, dY, LP - 46, accent + "66", 4)
    let iY = dY + 16

    const gradeLabels = { 0: "SPECIAL GRADE", 1: "GRADE 1", 2: "GRADE 2", 3: "GRADE 3", 4: "GRADE 4" }
    const gradeStr = player.sorcererGrade || gradeLabels[player.grade] || "GRADE 4"

    const infoRows = [
      ["GRADE", gradeStr, accent],
      ["LEVEL", String(player.level || 1), "#10b981"],
      ["REP", String(player.reputation || 0), "#f59e0b"],
      ["POTENTIAL", String(player.potential || "F"), "#a855f7"]
    ]
    for (const [label, value, color] of infoRows) {
      ctx.fillStyle = "#64748b"
      ctx.font = "bold 8px sans-serif"
      ctx.fillText(label, 24, iY)
      ctx.fillStyle = color || "#e2e8f0"
      ctx.font = "bold 11px sans-serif"
      ctx.fillText(this.fitText(ctx, value, LP - 32), 24, iY + 14)
      iY += 32
    }

    this.glowLine(ctx, 24, iY, LP - 46, accent + "44", 4)
    iY += 14

    ctx.save()
    ctx.shadowColor = accent
    ctx.shadowBlur = 16
    ctx.fillStyle = "#ffffff"
    ctx.font = "bold 46px sans-serif"
    ctx.fillText(player.level || 1, 24, iY + 48)
    ctx.restore()
    ctx.fillStyle = accent
    ctx.font = "bold 9px sans-serif"
    ctx.fillText("LEVEL", 78, iY + 28)
    ctx.fillStyle = "#cbd5e1"
    ctx.font = "bold 8px sans-serif"
    const nextRank = this.getNextRank(player)
    ctx.fillText(this.fitText(ctx, this.cleanText(nextRank || ""), LP - 92), 78, iY + 42)

    const progress = ProgressionService.getLevelProgress(player)
    this.drawProgressBar(ctx, 24, iY + 56, LP - 52, 11, progress.current, progress.needed, "", { color: accent })
    ctx.fillStyle = "#cbd5e1"
    ctx.font = "bold 9px sans-serif"
    ctx.fillText(`${progress.current.toLocaleString()} / ${progress.needed.toLocaleString()} XP`, 24, iY + 80)

    this.roundRect(ctx, 24, iY + 88, LP - 52, 22, 5)
    const spg = ctx.createLinearGradient(24, iY + 88, LP - 28, iY + 110)
    spg.addColorStop(0, "#451a0388")
    spg.addColorStop(1, "#78350f88")
    ctx.save()
    ctx.shadowColor = "#f59e0b"
    ctx.shadowBlur = 10
    ctx.fillStyle = spg
    ctx.fill()
    ctx.strokeStyle = "#f59e0b66"
    ctx.lineWidth = 1
    ctx.stroke()
    ctx.restore()
    ctx.fillStyle = "#fbbf24"
    ctx.font = "bold 9px sans-serif"
    const stk = `${player.dailyStreak || 0} day streak`
    ctx.fillText(stk, LP / 2 - ctx.measureText(stk).width / 2, iY + 103)

    const rX = LP + 14
    const rW = W - rX - 16
    ctx.save()
    ctx.shadowColor = accent
    ctx.shadowBlur = 20
    ctx.fillStyle = "#ffffff"
    ctx.font = "bold 15px sans-serif"
    ctx.fillText("PLAYER PROFILE", rX, 38)
    ctx.restore()

    if (isPremium) {
      const pm = PREMIUM_META[player.premiumTier]
      ctx.save()
      ctx.shadowColor = premiumAccent
      ctx.shadowBlur = 14
      ctx.fillStyle = premiumAccent
      ctx.font = "bold 10px sans-serif"
      ctx.fillText(this.cleanText(pm.aura), rX + 200, 38)
      ctx.restore()
    }

    ctx.fillStyle = "#475569"
    ctx.font = "bold 9px sans-serif"
    ctx.fillText("KENNYJAKS  ·  SORCERER DATABASE", rX, 52)
    this.glowLine(ctx, rX, 58, rW, accent, 10)

    const bW = (rW - 12) / 2
    const bH = 62
    const bY = 72
    this.statCard(ctx, rX, bY, bW, bH, "Wallet", `${(player.wallet || 0).toLocaleString()} ¥`, "#10b981", accent)
    this.statCard(ctx, rX + bW + 12, bY, bW, bH, "Bank", `${(player.bank || 0).toLocaleString()} ¥`, "#3b82f6", accent)

    this.statCard(ctx, rX, bY + 70, bW, bH, "Black Flashes", String(player.blackFlashes || 0), COLORS.ce, accent)
    this.statCard(ctx, rX + bW + 12, bY + 70, bW, bH, "PvP Wins", String(player.pvpWins || 0), "#f59e0b", accent)

    this.glowLine(ctx, rX, bY + 142, rW, "#1e2a40", 0)
    ctx.save()
    ctx.shadowColor = accent
    ctx.shadowBlur = 8
    ctx.fillStyle = accent
    ctx.font = "bold 11px sans-serif"
    ctx.fillText("COLLECTION", rX, bY + 160)
    ctx.restore()

    const cY = bY + 168
    const cW = (rW - 22) / 3
    const cH = 60
    this.statCard(ctx, rX, cY, cW, cH, "Cards", `${(player.cards || []).length} total`, "#0ea5e9", accent)
    this.statCard(ctx, rX + cW + 11, cY, cW, cH, "Curse Kills", String(player.curseKills || 0), "#ef4444", accent)
    this.statCard(ctx, rX + cW * 2 + 22, cY, cW, cH, "Training", String(player.yujiTrainingLevel || 0), "#a855f7", accent)

    this.glowLine(ctx, rX, cY + 68, rW, "#1e2a40", 0)
    const aY = cY + 82
    ctx.save()
    ctx.shadowColor = accent
    ctx.shadowBlur = 8
    ctx.fillStyle = accent
    ctx.font = "bold 11px sans-serif"
    ctx.fillText("ACTIVITY", rX, aY)
    ctx.restore()

    const aW = (rW - 12) / 2
    this.statCard(ctx, rX, aY + 8, aW, 60, "Total XP", `${(player.lifetimeXp || 0).toLocaleString()}`, accent, accent)
    this.statCard(ctx, rX + aW + 12, aY + 8, aW, 60, "Reputation", `${(player.reputation || 0).toLocaleString()}`, "#f59e0b", accent)

    const regDate = player.registrationDate ? new Date(player.registrationDate).toLocaleDateString() : "Unknown"
    const songTitleDisplay = player.profileSongTitle || "No song set"
    const songRowY = aY + 76
    this.statCard(ctx, rX, songRowY, aW, 50, "Joined", regDate, "#10b981", accent)
    this.statCard(ctx, rX + aW + 12, songRowY, aW, 50, "🎵 Song", songTitleDisplay, "#ef4444", accent)

    ctx.fillStyle = "#64748b"
    ctx.font = "bold 9px sans-serif"
    const footerText = bio && bio !== "No bio set" ? `Bio: ${bio}` : `Inventory: ${(player.inventory || []).length} items`
    ctx.fillText(this.fitText(ctx, footerText, rW - 10), rX, H - 18)

    return this.toBuffer(canvas)
  }

  async renderB(player) {
    const W = 640
    const H = 820
    const canvas = this.createCanvas(W, H)
    const ctx = canvas.getContext("2d")
    const accent = player.profileAccent || RANK_COLORS[player.sorcererGrade] || this.theme.accent
    const isPremium = player.premiumTier > 0 && player.premiumExpiry && player.premiumExpiry > Date.now()
    const premiumAccent = isPremium ? PREMIUM_META[player.premiumTier].accent : null

    this.drawBackground(ctx, W, H, accent)
    if (isPremium) this.drawPremiumAura(ctx, W, H, player.premiumTier, premiumAccent)

    [[52, 0.09, 10], [26, 0.22, 4], [10, 0.65, 1.5]].forEach(a => {
      ctx.save()
      ctx.shadowColor = accent
      ctx.shadowBlur = a[0]
      ctx.strokeStyle = accent + Math.round(a[1] * 255).toString(16).padStart(2, "0")
      ctx.lineWidth = a[2]
      this.roundRect(ctx, a[2] * 2, a[2] * 2, W - a[2] * 4, H - a[2] * 4, 16)
      ctx.stroke()
      ctx.restore()
    })

    this.drawGlowStrips(ctx, W, H, accent)

    await this.drawAvatar(ctx, player, W / 2, 128, 84, accent, premiumAccent)

    ctx.save()
    ctx.shadowColor = accent
    ctx.shadowBlur = 22
    ctx.fillStyle = "#ffffff"
    ctx.font = "bold 26px sans-serif"
    const nm = this.fitText(ctx, this.cleanText(player.name) || "Player", W - 80)
    ctx.fillText(nm, W / 2 - ctx.measureText(nm).width / 2, 258)
    ctx.restore()

    if (isPremium) {
      const pm = PREMIUM_META[player.premiumTier]
      ctx.save()
      ctx.shadowColor = premiumAccent
      ctx.shadowBlur = 10
      ctx.fillStyle = premiumAccent
      ctx.font = "bold 9px sans-serif"
      const tt = this.cleanText(`${pm.label} · ${pm.crest}`)
      ctx.fillText(tt, W / 2 - ctx.measureText(tt).width / 2, 274)
      ctx.restore()
    }

    ctx.fillStyle = "#94a3b8"
    ctx.font = "bold 11px sans-serif"
    const sub = `#${player.playerId || "0"}   ${this.cleanText(player.profileTitle || player.name)}`
    ctx.fillText(sub, W / 2 - ctx.measureText(sub).width / 2, isPremium ? 290 : 278)

    if (player.profileBadge) {
      ctx.save()
      ctx.shadowColor = "#f59e0b"
      ctx.shadowBlur = 10
      ctx.fillStyle = "#f59e0b"
      ctx.font = "bold 9px sans-serif"
      ctx.fillText(this.cleanText(player.profileBadge), W / 2 - ctx.measureText(player.profileBadge).width / 2, 308)
      ctx.restore()
    }

    const barY = isPremium ? 352 : 338
    ctx.save()
    ctx.shadowColor = accent
    ctx.shadowBlur = 14
    ctx.fillStyle = "#ffffff"
    ctx.font = "bold 48px sans-serif"
    ctx.fillText(player.level || 1, 50, barY + 40)
    ctx.restore()
    ctx.fillStyle = accent
    ctx.font = "bold 10px sans-serif"
    ctx.fillText("LEVEL", 52, barY + 54)

    const progress = ProgressionService.getLevelProgress(player)
    this.drawProgressBar(ctx, 145, barY + 8, W - 196, 13, progress.current, progress.needed, "", { color: accent })
    ctx.fillStyle = "#cbd5e1"
    ctx.font = "bold 10px sans-serif"
    ctx.fillText(`${progress.current.toLocaleString()} / ${progress.needed.toLocaleString()} XP`, 145, barY + 38)

    const eY = barY + 100
    const ew = (W - 90) / 4
    const eH = 66
    this.statCard(ctx, 46, eY, ew, eH, "Wallet", `${(player.wallet || 0).toLocaleString()} ¥`, "#10b981", accent)
    this.statCard(ctx, 46 + ew + 6, eY, ew, eH, "Bank", `${(player.bank || 0).toLocaleString()} ¥`, "#3b82f6", accent)
    this.statCard(ctx, 46 + ew * 2 + 12, eY, ew, eH, "BF", String(player.blackFlashes || 0), COLORS.ce, accent)
    this.statCard(ctx, 46 + ew * 3 + 18, eY, ew, eH, "PvP", String(player.pvpWins || 0), "#f59e0b", accent)

    ctx.fillStyle = "#e2e8f0"
    ctx.font = "bold 9px sans-serif"
    const bioText = this.cleanText(player.profileBio || "No bio")
    ctx.fillText("Bio: " + this.fitText(ctx, bioText, W / 2 - 60), 46, eY + 84)
    ctx.fillText("Cards: " + (player.cards || []).length, 46, eY + 100)
    ctx.fillText("Grade: " + (player.sorcererGrade || "Grade 4"), 46, eY + 116)

    return this.toBuffer(canvas)
  }

  async renderC(player) {
    const W = 900
    const H = 520
    const SPLIT = 320
    const canvas = this.createCanvas(W, H)
    const ctx = canvas.getContext("2d")
    const accent = player.profileAccent || RANK_COLORS[player.sorcererGrade] || this.theme.accent
    const isPremium = player.premiumTier > 0 && player.premiumExpiry && player.premiumExpiry > Date.now()
    const premiumAccent = isPremium ? PREMIUM_META[player.premiumTier].accent : null

    this.drawBackground(ctx, W, H, accent)
    if (isPremium) this.drawPremiumAura(ctx, W, H, player.premiumTier, premiumAccent)

    ctx.save()
    this.roundRect(ctx, 0, 0, SPLIT, H, 0)
    ctx.clip()
    ctx.fillStyle = "rgba(2,4,12,0.55)"
    ctx.fillRect(0, 0, SPLIT, H)
    ctx.restore()

    ctx.save()
    this.roundRect(ctx, SPLIT, 0, W - SPLIT, H, 0)
    ctx.clip()
    ctx.fillStyle = "rgba(6,10,22,0.9)"
    ctx.fillRect(SPLIT, 0, W - SPLIT, H)
    ctx.restore()

    this.glowLine(ctx, SPLIT, 0, H, accent, 18, true)
    this.drawGlowStrips(ctx, W, H, accent)

    await this.drawAvatar(ctx, player, SPLIT / 2, 160, 90, accent, premiumAccent)

    const nameY = H - 130
    const ng = ctx.createLinearGradient(0, nameY, 0, H)
    ng.addColorStop(0, "transparent")
    ng.addColorStop(1, "rgba(2,4,12,0.95)")
    ctx.fillStyle = ng
    ctx.fillRect(0, nameY, SPLIT, H - nameY)

    ctx.save()
    ctx.shadowColor = accent
    ctx.shadowBlur = 16
    ctx.fillStyle = "#ffffff"
    ctx.font = "bold 22px sans-serif"
    const nm = this.fitText(ctx, this.cleanText(player.name) || "Player", SPLIT - 20)
    ctx.fillText(nm, SPLIT / 2 - ctx.measureText(nm).width / 2, H - 88)
    ctx.restore()

    if (isPremium) {
      const pm = PREMIUM_META[player.premiumTier]
      ctx.save()
      ctx.shadowColor = premiumAccent
      ctx.shadowBlur = 8
      ctx.fillStyle = premiumAccent
      ctx.font = "bold 8px sans-serif"
      const tl = this.cleanText(`${pm.label} · ${pm.crest}`)
      ctx.fillText(tl, SPLIT / 2 - ctx.measureText(tl).width / 2, H - 72)
      ctx.restore()
    }

    ctx.fillStyle = "#94a3b8"
    ctx.font = "bold 10px sans-serif"
    const tg = `#${player.playerId || "0"}`
    ctx.fillText(tg, SPLIT / 2 - ctx.measureText(tg).width / 2, H - 57)

    const rX = SPLIT + 18
    const rW = W - SPLIT - 34
    ctx.save()
    ctx.shadowColor = accent
    ctx.shadowBlur = 20
    ctx.fillStyle = "#ffffff"
    ctx.font = "bold 16px sans-serif"
    ctx.fillText("PLAYER STATS", rX, 30)
    ctx.restore()

    if (isPremium) {
      const pm = PREMIUM_META[player.premiumTier]
      ctx.save()
      ctx.shadowColor = premiumAccent
      ctx.shadowBlur = 14
      ctx.fillStyle = premiumAccent
      ctx.font = "bold 10px sans-serif"
      ctx.fillText(this.cleanText(pm.aura), rX + 180, 30)
      ctx.restore()
    }

    ctx.fillStyle = "#475569"
    ctx.font = "bold 9px sans-serif"
    ctx.fillText("KENNYJAKS  ·  PROFILE", rX, 46)
    this.glowLine(ctx, rX, 52, rW, accent, 8)

    const lvY = 64
    ctx.save()
    ctx.shadowColor = accent
    ctx.shadowBlur = 14
    ctx.fillStyle = "#ffffff"
    ctx.font = "bold 50px sans-serif"
    ctx.fillText(player.level || 1, rX, lvY + 50)
    ctx.restore()
    ctx.fillStyle = accent
    ctx.font = "bold 9px sans-serif"
    ctx.fillText("LEVEL", rX + 56, lvY + 28)

    const progress = ProgressionService.getLevelProgress(player)
    this.drawProgressBar(ctx, rX, lvY + 62, rW, 11, progress.current, progress.needed, "", { color: accent })
    ctx.fillStyle = "#e2e8f0"
    ctx.font = "bold 9px sans-serif"
    ctx.fillText(`${progress.current.toLocaleString()} / ${progress.needed.toLocaleString()} XP  ·  ${progress.pct}%`, rX, lvY + 88)

    const inY = lvY + 116
    ctx.fillStyle = "#64748b"
    ctx.font = "bold 8px sans-serif"
    ctx.fillText("BIO", rX, inY)
    ctx.fillStyle = "#e2e8f0"
    ctx.font = "bold 10px sans-serif"
    ctx.fillText(this.fitText(ctx, this.cleanText(player.profileBio || "No bio set"), rW / 2 - 8), rX, inY + 14)
    ctx.fillStyle = "#64748b"
    ctx.font = "bold 8px sans-serif"
    ctx.fillText("GRADE", rX + rW / 2, inY)
    ctx.fillStyle = accent
    ctx.font = "bold 10px sans-serif"
    ctx.fillText(this.fitText(ctx, this.cleanText(player.sorcererGrade || "Grade 4"), rW / 2 - 8), rX + rW / 2, inY + 14)

    const eW = (rW - 18) / 4
    const eY2 = inY + 30
    const eH = 62
    this.statCard(ctx, rX, eY2, eW, eH, "Wallet", `${(player.wallet || 0).toLocaleString()} ¥`, "#10b981", accent)
    this.statCard(ctx, rX + eW + 6, eY2, eW, eH, "Bank", `${(player.bank || 0).toLocaleString()} ¥`, "#3b82f6", accent)
    this.statCard(ctx, rX + eW * 2 + 12, eY2, eW, eH, "Nyx", String(player.luck || 0), "#a855f7", accent)
    this.statCard(ctx, rX + eW * 3 + 18, eY2, eW, eH, "Reputation", String(player.reputation || 0), "#fde047", accent)

    return this.toBuffer(canvas)
  }

  async renderD(player) {
    const W = 940
    const H = 480
    const canvas = this.createCanvas(W, H)
    const ctx = canvas.getContext("2d")
    const accent = player.profileAccent || RANK_COLORS[player.sorcererGrade] || this.theme.accent
    const isPremium = player.premiumTier > 0 && player.premiumExpiry && player.premiumExpiry > Date.now()
    const premiumAccent = isPremium ? PREMIUM_META[player.premiumTier].accent : null

    this.drawBackground(ctx, W, H, accent)
    if (isPremium) this.drawPremiumAura(ctx, W, H, player.premiumTier, premiumAccent)

    ctx.fillStyle = "rgba(0,0,0,0.6)"
    ctx.fillRect(0, 0, W, 52)
    ctx.fillStyle = "rgba(0,0,0,0.6)"
    ctx.fillRect(0, H - 50, W, 50)
    this.glowLine(ctx, 0, 52, W, accent, 10)
    ctx.save()
    ctx.shadowColor = accent
    ctx.shadowBlur = 18
    ctx.fillStyle = "#ffffff"
    ctx.font = "bold 18px sans-serif"
    ctx.fillText("KENNYJAKS", 22, 33)
    ctx.restore()
    ctx.fillStyle = accent
    ctx.font = "bold 8px sans-serif"
    ctx.fillText("PLAYER CARD", 22, 43)

    if (isPremium) {
      const pm = PREMIUM_META[player.premiumTier]
      ctx.save()
      ctx.shadowColor = premiumAccent
      ctx.shadowBlur = 14
      ctx.fillStyle = premiumAccent
      ctx.font = "bold 10px sans-serif"
      const al = this.cleanText(pm.aura)
      ctx.fillText(al, W - ctx.measureText(al).width - 18, 33)
      ctx.restore()
    }

    this.glowLine(ctx, 0, H - 50, W, accent, 10)
    ctx.fillStyle = "#94a3b8"
    ctx.font = "bold 9px sans-serif"
    const footerText = `Total XP: ${(player.lifetimeXp || 0).toLocaleString()}     Reputation: ${(player.reputation || 0).toLocaleString()}     Cards: ${(player.cards || []).length}`
    ctx.fillText(this.fitText(ctx, footerText, W - 44), 22, H - 28)

    const avX = 64
    const avY = Math.round(H * 0.46)
    const avR = 82
    await this.drawAvatar(ctx, player, avX, avY, avR, accent, premiumAccent)

    ctx.save()
    ctx.shadowColor = accent
    ctx.shadowBlur = 16
    ctx.fillStyle = "#ffffff"
    ctx.font = "bold 20px sans-serif"
    const nm = this.fitText(ctx, this.cleanText(player.name) || "Player", 200)
    ctx.fillText(nm, avX - ctx.measureText(nm).width / 2, avY + avR + 24)
    ctx.restore()
    ctx.fillStyle = "#94a3b8"
    ctx.font = "bold 9px sans-serif"
    const tg2 = `#${player.playerId || "0"}`
    ctx.fillText(tg2, avX - ctx.measureText(tg2).width / 2, avY + avR + 38)

    if (isPremium) {
      const pm = PREMIUM_META[player.premiumTier]
      ctx.save()
      ctx.fillStyle = premiumAccent
      ctx.font = "bold 8px sans-serif"
      const tl = this.cleanText(pm.label)
      ctx.fillText(tl, avX - ctx.measureText(tl).width / 2, avY + avR + 52)
      ctx.restore()
    }

    this.glowLine(ctx, 190, 56, H - 110, accent + "88", 8, true)
    const mX = 208
    const mW = W - mX - 18
    const mY = 62
    ctx.save()
    ctx.shadowColor = accent
    ctx.shadowBlur = 18
    ctx.fillStyle = "#ffffff"
    ctx.font = "bold 56px sans-serif"
    ctx.fillText(player.level || 1, mX, mY + 60)
    ctx.restore()
    ctx.fillStyle = accent
    ctx.font = "bold 10px sans-serif"
    ctx.fillText("LEVEL", mX + 64, mY + 30)

    const progress = ProgressionService.getLevelProgress(player)
    ctx.fillStyle = "#e2e8f0"
    ctx.font = "bold 10px sans-serif"
    ctx.fillText(`${progress.current.toLocaleString()} / ${progress.needed.toLocaleString()} XP`, mX + 64, mY + 58)
    this.drawProgressBar(ctx, mX, mY + 70, mW, 12, progress.current, progress.needed, "", { color: accent })

    const inY = mY + 116
    ctx.fillStyle = "#475569"
    ctx.font = "bold 8px sans-serif"
    ctx.fillText("BIO", mX, inY)
    ctx.fillStyle = "#e2e8f0"
    ctx.font = "bold 10px sans-serif"
    ctx.fillText(this.fitText(ctx, this.cleanText(player.profileBio || "No bio set"), mW / 2 - 20), mX, inY + 14)
    ctx.fillStyle = "#475569"
    ctx.font = "bold 8px sans-serif"
    ctx.fillText("GRADE", mX + mW / 2, inY)
    ctx.fillStyle = accent
    ctx.font = "bold 10px sans-serif"
    ctx.fillText(this.fitText(ctx, this.cleanText(player.sorcererGrade || "Grade 4"), mW / 2 - 20), mX + mW / 2, inY + 14)

    return this.toBuffer(canvas)
  }

  drawBackground(ctx, W, H, accent) {
    const bg = ctx.createRadialGradient(W * 0.3, H * 0.3, 0, W * 0.5, H * 0.5, Math.max(W, H) * 0.9)
    bg.addColorStop(0, "#0d1424")
    bg.addColorStop(1, "#04060e")
    ctx.fillStyle = bg
    ctx.fillRect(0, 0, W, H)

    const glow1 = ctx.createRadialGradient(0, 0, 0, 0, 0, 360)
    glow1.addColorStop(0, accent + "0c")
    glow1.addColorStop(1, "transparent")
    ctx.fillStyle = glow1
    ctx.fillRect(0, 0, W, H)

    const glow2 = ctx.createRadialGradient(W, 0, 0, W, 0, 360)
    glow2.addColorStop(0, "#8b5cf60a")
    glow2.addColorStop(1, "transparent")
    ctx.fillStyle = glow2
    ctx.fillRect(0, 0, W, H)

    const glow3 = ctx.createRadialGradient(W / 2, H, 0, W / 2, H, 360)
    glow3.addColorStop(0, "#0d94880a")
    glow3.addColorStop(1, "transparent")
    ctx.fillStyle = glow3
    ctx.fillRect(0, 0, W, H)

    ctx.save()
    ctx.globalAlpha = 0.022
    ctx.fillStyle = "#000"
    for (let i = 0; i < H; i += 2) ctx.fillRect(0, i, W, 1)
    ctx.restore()
  }

  drawPremiumAura(ctx, W, H, tier, accent) {
    const tierAccent = PREMIUM_META[tier]?.accent || "#ffd700"
    [[0, 0], [W, 0], [0, H], [W, H]].forEach(([cx, cy]) => {
      const rg = ctx.createRadialGradient(cx, cy, 0, cx, cy, 180)
      rg.addColorStop(0, tierAccent + "18")
      rg.addColorStop(1, "transparent")
      ctx.fillStyle = rg
      ctx.fillRect(0, 0, W, H)
    })
    ctx.save()
    ctx.strokeStyle = tierAccent + "55"
    ctx.lineWidth = 1.5
    ctx.shadowColor = tierAccent
    ctx.shadowBlur = 20
    this.roundRect(ctx, 3, 3, W - 6, H - 6, 12)
    ctx.stroke()
    ctx.restore()
    ctx.save()
    ctx.globalAlpha = 0.04
    const sh = ctx.createLinearGradient(0, 0, W, H)
    sh.addColorStop(0, "transparent")
    sh.addColorStop(0.42, tierAccent)
    sh.addColorStop(0.5, "#ffffff")
    sh.addColorStop(0.58, tierAccent)
    sh.addColorStop(1, "transparent")
    ctx.fillStyle = sh
    ctx.fillRect(0, 0, W, H)
    ctx.restore()
  }

  drawGlowStrips(ctx, W, H, accent) {
    const ts = ctx.createLinearGradient(0, 0, W, 0)
    ts.addColorStop(0, "#8b5cf6")
    ts.addColorStop(0.5, accent)
    ts.addColorStop(1, "#8b5cf6")
    ctx.save()
    ctx.shadowColor = accent
    ctx.shadowBlur = 24
    ctx.fillStyle = ts
    ctx.fillRect(0, 0, W, 4)
    ctx.restore()

    const bs = ctx.createLinearGradient(0, H - 4, W, H - 4)
    bs.addColorStop(0, "#8b5cf6")
    bs.addColorStop(0.5, accent)
    bs.addColorStop(1, "#8b5cf6")
    ctx.save()
    ctx.shadowColor = accent
    ctx.shadowBlur = 16
    ctx.fillStyle = bs
    ctx.fillRect(0, H - 4, W, 4)
    ctx.restore()
  }

  glowLine(ctx, x, y, len, color, blur, vert) {
    blur = blur || 8
    const g = vert ? ctx.createLinearGradient(x, y, x, y + len) : ctx.createLinearGradient(x, y, x + len, y)
    g.addColorStop(0, "transparent")
    g.addColorStop(0.15, color)
    g.addColorStop(0.85, color)
    g.addColorStop(1, "transparent")
    ctx.save()
    ctx.shadowColor = color
    ctx.shadowBlur = blur
    ctx.strokeStyle = g
    ctx.lineWidth = 1
    ctx.beginPath()
    if (vert) { ctx.moveTo(x, y); ctx.lineTo(x, y + len) } else { ctx.moveTo(x, y); ctx.lineTo(x + len, y) }
    ctx.stroke()
    ctx.restore()
  }

  roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath()
    ctx.moveTo(x + r, y)
    ctx.lineTo(x + w - r, y)
    ctx.quadraticCurveTo(x + w, y, x + w, y + r)
    ctx.lineTo(x + w, y + h - r)
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
    ctx.lineTo(x + r, y + h)
    ctx.quadraticCurveTo(x, y + h, x, y + h - r)
    ctx.lineTo(x, y + r)
    ctx.quadraticCurveTo(x, y, x + r, y)
    ctx.closePath()
  }

  statCard(ctx, x, y, w, h, label, value, color, accent) {
    const bg = ctx.createLinearGradient(x, y, x + w, y + h)
    bg.addColorStop(0, "rgba(13,18,32,0.93)")
    bg.addColorStop(1, "rgba(8,10,20,0.93)")
    ctx.save()
    ctx.shadowColor = accent || color
    ctx.shadowBlur = 10
    this.roundRect(ctx, x, y, w, h, 7)
    ctx.fillStyle = bg
    ctx.fill()
    ctx.strokeStyle = (accent || color) + "65"
    ctx.lineWidth = 1.2
    ctx.stroke()
    ctx.restore()
    this.glowLine(ctx, x + 5, y, w - 10, accent || color, 5)
    ctx.fillStyle = (accent || color) + "ee"
    ctx.font = "bold 9px sans-serif"
    ctx.fillText(label.toUpperCase(), x + 9, y + 16)
    const vText = String(value || "0")
    ctx.font = "bold 15px sans-serif"
    if (ctx.measureText(vText).width > w - 16) ctx.font = "bold 12px sans-serif"
    ctx.save()
    ctx.shadowColor = accent || color
    ctx.shadowBlur = 10
    ctx.fillStyle = "#ffffff"
    ctx.fillText(this.fitText(ctx, vText, w - 16), x + 9, y + 37)
    ctx.restore()
  }

  async drawAvatar(ctx, player, cx, cy, r, accent, premiumAccent) {
    let img = null
    let spriteUsed = false
    
    // Try to load custom profile picture first
    const avatarUrl = player.profilePic || player.avatar
    if (avatarUrl) {
      try {
        if (avatarUrl.startsWith("http")) {
          if (this.avatarSock) {
            const avatar = await this.getPlayerAvatar(player.phoneNumber || player.playerId)
            if (avatar) img = avatar
          }
        } else {
          const { readFile } = await import("fs-extra")
          const buffer = await readFile(avatarUrl)
          const { loadImage } = await import("canvas")
          img = await loadImage(buffer)
        }
      } catch {}
    }
    
    // If no profile picture, try to use current sprite
    if (!img && player.currentSprite) {
      try {
        const buffer = getSpriteBuffer(player.currentSprite)
        if (buffer) {
          const { loadImage } = await import("canvas")
          img = await loadImage(buffer)
          spriteUsed = true
        }
      } catch (err) {
        console.error("Failed to load sprite:", err)
      }
    }
    
    // Fallback to default gradient if no image loaded

    const rings = [
      { blur: 48, alpha: 0.09, width: 10 },
      { blur: 24, alpha: 0.22, width: 4 },
      { blur: 8, alpha: 0.68, width: 2 }
    ]
    for (const ring of rings) {
      ctx.save()
      ctx.shadowColor = premiumAccent || accent
      ctx.shadowBlur = ring.blur
      ctx.strokeStyle = (premiumAccent || accent) + Math.round(ring.alpha * 255).toString(16).padStart(2, "0")
      ctx.lineWidth = ring.width
      ctx.beginPath()
      ctx.arc(cx, cy, r + ring.width * 2.5, 0, Math.PI * 2)
      ctx.stroke()
      ctx.restore()
    }

    ctx.save()
    ctx.beginPath()
    ctx.arc(cx, cy, r, 0, Math.PI * 2)
    ctx.clip()
    if (img) {
      const s = Math.max((r * 2) / img.width, (r * 2) / img.height)
      ctx.drawImage(img, cx - img.width * s / 2, cy - img.height * s / 2, img.width * s, img.height * s)
    } else {
      const pg = ctx.createRadialGradient(cx, cy - r * 0.3, 0, cx, cy, r)
      pg.addColorStop(0, "#1e3a5f")
      pg.addColorStop(1, "#0a0f1a")
      ctx.fillStyle = pg
      ctx.fill()
    }
    ctx.restore()

    ctx.save()
    ctx.shadowColor = premiumAccent || accent
    ctx.shadowBlur = 6
    ctx.strokeStyle = (premiumAccent || accent) + "ee"
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(cx, cy, r, 0, Math.PI * 2)
    ctx.stroke()
    ctx.restore()

    if (premiumAccent) {
      ctx.save()
      ctx.shadowColor = premiumAccent
      ctx.shadowBlur = 28
      ctx.strokeStyle = premiumAccent
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.arc(cx, cy, r + 10, 0, Math.PI * 2)
      ctx.stroke()
      ctx.restore()
      ctx.save()
      ctx.shadowColor = premiumAccent
      ctx.shadowBlur = 12
      ctx.strokeStyle = premiumAccent + "aa"
      ctx.lineWidth = 1.5
      ctx.setLineDash([6, 10])
      ctx.beginPath()
      ctx.arc(cx, cy, r + 16, 0, Math.PI * 2)
      ctx.stroke()
      ctx.restore()
    }

    this.drawGradeBadge(ctx, cx, cy + r + 10, player.sorcererGrade || player.grade)
  }

  drawCursedCircle(ctx, cx, cy, r, accent) {
    ctx.save()
    ctx.strokeStyle = accent + "44"
    ctx.lineWidth = 1
    ctx.setLineDash([4, 8])
    ctx.beginPath()
    ctx.arc(cx, cy, r, 0, Math.PI * 2)
    ctx.stroke()
    ctx.restore()

    ctx.save()
    ctx.strokeStyle = accent + "22"
    ctx.lineWidth = 1
    ctx.setLineDash([2, 12])
    ctx.beginPath()
    ctx.arc(cx, cy, r + 8, 0, Math.PI * 2)
    ctx.stroke()
    ctx.restore()
  }

  drawGradeBadge(ctx, x, y, grade) {
    const gradeLabels = { 0: "SPECIAL", 1: "S", 2: "A", 3: "B", 4: "C" }
    const gradeColors = { 0: "#ef4444", 1: "#f97316", 2: "#fbbf24", 3: "#a3e635", 4: "#94a3b8" }
    const label = gradeLabels[grade] || "C"
    const color = gradeColors[grade] || "#94a3b8"

    ctx.save()
    ctx.shadowColor = color
    ctx.shadowBlur = 8
    ctx.fillStyle = color
    ctx.font = "bold 10px sans-serif"
    ctx.textAlign = "center"
    ctx.fillText(`GRADE ${label}`, x, y)
    ctx.restore()
  }

  drawProgressBar(ctx, x, y, width, height, current, needed, label, options = {}) {
    const { color = this.theme.accent } = options
    const pct = Math.min(1, Math.max(0, current / Math.max(1, needed)))
    const fillW = Math.max(height, width * pct)

    this.roundRect(ctx, x, y, width, height, height / 2)
    ctx.fillStyle = "rgba(13,18,32,0.9)"
    ctx.fill()
    ctx.strokeStyle = "#1e2a40"
    ctx.lineWidth = 1
    this.roundRect(ctx, x, y, width, height, height / 2)
    ctx.stroke()

    const g = ctx.createLinearGradient(x, y, x + fillW, y)
    g.addColorStop(0, color)
    g.addColorStop(1, color + "88")
    ctx.save()
    ctx.shadowColor = color
    ctx.shadowBlur = 14
    this.roundRect(ctx, x, y, fillW, height, height / 2)
    ctx.fillStyle = g
    ctx.fill()
    ctx.restore()
  }

  getNextRank(player) {
    const rankOrder = ["Initiate", "Observer", "Operative", "Active Unit", "Executor", "Specialist", "Controller", "Overseer", "Architect", "Core Entity", "Ascendant", "Xythera Elite"]
    const current = player.rank || "Initiate"
    const idx = rankOrder.indexOf(current)
    if (idx >= 0 && idx < rankOrder.length - 1) return rankOrder[idx + 1]
    return null
  }

  fitText(ctx, text, maxW) {
    if (!text) return ""
    if (ctx.measureText(text).width <= maxW) return text
    let s = text
    while (s.length > 1 && ctx.measureText(s + "...").width > maxW) s = s.slice(0, -1)
    return s + "..."
  }

  cleanText(text) {
    if (!text) return ""
    return text
      .replace(/[\u{1F000}-\u{1FFFF}]/gu, "")
      .replace(/[\u{2600}-\u{27FF}]/gu, "")
      .replace(/[\u{2B00}-\u{2BFF}]/gu, "")
      .replace(/\uFE0F/gu, "")
      .replace(/\u200D/gu, "")
      .replace(/[^\x20-\x7E\u00A0-\u024F]/g, "")
      .replace(/\s+/g, " ")
      .trim()
  }
}
