import { createCanvas } from "canvas"

const CARD_WIDTH = 1200
const CARD_HEIGHT = 900

const DIFFICULTY_COLORS = {
  Easy: "#4ade80",
  Medium: "#fbbf24",
  Hard: "#f97316",
  "Special Grade": "#ff0088"
}

const GRADE_COLORS = {
  0: "#ff0088",
  1: "#fb923c",
  2: "#f97316",
  3: "#4a90d9",
  4: "#6b7280"
}

const GRADE_LABELS = {
  0: "SPECIAL GRADE",
  1: "GRADE 1",
  2: "GRADE 2",
  3: "GRADE 3",
  4: "GRADE 4"
}

export class MissionCanvasRenderer {
  async renderMissionList(incidents, activeMission) {
    const canvas = createCanvas(CARD_WIDTH, CARD_HEIGHT)
    const ctx = canvas.getContext("2d")

    this.drawBackground(ctx)
    this.drawHeader(ctx)
    
    let yOffset = 130

    if (activeMission && activeMission.id) {
      yOffset = this.drawActiveMission(ctx, activeMission, yOffset)
    }

    this.drawIncidents(ctx, incidents, yOffset)

    return canvas.toBuffer("image/png")
  }

  drawBackground(ctx) {
    const gradient = ctx.createLinearGradient(0, 0, CARD_WIDTH, CARD_HEIGHT)
    gradient.addColorStop(0, "#0a0a1a")
    gradient.addColorStop(0.5, "#0f071f")
    gradient.addColorStop(1, "#050215")
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT)

    ctx.strokeStyle = "#ffd700"
    ctx.lineWidth = 3
    ctx.strokeRect(8, 8, CARD_WIDTH - 16, CARD_HEIGHT - 16)
  }

  drawHeader(ctx) {
    const panelGradient = ctx.createLinearGradient(0, 50, CARD_WIDTH, 50)
    panelGradient.addColorStop(0, "rgba(219, 39, 99, 0.15)")
    panelGradient.addColorStop(0.5, "rgba(138, 43, 226, 0.15)")
    panelGradient.addColorStop(1, "rgba(245, 158, 11, 0.15)")
    ctx.fillStyle = panelGradient
    ctx.fillRect(50, 50, CARD_WIDTH - 100, 65)
    ctx.strokeStyle = "#fb2160"
    ctx.lineWidth = 2
    ctx.strokeRect(50, 50, CARD_WIDTH - 100, 65)

    ctx.fillStyle = "#ffffff"
    ctx.font = "bold 52px sans-serif"
    ctx.textAlign = "center"
    ctx.fillText("🚨 CURSE INCIDENTS", CARD_WIDTH / 2, 95)

    ctx.fillStyle = "#aaaaff"
    ctx.font = "italic 22px sans-serif"
    ctx.fillText("Investigate · Travel · Exorcise", CARD_WIDTH / 2, 115)

    ctx.strokeStyle = "#fb2160"
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(80, 140)
    ctx.lineTo(CARD_WIDTH - 80, 140)
    ctx.stroke()
  }

  drawActiveMission(ctx, activeMission, y) {
    const cardW = CARD_WIDTH - 160
    const cardH = 110

    const shadowGradient = ctx.createLinearGradient(80, y, 80, y + cardH)
    shadowGradient.addColorStop(0, "rgba(0, 0, 0, 0.6)")
    shadowGradient.addColorStop(1, "rgba(0, 0, 0, 0.3)")
    ctx.fillStyle = shadowGradient
    ctx.fillRect(83, y + 3, cardW, cardH)

    const bgGradient = ctx.createLinearGradient(80, y, 80 + cardW, y)
    bgGradient.addColorStop(0, "rgba(252, 211, 77, 0.12)")
    bgGradient.addColorStop(1, "rgba(252, 211, 77, 0.05)")
    ctx.fillStyle = bgGradient
    ctx.fillRect(80, y, cardW, cardH)
    ctx.strokeStyle = "#ffd700"
    ctx.lineWidth = 3
    this.roundRect(ctx, 80, y, cardW, cardH, 12)
    ctx.stroke()

    ctx.fillStyle = "#ffd700"
    ctx.font = "bold 26px sans-serif"
    ctx.textAlign = "left"
    ctx.fillText("ACTIVE MISSION", 100, y + 25)

    ctx.fillStyle = "#ffffff"
    ctx.font = "bold 32px sans-serif"
    const missionName = (activeMission.name || "Unknown Incident").slice(0, 30)
    ctx.fillText(missionName, 100, y + 55)

    ctx.fillStyle = "#aaaaff"
    ctx.font = "20px sans-serif"
    ctx.fillText(`📍 ${activeMission.location || "Unknown"}`, 100, y + 82)

    const statusText = activeMission.status || "IN PROGRESS"
    const statusColor = activeMission.status === "in-battle" ? "#ff4444" : "#4ade80"
    ctx.fillStyle = statusColor
    ctx.font = "bold 20px sans-serif"
    ctx.textAlign = "right"
    ctx.fillText(`[${statusText.toUpperCase()}]`, 80 + cardW - 20, y + 55)

    const gradeText = activeMission.curseGrade === 0 ? "SPECIAL GRADE" : `GRADE ${activeMission.curseGrade}`
    ctx.fillStyle = GRADE_COLORS[activeMission.curseGrade] || "#888"
    ctx.font = "bold 18px sans-serif"
    ctx.textAlign = "right"
    ctx.fillText(gradeText, 80 + cardW - 20, y + 82)

    return y + cardH + 30
  }

  drawIncidents(ctx, incidents, startY) {
    const cardH = 135
    const cardsPerColumn = 6

    const leftX = 60
    const rightX = CARD_WIDTH / 2 + 30

    const leftIncidents = incidents.filter((_, i) => i % 2 === 0)
    const rightIncidents = incidents.filter((_, i) => i % 2 === 1)

    const drawColumns = (incidentsToDraw, startX, startYOffset) => {
      incidentsToDraw.forEach((incident, i) => {
        const y = startYOffset + i * (cardH + 12)
        if (y + cardH > CARD_HEIGHT - 60) return
        this.drawIncidentCard(ctx, incident, i, startX, y, cardH)
      })
    }

    drawColumns(leftIncidents, leftX, startY)
    drawColumns(rightIncidents, rightX, startY)
  }

  drawIncidentCard(ctx, incident, index, x, y, height) {
    const cardW = CARD_WIDTH / 2 - 90
    const cardH = height

    const shadowGradient = ctx.createLinearGradient(x, y, x, y + cardH)
    shadowGradient.addColorStop(0, "rgba(0, 0, 0, 0.5)")
    shadowGradient.addColorStop(1, "rgba(0, 0, 0, 0.2)")
    ctx.fillStyle = shadowGradient
    this.roundRect(ctx, x + 3, y + 3, cardW, cardH, 14)
    ctx.fill()

    const rarity = this.getIncidentRarity(incident)
    const rarityColor = rarity === "Special Grade" ? "#ff0088" : rarity === "Grade 1" ? "#fb923c" : "#60a5fa"

    const bgGradient = ctx.createLinearGradient(x, y, x, y + cardH)
    bgGradient.addColorStop(0, "rgba(20, 20, 35, 0.8)")
    bgGradient.addColorStop(1, "rgba(30, 30, 45, 0.8)")
    ctx.fillStyle = bgGradient
    this.roundRect(ctx, x, y, cardW, cardH, 14)
    ctx.fill()
    ctx.strokeStyle = rarityColor
    ctx.lineWidth = 2
    this.roundRect(ctx, x, y, cardW, cardH, 14)
    ctx.stroke()

    ctx.fillStyle = rarityColor
    ctx.font = "bold 16px sans-serif"
    ctx.textAlign = "left"
    ctx.textBaseline = "top"
    ctx.fillText(rarity, x + 12, y + 8)

    ctx.fillStyle = "#ffffff"
    ctx.font = "bold 26px sans-serif"
    ctx.textAlign = "center"
    const number = `#${index + 1}`
    ctx.fillText(number, x + cardW / 2, y + 28)
    ctx.fillStyle = "#aaaaff"
    ctx.font = "bold 24px sans-serif"
    const name = (incident.name || "Unknown Incident").slice(0, 22)
    ctx.fillText(name, x + cardW / 2, y + 58)

    ctx.fillStyle = "#aaaaff"
    ctx.font = "18px sans-serif"
    ctx.textAlign = "left"
    ctx.fillText(`📍 ${incident.location || "Unknown"}`, x + 20, y + 90)

    const gradeText = incident.curseGrade === 0 ? "SPECIAL" : `GRADE ${incident.curseGrade}`
    ctx.fillStyle = GRADE_COLORS[incident.curseGrade] || "#888"
    ctx.font = "bold 18px sans-serif"
    ctx.fillText(`👹 ${gradeText}`, x + 20, y + 110)

    ctx.fillStyle = "#44ff88"
    ctx.font = "bold 18px sans-serif"
    ctx.fillText(`💰 ¥${incident.yenReward?.toLocaleString() || 0}`, x + cardW / 2 - 80, y + 110)

    ctx.fillStyle = "#ffdd44"
    ctx.fillText(`⭐ ${incident.xpReward || 0} XP`, x + cardW / 2 + 40, y + 110)

    ctx.fillStyle = "#ff88aa"
    ctx.font = "bold 16px sans-serif"
    const difficulty = incident.difficulty || "Medium"
    ctx.fillText(`Difficulty: ${difficulty}`, x + cardW / 2, y + cardH - 12)
  }

  getIncidentRarity(incident) {
    if (incident.curseGrade === 0) return "Special Grade"
    if (incident.curseGrade === 1) return "Grade 1"
    if (incident.curseGrade === 2) return "Grade 2"
    return "Normal"
  }

  roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath()
    ctx.moveTo(x + radius, y)
    ctx.lineTo(x + width - radius, y)
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
    ctx.lineTo(x + width, y + height - radius)
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
    ctx.lineTo(x + radius, y + height)
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
    ctx.lineTo(x, y + radius)
    ctx.quadraticCurveTo(x, y, x + radius, y)
    ctx.closePath()
  }
}
