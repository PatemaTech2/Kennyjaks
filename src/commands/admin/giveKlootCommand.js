import { sendQuotedWithFooter } from "../../utils/messageHelper.js"
import { loadPlayerByPhone, savePlayer } from "../../database/playerRepo.js"
import { KlootService } from "../../services/kloot/KlootService.js"

const ADMIN_IDS = [
  "2347049724284@s.whatsapp.net",
  "112326665601126@s.whatsapp.net"
]

function isAdmin(playerId) {
  return ADMIN_IDS.includes(playerId)
}

export async function handleGiveKloot(sock, message) {
  const remoteJid = message.key.remoteJid
  const sender = message.key.participant || remoteJid
  const phoneNumber = sender.split("@")[0]
  const text = (message.message?.conversation || message.message?.extendedTextMessage?.text || "").trim()

  const player = await loadPlayerByPhone(phoneNumber)
  if (!player) {
    await sendQuotedWithFooter(sock, remoteJid, "You need to register first.\n\nUse /start to begin.", message)
    return
  }

  if (!isAdmin(sender)) {
    await sendQuotedWithFooter(sock, remoteJid, "Only admins can use this command.", message)
    return
  }

  const args = text.split(" ")
  let targetPhone = null
  let klootId = null

  const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage
  const quotedSender = quoted?.participant || quoted?.key?.participant

  if (quotedSender) {
    targetPhone = quotedSender.split("@")[0]
  }

  if (args.length >= 2) {
    klootId = args[1].toLowerCase()
  }

  if (!targetPhone || !klootId) {
    await sendQuotedWithFooter(sock, remoteJid, "Usage: /give-kloot <tag user> <kloot name>\n\nAvailable kloots:\n- curse_binding_scroll\n- zero_gravity\n- benimaru", message)
    return
  }

  const targetPlayer = await loadPlayerByPhone(targetPhone)
  if (!targetPlayer) {
    await sendQuotedWithFooter(sock, remoteJid, "Target player not found.", message)
    return
  }

  const definitions = KlootService.getDefinitions()
  if (!definitions[klootId]) {
    await sendQuotedWithFooter(sock, remoteJid, `Unknown kloot: ${klootId}\nAvailable: ${Object.keys(definitions).join(", ")}`, message)
    return
  }

  KlootService.addKloot(targetPlayer, klootId)
  await savePlayer(targetPlayer)

  await sendQuotedWithFooter(sock, remoteJid, `✅ Gave ${definitions[klootId].name} to ${targetPlayer.name}!`, message)
}
