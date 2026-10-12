import { sendQuotedWithFooter } from "../../utils/messageHelper.js"
import { loadPlayerByPhone, savePlayer } from "../../database/playerRepo.js"
import { loadAllGroups } from "../../database/groupRepo.js"
import { globalStatusEngine } from "../battle/StatusEngine.js"
import {
  getAurstavBattle,
  getAurstavBattleState,
  clearAurstavBattle,
  getAurstavSummons,
  setAurstavSummons,
  getAurstavCooldowns,
  setAurstavCooldowns,
  saveTimeScapeSnapshot,
  getTimeScapeSnapshot,
  clearTimeScapeSnapshot,
  addRaidMember,
  getRaidBattleForPlayer,
  removeRaidMember,
  calculateDamageResistance,
  calculateGoldFlameCeBurn,
  calculateSoulBurnEffect,
  calculateDomainClashMomentum,
  calculateRctBrainRecoveryChance,
  calculateRaidScaling,
  checkLegendaryBattle,
  buildLegendaryRecord,
  selectDragonLongBladeWinner,
  AURSTAV_PHASE
} from "./AurstavService.js"
import { isAurstavUnlocked, isAurstavPermanentlyDead, setAurstavDefeated, setAurstavFirstChallenger, setAurstavPhase2, addRaidPlayer, startAurstavRaid, recordLegendaryBattle, getAurstavState, isEventActive } from "./SeasonalEventService.js"
import { DRAGON_CURSE_KING_EVENT } from "../../data/seasonal/dragonCurseKing.js"
import { DomainService } from "../technique/DomainService.js"
import { LegendaryBattlesService } from "../battle/LegendaryBattlesService.js"
import { ProgressionManager } from "../progression/ProgressionManager.js"
import { PetService } from "../pet/PetService.js"
import { DailyService } from "../daily/DailyService.js"
import { RCTAwakeningService } from "../rct/RCTAwakeningService.js"
import { checkThirst, isThirstExemptCommand } from "../../commands/drinkCommand.js"

const AURSTAV = DRAGON_CURSE_KING_EVENT.aurstav

export async function handleAurstavChallenge(sock, message) {
  const remoteJid = message.key.remoteJid
  const sender = message.key.participant || remoteJid
  const phoneNumber = sender.split("@")[0]

  const player = await loadPlayerByPhone(phoneNumber)
  if (!player) {
    await sendQuotedWithFooter(sock, remoteJid, "You need to register first.\n\nUse /start to begin.", message)
    return
  }

  if (!(await isEventActive())) {
    await sendQuotedWithFooter(sock, remoteJid, "THE DRAGON CURSE KING event is not active yet.", message)
    return
  }

  const unlocked = await isAurstavUnlocked()
  if (!unlocked) {
    await sendQuotedWithFooter(sock, remoteJid, [
      "❌ Aurstav cannot be challenged yet.",
      "",
      "The Dragon Knights still stand between",
      "humanity and the Dragon Curse King."
    ].join("\n"), message)
    return
  }

  const dead = await isAurstavPermanentlyDead()
  if (dead) {
    await sendQuotedWithFooter(sock, remoteJid, [
      "💀 AURSTAV",
      "THE ETERNAL DRAGON",
      "",
      "DEFEATED.",
      "",
      "The Dragon Curse King is no more."
    ].join("\n"), message)
    return
  }

  const existingBattle = getAurstavBattle(player.playerId)
  const existingRaid = getRaidBattleForPlayer(player.playerId)
  if (existingBattle || existingRaid) {
    await sendQuotedWithFooter(sock, remoteJid, "You are already engaged in the Dragon Curse King battle.", message)
    return
  }

  if (!isThirstExemptCommand("/challenge Aurstav") && !checkThirst(player)) {
    await sendQuotedWithFooter(sock, remoteJid, "🥤 You're severely dehydrated.\n\nYou need to drink water before doing anything else.\nUse /drink", message)
    return
  }

  const aurstavState = await getAurstavState()
  const isRaid = aurstavState.raidOpen && aurstavState.phase >= 2
  const raidSize = isRaid ? Math.min((aurstavState.raidPlayers || []).length + 1, 8) : 1

  const battle = createAurstavBattle(player.playerId, player.name, isRaid, raidSize)
  if (isRaid) {
    addRaidMember(player.playerId, player.name, battle)
    await addRaidPlayer(player.playerId, player.name)
  }

  if (!aurstavState.firstChallengerId) {
    await setAurstavFirstChallenger(player.playerId, player.name)
  }

  const lines = [
    "╔══════════════════════════════════╗",
    "        THE DRAGON CURSE KING",
    "╚══════════════════════════════════╝",
    "",
    "AURSTAV",
    "",
    "THE ETERNAL DRAGON",
    "",
    "CALAMITY GRADE",
    "",
    "The five Dragon Knights are dead.",
    "",
    "Something far older has awakened.",
    "",
    "The Dragon Curse King has entered",
    "the world.",
    "",
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    "",
    `HP: ${formatNumber(battle.bossHp)} / ${formatNumber(battle.bossMaxHp)}`,
    `CE: ${formatNumber(battle.bossCe)} / ${formatNumber(battle.bossMaxCe)}`,
    `Strength: ${formatNumber(battle.bossStrength)}`,
    `Speed: ${formatNumber(battle.bossSpeed)}`,
    `Defense: ${formatNumber(battle.bossDefense)}`,
    "",
    "RCT: MASTERED",
    "",
    "Use /battack to engage."
  ]

  if (isRaid) {
    lines.splice(lines.length - 2, 0, "")
    lines.splice(lines.length - 2, 0, `RAID MODE: ${Math.min((aurstavState.raidPlayers || []).length + 1, 8)}/8 players`)
  }

  await sendQuotedWithFooter(sock, remoteJid, lines.join("\n"), message)
}

export async function handleAurstavRaid(sock, message) {
  const remoteJid = message.key.remoteJid
  const sender = message.key.participant || remoteJid
  const phoneNumber = sender.split("@")[0]

  const player = await loadPlayerByPhone(phoneNumber)
  if (!player) {
    await sendQuotedWithFooter(sock, remoteJid, "You need to register first.\n\nUse /start to begin.", message)
    return
  }

  const aurstavState = await getAurstavState()
  if (aurstavState.permanentlyDead) {
    await sendQuotedWithFooter(sock, remoteJid, "Aurstav has already been defeated.", message)
    return
  }

  if (aurstavState.phase < 2) {
    await sendQuotedWithFooter(sock, remoteJid, "The raid is not yet open. Aurstav must first be pushed to Phase II.", message)
    return
  }

  if (!aurstavState.raidOpen) {
    await sendQuotedWithFooter(sock, remoteJid, "The raid is not currently open.", message)
    return
  }

  const existingBattle = getAurstavBattle(player.playerId)
  const existingRaid = getRaidBattleForPlayer(player.playerId)
  if (existingBattle || existingRaid) {
    await sendQuotedWithFooter(sock, remoteJid, "You are already in the Aurstav battle.", message)
    return
  }

  const raidPlayers = aurstavState.raidPlayers || []
  if (raidPlayers.length >= 8) {
    await sendQuotedWithFooter(sock, remoteJid, "The raid is full (8/8 players).", message)
    return
  }

  const hostId = raidPlayers[0]?.playerId
  if (!hostId) {
    await sendQuotedWithFooter(sock, remoteJid, "No raid host found.", message)
    return
  }

  const hostBattle = getAurstavBattle(hostId)
  if (!hostBattle || hostBattle.battleFinished) {
    await sendQuotedWithFooter(sock, remoteJid, "The raid has already ended.", message)
    return
  }

  addRaidMember(player.playerId, player.name, hostBattle)
  await addRaidPlayer(player.playerId, player.name)
  await startAurstavRaid()

  await sendQuotedWithFooter(sock, remoteJid, [
    "🐉 DRAGON CURSE KING RAID",
    "",
    `You have joined the raid.`,
    `Host: ${raidPlayers[0]?.playerName || "Unknown"}`,
    `Players: ${Math.min(raidPlayers.length + 1, 8)}/8`,
    "",
    "Use /battack to fight together."
  ].join("\n"), message)
}

export async function processAurstavPlayerAttack(player, battle, state, damage, isBlackFlash, isCritical, skillName = null) {
  const resistances = battle.bossResistances || getAurstavResistances()
  const isPhysical = !skillName
  const resistanceKey = isPhysical ? "ordinaryPhysical" : "ceAttacks"
  const resistance = resistances[resistanceKey] || 0.5

  const actualDamage = Math.floor(damage * (1 - calculateDamageResistance(resistance, player.cursedEnergy || 0, player.luck || 0, battle.bossIntelligence || 10000, state.momentum || 50)))

  battle.bossHp = Math.max(0, battle.bossHp - actualDamage)
  state.damageDealt += actualDamage
  battle.totalDamageDealt += actualDamage
  battle.damageDealtByPlayers[player.playerId] = (battle.damageDealtByPlayers[player.playerId] || 0) + actualDamage

  if (isBlackFlash) {
    state.blackFlashes++
    battle.blackFlashes++
    battle.momentumSwings++
  }

  const ceBurnChance = 0.25
  if (skillName && Math.random() < ceBurnChance) {
    const ceBurn = calculateGoldFlameCeBurn(
      player.cursedEnergy || 0,
      AURSTAV.goldFlameStrength,
      resistance,
      state.momentum || 50
    )
    player.cursedEnergy = Math.max(0, player.cursedEnergy - ceBurn)
  }

  const soulBurnChance = 0.08
  if (isBlackFlash && Math.random() < soulBurnChance) {
    const effect = calculateSoulBurnEffect(player.hasRCT, battle.bossIntelligence || 10000, 3)
    globalStatusEngine.addStatus(player.playerId, {
      type: "soul_burn",
      label: "Soul Burn",
      emoji: "🔥",
      durationTurns: effect.duration,
      stacks: 1,
      clearedOnBattleEnd: true,
      effect: (target) => {
        target.health = Math.max(0, target.health - Math.floor(target.maxHealth * 0.03))
        if (target.thirst !== undefined) {
          target.thirst = Math.max(0, target.thirst - 2)
        }
      }
    })
  }

  if (battle.bossHp === 0) {
    return { bossDefeated: true, actualDamage }
  }

  return { bossDefeated: false, actualDamage }
}

export async function processAurstavOpponentTurn(player, battle, state) {
  if (battle.battleFinished) return { finished: true }

  const boss = battle
  let narration = ""

  if (boss.timeScapeActive) {
    boss.timeScapeActive = false
    return { narration: "⏳ Time Scape fades.\n\nThe flow of time returns to normal.", finished: false }
  }

  if (boss.playerStunned) {
    boss.playerStunTurns--
    if (boss.playerStunTurns <= 0) {
      boss.playerStunned = false
      return { narration: "You recover from the stun.\n\nYour Turn", finished: false }
    }
    return { narration: "💤 You are stunned! You cannot act this turn.\n\nYour Turn", finished: false }
  }

  if (boss.domainActive && boss.domainRounds > 0) {
    boss.domainRounds--
    const thirstDrain = Math.floor(3 + boss.exhaustion * 0.5)
    const attackPenalty = Math.min(0.4, boss.exhaustion * 0.02)
    boss.exhaustion = Math.min(100, boss.exhaustion + 5)
    player.thirst = Math.max(0, (player.thirst || 100) - thirstDrain)
    boss.attackPenalty = attackPenalty

    if (boss.domainRounds <= 0) {
      boss.domainActive = false
      boss.exhaustion = 0
      boss.attackPenalty = 0
      boss.thirstDrainActive = false
    }
  }

  const scaling = boss.scaling || calculateRaidScaling(boss.raidMembers?.length || 1)
  const actionBudget = Math.floor((scaling.actionFreq || 1) * 2)
  let actionsUsed = 0

  if (battle.phasePhase === AURSTAV_PHASE.CALM && battle.round < 5) {
    actionsUsed = Math.min(actionBudget, 1 + Math.floor(Math.random() * 2))
  } else if (battle.phasePhase === AURSTAV_PHASE.SERIOUS) {
    actionsUsed = Math.min(actionBudget, 2 + Math.floor(Math.random() * 3))
  } else {
    actionsUsed = Math.min(actionBudget, 2 + Math.floor(Math.random() * 4))
  }

  const summons = getAurstavSummons(player.playerId) || []
  const dragonSoulCooldowns = getAurstavCooldowns(player.playerId) || {}
  const maxActive = boss.maxSummons || 5

  const aliveMembers = battle.isRaid
    ? (battle.raidMembers || []).filter(m => m.alive)
    : [{ playerId: player.playerId, playerName: player.name, player }]

  for (let i = 0; i < actionsUsed; i++) {
    const targetPlayerObj = aliveMembers[Math.floor(Math.random() * aliveMembers.length)]
    const action = decideAurstavAction(boss, player, state, summons, dragonSoulCooldowns)
    const result = executeAurstavAction(action, targetPlayerObj.player || player, battle, state, summons)
    narration += result.narration + "\n"
    if (result.finished) {
      if (battle.isRaid) {
        targetPlayerObj.alive = false
        targetPlayerObj.hp = 0
        narration += `\n💀 ${targetPlayerObj.playerName} has fallen!`
        const stillAlive = (battle.raidMembers || []).filter(m => m.alive)
        if (stillAlive.length === 0) {
          return { narration: narration.trim() + "\n\nAURSTAV REMAINS\n\nThe raid has failed.", finished: true }
        }
      } else {
        return { narration, finished: true }
      }
    }
  }

  if (boss.dragonSoulCooldown > 0) {
    boss.dragonSoulCooldown--
  }
  if (boss.goldManeCooldown > 0) {
    boss.goldManeCooldown--
  }
  if (boss.timeScapeCooldown > 0) {
    boss.timeScapeCooldown--
  }

  boss.round++
  state.turnCount = boss.round

  if (boss.round >= 5 && !boss.seriousTriggered) {
    boss.seriousTriggered = true
    boss.phasePhase = AURSTAV_PHASE.SERIOUS
    const baseStats = AURSTAV.baseStats
    boss.bossStrength = Math.floor(baseStats.strength * AURSTAV.phase2Multipliers.strength)
    boss.bossSpeed = Math.floor(baseStats.speed * AURSTAV.phase2Multipliers.speed)
    boss.bossDefense = Math.floor(baseStats.defense * AURSTAV.phase2Multipliers.defense)
    narration += [
      "⚠️ AURSTAV HAS BECOME SERIOUS",
      "",
      '"...Enough."',
      '"I have seen enough."',
      '"Now..."',
      '"Fight the Dragon Curse King."'
    ].join("\n") + "\n\n"
  }

  return { narration: narration.trim(), finished: false }
}

function decideAurstavAction(battle, player, state, summons, cooldowns) {
  const actions = []
  const hpRatio = battle.bossHp / Math.max(1, battle.bossMaxHp)
  const phase = battle.phasePhase

  if (phase === AURSTAV_PHASE.CALM && battle.round < 5) {
    actions.push({ type: "basic_attack", weight: 40 })
    actions.push({ type: "dragon_soul", weight: 20 })
    actions.push({ type: "golden_flame", weight: 15 })
    actions.push({ type: "defensive", weight: 15 })
    actions.push({ type: "physical", weight: 10 })
  } else if (phase === AURSTAV_PHASE.SERIOUS) {
    actions.push({ type: "heavy_attack", weight: 30 })
    actions.push({ type: "golden_flame", weight: 25 })
    actions.push({ type: "dragon_soul", weight: 20 })
    if (battle.goldManeCooldown <= 0 && !battle.goldManeActive) {
      actions.push({ type: "gold_mane", weight: 15 })
    }
    actions.push({ type: "technique", weight: 10 })
  } else {
    actions.push({ type: "heavy_attack", weight: 25 })
    actions.push({ type: "golden_flame", weight: 20 })
    actions.push({ type: "dragon_soul", weight: 20 })
    if (battle.goldManeCooldown <= 0 && !battle.goldManeActive) {
      actions.push({ type: "gold_mane", weight: 15 })
    }
    if (battle.timeScapeCooldown <= 0 && hpRatio < 0.5) {
      actions.push({ type: "time_scape", weight: 10 })
    }
    if (hpRatio < 0.3 && !battle.domainActive) {
      actions.push({ type: "domain_expansion", weight: 10 })
    }
    actions.push({ type: "technique", weight: 10 })
  }

  const totalWeight = actions.reduce((a, b) => a + b.weight, 0)
  let roll = Math.floor(Math.random() * totalWeight)
  for (const action of actions) {
    roll -= action.weight
    if (roll < 0) return action.type
  }
  return "basic_attack"
}

function executeAurstavAction(action, player, battle, state, summons) {
  switch (action) {
    case "basic_attack":
      return executeBasicAttack(player, battle, state)
    case "heavy_attack":
      return executeHeavyAttack(player, battle, state)
    case "golden_flame":
      return executeGoldenFlame(player, battle, state)
    case "dragon_soul":
      return executeDragonSoul(player, battle, state, summons)
    case "gold_mane":
      return executeGoldMane(player, battle, state)
    case "time_scape":
      return executeTimeScape(player, battle, state)
    case "domain_expansion":
      return executeDomainExpansion(player, battle, state)
    case "defensive":
      return executeDefensive(player, battle, state)
    case "technique":
      return executeTechnique(player, battle, state)
    case "physical":
      return executePhysical(player, battle, state)
    default:
      return executeBasicAttack(player, battle, state)
  }
}

function executeBasicAttack(player, battle, state) {
  const damage = Math.max(1, Math.floor((battle.bossStrength || 50000) * 0.02))
  const actualDamage = applyPlayerDamage(player, damage, battle)
  const narration = `🐉 Aurstav strikes with his claws!\n💥 ${actualDamage} damage to @${player.name || "Unknown"}!`
  return { narration, finished: player.health <= 0 }
}

function executeHeavyAttack(player, battle, state) {
  const damage = Math.max(1, Math.floor((battle.bossStrength || 50000) * 0.05))
  const actualDamage = applyPlayerDamage(player, damage, battle)
  const narration = `🐉 Aurstav unleashes a devastating blow!\n💥 ${actualDamage} damage to @${player.name || "Unknown"}!`
  return { narration, finished: player.health <= 0 }
}

function executeGoldenFlame(player, battle, state) {
  const baseDamage = Math.max(1, Math.floor((battle.bossStrength || 50000) * 0.03))
  const resistances = battle.bossResistances || {}
  const actualDamage = Math.floor(baseDamage * (1 - (resistances.ordinaryPhysical || 0.5)))

  const oldHp = player.health
  player.health = Math.max(0, player.health - actualDamage)
  const hpLoss = oldHp - player.health
  state.damageTaken += hpLoss

  const ceBurn = calculateGoldFlameCeBurn(player.cursedEnergy || 0, AURSTAV.goldFlameStrength, resistances.ceAttacks || 0.5, state.momentum || 50)
  player.cursedEnergy = Math.max(0, player.cursedEnergy - ceBurn)

  const soulBurnChance = 0.15
  let soulBurnText = ""
  if (Math.random() < soulBurnChance) {
    const effect = calculateSoulBurnEffect(player.hasRCT, battle.bossIntelligence || 10000, 4)
    globalStatusEngine.addStatus(player.playerId, {
      type: "soul_burn",
      label: "Soul Burn",
      emoji: "🔥",
      durationTurns: effect.duration,
      stacks: 1,
      clearedOnBattleEnd: true,
      effect: (target) => {
        target.health = Math.max(0, target.health - Math.floor(target.maxHealth * 0.03))
        if (target.thirst !== undefined) {
          target.thirst = Math.max(0, target.thirst - 2)
        }
      }
    })
    soulBurnText = "\n🔥 SOUL BURN inflicted!"
  }

  const narration = [
    "🔥 GOLD FLAME",
    `Aurstav breathes golden dragon flame!`,
    `💥 ${actualDamage} HP damage!`,
    `CE consumed: ${ceBurn}${soulBurnText}`,
    "",
    `❤️ @${player.name || "Unknown"}: ${player.health}/${player.maxHealth}`
  ].join("\n")

  return { narration, finished: player.health <= 0 }
}

function executeDragonSoul(player, battle, state, summons) {
  if (battle.dragonSoulCooldown > 0) {
    return executeBasicAttack(player, battle, state)
  }

  const maxActive = battle.maxSummons || 5
  const currentActive = (summons || []).filter(s => s.alive).length
  const toSummon = Math.min(2, maxActive - currentActive)

  if (toSummon <= 0) {
    return executeBasicAttack(player, battle, state)
  }

  const newSummons = []
  const availableTypes = [...AURSTAV.dragonSummonTypes]
  for (let i = 0; i < toSummon; i++) {
    const typeIndex = Math.floor(Math.random() * availableTypes.length)
    const template = availableTypes.splice(typeIndex, 1)[0]
    const scaling = battle.scaling || calculateRaidScaling(battle.raidMembers?.length || 1)
    newSummons.push({
      ...template,
      id: crypto.randomUUID(),
      hp: Math.floor(template.hp * (scaling.actionFreq || 1)),
      maxHp: Math.floor(template.hp * (scaling.actionFreq || 1)),
      alive: true
    })
  }

  const allSummons = [...(summons || []), ...newSummons].filter(s => s.alive)
  setAurstavSummons(player.playerId, allSummons)
  battle.activeSummons = allSummons
  battle.dragonSoulCooldown = AURSTAV.dragonSoul.cooldownRounds

  const grades = newSummons.map(s => s.name).join(", ")
  const narration = [
    "🐉 DRAGON SOUL ACTIVATED",
    "The sky has opened.",
    "Dragon signatures detected:",
    "",
    `Special Grade+ x${newSummons.length}`,
    "",
    `Summoned: ${grades}`,
    "",
    `Active dragons: ${allSummons.length}/${maxActive}`
  ].join("\n")

  return { narration, finished: false }
}

function executeGoldMane(player, battle, state) {
  battle.goldManeActive = true
  battle.goldManeArms = 4
  battle.goldManeCooldown = 5

  const damage = Math.max(1, Math.floor((battle.bossStrength || 50000) * 0.08))
  const actualDamage = applyPlayerDamage(player, damage, battle)

  const narration = [
    AURSTAV.dialogue.goldMane[0],
    AURSTAV.dialogue.goldMane[1],
    "",
    `Aurstav's golden mane extends into 4 arms!`,
    `💥 ${actualDamage} damage!`,
    "",
    `❤️ @${player.name || "Unknown"}: ${player.health}/${player.maxHealth}`
  ].join("\n")

  return { narration, finished: player.health <= 0 }
}

function executeTimeScape(player, battle, state) {
  if (battle.timeScapeCooldown > 0) {
    return executeBasicAttack(player, battle, state)
  }

  const interferenceChance = Math.min(0.5, (state.momentum || 50) / 200)
  const hasDomain = player.domains?.unlocked || player.domains?.infernalPurgatory
  if (hasDomain && Math.random() < interferenceChance + 0.2) {
    state.momentum = Math.min(100, (state.momentum || 50) + 10)
    return {
      narration: [
        "⏳ TIME SCAPE",
        "Aurstav is reversing the flow of time...",
        "",
        "The golden flames suddenly become still.",
        "Something feels wrong.",
        "Aurstav is preparing to distort time.",
        "",
        "Your domain clashes with his attempt!",
        "Time Scape INTERRUPTED!"
      ].join("\n"),
      finished: false
    }
  }

  if (Math.random() < interferenceChance) {
    state.momentum = Math.min(100, (state.momentum || 50) + 5)
    return {
      narration: [
        "⏳ TIME SCAPE",
        "Aurstav is reversing the flow of time...",
        "",
        "The golden flames suddenly become still.",
        "Something feels wrong.",
        "Aurstav is preparing to distort time.",
        "",
        "Your battle momentum disrupts the attempt!",
        "Time Scape INTERRUPTED!"
      ].join("\n"),
      finished: false
    }
  }

  battle.timeScapeActive = true
  battle.timeScapeCooldown = Math.floor(AURSTAV.timeScapeCooldownMs / 1000)

  const snapshot = {
    bossHp: battle.bossHp,
    bossCe: battle.bossCe,
    activeSummons: battle.activeSummons?.map(s => ({ ...s })) || [],
    statusEffects: player.statusEffects ? [...player.statusEffects] : [],
    domainRounds: battle.domainRounds,
    playerDomainRounds: battle.playerDomainRounds,
    round: battle.round
  }
  saveTimeScapeSnapshot(player.playerId, snapshot)

  const narration = [
    AURSTAV.dialogue.timeScape[0],
    AURSTAV.dialogue.timeScape[1],
    "",
    "10...",
    "9...",
    "8..."
  ].join("\n")

  return { narration, finished: false }
}

function executeDomainExpansion(player, battle, state) {
  battle.domainActive = true
  battle.domainRounds = 5
  battle.domainDamage = Math.floor(50 + battle.bossIntelligence * 0.01)
  battle.thirstDrainActive = true

  const narration = [
    AURSTAV.dialogue.domain[0],
    AURSTAV.dialogue.domain[1],
    "",
    "☀️ ETERNAL SUN DRAGON PALACE",
    "",
    "The environment becomes an enormous golden desert beneath an oppressive sun.",
    "",
    "Thirst rapidly decreases.",
    "Heat exhaustion increases.",
    "Attack efficiency reduced.",
    "",
    `❤️ @${player.name || "Unknown"}: ${player.health}/${player.maxHealth}`
  ].join("\n")

  return { narration, finished: false }
}

function executeDefensive(player, battle, state) {
  const heal = Math.floor(battle.bossMaxHp * 0.05)
  battle.bossHp = Math.min(battle.bossMaxHp, battle.bossHp + heal)
  const ceHeal = Math.floor(battle.bossMaxCe * 0.1)
  battle.bossCe = Math.min(battle.bossMaxCe, battle.bossCe + ceHeal)

  const narration = `🐉 Aurstav takes a defensive stance.\nRecovered ${heal} HP and ${ceHeal} CE.`
  return { narration, finished: false }
}

function executeTechnique(player, battle, state) {
  const damage = Math.max(1, Math.floor((battle.bossStrength || 50000) * 0.04))
  const actualDamage = applyPlayerDamage(player, damage, battle)
  const narration = `🐉 Aurstav uses a cursed technique!\n💥 ${actualDamage} damage to @${player.name || "Unknown"}!`
  return { narration, finished: player.health <= 0 }
}

function executePhysical(player, battle, state) {
  const damage = Math.max(1, Math.floor((battle.bossStrength || 50000) * 0.015))
  const actualDamage = applyPlayerDamage(player, damage, battle)
  const narration = `🐉 Aurstav attacks physically!\n💥 ${actualDamage} damage!`
  return { narration, finished: player.health <= 0 }
}

function applyPlayerDamage(player, amount, battle) {
  if (amount <= 0) return 0
  const oldHp = player.health
  player.health -= amount
  if (player.health < 0) player.health = 0

  const stateObj = getAurstavBattleState(player.playerId)
  if (stateObj) {
    stateObj.damageTaken += (oldHp - player.health)
    if (battle) {
      battle.totalDamageTaken += (oldHp - player.health)
    }
  }

  return oldHp - player.health
}

export async function processAurstavPlayerSkill(player, battle, state, skillName, damage) {
  const result = await processAurstavPlayerAttack(player, battle, state, damage, false, false, skillName)
  return result
}

export async function endAurstavBattle(playerId, victory) {
  const battle = getAurstavBattle(playerId)
  if (!battle) return null

  battle.battleFinished = true
  battle.victory = victory

  if (victory) {
    await setAurstavDefeated()
  }

  const state = getAurstavBattleState(playerId)
  const legendary = checkLegendaryBattle(state || {}, battle)

  if (legendary && !victory) {
    const record = buildLegendaryRecord(playerId, (await loadPlayerByPhone(playerId.split("@")[0]))?.name || "Unknown", battle, false)
    await recordLegendaryBattle(record)
    if (state) {
      state.legendary = true
    }
  }

  if (victory) {
    const record = buildLegendaryRecord(playerId, (await loadPlayerByPhone(playerId.split("@")[0]))?.name || "Unknown", battle, true)
    await recordLegendaryBattle(record)
  }

  if (!victory && battle.isRaid) {
    const aurstavState = await getAurstavState()
    if (aurstavState.phase >= 2) {
      await setAurstavPhase2()
    }
  }

  if (!victory) {
    const aurstavState = await getAurstavState()
    if (aurstavState.phase < 2 && battle.phasePhase === AURSTAV_PHASE.SERIOUS) {
      await setAurstavPhase2()
    }
  }

  return { battle, legendary }
}

export async function handleAurstavBattleCommand(sock, message, text) {
  const remoteJid = message.key.remoteJid
  const sender = message.key.participant || remoteJid
  const phoneNumber = sender.split("@")[0]

  const player = await loadPlayerByPhone(phoneNumber)
  if (!player) {
    await sendQuotedWithFooter(sock, remoteJid, "You need to register first.\n\nUse /start to begin.", message)
    return
  }

  const battle = getAurstavBattle(player.playerId)
  const raidBattle = getRaidBattleForPlayer(player.playerId)
  const activeBattle = battle || raidBattle?.battle

  if (!activeBattle) {
    await sendQuotedWithFooter(sock, remoteJid, "No active Aurstav battle. Use /challenge Aurstav to begin.", message)
    return
  }

  const hostId = raidBattle?.hostId || player.playerId
  const hostBattle = getAurstavBattle(hostId)
  const effectiveBattle = hostBattle || activeBattle

  if (effectiveBattle.battleFinished) {
    await sendQuotedWithFooter(sock, remoteJid, "This battle has ended.", message)
    return
  }

  const state = getAurstavBattleState(hostId)
  if (!state) {
    await sendQuotedWithFooter(sock, remoteJid, "Battle state corrupted. Please re-engage.", message)
    return
  }

  if (text === "/battack") {
    const damage = Math.max(1, 10 + player.strength + (player.equippedItems?.weapon?.stats?.attack || 0))
    const bfChance = 0.05 + (player.blackFlashAffinity || 0) * 0.01
    const isBlackFlash = Math.random() < bfChance
    const isCritical = !isBlackFlash && Math.random() < 0.08
    let finalDamage = damage
    if (isBlackFlash) {
      finalDamage = Math.floor(damage * 2.5)
      state.blackFlashes++
      effectiveBattle.blackFlashes++
    } else if (isCritical) {
      finalDamage = Math.floor(damage * 1.5)
    }

    const result = await processAurstavPlayerAttack(player, effectiveBattle, state, finalDamage, isBlackFlash, isCritical)
    state.turnCount = effectiveBattle.round

    const legendary = checkLegendaryBattle(state, effectiveBattle)
    if (legendary && !effectiveBattle.legendaryDetected) {
      effectiveBattle.legendaryDetected = true
      state.legendary = true
    }

    let narration = `@${player.name || "Unknown"} attacks!\n💥 ${result.actualDamage} damage to Aurstav!\n\n`
    narration += `Aurstav: ${formatNumber(effectiveBattle.bossHp)} / ${formatNumber(effectiveBattle.bossMaxHp)} HP\n`
    narration += `❤️ @${player.name}: ${player.health}/${player.maxHealth}\n`
    narration += `⚡ CE: ${player.cursedEnergy}/${player.maxCursedEnergy}`

    if (isBlackFlash) {
      narration = `⚫ BLACK FLASH\nSpace itself shattered.\nThe impact distorted reality.\n\n` + narration
    }

    if (result.bossDefeated) {
      const endResult = await endAurstavBattle(hostId, true)
      if (endResult) {
        const winner = selectDragonLongBladeWinner(effectiveBattle)
        const winnerName = winner ? winner.playerName : player.name
        const victoryLines = [
          "╔════════════════════════════════╗",
          "       THE DRAGON CURSE KING",
          "             FALLS",
          "╚════════════════════════════════╝",
          "",
          "AURSTAV",
          "",
          "THE ETERNAL DRAGON",
          "",
          "CALAMITY GRADE",
          "",
          "DEFEATED.",
          "",
          "The golden flames disappear.",
          "",
          "The sky falls silent.",
          "",
          "The Dragon Curse King is no more."
        ]

        if (winner) {
          victoryLines.push("", "🏆 DRAGON LONG BLADE AWARDED", "", `Winner: ${winner.playerName}`, "", "The Dragon Long Blade has chosen its wielder.")
        }

        if (effectiveBattle.isRaid && (effectiveBattle.raidMembers || []).length > 1) {
          const names = (effectiveBattle.raidMembers || []).map(m => m.playerName).join("\n")
          victoryLines.push("", "DEFEATED BY:", "", names)
        }

        await broadcastAurstavDefeat(sock, winnerName, effectiveBattle.isRaid ? (effectiveBattle.raidMembers || []).map(m => m.playerName) : [winnerName])
        await savePlayer(player)
        clearAurstavBattle(hostId)
        await sendQuotedWithFooter(sock, remoteJid, victoryLines.join("\n"), message)
        return { success: true, finished: true, narration: victoryLines.join("\n") }
      }
    }

    const opponentResult = await processAurstavOpponentTurn(player, effectiveBattle, state)
    const fullNarration = `${narration}\n\n${opponentResult.narration}`

    if (opponentResult.finished) {
      const endResult = await endAurstavBattle(hostId, false)
      if (endResult && endResult.legendary) {
        fullNarration += "\n\n⚔️ LEGENDARY BATTLE DETECTED\nYou pushed Aurstav to his limits.\nThe battle will be recorded."
      }
      if (!effectiveBattle.isRaid) {
        const aurstavState = await getAurstavState()
        if (aurstavState.phase < 2 && effectiveBattle.phasePhase === AURSTAV_PHASE.SERIOUS) {
          await setAurstavPhase2()
          fullNarration += "\n\n⚠️ AURSTAV PHASE II\nAurstav recognizes humanity can challenge him.\nHis power has doubled."
        }
      }
      await savePlayer(player)
      clearAurstavBattle(hostId)
      await sendQuotedWithFooter(sock, remoteJid, fullNarration, message)
      return { success: false, finished: true, narration: fullNarration }
    }

    await savePlayer(player)
    await sendQuotedWithFooter(sock, remoteJid, fullNarration, message)
    return { success: true, finished: false, narration: fullNarration }
  }

  if (text === "/bblock") {
    const narration = `@${player.name || "Unknown"} takes a defensive stance against Aurstav!`
    const opponentResult = await processAurstavOpponentTurn(player, effectiveBattle, state)
    const perfectBlock = Math.random() < 0.1
    let fullNarration = narration
    if (perfectBlock) {
      fullNarration += "\n\n🛡️ PERFECT BLOCK!"
      state.perfectBlocks = (state.perfectBlocks || 0) + 1
    }
    fullNarration += `\n\n${opponentResult.narration}`
    await sendQuotedWithFooter(sock, remoteJid, fullNarration, message)
    return { success: true, finished: false, narration: fullNarration }
  }

  if (text === "/bflee") {
    await sendQuotedWithFooter(sock, remoteJid, "You cannot flee from the Dragon Curse King.", message)
    return { success: false, finished: false, narration: "Cannot flee." }
  }

  if (text === "/rtu") {
    const { handleReverseTechnique } = await import("../reverseTechniqueCommand.js")
    await handleReverseTechnique(sock, message)
    return { success: true, finished: false }
  }

  if (text === "/domain") {
    const domainResult = handlePlayerDomain(player, effectiveBattle, state)
    if (domainResult.narration) {
      await sendQuotedWithFooter(sock, remoteJid, domainResult.narration, message)
    }
    return { success: true, finished: false, narration: domainResult.narration }
  }

  if (text === "/rct-burst" || text === "/rct-slow") {
    const { handleRctBurst, handleRctSlow } = await import("../rctBattleCommand.js")
    if (text === "/rct-burst") {
      await handleRctBurst(sock, message)
    } else {
      const wasStunned = effectiveBattle.playerStunned
      await handleRctSlow(sock, message)
      if (wasStunned && effectiveBattle.playerStunned) {
        const rctChance = calculateRctBrainRecoveryChance(player.hasRCT ? 50 : 0, player.cursedEnergy || 0, player.health / player.maxHealth, state.momentum || 50)
        const succeeded = Math.random() * 100 < rctChance
        if (succeeded) {
          effectiveBattle.playerStunned = false
          effectiveBattle.playerStunTurns = 0
          await sendQuotedWithFooter(sock, remoteJid, [
            "🧠 RCT",
            "You are attempting to regenerate the damaged parts of your brain.",
            "",
            `Success! The stun has been cleared.`,
            `Recovery chance: ${Math.floor(rctChance)}%`
          ].join("\n"), message)
        } else {
          await sendQuotedWithFooter(sock, remoteJid, [
            "🧠 RCT",
            "You are attempting to regenerate the damaged parts of your brain.",
            "",
            `Failed. The stun persists.`,
            `Recovery chance: ${Math.floor(rctChance)}%`
          ].join("\n"), message)
        }
      }
    }
    return { success: true, finished: false }
  }

  if (text === "/bstats") {
    const lines = [
      "━━━━━━━━━━━━━━━━━━━━━━",
      "📊 AURSTAV BATTLE",
      "━━━━━━━━━━━━━━━━━━━━━━",
      "",
      "🐉 AURSTAV",
      `HP: ${formatNumber(effectiveBattle.bossHp)} / ${formatNumber(effectiveBattle.bossMaxHp)}`,
      `CE: ${formatNumber(effectiveBattle.bossCe)} / ${formatNumber(effectiveBattle.bossMaxCe)}`,
      `Phase: ${effectiveBattle.phasePhase.toUpperCase()}`,
      "",
      `👤 @${player.name}`,
      `HP: ${player.health}/${player.maxHealth}`,
      `CE: ${player.cursedEnergy}/${player.maxCursedEnergy}`,
      `Thirst: ${player.thirst || 0}%`,
      "",
      effectiveBattle.domainActive ? `☀️ Domain Active: ${effectiveBattle.domainRounds} rounds` : "No domain active",
      effectiveBattle.goldManeActive ? "🦁 Gold Mane: ACTIVE (4 arms)" : "Gold Mane: Inactive",
      effectiveBattle.timeScapeCooldown > 0 ? `⏳ Time Scape CD: ${effectiveBattle.timeScapeCooldown}s` : "⏳ Time Scape: READY",
      "",
      "━━━━━━━━━━━━━━━━━━━━━━"
    ]
    await sendQuotedWithFooter(sock, remoteJid, lines.join("\n"), message)
    return { success: true, finished: false }
  }

  await sendQuotedWithFooter(sock, remoteJid, "Unknown command in Aurstav battle. Use /battack, /bblock, /bflee, /domain, /rct-burst, /rct-slow, /bstats", message)
  return { success: false, finished: false }
}

function handlePlayerDomain(player, battle, state) {
  if (!DomainService.hasDomain(player)) {
    return { narration: "You do not have a Domain Expansion unlocked." }
  }

  if (battle.domainActive) {
    return { narration: "Aurstav's domain is already active. You cannot activate yours inside it without a Domain Clash." }
  }

  if (battle.domainClashActive) {
    return { narration: "A Domain Clash is already in progress!" }
  }

  if (battle.playerDomainActive) {
    return { narration: "Your domain is already active." }
  }

  const result = DomainService.activate(player, battle)
  if (result.error) {
    return { narration: result.error }
  }

  battle.playerDomainActive = true
  battle.playerDomainRounds = result.domain.battleEffect?.rounds || 3

  if (battle.domainActive) {
    battle.domainClashActive = true
    const playerMomentum = calculateDomainClashMomentum(
      player.techniqueMastery || 50,
      player.cursedEnergy || 0,
      player.intelligence || 50,
      state.momentum || 50,
      80
    )
    battle.domainClashMomentum = playerMomentum

    const winner = playerMomentum >= 50 ? "PLAYER" : "AURSTAV"
    const bar1 = "█".repeat(Math.floor(playerMomentum / 10)) + "░".repeat(10 - Math.floor(playerMomentum / 10))
    const bar2 = "█".repeat(Math.floor((100 - playerMomentum) / 10)) + "░".repeat(10 - Math.floor((100 - playerMomentum) / 10))

    let narration = [
      "DOMAIN CLASH",
      "",
      `PLAYER DOMAIN        AURSTAV DOMAIN`,
      `${bar1} ${playerMomentum}%      ${bar2} ${100 - playerMomentum}%`,
      ""
    ].join("\n")

    if (winner === "PLAYER") {
      narration += "\nYou win the Domain Clash!\nAurstav's domain is suppressed!"
      battle.domainActive = false
      battle.domainRounds = 0
      battle.domainClashActive = false
      battle.domainClashes = (battle.domainClashes || 0) + 1
      state.momentum = Math.min(100, (state.momentum || 50) + 15)
    } else {
      narration += "\n⚠️ DOMAIN CLASH LOST\nAurstav's domain overwhelms yours!\nYou are stunned!"
      battle.playerDomainActive = false
      battle.playerDomainRounds = 0
      battle.domainClashActive = false
      battle.playerStunned = true
      battle.playerStunTurns = 2
      battle.domainClashes = (battle.domainClashes || 0) + 1
      state.momentum = Math.max(0, (state.momentum || 50) - 10)
    }

    return { narration, domainClash: true }
  }

  return { narration: `🌀 Domain Expansion activated!\nYour domain: ${result.domain.name}\n\nYour Turn` }
}

export function formatNumber(num) {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M"
  if (num >= 1000) return (num / 1000).toFixed(1) + "K"
  return String(num)
}

export async function broadcastAurstavDefeat(sock, winnerName, raidMembers = []) {
  const groups = await loadAllGroups()
  const announcement = [
    "🚨 WORLD EVENT COMPLETE 🚨",
    "",
    "AURSTAV",
    "THE ETERNAL DRAGON",
    "THE DRAGON CURSE KING",
    "",
    "HAS BEEN DEFEATED.",
    "",
    "The impossible has happened.",
    "",
    `<${winnerName}>`,
    "",
    "has slain the strongest curse",
    "KennyJaks has ever witnessed."
  ]

  if (raidMembers.length > 1) {
    announcement.push("", "DEFEATED BY:", "", ...raidMembers)
  }

  for (const group of groups) {
    if (group.enabled && group.groupId) {
      try {
        await sock.sendMessage(group.groupId, { text: announcement.join("\n") })
      } catch (err) {
        console.error("[AURSTAV] Failed to broadcast to group:", group.groupId, err.message)
      }
    }
  }
}
