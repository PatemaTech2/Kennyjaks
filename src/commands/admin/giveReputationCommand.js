import { sendQuotedWithFooter } from "../../utils/messageHelper.js"
import { loadPlayerByPhone, loadPlayerByName, savePlayer } from "../../database/playerRepo.js"
import { isOwnerOrModerator } from "../../services/PermissionService.js"
import { ReputationService } from "../../services/reputation/ReputationService.js"
import { ReputationTitleService } from "../../services/progression/ReputationTitleService.js"
import { applyToAllPlayers } from "../../services/player/ownerCommandService.js"

export async function handleGiveReputation(sock, message) {
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
    await sendQuotedWithFooter(sock, remoteJid, "Usage: /give-rep <amount>\nUsage: /give-rep <@phone_or_number> <amount>\n\nExample: /give-rep 200\nExample: /give-rep 2347012345678 500", message)
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
    const results = await applyToAllPlayers(async (player) => {
      ReputationService.addReputation(player, amount)
      ReputationTitleService.reconcileReputation(player)
    })
    const successCount = results.filter(r => r.success).length
    await sendQuotedWithFooter(sock, remoteJid, [
      "🏆 REPUTATION GRANTED TO ALL",
      "",
      `Amount: +${amount} REP`,
      `Players Updated: ${successCount}/${results.length}`,
      "",
      "All players received reputation."
    ].join("\n"), message)
    return
  }

  const newRep = ReputationService.addReputation(target, amount)
  ReputationTitleService.reconcileReputation(target)
  const title = ReputationTitleService.getReputationTitle(target.reputation)?.title || "Unknown"
  await savePlayer(target)

  await sendQuotedWithFooter(sock, remoteJid, [
    "🏆 REPUTATION GRANTED",
    "",
    `Target: ${target.name || "Unknown"}`,
    `Amount: +${amount} REP`,
    `New Total: ${newRep.toLocaleString()}`,
    `Title: ${title}`,
    "",
    "Reputation has been updated."
  ].join("\n"), message)
}
