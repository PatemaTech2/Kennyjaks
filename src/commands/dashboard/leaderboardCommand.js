import { sendQuotedWithFooter } from "../../utils/messageHelper.js"
import { loadPlayerByPhone } from "../../database/playerRepo.js"
import { ServerDashboardService } from "../../services/dashboard/ServerDashboardService.js"
import { universalHeader, sectionDivider, getFooter } from "../../utils/ui.js"

const MEDALS = ["🥇", "🥈", "🥉"]
const RANK_NUMBERS = ["④", "⑤", "⑥", "⑦", "⑧", "⑨", "⑩"]

export async function handleLeaderboard(sock, message) {
  const remoteJid = message.key.remoteJid
  const sender = message.key.participant || remoteJid
  const phoneNumber = sender.split("@")[0]

  const player = await loadPlayerByPhone(phoneNumber)
  if (!player) {
    await sendQuotedWithFooter(sock, remoteJid, "You need to register first.\n\nUse /start to begin.", message)
    return
  }

  const text = (message.message?.conversation || message.message?.extendedTextMessage?.text || "").trim().toLowerCase()
  const args = text.split(" ")
  const category = args[1] || "richest"
  const page = parseInt(args[2] || "1", 10)

  const validCategories = ["richest", "level", "kills", "pvp", "playtime"]
  if (!validCategories.includes(category)) {
    await sendQuotedWithFooter(sock, remoteJid, `❌ Invalid category.\n\nTry: ${validCategories.join(", ")}`, message)
    return
  }

  const leaderboard = await ServerDashboardService.getLeaderboard(category, page)

  const categoryLabels = {
    richest: "💰 Richest Sorcerers",
    level: "⭐ Highest Level",
    kills: "💀 Curse Kills",
    pvp: "🥊 Best PvP Record",
    playtime: "⏰ Longest Play Time"
  }

  const lines = []
  lines.push(universalHeader("LEADERBOARD", categoryLabels[category] || category))
  lines.push("")

  if (leaderboard.players.length === 0) {
    lines.push("  No players found.")
  } else {
    leaderboard.players.forEach((p, i) => {
      const rank = (leaderboard.page - 1) * 10 + i + 1
      let value = ""
      let valueIcon = ""
      switch (category) {
        case "richest":
          value = `¥${((p.wallet || 0) + (p.bank || 0)).toLocaleString()}`
          valueIcon = "💰"
          break
        case "level":
          value = `Lv.${p.level || 1}`
          valueIcon = "⭐"
          break
        case "kills":
          value = `${p.blackFlashes || 0} kills`
          valueIcon = "💀"
          break
        case "pvp":
          value = `${p.pvpWins || 0}W / ${p.pvpLosses || 0}L`
          valueIcon = "🥊"
          break
        case "playtime":
          const hours = Math.floor((p.totalPlayTime || 0) / (1000 * 60 * 60))
          const minutes = Math.floor(((p.totalPlayTime || 0) % (1000 * 60 * 60)) / (1000 * 60))
          value = `${hours}h ${minutes}m`
          valueIcon = "⏰"
          break
      }

      let rankDisplay
      if (rank <= 3) {
        rankDisplay = `${MEDALS[rank - 1]}`
      } else if (rank <= 10) {
        rankDisplay = `${RANK_NUMBERS[rank - 4]}`
      } else {
        rankDisplay = `#${rank}`
      }

      lines.push(`  ${rankDisplay}  @${p.name || "Unknown"}`)
      lines.push(`     ${valueIcon} ${value}`)
      lines.push("")
    })
  }

  lines.push("  " + sectionDivider)
  lines.push(`  Page ${leaderboard.page}/${leaderboard.totalPages}`)
  lines.push("")

  if (leaderboard.page < leaderboard.totalPages) {
    lines.push(`  /leaderboard ${category} ${leaderboard.page + 1}  →  next page`)
  }

  await sendQuotedWithFooter(sock, remoteJid, lines.join("\n"), message)
}
