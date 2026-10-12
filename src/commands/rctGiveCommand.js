import { sendQuotedWithFooter } from "../utils/messageHelper.js"
import { loadPlayerByPhone, savePlayer } from "../database/playerRepo.js"
import { resolveTarget } from "../utils/targetResolver.js"
import { BattleManager } from "../services/battle/BattleManager.js"
import { BALANCE } from "../config/balance.js"

export async function handleRctGive(sock, message) {
  const remoteJid = message.key.remoteJid
  const sender = message.key.participant || remoteJid
  const phoneNumber = sender.split("@")[0]

  const player = await loadPlayerByPhone(phoneNumber)
  if (!player) {
    await sendQuotedWithFooter(sock, remoteJid, "You need to register first.", message)
    return
  }

  if (!player.hasRCT && !(player.rct && player.rct.unlocked)) {
    await sendQuotedWithFooter(sock, remoteJid, "❌ You have not awakened Reverse Cursed Technique.\n\nUse /rt to learn how.", message)
    return
  }

  const battle = BattleManager.getActiveBattle(player.playerId)
  if (battle) {
    await sendQuotedWithFooter(sock, remoteJid, "RCT Give can only be used outside of battle.", message)
    return
  }

  const target = await resolveTarget(message, phoneNumber)
  if (!target) {
    await sendQuotedWithFooter(sock, remoteJid, "Usage: /rct-give @user or reply to a message with /rct-give", message)
    return
  }

  const rctCooldowns = player.rctCooldowns || {}
  const now = Date.now()
  const lastGive = rctCooldowns.give || 0
  const cooldownMs = 56 * 60 * 1000

  if (now - lastGive < cooldownMs) {
    const remaining = Math.ceil((cooldownMs - (now - lastGive)) / 1000)
    await sendQuotedWithFooter(sock, remoteJid, `RCT Give is on cooldown. ${remaining}s remaining.`, message)
    return
  }

  const rctCost = BALANCE.rctGiveCeCost
  if ((player.cursedEnergy || 0) < rctCost) {
    await sendQuotedWithFooter(sock, remoteJid, "❌ Your Cursed Energy is too low to use Reverse Cursed Technique.", message)
    return
  }

  player.cursedEnergy -= rctCost
  player.rctCooldowns = player.rctCooldowns || {}
  player.rctCooldowns.give = now

  const targetPlayer = target.player
  const oldHp = targetPlayer.health
  targetPlayer.health = targetPlayer.maxHealth
  targetPlayer.cursedEnergy = targetPlayer.maxCursedEnergy

  await savePlayer(player)
  await savePlayer(targetPlayer)

  const msg = [
    "✨ REVERSE CURSED TECHNIQUE",
    "",
    `@${player.name || "Unknown"} places a hand on @${targetPlayer.name || "Unknown"}.`,
    "",
    "Reverse Cursed Technique flows through their body.",
    "",
    `${targetPlayer.name || "Unknown"} has been fully healed.`,
    `HP: ${oldHp || 0} → ${targetPlayer.maxHealth || 0}`,
    "All injuries have been repaired.",
    "",
    `CE: -${rctCost} (healer)`,
    "",
    "Cooldown: 56 minutes",
    "",
    "━━━━━━━━━━━━━━━━"
  ].join("\n")

  await sendQuotedWithFooter(sock, remoteJid, msg, message)
}
