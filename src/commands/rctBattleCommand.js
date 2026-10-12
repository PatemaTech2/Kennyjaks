import { sendQuotedWithFooter } from "../utils/messageHelper.js"
import { loadPlayerByPhone, savePlayer } from "../database/playerRepo.js"
import { BattleManager } from "../services/battle/BattleManager.js"
import { globalStatusEngine } from "../services/battle/StatusEngine.js"
import { BALANCE } from "../config/balance.js"

export async function handleRctBurst(sock, message) {
  const remoteJid = message.key.remoteJid
  const sender = message.key.participant || remoteJid
  const phoneNumber = sender.split("@")[0]

  const player = await loadPlayerByPhone(phoneNumber)
  if (!player) {
    await sendQuotedWithFooter(sock, remoteJid, "You need to register first.", message)
    return
  }

  if (!player.hasRCT && !(player.rct && player.rct.unlocked)) {
    await sendQuotedWithFooter(sock, remoteJid, "You haven't unlocked Reverse Cursed Technique. Use /rt to learn how.", message)
    return
  }

  const battle = BattleManager.getActiveBattle(player.playerId)
  if (!battle) {
    await sendQuotedWithFooter(sock, remoteJid, "RCT Burst can only be used during battle.", message)
    return
  }

  const cooldownMs = BALANCE.rctBurstCooldownMs
  const rctCooldowns = player.rctCooldowns || {}
  const now = Date.now()
  const lastBurst = rctCooldowns.burst || 0

  if (now - lastBurst < cooldownMs) {
    const remaining = Math.ceil((cooldownMs - (now - lastBurst)) / 1000)
    await sendQuotedWithFooter(sock, remoteJid, `RCT Burst is on cooldown. ${remaining}s remaining.`, message)
    return
  }

  const rctCost = BALANCE.rctBurstCeCost
  if ((player.cursedEnergy || 0) < rctCost) {
    await sendQuotedWithFooter(sock, remoteJid, `Not enough CE. RCT Burst requires ${rctCost} CE.`, message)
    return
  }

  player.cursedEnergy -= rctCost
  player.rctCooldowns = player.rctCooldowns || {}
  player.rctCooldowns.burst = now

  const oldHp = player.health

  const intel = player.intelligence || player.stats?.intelligence || 10
  const intBonus = 1 + (intel / 200)
  const healPct = Math.max(0.8, Math.min(1.0, 0.85 + intBonus * 0.15))
  const healAmount = Math.floor(player.maxHealth * healPct)
  player.health = Math.min(player.maxHealth, oldHp + healAmount)
  const actualHeal = player.health - oldHp

  let pvpOpponent = null
  if (battle.type === "PVP") {
    const bb = battle.battle || battle
    pvpOpponent = bb
    const ids = bb.playerIds || []
    const playerIndex = ids.indexOf(String(player.playerId))
    if (playerIndex === 0 && ids.length >= 2) {
      bb.challengerHp = player.health
    } else {
      bb.targetHp = player.health
    }
  }

  globalStatusEngine.addStatus(player.playerId, {
    type: "rct_heal",
    label: "RCT Healing",
    emoji: "🌟",
    durationTurns: 3,
    unique: true,
    clearedOnBattleEnd: true,
    lastDamageTaken: 0,
    effect: (target) => {
      const heal = Math.floor(target.lastDamageTaken * 0.6)
      if (heal > 0) {
        const oldH = target.health
        target.health = Math.min(target.maxHealth, target.health + heal)
        return target.health - oldH
      }
      return 0
    }
  })

  await savePlayer(player)

  const msg = [
    "✨ REVERSE CURSED TECHNIQUE",
    "",
    "Your body floods with positive energy.",
    "Broken bones reconnect.",
    "Deep wounds close instantly.",
    "",
    `HP: ${(oldHp || 0)} → ${player.health || 0} (+${actualHeal || 0})`,
    `CE: -${rctCost || 0}`,
    "",
    "For the next 3 rounds:",
    "After each enemy attack, you will",
    "automatically heal 60% of damage taken.",
    "",
    "RCT Mastery: " + (healPct >= 1.0 ? "PERFECT" : healPct >= 0.9 ? "EXCELLENT" : "GOOD"),
    "",
    "Cooldown: 3 minutes",
    "",
    "Available Commands",
    "  /battack1",
    "  /battack2",
    "  /battack3",
    "  /battack4",
    "  /btq1",
    "  /btq2",
    "  /btq3",
    "  /bblock",
    "  /bflee"
  ].join("\n")

  await sendQuotedWithFooter(sock, remoteJid, msg, message)
}

export async function handleRctSlow(sock, message) {
  const remoteJid = message.key.remoteJid
  const sender = message.key.participant || remoteJid
  const phoneNumber = sender.split("@")[0]

  const player = await loadPlayerByPhone(phoneNumber)
  if (!player) {
    await sendQuotedWithFooter(sock, remoteJid, "You need to register first.", message)
    return
  }

  if (!player.hasRCT && !(player.rct && player.rct.unlocked)) {
    await sendQuotedWithFooter(sock, remoteJid, "You haven't unlocked Reverse Cursed Technique. Use /rt to learn how.", message)
    return
  }

  const battle = BattleManager.getActiveBattle(player.playerId)
  if (!battle) {
    await sendQuotedWithFooter(sock, remoteJid, "RCT Slow can only be used during battle.", message)
    return
  }

  const cooldownMs = BALANCE.rctSlowCooldownMs
  const rctCooldowns = player.rctCooldowns || {}
  const now = Date.now()
  const lastSlow = rctCooldowns.slow || 0

  if (now - lastSlow < cooldownMs) {
    const remaining = Math.ceil((cooldownMs - (now - lastSlow)) / 1000)
    await sendQuotedWithFooter(sock, remoteJid, `RCT Slow is on cooldown. ${remaining}s remaining.`, message)
    return
  }

  const rctCost = BALANCE.rctSlowCeCost
  if ((player.cursedEnergy || 0) < rctCost) {
    await sendQuotedWithFooter(sock, remoteJid, `Not enough CE. RCT Slow requires ${rctCost} CE.`, message)
    return
  }

  player.cursedEnergy -= rctCost
  player.rctCooldowns = player.rctCooldowns || {}
  player.rctCooldowns.slow = now

  const oldHp = player.health
  const healAmount = BALANCE.rctSlowHeal
  player.health = Math.min(player.maxHealth, player.health + healAmount)
  const actualHeal = player.health - oldHp

  if (battle.type === "PVP") {
    const bb = battle.battle || battle
    const ids = bb.playerIds || []
    const playerIndex = ids.indexOf(String(player.playerId))
    if (playerIndex === 0 && ids.length >= 2) {
      bb.challengerHp = player.health
    } else {
      bb.targetHp = player.health
    }
  }

  await savePlayer(player)

  const msg = [
    "🩹 REVERSE CURSED TECHNIQUE",
    "",
    "Positive energy flows through your body.",
    "Wounds knit themselves back together.",
    "",
    `HP: ${(oldHp || 0)} → ${player.health || 0} (+${actualHeal || 0})`,
    `CE: -${rctCost || 0}`,
    "",
    "Cooldown: 3 minutes",
    "",
    "Available Commands",
    "  /battack1",
    "  /battack2",
    "  /battack3",
    "  /battack4",
    "  /btq1",
    "  /btq2",
    "  /btq3",
    "  /bblock",
    "  /bflee"
  ].join("\n")

  await sendQuotedWithFooter(sock, remoteJid, msg, message)
}
