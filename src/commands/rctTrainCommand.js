import { sendQuotedWithFooter } from "../utils/messageHelper.js"
import { loadPlayerByPhone, savePlayer } from "../database/playerRepo.js"
import { RCTAwakeningService } from "../services/rct/RCTAwakeningService.js"

export async function handleRctTrain(sock, message) {
  const remoteJid = message.key.remoteJid
  const sender = message.key.participant || remoteJid
  const phoneNumber = sender.split("@")[0]

  const player = await loadPlayerByPhone(phoneNumber)
  if (!player) {
    await sendQuotedWithFooter(sock, remoteJid, "You need to register first.\n\nUse /start to begin.", message)
    return
  }

  if (player.hasRCT) {
    await sendQuotedWithFooter(sock, remoteJid, "You have already awakened Reverse Cursed Technique.", message)
    return
  }

  const canTrain = RCTAwakeningService.canStartRctTraining(player)
  if (!canTrain.canTrain) {
    await sendQuotedWithFooter(sock, remoteJid, canTrain.reason, message)
    return
  }

  const progress = RCTAwakeningService.getRctTrainingProgress(player)

  const lines = [
    "━━━━━━━━━━━━━━━━━━━━━━",
    "🔄 RCT MASTERY TRAINING",
    "━━━━━━━━━━━━━━━━━━━━━━",
    "",
    "To awaken Reverse Cursed Technique through mastery,",
    "you must complete ALL of the following challenges:",
    "",
  ]

  progress.stages.forEach((stage, idx) => {
    const status = stage.completed ? "✅" : "🔸"
    const pct = Math.round((stage.current / stage.target) * 100)
    lines.push(`${status} ${stage.desc}`)
    lines.push(`   ${stage.label}: ${stage.current}/${stage.target} (${pct}%)`)
    lines.push("")
  })

  lines.push("━━━━━━━━━━━━━━━━━━━━━━")
  lines.push("")

  if (progress.allComplete) {
    lines.push("🎯 ALL CHALLENGES COMPLETE!")
    lines.push("You have awakened Reverse Cursed Technique!")
    lines.push("")
    lines.push("Use /rt to view your awakening details.")
  } else {
    const remaining = progress.stages.filter(s => !s.completed).length
    lines.push(`Remaining challenges: ${remaining}/${progress.stages.length}`)
    lines.push("")
    lines.push("Track your progress with /rct-train anytime.")
  }

  lines.push("")
  lines.push("━━━━━━━━━━━━━━━━━━━━━━")

  await sendQuotedWithFooter(sock, remoteJid, lines.join("\n"), message)
}
