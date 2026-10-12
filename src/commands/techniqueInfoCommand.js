import { sendQuotedWithFooter } from "../utils/messageHelper.js"
import { loadPlayerByPhone } from "../database/playerRepo.js"
import { ProgressionManager } from "../services/progression/ProgressionManager.js"

export async function handleTechniqueInfo(sock, message) {
  const remoteJid = message.key.remoteJid
  const sender = message.key.participant || remoteJid
  const phoneNumber = sender.split("@")[0]

  const player = await loadPlayerByPhone(phoneNumber)
  if (!player) {
    await sendQuotedWithFooter(sock, remoteJid, "You need to register first.\n\nUse /start to begin.", message)
    return
  }

  const result = ProgressionManager.getTrainingDisplay(player)
  if (result.error) {
    await sendQuotedWithFooter(sock, remoteJid, result.error, message)
    return
  }

  await sendQuotedWithFooter(sock, remoteJid, result.display, message)
}
