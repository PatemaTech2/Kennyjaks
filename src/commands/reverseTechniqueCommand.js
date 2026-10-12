import { sendQuotedWithFooter } from "../utils/messageHelper.js"
import { loadPlayerByPhone, savePlayer } from "../database/playerRepo.js"
import { BattleManager } from "../services/battle/BattleManager.js"
import { globalStatusEngine } from "../services/battle/StatusEngine.js"
import { RCTAwakeningService } from "../services/rct/RCTAwakeningService.js"

export async function handleReverseTechnique(sock, message) {
  const remoteJid = message.key.remoteJid
  const sender = message.key.participant || remoteJid
  const phoneNumber = sender.split("@")[0]

  const player = await loadPlayerByPhone(phoneNumber)
  if (!player) {
    await sendQuotedWithFooter(sock, remoteJid, "You need to register first.\n\nUse /start to begin.", message)
    return
  }

  if (!player.hasRCT) {
    await sendQuotedWithFooter(sock, remoteJid, "❌ You have not awakened Reverse Cursed Technique.\n\nUse /rt to learn how.", message)
    return
  }

  const battle = BattleManager.getActiveBattle(player.playerId)
  if (!battle) {
    await sendQuotedWithFooter(sock, remoteJid, "Reverse Technique can only be used during battle.", message)
    return
  }

  const rt = RCTAwakeningService.getReversedTechnique(player)
  if (!rt) {
    await sendQuotedWithFooter(sock, remoteJid, "You have not yet been assigned a Reverse Technique. This is a system error.", message)
    return
  }

  const rctCooldowns = player.rctCooldowns || {}
  const now = Date.now()
  const cooldownMs = (rt.cooldown || 60) * 1000
  const lastUsed = rctCooldowns.reverseTechnique || 0

  if (now - lastUsed < cooldownMs) {
    const remaining = Math.ceil((cooldownMs - (now - lastUsed)) / 1000)
    await sendQuotedWithFooter(sock, remoteJid, `Reverse Technique is on cooldown. ${remaining}s remaining.`, message)
    return
  }

  const ceCost = rt.ceCost || 100
  if ((player.cursedEnergy || 0) < ceCost) {
    await sendQuotedWithFooter(sock, remoteJid, `Not enough CE. Reverse Technique requires ${ceCost} CE.`, message)
    return
  }

  player.cursedEnergy -= ceCost
  player.rctCooldowns = player.rctCooldowns || {}
  player.rctCooldowns.reverseTechnique = now

  const opponent = BattleManager.getOpponent(battle, player)
  const isPvP = battle.type === "PVP"

  if (isPvP) {
    opponent.health -= rt.damage
    if (opponent.health < 0) opponent.health = 0
    if (battle.battle) {
      const ids = battle.battle.playerIds || []
      const playerIndex = ids.indexOf(String(player.playerId))
      if (playerIndex === 0 && ids.length >= 2) {
        battle.battle.targetHp = opponent.health
      } else {
        battle.battle.challengerHp = opponent.health
      }
    }
  } else {
    opponent.hp -= rt.damage
    if (opponent.hp < 0) opponent.hp = 0
  }

  const lines = []

  lines.push("━━━━━━━━━━━━━━━━━━━━━━")
  lines.push(`⚡ ${rt.name}`)
  lines.push("━━━━━━━━━━━━━━━━━━━━━━")
  lines.push("")
  lines.push(rt.battleDialogue || "Your reversed cursed energy flows through your technique.")
  lines.push("")
  lines.push(`💥 ${rt.damage || 0} damage dealt to ${opponent.name || "Unknown"}!`)

  if (rt.effects && rt.effects.length > 0) {
    lines.push("")
    lines.push("Effects:")
    rt.effects.forEach(eff => {
      lines.push(`  • ${eff}`)
    })
  }

  if (rt.statusEffect && rt.statusEffect.type) {
    globalStatusEngine.addStatus(opponent.playerId || opponent.id || "unknown", {
      type: rt.statusEffect.type,
      label: rt.statusEffect.type,
      emoji: "⚠️",
      durationTurns: rt.statusEffect.durationTurns || 3,
      clearedOnBattleEnd: true,
      effect: applyStatusEffect(rt.statusEffect.type, player)
    })
  }

  lines.push("")
  lines.push(`CE: -${ceCost}`)
  lines.push(`Cooldown: ${(rt.cooldown || 60)}s`)
  lines.push("")
  lines.push("Available Commands")
  const cmds = isPvP
    ? ["/battack1", "/battack2", "/battack3", "/battack4", "/btq1", "/btq2", "/btq3", "/rct-burst", "/rct-slow", "/bblock", "/bflee"]
    : ["/battack1", "/battack2", "/battack3", "/battack4", "/btq1", "/btq2", "/btq3", "/rct-burst", "/rct-slow", "/bblock", "/bflee"]
  cmds.forEach(c => lines.push(`  ${c}`))
  lines.push("")
  lines.push("━━━━━━━━━━━━━━━━━━━━━━")

  await savePlayer(player)
  await sendQuotedWithFooter(sock, remoteJid, lines.join("\n"), message)
}

function applyStatusEffect(type, player) {
  switch (type) {
    case "slow":
      return (target) => {
        const lost = Math.floor((target.maxHealth || 100) * 0.05)
        target.health = Math.max(0, (target.health || 0) - lost)
        return lost
      }
    case "burn":
      return (target) => {
        const loss = Math.floor((target.maxHealth || 100) * 0.08)
        target.health = Math.max(0, (target.health || 0) - loss)
        return loss
      }
    case "bleed":
      return (target) => {
        const loss = Math.floor((target.maxHealth || 100) * 0.06)
        target.health = Math.max(0, (target.health || 0) - loss)
        return loss
      }
    case "stun":
      return (target) => {
        target.health = Math.max(0, (target.health || 0) - 0)
        return 0
      }
    case "confusion":
      return (target) => {
        return 0
      }
    case "weaken":
      return (target) => {
        const loss = Math.floor((target.maxHealth || 100) * 0.03)
        target.health = Math.max(0, (target.health || 0) - loss)
        return loss
      }
    case "no_heal":
      return (target) => {
        return 0
      }
    case "technique_lock":
      return (target) => {
        return 0
      }
    case "damage_reduction":
      return (target) => {
        return 0
      }
    case "defense_boost":
      return (target) => {
        return 0
      }
    case "blindness":
      return (target) => {
        return 0
      }
    case "repel_stun":
      return (target) => {
        const loss = Math.floor((target.maxHealth || 100) * 0.05)
        target.health = Math.max(0, (target.health || 0) - loss)
        return loss
      }
    default:
      return (target) => { return 0 }
  }
}
