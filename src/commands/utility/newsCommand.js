import { sendQuotedWithFooter } from "../../utils/messageHelper.js"
import { loadPlayerByPhone } from "../../database/playerRepo.js"
import chalk from "chalk"

export async function handleNews(sock, message) {
  const remoteJid = message.key.remoteJid
  const sender = message.key.participant || remoteJid
  const phoneNumber = sender.split("@")[0]

  const player = await loadPlayerByPhone(phoneNumber)
  if (!player) {
    await sendQuotedWithFooter(sock, remoteJid, "You need to register first.\n\nUse /start to begin.", message)
    return
  }

  const uptime = process.uptime()
  const uptimeStr = `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m`

  const lines = [
    "━━━━━━━━━━━━━━━━━━━━━━",
    "📰 KENNYJAKS NEWS",
    "━━━━━━━━━━━━━━━━━━━━━━",
    "",
    "🌍 WORLD STATUS",
    `Uptime: ${uptimeStr}`,
    `Online: Calculating...`,
    "",
    "━━━━━━━━━━━━━━━━━━━━━━",
    "Use /stats for server statistics"
  ]

  await sendQuotedWithFooter(sock, remoteJid, lines.join("\n"), message)
}
