import { sendQuotedWithFooter } from "../utils/messageHelper.js"
import { loadPlayerByPhone, savePlayer } from "../database/playerRepo.js"

export async function handleSetName(sock, message) {
  const remoteJid = message.key.remoteJid
  const sender = message.key.participant || remoteJid
  const phoneNumber = sender.split("@")[0]

  const player = await loadPlayerByPhone(phoneNumber)
  if (!player) {
    await sendQuotedWithFooter(sock, remoteJid, "You need to register first.\n\nUse /start to begin.", message)
    return
  }

  const text = (message.message.conversation || message.message.extendedTextMessage?.text || "").trim()
  const args = text.split(" ")
  args.shift()
  const newName = args.join(" ").trim()

  if (!newName) {
    await sendQuotedWithFooter(sock, remoteJid, "Usage: /set-name <Name>\nMax 50 characters including emojis.", message)
    return
  }

  if (newName.length > 50) {
    await sendQuotedWithFooter(sock, remoteJid, "Name too long. Maximum 50 characters.", message)
    return
  }

  player.name = newName
  await savePlayer(player)

  await sendQuotedWithFooter(sock, remoteJid, `Name changed to: ${newName}`, message)
}
