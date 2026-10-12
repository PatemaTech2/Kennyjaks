import { sendQuotedWithFooter } from "../../utils/messageHelper.js"
import { loadPlayerByPhone } from "../../database/playerRepo.js"
import { ServerDashboardService } from "../../services/dashboard/ServerDashboardService.js"
import { getRandomHeader } from "../../utils/ui.js"

export async function handleList(sock, message) {
  const remoteJid = message.key.remoteJid
  const sender = message.key.participant || remoteJid
  const phoneNumber = sender.split("@")[0]

  const player = await loadPlayerByPhone(phoneNumber)
  if (!player) {
    await sendQuotedWithFooter(sock, remoteJid, "You need to register first.\n\nUse /start to begin.", message)
    return
  }

  const text = (message.message.conversation || message.message.extendedTextMessage?.text || "").trim().toLowerCase()
  const args = text.split(" ")
  const page = parseInt(args[1] || "1", 10)

  const stats = await ServerDashboardService.getServerStats()
  const { players: pagePlayers, page: currentPage, totalPages } = await ServerDashboardService.getPaginatedPlayers(page)

  const lines = [
    `Total Players: ${stats.totalPlayers || 0}`,
    `Total Wealth: ¥${(stats.combinedWealth || 0).toLocaleString()}`,
    `Average Level: ${stats.averageLevel || 0}`,
    `Total Curse Kills: ${stats.totalCurseKills || 0}`,
    `Total PvP Battles: ${stats.totalPvPBattles || 0}`,
    `Total Black Flashes: ${stats.totalBlackFlashes || 0}`,
    `Total Shikigami: ${stats.totalShikigami || 0}`,
    `Total Items: ${stats.totalItems || 0}`,
    `Total Bags: ${stats.totalBags || 0}`,
    `Average Play Time: ${(stats.averagePlayTimeHours || 0)}h ${(stats.averagePlayTimeMinutes || 0)}m`,
    `Players Online: ${stats.onlineCount || 0}`
  ]

  const header = getRandomHeader("SERVER REGISTRY")
  const result = [header, ""]
  result.push(...lines.map(l => `┃ ${l}`))
  result.push("┃")
  result.push(`┃ Players (${currentPage}/${totalPages})`)
  result.push("┃")

  pagePlayers.forEach((p, i) => {
    const idx = (currentPage - 1) * 10 + i + 1
    result.push(`┃ ${idx}. ${p.name || "Unknown"}`)
    result.push(`┃    Lv.${p.level || 1} • Grade ${p.grade !== undefined ? p.grade : 4}`)
  })

  result.push("┃")
  if (currentPage < totalPages) {
    result.push(`┃ Use /list ${currentPage + 1} for next page`)
  }
  result.push("╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯")

  await sendQuotedWithFooter(sock, remoteJid, result.join("\n"), message)
}
