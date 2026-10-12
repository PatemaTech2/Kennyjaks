import { sendQuotedWithFooter } from "../../utils/messageHelper.js"
import { loadPlayerByPhone } from "../../database/playerRepo.js"
import os from "os"

export async function handleStats(sock, message) {
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
  const memUsage = process.memoryUsage()
  const memUsed = (memUsage.heapUsed / 1024 / 1024).toFixed(1)
  const memTotal = (memUsage.heapTotal / 1024 / 1024).toFixed(1)

  const lines = [
    "━━━━━━━━━━━━━━━━━━━━━━",
    "📊 SERVER STATISTICS",
    "━━━━━━━━━━━━━━━━━━━━━━",
    "",
    "🖥️ SYSTEM",
    `Uptime: ${uptimeStr}`,
    `Memory: ${memUsed} MB / ${memTotal} MB`,
    `Node: ${process.version}`,
    `Platform: ${os.platform()} ${os.arch()}`,
    "",
    "━━━━━━━━━━━━━━━━━━━━━━",
    "Use /news for world updates"
  ]

  await sendQuotedWithFooter(sock, remoteJid, lines.join("\n"), message)
}
