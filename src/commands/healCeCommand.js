import { sendQuotedWithFooter } from "../utils/messageHelper.js"
import { loadPlayerByPhone, savePlayer } from "../database/playerRepo.js"
import { BattleManager } from "../services/battle/BattleManager.js"

const HEAL_CE_COOLDOWN_MS = 6 * 60 * 1000

const BURNOUT_MESSAGES = [
  "Your Cursed Energy has stabilized.",
  "You regain control over the cursed flow within your body.",
  "The strain of battle fades from your body.",
  "Your cursed pathways recover completely.",
  "You release the lingering burnout and restore your energy."
]

function formatCooldown(ms) {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}m ${seconds.toString().padStart(2, "0")}s`
}

export function getHealCeCooldown(player) {
  if (!player.healCeCooldownEnd) return null
  const now = Date.now()
  if (now >= player.healCeCooldownEnd) {
    return null
  }
  return player.healCeCooldownEnd - now
}

export function isHealCeOnCooldown(player) {
  const remaining = getHealCeCooldown(player)
  return remaining !== null
}

export function formatBurnoutStatus(player) {
  const cooldown = getHealCeCooldown(player)
  if (!cooldown) {
    return "⚡ Burnout: Recovered"
  }
  return `⚡ Burnout: Recovering (${formatCooldown(cooldown)})`
}

export async function handleHealCe(sock, message) {
  const remoteJid = message.key.remoteJid
  const sender = message.key.participant || remoteJid
  const phoneNumber = sender.split("@")[0]

  const player = await loadPlayerByPhone(phoneNumber)
  if (!player) {
    await sendQuotedWithFooter(sock, remoteJid, "You need to register first.\n\nUse /start to begin.", message)
    return
  }

  if (BattleManager.isInBattle(player.playerId)) {
    await sendQuotedWithFooter(sock, remoteJid, "❌ You cannot meditate during battle.\n\nDefeat your enemy first.", message)
    return
  }

  if (player.cursedEnergy >= player.maxCursedEnergy) {
    await sendQuotedWithFooter(sock, remoteJid, "⚡ Your Cursed Energy is already at its maximum.", message)
    return
  }

  const cooldown = getHealCeCooldown(player)
  if (cooldown !== null) {
    await sendQuotedWithFooter(sock, remoteJid, `⚠️ Your Cursed Energy pathways are still recovering.\n\nRemaining Cooldown\n${formatCooldown(cooldown)}`, message)
    return
  }

  const oldCe = player.cursedEnergy
  player.cursedEnergy = player.maxCursedEnergy
  const recovered = player.cursedEnergy - oldCe

  player.healCeCooldownEnd = Date.now() + HEAL_CE_COOLDOWN_MS

  await savePlayer(player)

  const recoveryMessage = BURNOUT_MESSAGES[Math.floor(Math.random() * BURNOUT_MESSAGES.length)]

  const response = [
    "━━━━━━━━━━━━━━━━━━━━━━",
    "🧘 Cursed Energy Recovery",
    "━━━━━━━━━━━━━━━━━━━━━━",
    "",
    "You sit down and calm your mind.",
    "The flow of Cursed Energy returns throughout your body.",
    "",
    `⚡ CE Fully Restored! (+${recovered})`,
    "",
    recoveryMessage,
    "",
    "Cooldown:",
    "6 Minutes",
    "",
    "━━━━━━━━━━━━━━━━━━━━━━"
  ].join("\n")

  await sendQuotedWithFooter(sock, remoteJid, response, message)
}
