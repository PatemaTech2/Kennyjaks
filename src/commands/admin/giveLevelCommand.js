import { sendQuotedWithFooter } from "../../utils/messageHelper.js"
import { loadPlayerByPhone, savePlayer } from "../../database/playerRepo.js"
import { isOwnerOrModerator } from "../../services/PermissionService.js"
import { gradeFromLevel, GRADE_TITLES, cumulativeXpForLevel } from "../../services/GradeService.js"
import { ProgressionService } from "../../services/progression/ProgressionService.js"

export async function handleGiveLevel(sock, message) {
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
    await sendQuotedWithFooter(sock, remoteJid, "Usage: /give-level <amount>\nUsage: /give-level <@phone_or_number> <amount>\n\nExample: /give-level 5\nExample: /give-level 2347012345678 3", message)
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
    const results = await ProgressionService.awardBulkLevels(amount)
    const successCount = results.filter(r => r.success).length
    await sendQuotedWithFooter(sock, remoteJid, [
      "⬆️ LEVELS GRANTED TO ALL",
      "",
      `Amount: +${amount} Level(s)`,
      `Players Updated: ${successCount}/${results.length}`,
      "",
      "All players have been leveled up.",
      "Skills auto-unlocked where requirements met.",
      "Grades updated based on new levels."
    ].join("\n"), message)
    return
  }

  target.lifetimeXp = cumulativeXpForLevel(Math.max(1, (target.level || 1) + amount))
  await ProgressionService.reconcilePlayerProgression(target)
  await savePlayer(target)

  await sendQuotedWithFooter(sock, remoteJid, [
    "⬆️ LEVEL GRANTED",
    "",
    `Target: ${target.name || "Unknown"}`,
    `Amount: +${amount} Level(s)`,
    `New Total: ${target.level}`,
    `Grade: ${GRADE_TITLES[target.grade]}`,
    "",
    "Levels have been added.",
    "Skills auto-unlocked where requirements met."
  ].join("\n"), message)
}

export async function handleRemoveLevel(sock, message) {
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
    await sendQuotedWithFooter(sock, remoteJid, "Usage: /rem-level <amount>\nUsage: /rem-level <@phone_or_number> <amount>\n\nExample: /rem-level 5\nExample: /rem-level 2347012345678 3", message)
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
    const results = await bulkRemoveLevels(amount)
    const successCount = results.filter(r => r.success).length
    await sendQuotedWithFooter(sock, remoteJid, [
      "⬇️ LEVELS REMOVED FROM ALL",
      "",
      `Amount: -${amount} Level(s)`,
      `Players Updated: ${successCount}/${results.length}`,
      "",
      "All players have been leveled down."
    ].join("\n"), message)
    return
  }

  const newLevel = Math.max(1, (target.level || 1) - amount)
  target.lifetimeXp = cumulativeXpForLevel(newLevel)
  await ProgressionService.reconcilePlayerProgression(target)
  await savePlayer(target)

  await sendQuotedWithFooter(sock, remoteJid, [
    "⬇️ LEVEL REMOVED",
    "",
    `Target: ${target.name || "Unknown"}`,
    `Amount: -${amount} Level(s)`,
    `New Total: ${target.level}`,
    "",
    "Levels have been removed."
  ].join("\n"), message)
}
