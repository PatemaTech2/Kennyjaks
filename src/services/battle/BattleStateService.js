export const BATTLE_PHASE = {
  OPENING: "opening",
  TESTING: "testing",
  RECOGNITION: "recognition",
  ESCALATION: "escalation",
  RIVALRY: "rivalry",
  DESPERATION: "desperation",
  FINAL_EXCHANGE: "final_exchange",
  LEGENDARY: "legendary",
  NORMAL: "normal"
}

export const EMOTIONAL_STATE = {
  CALM: "calm",
  CONFIDENT: "confident",
  AMUSED: "amused",
  IMPRESSED: "impressed",
  FRUSTRATED: "frustrated",
  ANGRY: "angry",
  DESPERATE: "desperate",
  TERRIFIED: "terrified",
  RESPECTFUL: "respectful",
  BATTLE_OBSESSED: "battle_obsessed"
}

export const BATTLE_HYPE = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  LEGENDARY: "legendary"
}

export function createBattleState() {
  return {
    momentum: 50,
    comebackPotential: 0,
    clutchReady: false,
    clutchTriggered: false,
    perfectBlockReady: false,
    perfectBlockTriggered: false,
    counterWindow: false,
    phase: BATTLE_PHASE.OPENING,
    turnCount: 0,
    combo: 0,
    lastAction: null,
    pressureTurns: 0,
    comebackTurns: 0,
    perfectBlocks: 0,
    blackFlashes: 0,
    dodges: 0,
    counters: 0,
    damageDealt: 0,
    damageTaken: 0,
    startTime: Date.now(),
    playerPattern: [],
    cursePattern: [],
    legendary: false,
    battleRecord: null,

    hype: 0,
    emotionalState: EMOTIONAL_STATE.CALM,
    curseEmotionalState: EMOTIONAL_STATE.CALM,
    rivalryLevel: 0,
    playerRespectGained: 0,
    curseRespectGained: 0,
    lastMajorEvent: null,
    lastDialogue: null,
    dialogueCooldown: 0,
    awakeningTriggered: false,
    closeCalls: 0,
    momentumSwings: 0,
    lastMomentum: 50,
    techniqueReveals: [],
    domainClashes: 0,
    tauntCount: 0,
    playerTaunted: false,
    curseTaunted: false,
    battleStory: [],
    location: null,
    environmentEvents: []
  }
}

export function clamp(value, min, max) {
  if (Number.isNaN(value)) return min
  return Math.max(min, Math.min(max, value))
}

export function updatePhase(state, playerHp, playerMaxHp, curseHp, curseMaxHp) {
  const hpRatio = playerMaxHp > 0 ? playerHp / playerMaxHp : 1
  const curseHpRatio = curseMaxHp > 0 ? curseHp / curseMaxHp : 1
  if (state.legendary) return BATTLE_PHASE.LEGENDARY
  if (state.phase === BATTLE_PHASE.FINAL_EXCHANGE) return BATTLE_PHASE.FINAL_EXCHANGE
  if (state.phase === BATTLE_PHASE.DESPERATION) return BATTLE_PHASE.DESPERATION
  if (state.phase === BATTLE_PHASE.RIVALRY) return BATTLE_PHASE.RIVALRY
  if (state.phase === BATTLE_PHASE.ESCALATION) return BATTLE_PHASE.ESCALATION
  if (state.phase === BATTLE_PHASE.RECOGNITION) return BATTLE_PHASE.RECOGNITION

  if (state.turnCount >= 12 && state.hype >= 70 && state.rivalryLevel >= 30) {
    return BATTLE_PHASE.FINAL_EXCHANGE
  }
  if (state.turnCount >= 8 && state.hype >= 50 && state.rivalryLevel >= 20) {
    return BATTLE_PHASE.RIVALRY
  }
  if (state.turnCount >= 5 && (state.blackFlashes >= 1 || state.domainClashes >= 1 || state.hype >= 40)) {
    return BATTLE_PHASE.ESCALATION
  }
  if (state.turnCount >= 3 && (state.damageDealt > 0 || state.damageTaken > 0)) {
    return BATTLE_PHASE.RECOGNITION
  }
  if (state.turnCount >= 1) {
    return BATTLE_PHASE.TESTING
  }
  return BATTLE_PHASE.OPENING
}

export function adjustMomentum(state, delta) {
  const old = state.momentum
  state.momentum = clamp(state.momentum + delta, 0, 100)
  if (Math.abs(state.momentum - old) >= 15) {
    state.momentumSwings += 1
  }
}

export function registerPlayerAction(state, action) {
  state.lastAction = action
  state.playerPattern = state.playerPattern || []
  state.playerPattern.push(action)
  if (state.playerPattern.length > 20) state.playerPattern.shift()
}

export function registerCurseAction(state, action) {
  state.cursePattern = state.cursePattern || []
  state.cursePattern.push(action)
  if (state.cursePattern.length > 20) state.cursePattern.shift()
}

export function getComebackPotential(state, playerHp, playerMaxHp, playerLevel, enemyGrade, enemyHp, enemyMaxHp) {
  const hpRatio = playerMaxHp > 0 ? playerHp / playerMaxHp : 0
  const enemyHpRatio = enemyMaxHp > 0 ? enemyHp / enemyMaxHp : 0
  const gradeDiff = (enemyGrade || 4) - 0
  let potential = 20
  if (hpRatio <= 0.2) potential += 35
  if (state.pressureTurns >= 4) potential += 20
  if (state.phase === BATTLE_PHASE.CORNERED) potential += 15
  if (gradeDiff >= 2) potential += 20
  if (enemyHpRatio <= 0.3) potential += 15
  if (state.blackFlashes > 0) potential += 10
  if (state.perfectBlocks > 0) potential += 10
  return clamp(potential + (playerLevel || 1) * 0.2, 0, 100)
}

export function isLegendary(state, playerHp, playerMaxHp, enemyGrade, enemyLevel, playerGrade) {
  if (!state || state.legendary) return false
  if (playerHp <= 0) return false
  const hpRatio = playerMaxHp > 0 ? playerHp / playerMaxHp : 0
  const gradeDiff = (enemyGrade || 4) - (playerGrade || 4)
  const survived = hpRatio <= 0.2 && gradeDiff >= 1
  const clutch = state.perfectBlocks >= 3 && state.blackFlashes >= 1 && hpRatio <= 0.15
  return survived || clutch
}

export function buildLegendaryRecord(state, player, curse, victory) {
  if (!state) return null
  const playerGrade = player.grade !== undefined ? player.grade : 4
  return {
    playerId: player.playerId,
    playerName: player.name,
    playerGrade,
    playerLevel: player.level,
    enemyName: curse.name,
    enemyGrade: curse.grade,
    victory,
    rounds: state.turnCount,
    finalHp: player.health,
    blackFlashes: state.blackFlashes,
    perfectBlocks: state.perfectBlocks,
    dodges: state.dodges,
    counters: state.counters,
    damageDealt: state.damageDealt,
    damageTaken: state.damageTaken,
    hype: state.hype,
    momentumSwings: state.momentumSwings,
    location: state.location,
    phase: state.phase,
    timestamp: Date.now()
  }
}
