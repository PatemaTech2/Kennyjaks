import { getEventState, setAurstavDefeated, setAurstavFirstChallenger, setAurstavPhase2, addRaidPlayer, startAurstavRaid, recordAurstavLegendaryBattle, isAurstavUnlocked } from "./SeasonalEventService.js"
import { DRAGON_CURSE_KING_EVENT } from "../../data/seasonal/dragonCurseKing.js"

const AURSTAV_BASE = DRAGON_CURSE_KING_EVENT.aurstav

const aurstavBattles = new Map()
const aurstavBattleStates = new Map()
const aurstavSummons = new Map()
const aurstavCooldowns = new Map()
const aurstavSnapshots = new Map()
const raidMembers = new Map()

export const AURSTAV_PHASE = {
  CALM: "calm",
  SERIOUS: "serious",
  PHASE2: "phase2"
}

export function getAurstavBaseStats() {
  return { ...AURSTAV_BASE.baseStats }
}

export function getAurstavResistances() {
  return { ...AURSTAV_BASE.resistances }
}

export function createAurstavBattle(playerId, playerName, isRaid = false, raidSize = 1) {
  const base = getAurstavBaseStats()
  const scaling = AURSTAV_BASE.raidScaling[Math.min(raidSize, 8)] || AURSTAV_BASE.raidScaling[8]
  const phase = isRaid ? 2 : 1

  const hp = base.hp
  const strength = phase >= 2 ? Math.floor(base.strength * AURSTAV_BASE.phase2Multipliers.strength) : base.strength
  const speed = phase >= 2 ? Math.floor(base.speed * AURSTAV_BASE.phase2Multipliers.speed) : base.speed
  const defense = phase >= 2 ? Math.floor(base.defense * AURSTAV_BASE.phase2Multipliers.defense) : base.defense

  const battle = {
    type: "AURSTAV",
    bossId: "aurstav",
    playerId,
    isRaid,
    raidMembers: isRaid ? [{ playerId, playerName, hp: 0, maxHp: 0, ce: 0, maxCe: 0, alive: true, joinedAt: Date.now() }] : [],
    phase,
    phasePhase: phase === 1 ? AURSTAV_PHASE.CALM : AURSTAV_PHASE.PHASE2,
    round: 0,
    startedAt: Date.now(),
    bossHp: hp,
    bossMaxHp: hp,
    bossCe: base.ce,
    bossMaxCe: base.ce,
    bossStrength: strength,
    bossSpeed: speed,
    bossDefense: defense,
    bossIntelligence: base.intelligence,
    bossLuck: base.luck,
    bossResistances: getAurstavResistances(),
    bossRctEfficiency: AURSTAV_BASE.rctEfficiency,
    bossRctMastered: true,
    activeSummons: [],
    maxSummons: AURSTAV_BASE.dragonSoul.maxActive,
    dragonSoulCooldown: 0,
    goldManeActive: false,
    goldManeArms: 2,
    goldManeCooldown: 0,
    timeScapeCooldown: 0,
    timeScapeActive: false,
    domainActive: false,
    domainRounds: 0,
    domainDamage: 0,
    domainName: "ETERNAL SUN DRAGON PALACE",
    playerDomainActive: false,
    playerDomainRounds: 0,
    domainClashActive: false,
    domainClashMomentum: 50,
    playerStunned: false,
    playerStunTurns: 0,
    soulBurnActive: false,
    soulBurnTurns: 0,
    exhaustion: 0,
    thirstDrainActive: false,
    attackPenalty: 0,
    scaling,
    bossActionsUsed: 0,
    lastBossAction: null,
    battleFinished: false,
    victory: false,
    damageDealtByPlayers: {},
    totalDamageDealt: 0,
    totalDamageTaken: 0,
    blackFlashes: 0,
    domainClashes: 0,
    momentumSwings: 0,
    criticalMoments: 0,
    phasesReached: [phase],
    bossDialogueShown: {},
    seriousTriggered: false,
    phase2Triggered: false,
    legendaryDetected: false,
    battleId: crypto.randomUUID()
  }

  aurstavBattles.set(playerId, battle)
  aurstavBattleStates.set(playerId, {
    turnCount: 0,
    momentum: 50,
    comebackPotential: 0,
    perfectBlocks: 0,
    blackFlashes: 0,
    damageDealt: 0,
    damageTaken: 0,
    lastAction: null,
    legendary: false
  })

  return battle
}

export function getAurstavBattle(playerId) {
  return aurstavBattles.get(playerId) || null
}

export function getAurstavBattleState(playerId) {
  return aurstavBattleStates.get(playerId) || null
}

export function getAllActiveAurstavBattles() {
  const results = []
  for (const [playerId, battle] of aurstavBattles) {
    if (!battle.battleFinished) {
      results.push({ playerId, battle })
    }
  }
  return results
}

export function getRaidMembers() {
  return raidMembers
}

export function addRaidMember(playerId, playerName, battle) {
  if (!battle.raidMembers) battle.raidMembers = []
  const existing = battle.raidMembers.find(m => m.playerId === playerId)
  if (!existing) {
    battle.raidMembers.push({ playerId, playerName, hp: 0, maxHp: 0, ce: 0, maxCe: 0, alive: true, joinedAt: Date.now() })
  }
  raidMembers.set(playerId, battle.playerId)
}

export function removeRaidMember(playerId) {
  raidMembers.delete(playerId)
}

export function getRaidBattleForPlayer(playerId) {
  const hostId = raidMembers.get(playerId)
  if (hostId) {
    const battle = aurstavBattles.get(hostId)
    if (battle && battle.isRaid && !battle.battleFinished) {
      return { hostId, battle }
    }
  }
  return null
}

export function clearAurstavBattle(playerId) {
  aurstavBattles.delete(playerId)
  aurstavBattleStates.delete(playerId)
  aurstavSummons.delete(playerId)
  aurstavCooldowns.delete(playerId)
  aurstavSnapshots.delete(playerId)
  raidMembers.delete(playerId)
}

export function getAurstavSummons(playerId) {
  return aurstavSummons.get(playerId) || []
}

export function setAurstavSummons(playerId, summons) {
  aurstavSummons.set(playerId, summons)
}

export function getAurstavCooldowns(playerId) {
  return aurstavCooldowns.get(playerId) || { timeScape: 0, dragonSoul: 0, goldMane: 0 }
}

export function setAurstavCooldowns(playerId, cooldowns) {
  aurstavCooldowns.set(playerId, cooldowns)
}

export function saveTimeScapeSnapshot(playerId, snapshot) {
  aurstavSnapshots.set(playerId, snapshot)
}

export function getTimeScapeSnapshot(playerId) {
  return aurstavSnapshots.get(playerId) || null
}

export function clearTimeScapeSnapshot(playerId) {
  aurstavSnapshots.delete(playerId)
}

export async function isAurstavPermanentlyDead() {
  const state = await getAurstavState()
  return state.permanentlyDead === true
}

export async function recordLegendaryBattle(record) {
  await recordAurstavLegendaryBattle(record)
}

export function calculateDamageResistance(baseResistance, playerCe, playerLuck, bossIntelligence, battleMomentum) {
  const ceFactor = 1 - (baseResistance * 0.5)
  const luckFactor = 1 - (Math.min(250, playerLuck || 0) / 250) * 0.3
  const intFactor = 1 - (Math.min(10000, bossIntelligence || 0) / 10000) * 0.2
  const momentumFactor = 1 - (battleMomentum || 50) / 200
  return Math.max(0.1, baseResistance * ceFactor * luckFactor * intFactor * momentumFactor)
}

export function calculateGoldFlameCeBurn(attackCe, flameStrength, playerResistance, battleMomentum) {
  const baseBurn = attackCe * (flameStrength / 10000) * (1 - playerResistance)
  const momentumBonus = 1 + (battleMomentum || 50) / 200
  return Math.floor(baseBurn * momentumBonus)
}

export function calculateSoulBurnEffect(playerRctMastery, bossIntelligence, duration) {
  const rctResistance = playerRctMastery ? 0.3 : 0.1
  const intFactor = bossIntelligence / 10000
  return {
    hpRecoveryReduction: Math.min(0.8, rctResistance + intFactor * 0.5),
    rctEfficiencyReduction: Math.min(0.7, rctResistance + intFactor * 0.4),
    staminaDrainMultiplier: 1 + intFactor * 2,
    duration
  }
}

export function calculateTimeScapeRestore(snapshot, current) {
  return {
    bossHp: snapshot.bossHp,
    bossCe: snapshot.bossCe,
    activeSummons: snapshot.activeSummons,
    statusEffects: snapshot.statusEffects,
    domainRounds: snapshot.domainRounds,
    playerDomainRounds: snapshot.playerDomainRounds,
    round: snapshot.round
  }
}

export function calculateDomainClashMomentum(playerDomainMastery, playerCe, playerIntelligence, playerMomentum, bossDomainPower) {
  const playerScore = (playerDomainMastery || 50) * 0.4 + (playerCe || 0) / 500 + (playerIntelligence || 0) / 200 + (playerMomentum || 50) * 0.3
  const bossScore = bossDomainPower + 50
  const total = playerScore + bossScore
  if (total <= 0) return 50
  return Math.max(10, Math.min(90, Math.floor((playerScore / total) * 100)))
}

export function calculateRctBrainRecoveryChance(rctMastery, ceAvailable, playerCondition, battleMomentum) {
  const masteryBonus = (rctMastery || 0) * 0.3
  const ceBonus = Math.min(30, (ceAvailable || 0) / 100)
  const conditionBonus = playerCondition > 0.5 ? 20 : 10
  const momentumBonus = (battleMomentum || 50) / 5
  return Math.min(95, Math.max(5, 10 + masteryBonus + ceBonus + conditionBonus + momentumBonus))
}

export function calculateRaidScaling(raidSize) {
  const scaling = AURSTAV_BASE.raidScaling[Math.min(raidSize, 8)] || AURSTAV_BASE.raidScaling[8]
  return scaling
}

export function checkLegendaryBattle(battleState, battle) {
  if (battleState.legendary) return true
  const rounds = battleState.turnCount || 0
  const damageDealt = battleState.damageDealt || 0
  const damageTaken = battleState.damageTaken || 0
  const blackFlashes = battleState.blackFlashes || 0
  const momentum = battleState.momentum || 50

  if (rounds >= 20 && damageDealt >= 50000 && blackFlashes >= 3 && battle.bossHp < battle.bossMaxHp * 0.3) {
    return true
  }
  if (rounds >= 15 && damageDealt >= 80000 && battle.bossHp < battle.bossMaxHp * 0.2) {
    return true
  }
  if (battle.isRaid && rounds >= 25 && damageDealt >= 100000 && battle.bossHp < battle.bossMaxHp * 0.25) {
    return true
  }
  return false
}

export function buildLegendaryRecord(playerId, playerName, battle, victory) {
  const state = aurstavBattleStates.get(playerId) || {}
  return {
    battleId: battle.battleId,
    playerId,
    playerName,
    bossId: "aurstav",
    rounds: state.turnCount || 0,
    damageDealt: state.damageDealt || 0,
    damageTaken: state.damageTaken || 0,
    blackFlashes: state.blackFlashes || 0,
    domainClashes: battle.domainClashes || 0,
    momentumSwings: battle.momentumSwings || 0,
    phasesReached: battle.phasesReached || [1],
    result: victory ? "victory" : "defeat",
    timestamp: Date.now(),
    legendary: true,
    isRaid: battle.isRaid || false,
    raidMembers: battle.isRaid ? (battle.raidMembers || []).map(m => m.playerName) : []
  }
}

export function selectDragonLongBladeWinner(battle) {
  const eligible = (battle.raidMembers || []).filter(m => {
    const dmg = battle.damageDealtByPlayers[m.playerId] || 0
    return dmg >= 10000 && m.alive
  })

  if (eligible.length === 0) {
    const solo = battle.raidMembers?.[0]
    if (solo && (battle.damageDealtByPlayers[solo.playerId] || 0) > 0) {
      return solo
    }
    return null
  }

  eligible.sort((a, b) => (battle.damageDealtByPlayers[b.playerId] || 0) - (battle.damageDealtByPlayers[a.playerId] || 0))
  return eligible[0]
}
