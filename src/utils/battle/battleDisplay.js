import { SKILL_MAP } from "../../services/battle/SimpleBattleService.js"

export function createHPBar(current, max, length = 20) {
  const percent = current / max
  const filled = Math.round(percent * length)
  const empty = length - filled

  if (percent > 0.5) return "█".repeat(filled) + "░".repeat(empty)
  if (percent > 0.25) return "▓".repeat(filled) + "░".repeat(empty)
  return "▀".repeat(filled) + "░".repeat(empty)
}

export function formatBattleStart(player, opponent) {
  const playerHpBar = createHPBar(player.hp || 0, player.maxHp || 1)
  const opponentHpBar = createHPBar(opponent.hp || 0, opponent.maxHp || 1)

  return `⚔️ BATTLE START

 『${player.name || "Player"}』 Lv.${player.level || 1}
 ❤️ HP: ${player.hp || 0}/${player.maxHp || 1}
 ${playerHpBar}
 ⚡ ENERGY: ${player.cursedEnergy || 0}/${player.maxCursedEnergy || 1}
 ⚔️ ATK: ${player.strength || 10}
 🛡️ DEF: ${player.defense || 10}

 VS

 『${opponent.name || "Enemy"}』 Lv.${opponent.level || 1}
 ❤️ HP: ${opponent.hp || 0}/${opponent.maxHp || 1}
 ${opponentHpBar}
 ⚡ ENERGY: ${opponent.ce || 0}/${opponent.maxCe || 1}
 ⚔️ ATK: ${opponent.strength || 10}
 🛡️ DEF: ${opponent.defense || 10}

 ━━━━━━━━━━━━━━━━━━
 🎮 Your turn
 ━━━━━━━━━━━━━━━━━━`
}

export function formatRoundDisplay(round, player, opponent, battleLog, currentTurn) {
  const playerHpBar = createHPBar(player.hp || 0, player.maxHp || 1)
  const opponentHpBar = createHPBar(opponent.hp || 0, opponent.maxHp || 1)

  let display = `╔════════════════════════════╗
 ⚔️ BATTLE ⚔️
 ╚════════════════════════════╝

 🔵 『${player.name || "Player"}』 Lv.${player.level || 1}
 ❤️ HP ${player.hp || 0}/${player.maxHp || 1}
 ${playerHpBar}
 ⚡ ENERGY ${player.cursedEnergy || 0}/${player.maxCursedEnergy || 1}
 ⚔️ ATK ${player.strength || 10}
 🛡️ DEF ${player.defense || 10}

 VS

 🔴 『${opponent.name || "Enemy"}』 Lv.${opponent.level || 1}
 ❤️ HP ${opponent.hp || 0}/${opponent.maxHp || 1}
 ${opponentHpBar}
 ⚡ ENERGY ${opponent.ce || 0}/${opponent.maxCe || 1}
 ⚔️ ATK ${opponent.strength || 10}
 🛡️ DEF ${opponent.defense || 10}

 ━━━━━━━━━━━━━━━━━━━━━━━
 ⚔️ ROUND ${String(round).padStart(2, "0")}
 ━━━━━━━━━━━━━━━━━━━━━━━}

 📜 BATTLE LOG

 `

  const recentLogs = (battleLog || []).slice(-3)
  recentLogs.forEach(log => {
    display += `${log}\n\n`
  })

  display += `━━━━━━━━━━━━━━━━━━━━━━
 🔵 ${player.name || "Player"}'s TURN
 ━━━━━━━━━━━━━━━━━━━━━━

 `

  const moveNames = [
    ["⚔️", SKILL_MAP.attack?.name || "Attack"],
    ["🔥", SKILL_MAP.skill?.name || "Skill"],
    ["🛡️", SKILL_MAP.defend?.name || "Defend"],
    ["❤️", SKILL_MAP.heal?.name || "Heal"],
    ["💀", SKILL_MAP.ultimate?.name || "Ultimate"],
    ["🏃", SKILL_MAP.flee?.name || "Flee"],
    ["💪", SKILL_MAP.heavy_attack?.name || "Heavy Attack"],
    ["🎯", SKILL_MAP.taunt?.name || "Taunt"],
    ["🔄", SKILL_MAP.counter?.name || "Counter"],
    ["👻", SKILL_MAP.dodge?.name || "Dodge"],
    ["👻", SKILL_MAP.reverse?.name || "Reverse"],
    ["⚡", SKILL_MAP.rct?.name || "Reverse Cursed Technique"],
    ["🌀", SKILL_MAP.domain?.name || "Domain Expansion"],
    ["🗡️", SKILL_MAP.execute?.name || "Execute"],
    ["🫧", SKILL_MAP.absorb?.name || "Absorb CE"]
  ]

  moveNames.forEach(([emoji, name]) => {
    display += `${emoji} ${name}\n`
  })

  return display
}

export function createLogEntry(attacker, defender, skill, damage, isCritical, otherInfo) {
  let entry = `『${attacker.name || "Unknown"}』 used\n`
  entry += `${skill.emoji || "⚔️"} ${skill.name}\n\n`

  if (isCritical) {
    entry += `💥 DAMAGE: ${damage}\n`
    entry += `🎯 CRITICAL HIT!\n`
  } else {
    entry += `💥 DAMAGE: ${damage}\n`
  }

  entry += `\n『${defender.name || "Unknown"}』\n`
  entry += `❤️ ${defender.maxHp || defender.hp || 0} → ${Math.max(0, (defender.hp || 0) - damage)}\n\n`

  if (otherInfo) {
    if (otherInfo.energyUsed) {
      entry += `⚡ ${attacker.name || "Unknown"} Energy: ${otherInfo.newEnergy || 0}/${attacker.maxCe || attacker.maxCursedEnergy || 1}\n`
    }
    if (otherInfo.comboCount) {
      entry += `🔥 ${attacker.name || "Unknown"} Combo: x${otherInfo.comboCount}\n`
    }
    if (otherInfo.statusApplied) {
      entry += `🔴 ${defender.name || "Unknown"} afflicted with ${otherInfo.statusApplied}\n`
    }
  }

  return entry
}

export function formatVictoryScreen(winner, loser, battleStats, rewards) {
  const xpProgress = Math.min(100, Math.round(((rewards.currentXp || 0) / (rewards.nextLevelXp || 1)) * 100))
  const progressBar = "█".repeat(Math.round(xpProgress / 5)) + "░".repeat(20 - Math.round(xpProgress / 5))

  return `╔════════════════════════════╗
 🏆 VICTORY 🏆
 ╚════════════════════════════╝

 『${winner.name || "Player"}』 defeated 『${loser.name || "Enemy"}』

 ❤️ Remaining HP: ${winner.hp || 0}/${winner.maxHp || 1}
 🔥 Final Combo: x${battleStats.finalCombo || 0}
 💥 Total Damage: ${battleStats.totalDamage || 0}

 ━━━━━━━━━━━━━━━━━━━━━━━
 🎁 REWARDS

 ⭐ +${rewards.xp || 0} XP
 🪙 +${rewards.coins || 0} Coins
 🏆 +${rewards.rankPoints || 0} Rank Points

 📈 Level Progress
 ${progressBar} ${xpProgress}%
 ━━━━━━━━━━━━━━━━━━━━━━━`
}

export function formatDefeatScreen(winner, loser, battleStats, consolationRewards) {
  return `╔════════════════════════════╗
 ☠️ DEFEAT ☠️
 ╚════════════════════════════╝

 『${winner.name || "Enemy"}』 defeated 『${loser.name || "Player"}』

 ❤️ You fainted!
 🔥 Combo reached: x${battleStats.maxCombo || 0}
 💥 Damage dealt: ${battleStats.totalDamage || 0}

 ━━━━━━━━━━━━━━━━━━━━━━━
 💔 DEFEAT STATS

 Rounds Lasted: ${battleStats.roundsLasted || 0}
 Enemy Remaining: ${winner.hp || 0}/${winner.maxHp || 1}
 Accuracy: ${battleStats.accuracy || 0}%

 ━━━━━━━━━━━━━━━━━━━━━━━
 🎁 CONSOLATION REWARD

 ⭐ +${consolationRewards.xp || 0} XP (Participation)
 🪙 +${consolationRewards.coins || 0} Coins (Consolation)

 Type **/rematch** to try again!
 ━━━━━━━━━━━━━━━━━━━━━━━`
}

export function formatActionMenu() {
  return `⚔️ ${SKILL_MAP.attack?.name || "Attack"}
 🔥 ${SKILL_MAP.skill?.name || "Skill"}
 🛡️ ${SKILL_MAP.defend?.name || "Defend"}/${SKILL_MAP.block?.name || "Block"}
 ❤️ ${SKILL_MAP.heal?.name || "Heal"}
 💀 ${SKILL_MAP.ultimate?.name || "Ultimate"}
 🏃 ${SKILL_MAP.flee?.name || "Flee"}

 ╔══════════════════════════╗
 ║ JUTSU TECHNIQUES         ║
 ╠══════════════════════════╣
 ⚡ ${SKILL_MAP.domain?.name || "Domain Expansion"} (100 CE)
 👻 ${SKILL_MAP.rct?.name || "Reverse Cursed Technique"} (25 CE)
 💪 ${SKILL_MAP.heavy_attack?.name || "Heavy Attack"} (30 CE)
 🎯 ${SKILL_MAP.taunt?.name || "Taunt"} (10 CE)
 🔄 ${SKILL_MAP.counter?.name || "Counter"}
 👻 ${SKILL_MAP.dodge?.name || "Dodge"}
 🗡️ ${SKILL_MAP.execute?.name || "Execute"}
 🫧 ${SKILL_MAP.absorb?.name || "Absorb CE"}

 ━━━━━━━━━━━━━━━━━━

 > Reply with action name`
}