import { sendQuotedWithFooter } from "../utils/messageHelper.js"
import { loadPlayerByPhone } from "../database/playerRepo.js"
import { buildRegistry, buildMenuText } from "../services/commandRegistry.js"

export async function handleMenu(sock, message) {
  const remoteJid = message.key.remoteJid
  const sender = message.key.participant || remoteJid
  const phoneNumber = sender.split("@")[0]

  const player = await loadPlayerByPhone(phoneNumber)
  if (!player) {
    await sendQuotedWithFooter(sock, remoteJid, "You need to register first.\n\nUse /start to begin.", message)
    return
  }

  const args = message.parsedCommand?.args || message.args || []
  const menuText = buildMenuText(buildRegistry(), player, args)
  await sendQuotedWithFooter(sock, remoteJid, menuText, message)
}
