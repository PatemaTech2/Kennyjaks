import { sendQuotedWithFooter } from "../../utils/messageHelper.js"
import { loadPlayerByPhone, savePlayer } from "../../database/playerRepo.js"
import { isOwnerOrModerator } from "../../services/PermissionService.js"
import { GRADE_TITLES, GRADE_SCHEDULE, cumulativeXpForLevel } from "../../services/GradeService.js"
import { ProgressionService } from "../../services/progression/ProgressionService.js"

const VALID_GRADES = [4, 3, 2, 1, 0]

export async function handleSetGrade(sock, message) {
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
    await sendQuotedWithFooter(sock, remoteJid, "Usage: /set-grade <grade>\nUsage: /set-grade <@phone_or_number> <grade>\n\nValid grades: 4, 3, 2, 1, 0\n\nExample: /set-grade 0\nExample: /set-grade 2347012345678 1", message)
    return
  }

  let target = null
  let grade = null
  let isBulk = false

  if (args.length >= 2 && VALID_GRADES.includes(parseInt(args[args.length - 1], 10))) {
    const possibleTarget = args[0].replace("@", "").replace(/\D/g, "")
    const targetRef = await loadPlayerByPhone(possibleTarget)
    if (targetRef) {
      target = targetRef
      grade = parseInt(args[args.length - 1], 10)
    }
  }

  if (!target && VALID_GRADES.includes(parseInt(args[0], 10))) {
    const parsedGrade = parseInt(args[0], 10)
    if (isOwner) {
      isBulk = true
      grade = parsedGrade
    } else {
      target = await loadPlayerByPhone(phoneNumber)
      grade = parsedGrade
    }
  }

  if (!target && !isBulk) {
    await sendQuotedWithFooter(sock, remoteJid, "Target player not found.", message)
    return
  }

  if (grade === null || !VALID_GRADES.includes(grade)) {
    await sendQuotedWithFooter(sock, remoteJid, "Invalid grade. Valid grades: 4, 3, 2, 1, 0", message)
    return
  }

  if (isBulk) {
    const results = await ProgressionService.awardBulkSetGrade(grade)
    const successCount = results.filter(r => r.success).length
    await sendQuotedWithFooter(sock, remoteJid, [
      "🎓 GRADE SET FOR ALL",
      "",
      `New Grade: ${grade}`,
      `Title: ${GRADE_TITLES[grade]}`,
      `Players Updated: ${successCount}/${results.length}`,
      "",
      "All player grades have been updated."
    ].join("\n"), message)
    return
  }

  const minLevel = GRADE_SCHEDULE.find(entry => entry.grade === grade)?.minLevel || 1
  const currentLevel = target.level || 1
  if (currentLevel < minLevel) {
    target.lifetimeXp = cumulativeXpForLevel(minLevel)
  }
  await ProgressionService.reconcilePlayerProgression(target)
  await savePlayer(target)

  await sendQuotedWithFooter(sock, remoteJid, [
    "🎓 GRADE SET",
    "",
    `Target: ${target.name || "Unknown"}`,
    `New Grade: ${grade}`,
    `Title: ${GRADE_TITLES[grade]}`,
    "",
    "Grade has been updated."
  ].join("\n"), message)
}
