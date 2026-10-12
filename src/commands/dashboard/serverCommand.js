import { sendQuotedWithFooter } from "../../utils/messageHelper.js"
import { loadPlayerByPhone } from "../../database/playerRepo.js"
import { getRandomHeader } from "../../utils/ui.js"
import os from "os"
import chalk from "chalk"

export async function handleServer(sock, message) {
  const remoteJid = message.key.remoteJid
  const sender = message.key.participant || remoteJid
  const phoneNumber = sender.split("@")[0]

  const player = await loadPlayerByPhone(phoneNumber)
  if (!player) {
    await sendQuotedWithFooter(sock, remoteJid, "You need to register first.\n\nUse /start to begin.", message)
    return
  }

  const uptime = process.uptime()
  const uptimeDays = Math.floor(uptime / (3600 * 24))
  const uptimeHours = Math.floor((uptime % (3600 * 24)) / 3600)
  const uptimeMinutes = Math.floor((uptime % 3600) / 60)

  const memUsage = process.memoryUsage()
  const memUsed = (memUsage.heapUsed / 1024 / 1024).toFixed(1)
  const memTotal = (memUsage.heapTotal / 1024 / 1024).toFixed(1)
  const memRSS = (memUsage.rss / 1024 / 1024).toFixed(1)

  const cpuUsage = os.loadavg()[0].toFixed(2)
  const cpuCores = os.cpus().length

  const lines = [
    `Bot Version: 1.0.0`,
    `Node.js: ${process.version}`,
    `Platform: ${os.platform()} ${os.arch()}`,
    `CPU Cores: ${cpuCores}`,
    `CPU Load: ${cpuUsage}`,
    `Memory: ${memUsed} MB / ${memTotal} MB`,
    `RSS: ${memRSS} MB`,
    `Uptime: ${uptimeDays}d ${uptimeHours}h ${uptimeMinutes}m`
  ]

  const header = getRandomHeader("SERVER STATUS")
  const result = [header, ""]
  result.push(...lines.map(l => `┃ ${l}`))
  result.push("╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯")

  await sendQuotedWithFooter(sock, remoteJid, result.join("\n"), message)
}
