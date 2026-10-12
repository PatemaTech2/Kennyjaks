import { sendQuotedWithFooter } from "../utils/messageHelper.js"
import { loadPlayerByPhone } from "../database/playerRepo.js"
import { RCTAwakeningService } from "../services/rct/RCTAwakeningService.js"

export async function handleRctStatus(sock, message) {
  const remoteJid = message.key.remoteJid
  const sender = message.key.participant || remoteJid
  const phoneNumber = sender.split("@")[0]

  const player = await loadPlayerByPhone(phoneNumber)
  if (!player) {
    await sendQuotedWithFooter(sock, remoteJid, "You need to register first.\n\nUse /start to begin.", message)
    return
  }

  if (player.hasRCT && player.reversedTechnique) {
    const rt = player.reversedTechnique
    const methodLabel = player.rctMethod === "near_death" ? "Near-Death Awakening" : player.rctMethod === "mastery" ? "Mastery Training" : "Legacy"

    const lines = [
      "━━━━━━━━━━━━━━━━━━━━━━",
      "🔄 REVERSE CURSED TECHNIQUE",
      "━━━━━━━━━━━━━━━━━━━━━━",
      "",
      "Status",
      "✅ Mastered",
      "",
      `Awakened via: ${methodLabel}`,
      "",
      "━━━━━━━━━━━━━━━━━━━━━━",
      "",
      "🔄 Reverse Technique",
      rt.name,
      "",
      `Damage: ${rt.damage || 0}`,
      `CE Cost: ${rt.ceCost || 0}`,
      `Cooldown: ${rt.cooldown || 0}${rt.cooldownUnit ? " " + rt.cooldownUnit : ""}`,
      "",
      `Effects: ${rt.effects ? rt.effects.join(", ") : "None"}`,
      "",
      "Use",
      "/rtu",
      "",
      "━━━━━━━━━━━━━━━━━━━━━━"
    ]

    await sendQuotedWithFooter(sock, remoteJid, lines.join("\n"), message)
    return
  }

  const progress = RCTAwakeningService.getRctTrainingProgress(player)

  const lines = [
    "━━━━━━━━━━━━━━━━━━━━━━",
    "🔄 REVERSE CURSED TECHNIQUE",
    "━━━━━━━━━━━━━━━━━━━━━━",
    "",
    "Status",
    "❌ Locked",
    "",
    "━━━━━━━━━━━━━━━━━━━━━━",
    "",
    "Natural Awakening",
    "Die against an overwhelmingly stronger curse.",
    "9% chance.",
    "",
    "━━━━━━━━━━━━━━━━━━━━━━",
    "",
    "Master Awakening",
    "Become Grade 2.",
    "Complete RCT Training.",
    "",
    "━━━━━━━━━━━━━━━━━━━━━━"
  ]

  if (progress.stages.length > 0) {
    lines.push("")
    lines.push("Training Progress")
    progress.stages.forEach(stage => {
      const status = stage.completed ? "✅" : "🔸"
      lines.push(`${status} ${stage.desc}`)
      lines.push(`   ${stage.current}/${stage.target} (${stage.label})`)
    })
    lines.push("")
    const remaining = progress.stages.filter(s => !s.completed).length
    lines.push(`Remaining: ${remaining}/${progress.stages.length}`)
  }

  lines.push("")
  lines.push("━━━━━━━━━━━━━━━━━━━━━━")

  await sendQuotedWithFooter(sock, remoteJid, lines.join("\n"), message)
}
