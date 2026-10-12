import { sendQuotedWithFooter } from "../../utils/messageHelper.js"
import { loadPlayerByPhone, loadPlayerByName, savePlayer } from "../../database/playerRepo.js"
import { isOwnerOrModerator } from "../../services/PermissionService.js"
import { bulkAddSkillPoints } from "../../services/player/ownerCommandService.js"

export async function handleGiveSkillPoints(sock, message) {
  const remoteJid = message.key.remoteJid
  const sender = message.key.participant || remoteJid
  const phoneNumber = sender.split("@")[0]

  if (!isOwnerOrModerator(phoneNumber)) {
    await sendQuotedWithFooter(sock, remoteJid, "⛔ This command is restricted to the Bot Owner and Bot Moderators.", message)
    return
  }

  const text = (message.message?.conversation || message.message?.extendedTextMessage?.text || "").trim()
  const args = text.split(" ").slice(1)

  if (args.length === 0) {
    await sendQuotedWithFooter(sock, remoteJid, "Usage: /give-sp <amount>\nUsage: /give-sp <@phone_or_number> <amount>\n\nExample: /give-sp 100\nExample: /give-sp 2347012345678 50", message)
    return
  }

  let target = null
  let amount = 0
  let isBulk = false

  if (args.length >= 2 && /^\d+$/.test(args[args.length - 1])) {
    const possibleTarget = args[0].replace("@", "").replace(/\D/g, "")
    const targetRef = await loadPlayerByPhone(possibleTarget)
    if (targetRef) {
      target = targetRef
      amount = Math.max(0, parseInt(args[args.length - 1], 10) || 0)
    }
  }

  if (!target) {
    const parsedAmount = parseInt(args[0], 10) || 0
    if (parsedAmount > 0 && isOwner) {
      isBulk = true
      amount = parsedAmount
    } else {
      target = await loadPlayerByPhone(phoneNumber)
      amount = parsedAmount
    }
  }

  if (!target && !isBulk) {
    await sendQuotedWithFooter(sock, remoteJid, "Target player not found.", message)
    return
  }

  if (amount <= 0) {
    await sendQuotedWithFooter(sock, remoteJid, "Amount must be a positive number.", message)
    return
  }

  if (isBulk) {
    const results = await bulkAddSkillPoints(amount)
    const successCount = results.filter(r => r.success).length
    await sendQuotedWithFooter(sock, remoteJid, [
      "✨ SKILL POINTS GRANTED TO ALL",
      "",
      `Amount: +${amount} SP`,
      `Players Updated: ${successCount}/${results.length}`,
      "",
      "All players received skill points.",
      "Skills auto-unlocked where requirements met."
    ].join("\n"), message)
    return
  }

  target.skillPoints = (target.skillPoints || 0) + amount
  await autoUnlockSkillsForPlayer(target)
  await savePlayer(target)

  await sendQuotedWithFooter(sock, remoteJid, [
    "✨ SKILL POINTS GRANTED",
    "",
    `Target: ${target.name || "Unknown"}`,
    `Amount: +${amount} SP`,
    `New Total: ${target.skillPoints}`,
    "",
    "Skill points have been added.",
    "Skills auto-unlocked where requirements met."
  ].join("\n"), message)
}
