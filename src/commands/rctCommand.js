import { sendQuotedWithFooter } from "../utils/messageHelper.js"
import { loadPlayerByPhone } from "../database/playerRepo.js"
import { RCTAwakeningService } from "../services/rct/RCTAwakeningService.js"

export async function handleTrainRct(sock, message) {
  const remoteJid = message.key.remoteJid
  const sender = message.key.participant || remoteJid
  const phoneNumber = sender.split("@")[0]

  const player = await loadPlayerByPhone(phoneNumber)
  if (!player) {
    await sendQuotedWithFooter(sock, remoteJid, "You need to register first.\n\nUse /start to begin.", message)
    return
  }

  if (player.hasRCT) {
    await sendQuotedWithFooter(sock, remoteJid, "You have already awakened Reverse Cursed Technique.\n\nUse /rt to view your status.\nUse /rtu in battle to use your Reverse Technique.", message)
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

  progress.stages.forEach(stage => {
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
  }

  lines.push("")
  lines.push("━━━━━━━━━━━━━━━━━━━━━━")

  await sendQuotedWithFooter(sock, remoteJid, lines.join("\n"), message)
}

export async function handleTrainRctConfirm(sock, message) {
  const remoteJid = message.key.remoteJid
  const sender = message.key.participant || remoteJid
  const phoneNumber = sender.split("@")[0]

  const player = await loadPlayerByPhone(phoneNumber)
  if (!player) {
    await sendQuotedWithFooter(sock, remoteJid, "You need to register first.\n\nUse /start to begin.", message)
    return
  }

  if (player.hasRCT) {
    await sendQuotedWithFooter(sock, remoteJid, "You have already awakened Reverse Cursed Technique.\n\nUse /rt to view your status.", message)
    return
  }

  const progress = RCTAwakeningService.getRctTrainingProgress(player)
  if (progress.allComplete && progress.allComplete) {
    await RCTAwakeningService.awakenRCT(player, "mastery")
    const msg = [
      "━━━━━━━━━━━━━━━━━━━━━━",
      "AWAKENING!",
      "━━━━━━━━━━━━━━━━━━━━━━",
      "",
      `⚡ ${player.name || "Unknown Sorcerer"} has unlocked`,
      "  🌟 REVERSE CURSED TECHNIQUE!",
      "",
      "Your body floods with positive energy.",
      "Inverted cursed energy flows through your veins.",
      "You can now heal yourself and others,",
      "and wield your unique Reverse Technique.",
      "",
      `Reversed Technique: ${player.reversedTechnique?.name || "Unknown"}`,
      "",
      "Use /rt to view details.",
      "Use /rtu in battle to use your Reverse Technique.",
      "",
      "━━━━━━━━━━━━━━━━━━━━━━"
    ].join("\n")
    await sendQuotedWithFooter(sock, remoteJid, msg, message)
  } else {
    await sendQuotedWithFooter(sock, remoteJid, "You have not completed all RCT training challenges yet.\n\nUse /rct-train to check your progress.", message)
  }
}
