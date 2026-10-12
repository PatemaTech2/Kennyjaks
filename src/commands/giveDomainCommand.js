import { sendQuotedWithFooter } from "../utils/messageHelper.js"
import { loadPlayerByPhone, loadPlayerByName, savePlayer } from "../database/playerRepo.js"
import { isOwnerOrModerator } from "../services/PermissionService.js"
import { DomainService } from "../services/technique/DomainService.js"

export async function handleGiveDomain(sock, message) {
  const remoteJid = message.key.remoteJid
  const sender = message.key.participant || remoteJid
  const phoneNumber = sender.split("@")[0]

  if (!isOwnerOrModerator(phoneNumber)) {
    await sendQuotedWithFooter(sock, remoteJid, "⛔ This command is restricted to the Bot Owner and Bot Moderators.", message)
    return
  }

  const text = (message.message?.conversation || message.message?.extendedTextMessage?.text || "").trim()
  const args = text.split(" ").slice(1)
  if (args.length < 2) {
    await sendQuotedWithFooter(sock, remoteJid, "Usage: /give-domain <@phone_or_number> <technique>\nExample: /give-domain 2347012345678 Limitless", message)
    return
  }

  const targetRef = args[0].replace("@", "").replace(/\D/g, "")
  const techniqueName = args.slice(1).join(" ")

  // Resolve target: by phoneNumber, or by name (strip @)
  const nameArg = args[0].replace("@", "")
  const target = await loadPlayerByPhone(targetRef) || await loadPlayerByName(nameArg)
  if (!target) {
    await sendQuotedWithFooter(sock, remoteJid, `Target player not found: ${args[0]}`, message)
    return
  }

  const result = DomainService.grantDomain(target, techniqueName)
  if (result.error) {
    await sendQuotedWithFooter(sock, remoteJid, result.error, message)
    return
  }

  await savePlayer(target)
  await sendQuotedWithFooter(sock, remoteJid, [
    "🌀 DOMAIN GRANTED",
    "",
    `Target: ${target.name || "Unknown"}`,
    `Domain: ${result.domain.name}`,
    `Technique: ${techniqueName}`,
    "",
    "Domain Expansion is now permanently unlocked for this player.",
    "They can use /domain in battle."
  ].join("\n"), message)
}
