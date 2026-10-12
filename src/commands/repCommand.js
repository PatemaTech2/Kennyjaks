import { sendQuotedWithFooter } from "../utils/messageHelper.js"
import { loadPlayerByPhone } from "../database/playerRepo.js"
import { isCalamityLevel, getCalamityStatus } from "../services/CalamityService.js"

export async function handleReputation(sock, message) {
  const remoteJid = message.key.remoteJid
  const sender = message.key.participant || remoteJid
  const phoneNumber = sender.split("@")[0]

  const player = await loadPlayerByPhone(phoneNumber)
  if (!player) {
    await sendQuotedWithFooter(sock, remoteJid, "You need to register first.\n\nUse /start to begin.", message)
    return
  }

  const rep = player.reputation || 0
  const curseKills = player.curseKills || 0
  const specialGradeKills = player.specialGradeKills || 0
  const calamityStatus = getCalamityStatus(player)

  const lines = [
    "╔══════════════════════════════╗",
    "         REPUTATION",
    "╚══════════════════════════════╝",
    "",
    `REP: ${rep.toLocaleString()}`,
    "",
    calamityStatus ? `STATUS:\n${calamityStatus}` : "STATUS:\nSorcerer",
    "",
    "Curse Kills:",
    `${curseKills.toLocaleString()}`,
    "",
    "Special Grade Kills:",
    `${specialGradeKills.toLocaleString()}`,
    ""
  ]

  await sendQuotedWithFooter(sock, remoteJid, lines.join("\n"), message)
}
