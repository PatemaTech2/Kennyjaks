import { randomFrom, randomAttack, randomTechnique, randomBlackFlash, randomVictory, randomDefeat, substituteTemplate } from "./BattleNarrationPool.js"

const GRADE_LABELS = { 0: "SPECIAL GRADE", 1: "GRADE 1", 2: "GRADE 2", 3: "GRADE 3", 4: "GRADE 4" }

function getGradeLabel(grade) {
  if (grade === undefined || grade === null) return "Unknown"
  return GRADE_LABELS[grade] || `GRADE ${grade}`
}

function getFinalAttackLabel(type) {
  if (!type) return "Normal"
  const labels = {
    "Black Flash": "⚫⚡ Black Flash",
    "Critical": "🎯 Critical Hit",
    "Domain Strike": "🌀 Domain Strike",
    "Normal": "👊 Normal Attack"
  }
  return labels[type] || type
}

export function compactBar(current, max, fillChar, emptyChar, segments = 10) {
  const cur = current || 0
  const mx = max || 0
  const pct = mx > 0 ? Math.max(0, Math.min(1, cur / mx)) : 0
  const filled = Math.round(pct * segments)
  const empty = segments - filled
  return `${fillChar.repeat(filled)}${emptyChar.repeat(empty)}`
}

export function compactStatusEffects(statusEffects) {
  if (!statusEffects || statusEffects.length === 0) return ""
  const effectMap = {
    paralyzed: "⚡ Paralysis",
    missChance: "⚡ Miss",
    stunned: "💤 Stun",
    poisoned: "🟣 Poison",
    burning: "🔥 Burn",
    bleeding: "🩸 Bleed",
    slowed: "🐢 Slow",
    haste: "⚡ Haste",
    shield: "🛡 Shield",
    rct_heal: "🌟 RCT"
  }
  return statusEffects.map(s => effectMap[s.type || s] || s.emoji || "⚠️").join(" ")
}

export function buildCompactCommands(player) {
  const hasWeapon = player && player.equippedItems && player.equippedItems.weapon
  const hasTechnique = player && player.technique && player.technique.unlockedSkills && player.technique.unlockedSkills.length > 0
  const hasRct = player && (player.hasRCT || (player.rct && player.rct.unlocked))
  const hasShikigami = player && player.activeShikigami
  const cmds = ["/battack", "/bblock", "/bflee"]
  if (hasShikigami) cmds.splice(1, 0, "/summon")
  if (hasTechnique) cmds.splice(1, 0, "/btq")
  if (hasRct) cmds.splice(1, 0, "/rtu")
  if (hasWeapon) cmds.splice(1, 0, "/w")
  return cmds
}

export function buildCompactPvPCommands(player) {
  const hasWeapon = player && player.equippedItems && player.equippedItems.weapon
  const hasTechnique = player && player.technique && player.technique.unlockedSkills && player.technique.unlockedSkills.length > 0
  const hasRct = player && (player.hasRCT || (player.rct && player.rct.unlocked))
  const hasShikigami = player && player.activeShikigami
  const cmds = ["/battack1", "/battack2", "/battack3", "/battack4", "/bblock", "/bflee"]
  if (hasShikigami) {
    cmds.splice(4, 0, "/summon")
  }
  if (hasTechnique) {
    cmds.splice(4, 0, "/btq1", "/btq2", "/btq3")
  }
  if (hasRct) {
    cmds.splice(4, 0, "/rtu")
  }
  if (hasWeapon) {
    cmds.splice(4, 0, "/w", "/w1", "/w2", "/w3")
  }
  return cmds
}

export function formatCompactPlayer(player) {
  const name = (player && player.name) || "Sorcerer"
  const hp = (player && player.health) || 0
  const maxHp = (player && player.maxHealth) || 0
  const ce = (player && player.cursedEnergy) || 0
  const maxCe = (player && player.maxCursedEnergy) || 0
  const effects = compactStatusEffects(player.statusEffects || [])
  return `👤 ${name}\n❤️ ${hp} / ${maxHp}\n⚡ ${ce} / ${maxCe}${effects ? `\n${effects}` : ""}`
}

export function formatCompactCurse(curse) {
  const name = (curse && curse.name) || "Unknown Curse"
  const hp = (curse && curse.hp) || 0
  const maxHp = (curse && curse.maxHp) || 0
  const effects = compactStatusEffects(curse.statusEffects || [])
  return `👹 ${name}\n❤️ ${hp} / ${maxHp}${effects ? `\n${effects}` : ""}`
}

export function formatCompactPvPPlayer(player) {
  const name = (player && player.name) || "Sorcerer"
  const hp = (player && player.health) || 0
  const maxHp = (player && player.maxHealth) || 0
  const ce = (player && player.cursedEnergy) || 0
  const maxCe = (player && player.maxCursedEnergy) || 0
  const effects = compactStatusEffects(player.statusEffects || [])
  return `@${name}\n❤️ ${hp} / ${maxHp}\n⚡ ${ce} / ${maxCe}${effects ? `\n${effects}` : ""}`
}

export function formatCompactPvPDefender(player) {
  const name = (player && player.name) || "Opponent"
  const hp = (player && player.health) || 0
  const maxHp = (player && player.maxHealth) || 0
  const effects = compactStatusEffects(player.statusEffects || [])
  return `@${name}\n❤️ ${hp} / ${maxHp}${effects ? `\n${effects}` : ""}`
}

function potentialReaction(potential, opponentGrade, opponentName) {
  const p = potential || "F"
  const isHighGrade = opponentGrade <= 1

  if (p === "A") {
    if (opponentGrade === 0) {
      const reactions = [
        `"All those weak Grade 4 sorcerers... they're nothing compared to you."`,
        `"I usually don't get excited often. But today... I think I'll enjoy this."`,
        `"Let's see which one of us remains standing."`,
        `"I've been waiting for someone worthy."`
      ]
      return substituteTemplate(randomFrom(reactions), { name: opponentName })
    }
    if (isHighGrade) {
      const reactions = [
        `"I have heard so much about you..."`,
        `"If I defeat you, everyone will finally recognize my strength."`,
        `"So... YOU are the famous sorcerer."`,
        `"I've defeated countless sorcerers... but your cursed energy... it's different."`,
        `"This should be fun."`
      ]
      return substituteTemplate(randomFrom(reactions), { name: opponentName })
    }
  }

  if (["B", "C", "D", "E", "F"].includes(p) && isHighGrade) {
    const reactions = [
      `"You call yourself a sorcerer?"`,
      `"What a disappointment."`,
      `"I've killed stronger children."`,
      `"You should've stayed home."`,
      `"I expected more."`
    ]
    return substituteTemplate(randomFrom(reactions), { name: opponentName })
  }

  return null
}

const DEATH_QUOTES = {
  "Amateratsukuyomi": [
    `"Impossible...\nThis maggot...\ndefeated me..."`,
    `"No...\nThis...\ncan't...\nbe..."`,
    `"Damn... How did I lose..."`
  ],
  "Jogo": [
    `"I am Jogo, the strongest... curse..."`,
    `"You... got lucky..."`,
    `"The age of humans... is ending..."`
  ],
  "Hanami": [
    `"Plants… bloom again… after being crushed…"`,
    `"I should have… killed you faster…"`,
    `"The forest… will not forgive… this loss…"`
  ],
  "Dagon": [
    `"My domain… was impenetrable…"`,
    `"I am the ocean… I should have drowned you…"`,
    `"The tide… turns against me…"`
  ],
  "Kenjaku": [
    `"My thousand-year plan… you've disrupted it..."`,
    `"How… could the Prison Realm… fail me..."`,
    `"You think this… ends here..."`
  ]
}

function getDeathQuote(curseName) {
  const quotes = DEATH_QUOTES[curseName]
  if (quotes) return randomFrom(quotes)
  const generic = [
    `"Impossible..."`,
    `"This... can't... be..."`,
    `"Damn... How did I lose..."`,
    `"I won't... be defeated by you..."`,
    `"My cursed energy... fading..."`
  ]
  return randomFrom(generic)
}

export function naratePlayerAttack(player, curse, damage, isBlackFlash, isCritical, skillName = null, consecutiveCount = 0, perfectBlackFlash = false) {
  const lines = []

  lines.push("")
  lines.push("━━━━━━━━━━━━━━━━━━━━━━")

  if (perfectBlackFlash) {
    lines.push("ROUND " + (player._round || "?"))
  } else {
    lines.push("ROUND")
  }

  lines.push("")
  lines.push(formatCompactPlayer(player))
  lines.push("")
  lines.push(formatCompactCurse(curse))
  lines.push("")
  lines.push("━━━━━━━━━━━━━━━━━━━━━━")
  lines.push("")

  if (perfectBlackFlash) {
    lines.push("⚫ PERFECT BLACK FLASH")
    lines.push("Your cursed energy reached absolute zero.")
    lines.push("Your instincts surpassed thought.")
    lines.push("The impossible became inevitable.")
    lines.push("100% Black Flash.")
    lines.push("")
    lines.push(`💥 ${damage || 0} damage dealt!`)
    lines.push(`\n${curse.name || "Unknown"} has been stunned!`)
  } else if (isBlackFlash) {
    lines.push("⚫ BLACK FLASH")
    lines.push("Space itself shattered.")
    lines.push("The impact distorted reality.")
    lines.push("")
    lines.push(`💥 ${damage || 0} damage dealt!`)
    lines.push(`\n${curse.name || "Unknown"} staggers backwards.`)
    if (consecutiveCount > 3) {
      lines.push(`🔥 Combo: ${consecutiveCount} consecutive Black Flashes!`)
    }
  } else if (skillName) {
    lines.push(`⚡ ${skillName}`)
    lines.push(substituteTemplate(randomTechnique(player), { name: player.name || "You" }))
    lines.push(`💥 ${damage || 0} damage dealt!`)
  } else if (isCritical) {
    lines.push(substituteTemplate(randomAttack(player), { name: player.name || "You" }))
    lines.push(`💥 ${damage || 0} damage dealt! (Critical)`)
  } else {
    lines.push(substituteTemplate(randomAttack(player), { name: player.name || "You" }))
    lines.push(`💥 ${damage || 0} damage dealt!`)
  }

  lines.push("")
  lines.push("━━━━━━━━━━━━━━━━━━━━━━")
  lines.push("")
  lines.push("Your Turn")
  lines.push("")
  const cmds = buildCompactCommands(player)
  cmds.forEach(c => lines.push(`  ${c}`))
  lines.push("")
  lines.push("━━━━━━━━━━━━━━━━━━━━━━")

  return lines.join("\n")
}

export function narateCurseAttack(curse, player, damage, dialogue) {
  const lines = []

  lines.push("")
  lines.push("━━━━━━━━━━━━━━━━━━━━━━")
  lines.push("ROUND")
  lines.push("")
  lines.push(formatCompactPlayer(player))
  lines.push("")
  lines.push(formatCompactCurse(curse))
  lines.push("")
  lines.push("━━━━━━━━━━━━━━━━━━━━━━")
  lines.push("")

  lines.push(`👹 ${curse.name || "Unknown Curse"}`)
  if (dialogue) {
    lines.push(`"${dialogue}"`)
  }
  lines.push(substituteTemplate(randomAttack({ name: curse.name || "Unknown Curse" }), { name: curse.name || "Unknown Curse" }))
  lines.push(`💥 ${damage || 0} damage dealt!`)
  lines.push(`- ❤️ ${player.name || "You"}: ${player.health || 0}/${player.maxHealth || 0} HP`)

  lines.push("")
  lines.push("━━━━━━━━━━━━━━━━━━━━━━")
  lines.push("")
  lines.push("Your Turn")
  lines.push("")
  const cmds = buildCompactCommands(player)
  cmds.forEach(c => lines.push(`  ${c}`))
  lines.push("")
  lines.push("━━━━━━━━━━━━━━━━━━━━━━")

  return lines.join("\n")
}

export function narateBattleSummary(player, curse, victory, turns, damageDealt, damageTaken, criticalHits, techniquesUsed, rewards) {
  const lines = []

  lines.push("")
  lines.push("━━━━━━━━━━━━━━━━━━━━━━")

  if (victory) {
    lines.push("🏆 VICTORY")
    lines.push("")
    lines.push(`👹 ${curse.name || "Unknown"} Exorcised`)
    if (rewards && rewards.yen > 0) {
      lines.push(`💴 +¥${(rewards.yen || 0).toLocaleString()}`)
    }
    if (rewards && rewards.xp > 0) {
      lines.push(`✨ +${rewards.xp || 0} XP`)
    }
    if (rewards && rewards.sp > 0) {
      lines.push(`⭐ +${rewards.sp || 0} SP`)
    }
  } else {
    lines.push("☠ DEFEAT")
    lines.push("")
    lines.push(`👹 ${curse.name || "Unknown"}`)
    if (curse && curse.dialogue && curse.dialogue.defeat) {
      lines.push(`"${curse.dialogue.defeat}"`)
    }
    lines.push("")
    lines.push("No rewards awarded.")
  }

  lines.push("")
  lines.push("━━━━━━━━━━━━━━━━━━━━━━")

  return lines.join("\n")
}

export function narateVictoryScreen(player, opponent, state, rewards, oldWallet, oldXp, levelUp, newGrade, oldLevel, petXp = 0, petName = null) {
  const lines = []

  lines.push("")
  lines.push("━━━━━━━━━━━━━━━━━━━━━━")
  lines.push("🏆 VICTORY")
  lines.push("")
  lines.push(`👹 ${(opponent && opponent.name) || "Unknown Curse"} Exorcised`)
  lines.push("")

  const yenGain = (rewards && rewards.yen) || 0
  const xpGain = (rewards && rewards.xp) || 0
  const repGain = (rewards && rewards.reputation) || 0

  if (yenGain > 0) {
    lines.push(`💴 +¥${yenGain.toLocaleString()}`)
  }
  if (xpGain > 0) {
    lines.push(`✨ +${xpGain.toLocaleString()} XP`)
  }
  if (repGain > 0) {
    lines.push(`🏆 +${repGain} REP`)
  }
  if (petXp > 0 && petName) {
    lines.push(`🐾 +${petXp} XP for ${petName || "Pet"}`)
  }

  if (levelUp || (newGrade !== null && newGrade !== undefined)) {
    lines.push("")
    lines.push("📈 PROGRESSION")
    if (levelUp) {
      lines.push(`LEVEL UP! ${(player.level || 1)}`)
    }
    if (newGrade !== null && newGrade !== undefined) {
      lines.push(`🏆 GRADE PROMOTION! ${getGradeLabel(player.grade)}`)
    }
  }

  if (opponent && opponent.drops && opponent.drops.length > 0) {
    lines.push("")
    lines.push("🎁 LOOT")
    opponent.drops.forEach(d => {
      lines.push(`${d.icon || "✨"} ${(d.name || "Unknown Item")} x${d.quantity || 1}`)
    })
  }

  lines.push("")
  lines.push("━━━━━━━━━━━━━━━━━━━━━━")

  return lines.join("\n")
}

export function narateDefeatScreen(player, opponent, state) {
  const lines = []

  lines.push("")
  lines.push("━━━━━━━━━━━━━━━━━━━━━━")
  lines.push("☠ DEFEAT")
  lines.push("")
  lines.push(`👹 ${(opponent && opponent.name) || "Unknown Curse"}`)
  if (opponent && opponent.dialogue && opponent.dialogue.defeat) {
    lines.push(`"${opponent.dialogue.defeat}"`)
  } else if (opponent && opponent.dialogue && opponent.dialogue.intro) {
    lines.push(`"${opponent.dialogue.intro}"`)
  }
  lines.push("")
  lines.push("No rewards awarded.")
  lines.push("")
  lines.push("━━━━━━━━━━━━━━━━━━━━━━")

  return lines.join("\n")
}

export function narateCurseFlee(curse, player, dialogue) {
  const lines = []

  lines.push("")
  lines.push("━━━━━━━━━━━━━━━━━━━━━━")
  lines.push("")
  lines.push(`👹 ${curse.name || "Unknown Curse"}`)
  if (dialogue) {
    lines.push(`"${dialogue}"`)
  }
  lines.push("")
  lines.push(`${curse.name || "Unknown Curse"} turned tail and fled!`)
  lines.push("")
  lines.push("Battle ended. No rewards.")
  lines.push("")
  lines.push("━━━━━━━━━━━━━━━━━━━━━━")

  return lines.join("\n")
}

export function narateCurseReturn(curse, player) {
  const lines = []

  lines.push("")
  lines.push("⚠️ A familiar cursed presence appears...")
  lines.push("")
  lines.push(`👹 ${curse.name || "Unknown Curse"}`)
  lines.push("has returned.")
  if (curse.gradeIncreased) {
    lines.push("Grade increased!")
    lines.push(curse.gradeLabel || "Grade 4")
  }
  lines.push("")
  lines.push(`It remembers @${player.name || "Unknown"}.`)
  lines.push(`"I finally found you."`)
  lines.push("")
  lines.push("━━━━━━━━━━━━━━━━━━━━━━")

  return lines.join("\n")
}

export function naratePvPAttack(attacker, defender, damage, isCritical, skillName = null, perfectBlackFlash = false) {
  const lines = []

  lines.push("")
  lines.push("━━━━━━━━━━━━━━━━━━━━━━")
  lines.push("ROUND")
  lines.push("")
  lines.push(formatCompactPvPPlayer(attacker))
  lines.push("")
  lines.push(formatCompactPvPDefender(defender))
  lines.push("")
  lines.push("━━━━━━━━━━━━━━━━━━━━━━")
  lines.push("")

  if (perfectBlackFlash) {
    lines.push("⚫ PERFECT BLACK FLASH")
    lines.push("Your cursed energy reached absolute zero.")
    lines.push("Your instincts surpassed thought.")
    lines.push(`💥 ${damage || 0} damage dealt!`)
    lines.push(`\n${defender.name || "Unknown"} has been stunned!`)
  } else {
    lines.push(`⚔️ @${attacker.name || "Unknown"} attacks!`)
    if (skillName) {
      lines.push(`🔥 ${skillName || "Unknown"} activated!`)
    }
    lines.push(`💥 ${damage || 0} damage dealt!`)
  }

  lines.push("")
  lines.push("━━━━━━━━━━━━━━━━━━━━━━")
  lines.push("")
  lines.push("Your Turn")
  lines.push("")
  const cmds = buildCompactPvPCommands(attacker)
  cmds.forEach(c => lines.push(`  ${c}`))
  lines.push("")
  lines.push("━━━━━━━━━━━━━━━━━━━━━━")

  return lines.join("\n")
}

export function naratePvPBlock(attacker, defender) {
  const lines = []

  lines.push("")
  lines.push("━━━━━━━━━━━━━━━━━━━━━━")
  lines.push("ROUND")
  lines.push("")
  lines.push(formatCompactPvPPlayer(attacker))
  lines.push("")
  lines.push(formatCompactPvPDefender(defender))
  lines.push("")
  lines.push("━━━━━━━━━━━━━━━━━━━━━━")
  lines.push("")
  lines.push(`🛡️ @${attacker.name || "Unknown"} takes a defensive stance!`)
  lines.push("")
  lines.push("━━━━━━━━━━━━━━━━━━━━━━")

  return lines.join("\n")
}

export function naratePvPFlee(attacker, success) {
  const lines = []
  lines.push("")
  lines.push("━━━━━━━━━━━━━━━━━━━━━━")
  if (success) {
    lines.push(`🏃 @${attacker.name || "Unknown"} escaped!`)
    lines.push("")
    lines.push("Battle ended. No rewards.")
  } else {
    lines.push(`@${attacker.name || "Unknown"} tried to flee but failed!`)
  }
  lines.push("")
  lines.push("━━━━━━━━━━━━━━━━━━━━━━")
  return lines.join("\n")
}

export function naratePvPStatusEffects(playerId) {
  return ""
}

export function naratePvPStatusDamage(playerId, statusEffects) {
  if (!statusEffects || statusEffects.length === 0) return ""
  return `⚠️ ${statusEffects.map(s => s.emoji || "⚠️").join(" ")} ${statusEffects.map(s => s.label || s.type).join(" ")}`
}

export function naratePvPDuelIntro(challengerName, targetName) {
  const lines = [
    "",
    "╭" + "━".repeat(32) + "╮",
    "       ⚔  DUEL  ⚔",
    "╰" + "━".repeat(32) + "╯",
    "",
    "  " + padCenter(challengerName, 26),
    "  " + padCenter("VS", 26),
    "  " + padCenter(targetName, 26),
    "",
    "════════════════════════════════════",
  ]
  return lines.join("\n")
}

export function naratePvPVictory(winnerName, rewards = null) {
  const lines = []

  lines.push("")
  lines.push("━━━━━━━━━━━━━━━━━━━━━━")
  lines.push("🏆 VICTORY")
  lines.push("")
  lines.push(`@${winnerName || "Unknown"} wins!`)
  lines.push("")
  if (rewards) {
    if (rewards.yen > 0) lines.push(`💴 +¥${(rewards.yen || 0).toLocaleString()}`)
    if (rewards.xp > 0) lines.push(`✨ +${rewards.xp || 0} XP`)
  }
  lines.push("")
  lines.push("━━━━━━━━━━━━━━━━━━━━━━")

  return lines.join("\n")
}

export function naratePvPDefeat(loserName, opponentName = null) {
  const lines = []

  lines.push("")
  lines.push("━━━━━━━━━━━━━━━━━━━━━━")
  lines.push("☠ DEFEAT")
  lines.push("")
  lines.push(`@${loserName || "Unknown"} falls!`)
  if (opponentName) {
    lines.push(`@${opponentName || "Unknown"} stands victorious.`)
  }
  lines.push("")
  lines.push("No rewards awarded.")
  lines.push("")
  lines.push("━━━━━━━━━━━━━━━━━━━━━━")

  return lines.join("\n")
}

export function naratePhaseTransition(phase, playerHp, playerMaxHp) {
  if (phase === "cornered") {
    return `\n\n╔══════════════════════════════╗\n       CORNERED\n╚══════════════════════════════╝\n\nYour body is barely standing.\nThe curse is approaching.\n\nHP: ${playerHp} / ${playerMaxHp}\n\nThe next mistake could end this.`
  }
  if (phase === "clutch") {
    return `\n\n⚠️ CLUTCH OPPORTUNITY\nThe curse lowers its guard.\nYou have one opening.`
  }
  if (phase === "pressure") {
    return `\n\n⚠️ YOU ARE UNDER PRESSURE\nThe curse is controlling the battlefield.\nHP: ${playerHp} / ${playerMaxHp}`
  }
  if (phase === "comeback") {
    return `\n\n🔥 COMEBACK POTENTIAL\nYou are not giving up.\nSomething is shifting.`
  }
  if (phase === "legendary") {
    return `\n\n⚔️ LEGENDARY BATTLE\nThis will be remembered.`
  }
  return ""
}

export function naratePerfectBlock() {
  return `\n\n╔══════════════════════════════╗\n     PERFECT BLOCK\n╚══════════════════════════════╝\n\nYou read the attack perfectly.\nDamage: 0\n\nThe curse is exposed.\n\nCOUNTER WINDOW`
}

export function narateDodge() {
  return `\n\n💨 DODGE!\nYou disappear from its reach.`
}

export function narateCounter(counterType, damage) {
  const typeText = counterType === "black_flash" ? "⚫⚡ BLACK FLASH COUNTER ⚡⚫" : counterType === "technique" ? "🌀 TECHNIQUE COUNTER" : "⚔️ COUNTER ATTACK"
  return `\n\n${typeText}\n💥 ${damage} damage!`
}

export function narateBattleAdaptation(curseName, pattern) {
  if (!pattern || pattern.length < 3) return ""
  return `\n\n⚠️ ${curseName} has begun reading your rhythm.`
}

export function narateLegendaryRecord(record) {
  if (!record) return ""
  return `\n\n━━━━ LEGENDARY RECORD ━━━━\n@${record.playerName} became the first Grade ${record.playerGrade} to defeat a ${record.enemyName}.\n\nRounds: ${record.rounds}\nFinal HP: ${record.finalHp}\nBlack Flashes: ${record.blackFlashes}\nPerfect Blocks: ${record.perfectBlocks}\n\nThis battle has been recorded permanently.`
}

function padCenter(text, width) {
  const str = String(text)
  const padding = Math.max(0, Math.floor((width - str.length) / 2))
  const right = Math.max(0, width - str.length - padding)
  return " ".repeat(padding) + str + " ".repeat(right)
}

export { potentialReaction }
