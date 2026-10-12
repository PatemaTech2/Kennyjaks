import { loadPlayerByPhone, savePlayer } from "../../database/playerRepo.js"
import { BattleManager } from "./BattleManager.js"
import { getBattleEngine, removeBattleEngine } from "./BattleEngine.js"
import { globalStatusEngine } from "./StatusEngine.js"
import { BindingVowService } from "../../services/technique/BindingVowService.js"
import { TechniqueMasteryService } from "../../services/technique/TechniqueMasteryService.js"
import { gradeFromLevel } from "../../services/GradeService.js"

const ALLOWED_RCT_SKILLS = ["/rct-burst", "/rct-slow"]
const ALLOWED_REVERSE_SKILLS = ["/rtu"]
const ALLOWED_WEAPON_SKILLS = ["/w", "/w1", "/w2", "/w3"]

export class BattleEngineAdapter {
  constructor(sock, remoteJid) {
    this.sock = sock
    this.remoteJid = remoteJid
  }

  async getState(player) {
    const battle = BattleManager.getActiveBattle(player.playerId)
    if (!battle) return null

    const opponent = BattleManager.getOpponent(battle, player)
    const isPvP = battle.type === "PVP"

    return {
      playerId: player.playerId,
      type: battle.type,
      opponent,
      isPvP,
      turn: battle.turn || "player",
      playerHp: player.health,
      playerCe: player.cursedEnergy,
      opponentHp: opponent ? (opponent.hp || opponent.health || 0) : 0,
      skillCooldowns: {},
      log: [],
      escaped: false,
      finished: false,
      victory: false,
      createdAt: Date.now()
    }
  }

  async attack(player) {
    return await executeBattleAction(player, "attack", {}, null)
  }

  async block(player) {
    return await executeBattleAction(player, "block", {}, null)
  }

  async dodge(player) {
    return await executeBattleAction(player, "dodge", {}, null)
  }

  async counter(player) {
    return await executeBattleAction(player, "counter", {}, null)
  }

  async taunt(player) {
    return await executeBattleAction(player, "taunt", {}, null)
  }

  async flee(player) {
    const battle = BattleManager.getActiveBattle(player.playerId)
    if (!battle) return { error: "No active battle" }

    const battleId = getStableBattleId(battle, player)
    const engine = getBattleEngine(battleId)

    if (!engine.state || engine.battleId !== battleId) {
      engine.init(battleId, "NORMAL")
      const participant = adaptPlayerToParticipant(player, battle, engine)
      engine.registerParticipant(participant)
      if (battle.type === "CURSE") {
        const opponent = BattleManager.getOpponent(battle, player)
        if (opponent) {
          const opponentParticipant = adaptPlayerToParticipant(opponent, battle, engine)
          engine.registerParticipant(opponentParticipant)
        }
      }
    } else {
      const existing = engine.participants.get(String(player.playerId))
      if (!existing) {
        const participant = adaptPlayerToParticipant(player, battle, engine)
        engine.registerParticipant(participant)
      }
    }

    const existingAction = engine.pendingActions.get(String(player.playerId))
    if (existingAction) {
      return { error: "Your action for this round is already locked." }
    }

    if (battle.type === "PVP") {
      const currentTurn = BattleManager.getCurrentTurn(battle)
      if (currentTurn !== String(player.playerId)) {
        const opponent = BattleManager.getOpponent(battle, player)
        const opponentName = (opponent && opponent.name) || "your opponent"
        return {
          success: true,
          finished: false,
          waitingForOpponent: true,
          narration: `⏳ Your move has been locked in.\n\nWaiting for ${opponentName}...`
        }
      }
    }

    syncPlayersToEngine(engine, player, null)

    engine.submitAction(String(player.playerId), "flee", {})
    const resolved = await engine.resolveRound()
    syncEngineToPlayers(engine, resolved, player, null)

    const roundNumber = (battle.round || 0) + 1
    battle.round = roundNumber

    const narration = resolved.narration || `Round ${roundNumber} resolved.`

    let finished = false
    const fled = resolved.participants.find(p => p.id === String(player.playerId))?.fled || false
    if (fled || resolved.finished) {
      finished = true
      battle.finished = true

      if (battle.type === "GROUP_CURSE") {
        await BattleManager.endGroupCurseBattle(player.playerId, false)
      }
    } else if (battle.type === "PVP") {
      BattleManager.switchTurn(battle)
    }

    if (finished) {
      removeBattleEngine(battleId)
    }

    const summary = finished ? buildBattleSummary(engine, player, null, resolved) : null
    const finalNarration = summary ? `${narration}\n\n${summary}` : narration

    return {
      success: true,
      finished,
      victory: false,
      narration: finalNarration,
      round: roundNumber,
      summary
    }
  }

  async rct(player) {
    const battle = BattleManager.getActiveBattle(player.playerId)
    if (!battle) return { error: "No active battle" }

    const battleId = getStableBattleId(battle, player)
    const engine = getBattleEngine(battleId)

    if (!engine.state || engine.battleId !== battleId) {
      return { error: "Battle not initialized" }
    }

    const existingParticipant = engine.participants.get(String(player.playerId))
    if (!existingParticipant) {
      return { error: "Participant not found in battle" }
    }

    const existingAction = engine.pendingActions.get(String(player.playerId))
    if (existingAction) {
      return { error: "Your action for this round is already locked." }
    }

    if (battle.type === "PVP") {
      const currentTurn = BattleManager.getCurrentTurn(battle)
      if (currentTurn !== String(player.playerId)) {
        const opponent = BattleManager.getOpponent(battle, player)
        const opponentName = (opponent && opponent.name) || "your opponent"
        return {
          success: true,
          finished: false,
          waitingForOpponent: true,
          narration: `⏳ Your move has been locked in.\n\nWaiting for ${opponentName}...`
        }
      }
    }

    const opponent = BattleManager.getOpponent(battle, player)
    const opponentParticipant = opponent ? engine.participants.get(String(opponent.id || opponent.playerId)) : null

    syncPlayersToEngine(engine, player, opponent)

    engine.submitAction(String(player.playerId), "rct", {})

    if (battle.type !== "PVP") {
      const aiAction = await determineAiAction(battle, player, opponent)
      const opponentId = opponentParticipant ? String(opponentParticipant.id) : null
      const submitted = submitOpponentAction(engine, opponentParticipant, aiAction)
      if (!submitted && opponentParticipant && opponentId) {
        engine.submitAction(opponentId, "attack", {})
      }
    }

    const resolved = await engine.resolveRound()
    syncEngineToPlayers(engine, resolved, player, opponent)

    const roundNumber = (battle.round || 0) + 1
    battle.round = roundNumber

    const narration = resolved.narration || `Round ${roundNumber} resolved.`

    let finished = false
    let victory = false

    if (resolved.finished) {
      finished = true
      battle.finished = true
      victory = resolved.winnerId && String(resolved.winnerId) === String(player.playerId)
      battle.winnerId = resolved.winnerId
      battle.loserId = resolved.loserId

      if (battle.type === "GROUP_CURSE") {
        await BattleManager.endGroupCurseBattle(player.playerId, victory)
      }
    } else if (battle.type === "PVP") {
      BattleManager.switchTurn(battle)
    }

    if (finished) {
      removeBattleEngine(battleId)
    }

    const summary = finished ? buildBattleSummary(engine, player, opponent, resolved) : null
    const finalNarration = summary ? `${narration}\n\n${summary}` : narration

    return {
      success: true,
      finished,
      victory,
      narration: finalNarration,
      round: roundNumber,
      summary
    }
  }

  async reverse(player) {
    const battle = BattleManager.getActiveBattle(player.playerId)
    if (!battle) return { error: "No active battle" }

    const battleId = getStableBattleId(battle, player)
    const engine = getBattleEngine(battleId)

    if (!engine.state || engine.battleId !== battleId) {
      return { error: "Battle not initialized" }
    }

    const existingParticipant = engine.participants.get(String(player.playerId))
    if (!existingParticipant) {
      return { error: "Participant not found in battle" }
    }

    const existingAction = engine.pendingActions.get(String(player.playerId))
    if (existingAction) {
      return { error: "Your action for this round is already locked." }
    }

    if (battle.type === "PVP") {
      const currentTurn = BattleManager.getCurrentTurn(battle)
      if (currentTurn !== String(player.playerId)) {
        const opponent = BattleManager.getOpponent(battle, player)
        const opponentName = (opponent && opponent.name) || "your opponent"
        return {
          success: true,
          finished: false,
          waitingForOpponent: true,
          narration: `⏳ Your move has been locked in.\n\nWaiting for ${opponentName}...`
        }
      }
    }

    const opponent = BattleManager.getOpponent(battle, player)
    const opponentParticipant = opponent ? engine.participants.get(String(opponent.id || opponent.playerId)) : null

    syncPlayersToEngine(engine, player, opponent)

    engine.submitAction(String(player.playerId), "reverse", {})

    if (battle.type !== "PVP") {
      const aiAction = await determineAiAction(battle, player, opponent)
      const opponentId = opponentParticipant ? String(opponentParticipant.id) : null
      const submitted = submitOpponentAction(engine, opponentParticipant, aiAction)
      if (!submitted && opponentParticipant && opponentId) {
        engine.submitAction(opponentId, "attack", {})
      }
    }

    const resolved = await engine.resolveRound()
    syncEngineToPlayers(engine, resolved, player, opponent)

    const roundNumber = (battle.round || 0) + 1
    battle.round = roundNumber

    const narration = resolved.narration || `Round ${roundNumber} resolved.`

    let finished = false
    let victory = false

    if (resolved.finished) {
      finished = true
      battle.finished = true
      victory = resolved.winnerId && String(resolved.winnerId) === String(player.playerId)
      battle.winnerId = resolved.winnerId
      battle.loserId = resolved.loserId

      if (battle.type === "GROUP_CURSE") {
        await BattleManager.endGroupCurseBattle(player.playerId, victory)
      }
    } else if (battle.type === "PVP") {
      BattleManager.switchTurn(battle)
    }

    if (finished) {
      removeBattleEngine(battleId)
    }

    const summary = finished ? buildBattleSummary(engine, player, opponent, resolved) : null
    const finalNarration = summary ? `${narration}\n\n${summary}` : narration

    return {
      success: true,
      finished,
      victory,
      narration: finalNarration,
      round: roundNumber,
      summary
    }
  }

  async useSkill(player, skillIndex, vows = []) {
    const battle = BattleManager.getActiveBattle(player.playerId)
    if (!battle) return { error: "No active battle" }

    const skills = (player.technique && player.technique.unlockedSkills) || []
    if (skillIndex < 0 || skillIndex >= skills.length) {
      return { error: "Skill not unlocked." }
    }

    const battleId = getStableBattleId(battle, player)
    const engine = getBattleEngine(battleId)

    if (!engine.state || engine.battleId !== battleId) {
      engine.init(battleId, "NORMAL")
      const opponent = BattleManager.getOpponent(battle, player)
      const opponentParticipant = opponent ? adaptPlayerToParticipant(opponent, battle, engine) : null
      const participant = adaptPlayerToParticipant(player, battle, engine)

      engine.registerParticipant(participant)
      if (opponentParticipant) {
        engine.registerParticipant(opponentParticipant)
      }
    } else {
      const existingParticipant = engine.participants.get(String(player.playerId))
      if (!existingParticipant) {
        const participant = adaptPlayerToParticipant(player, battle, engine)
        engine.registerParticipant(participant)
      }

      const petParticipant = ensurePetRegistered(engine, player, battle)
      if (petParticipant) {
        engine.registerParticipant(petParticipant)
      }
    }

    const existingAction = engine.pendingActions.get(String(player.playerId))
    if (existingAction) {
      return { error: "Your action for this round is already locked." }
    }

    const opponent = BattleManager.getOpponent(battle, player)
    const opponentParticipant = opponent ? engine.participants.get(String(opponent.id || opponent.playerId)) : null

    syncPlayersToEngine(engine, player, opponent)

    const skillId = skills[skillIndex]
    engine.submitAction(String(player.playerId), "skill", { skillId, skillIndex, vows })

    if (battle.type === "PVP") {
      const currentTurn = BattleManager.getCurrentTurn(battle)
      if (currentTurn !== String(player.playerId)) {
        const opponentName = (opponent && opponent.name) || "your opponent"
        return {
          success: true,
          finished: false,
          waitingForOpponent: true,
          narration: `⏳ Your move has been locked in.\n\nWaiting for ${opponentName}...`
        }
      }
    } else {
      const aiAction = await determineAiAction(battle, player, opponent)
      const opponentId = opponentParticipant ? String(opponentParticipant.id) : null
      const submitted = submitOpponentAction(engine, opponentParticipant, aiAction)
      if (!submitted && opponentParticipant && opponentId) {
        engine.submitAction(opponentId, "attack", {})
      }
    }

    const resolved = await engine.resolveRound()
    syncEngineToPlayers(engine, resolved, player, opponent)

    const roundNumber = (battle.round || 0) + 1
    battle.round = roundNumber

    const narration = resolved.narration || `Round ${roundNumber} resolved.`

    let finished = false
    let victory = false

    if (resolved.finished) {
      finished = true
      battle.finished = true
      victory = resolved.winnerId && String(resolved.winnerId) === String(player.playerId)
      battle.winnerId = resolved.winnerId
      battle.loserId = resolved.loserId
    }

    if (finished) {
      removeBattleEngine(battleId)
    }

    const summary = finished ? buildBattleSummary(engine, player, opponent, resolved) : null
    const finalNarration = summary ? `${narration}\n\n${summary}` : narration

    return {
      success: true,
      finished,
      victory,
      narration: finalNarration,
      round: roundNumber,
      summary
    }
  }

  async useWeaponSkill(player, skillNum) {
    const battle = BattleManager.getActiveBattle(player.playerId)
    if (!battle) return { error: "No active battle" }

    const battleId = getStableBattleId(battle, player)
    const engine = getBattleEngine(battleId)

    if (!engine.state || engine.battleId !== battleId) {
      engine.init(battleId, "NORMAL")
      const opponent = BattleManager.getOpponent(battle, player)
      const opponentParticipant = opponent ? adaptPlayerToParticipant(opponent, battle, engine) : null
      const participant = adaptPlayerToParticipant(player, battle, engine)

      engine.registerParticipant(participant)
      if (opponentParticipant) {
        engine.registerParticipant(opponentParticipant)
      }
    } else {
      const existingParticipant = engine.participants.get(String(player.playerId))
      if (!existingParticipant) {
        const participant = adaptPlayerToParticipant(player, battle, engine)
        engine.registerParticipant(participant)
      }

      const petParticipant = ensurePetRegistered(engine, player, battle)
      if (petParticipant) {
        engine.registerParticipant(petParticipant)
      }
    }

    const existingAction = engine.pendingActions.get(String(player.playerId))
    if (existingAction) {
      return { error: "Your action for this round is already locked." }
    }

    if (battle.type === "PVP") {
      const currentTurn = BattleManager.getCurrentTurn(battle)
      if (currentTurn !== String(player.playerId)) {
        const opponent = BattleManager.getOpponent(battle, player)
        const opponentName = (opponent && opponent.name) || "your opponent"
        return {
          success: true,
          finished: false,
          waitingForOpponent: true,
          narration: `⏳ Your move has been locked in.\n\nWaiting for ${opponentName}...`
        }
      }
    }

    const opponent = BattleManager.getOpponent(battle, player)
    const opponentParticipant = opponent ? engine.participants.get(String(opponent.id || opponent.playerId)) : null

    syncPlayersToEngine(engine, player, opponent)

    engine.submitAction(String(player.playerId), "weapon", { skillNum })

    if (battle.type !== "PVP") {
      const aiAction = await determineAiAction(battle, player, opponent)
      const opponentId = opponentParticipant ? String(opponentParticipant.id) : null
      const submitted = submitOpponentAction(engine, opponentParticipant, aiAction)
      if (!submitted && opponentParticipant && opponentId) {
        engine.submitAction(opponentId, "attack", {})
      }
    }

    const resolved = await engine.resolveRound()
    syncEngineToPlayers(engine, resolved, player, opponent)

    const roundNumber = (battle.round || 0) + 1
    battle.round = roundNumber

    const narration = resolved.narration || `Round ${roundNumber} resolved.`

    let finished = false
    let victory = false

    if (resolved.finished) {
      finished = true
      battle.finished = true
      victory = resolved.winnerId && String(resolved.winnerId) === String(player.playerId)
      battle.winnerId = resolved.winnerId
      battle.loserId = resolved.loserId

      if (battle.type === "GROUP_CURSE") {
        await BattleManager.endGroupCurseBattle(player.playerId, victory)
      }
    } else if (battle.type === "PVP") {
      BattleManager.switchTurn(battle)
    }

    if (finished) {
      removeBattleEngine(battleId)
    }

    return {
      success: true,
      finished,
      victory,
      narration,
      round: roundNumber
    }
  }

  async domain(player) {
    const battle = BattleManager.getActiveBattle(player.playerId)
    if (!battle) return { error: "No active battle" }

    const battleId = getStableBattleId(battle, player)
    const engine = getBattleEngine(battleId)

    if (!engine.state || engine.battleId !== battleId) {
      return { error: "Battle not initialized" }
    }

    const existingParticipant = engine.participants.get(String(player.playerId))
    if (!existingParticipant) {
      return { error: "Participant not found in battle" }
    }

    const existingAction = engine.pendingActions.get(String(player.playerId))
    if (existingAction) {
      return { error: "Your action for this round is already locked." }
    }

    if (battle.type === "PVP") {
      const currentTurn = BattleManager.getCurrentTurn(battle)
      if (currentTurn !== String(player.playerId)) {
        const opponent = BattleManager.getOpponent(battle, player)
        const opponentName = (opponent && opponent.name) || "your opponent"
        return {
          success: true,
          finished: false,
          waitingForOpponent: true,
          narration: `⏳ Your move has been locked in.\n\nWaiting for ${opponentName}...`
        }
      }
    }

    const opponent = BattleManager.getOpponent(battle, player)
    const opponentParticipant = opponent ? engine.participants.get(String(opponent.id || opponent.playerId)) : null

    syncPlayersToEngine(engine, player, opponent)

    engine.submitAction(String(player.playerId), "domain", {})

    if (battle.type !== "PVP") {
      const aiAction = await determineAiAction(battle, player, opponent)
      const opponentId = opponentParticipant ? String(opponentParticipant.id) : null
      const submitted = submitOpponentAction(engine, opponentParticipant, aiAction)
      if (!submitted && opponentParticipant && opponentId) {
        engine.submitAction(opponentId, "attack", {})
      }
    }

    const resolved = await engine.resolveRound()
    syncEngineToPlayers(engine, resolved, player, opponent)

    const roundNumber = (battle.round || 0) + 1
    battle.round = roundNumber

    const narration = resolved.narration || `Round ${roundNumber} resolved.`

    let finished = false
    let victory = false

    if (resolved.finished) {
      finished = true
      battle.finished = true
      victory = resolved.winnerId && String(resolved.winnerId) === String(player.playerId)
      battle.winnerId = resolved.winnerId
      battle.loserId = resolved.loserId

      if (battle.type === "GROUP_CURSE") {
        await BattleManager.endGroupCurseBattle(player.playerId, victory)
      }
    } else if (battle.type === "PVP") {
      BattleManager.switchTurn(battle)
    }

    if (finished) {
      removeBattleEngine(battleId)
    }

    const summary = finished ? buildBattleSummary(engine, player, opponent, resolved) : null
    const finalNarration = summary ? `${narration}\n\n${summary}` : narration

    return {
      success: true,
      finished,
      victory,
      narration: finalNarration,
      round: roundNumber,
      summary
    }
  }
}

function buildBattleSummary(engine, player, opponent, resolved) {
  const lines = []
  const winnerId = resolved.winnerId
  const loserId = resolved.loserId
  const isVictory = String(winnerId) === String(player.playerId)

  lines.push("━━━ BATTLE COMPLETE ━━━")
  lines.push("")
  lines.push(isVictory ? "🏆 VICTORY" : "💀 DEFEAT")
  lines.push("")
  lines.push(`Rounds: ${engine.state.round || 1}`)

  const playerParticipant = resolved.participants.find(p => String(p.id) === String(player.playerId))
  if (playerParticipant) {
    const hpLeft = Math.max(0, playerParticipant.currentHp || 0)
    const hpMax = playerParticipant.maxHp || 1
    lines.push(`Your HP: ${hpLeft} / ${hpMax} (${Math.floor((hpLeft / hpMax) * 100)}%)`)
  }

  if (opponent) {
    const opponentId = String(opponent.id || opponent.playerId)
    const opponentParticipant = resolved.participants.find(p => String(p.id) === opponentId)
    if (opponentParticipant) {
      const hpLeft = Math.max(0, opponentParticipant.currentHp || 0)
      const hpMax = opponentParticipant.maxHp || 1
      lines.push(`Opponent HP: ${hpLeft} / ${hpMax}`)
    }
  }

  if (engine.state.blackFlashTriggered) {
    lines.push("")
    lines.push("✨ BLACK FLASH landed!")
  }
  if (engine.state.peakMoment) {
    lines.push(`⭐ Peak Moment: ${engine.state.peakMoment}`)
  }

  return lines.join("\n")
}

async function executeBattleAction(player, actionType, params, special) {
  const battle = BattleManager.getActiveBattle(player.playerId)
  if (!battle) return { error: "No active battle" }

  const battleId = getStableBattleId(battle, player)
  const engine = getBattleEngine(battleId)

  if (!engine.initialized || engine.battleId !== battleId) {
    engine.init(battleId, "NORMAL")
    const opponent = BattleManager.getOpponent(battle, player)
    const opponentParticipant = opponent ? adaptPlayerToParticipant(opponent, battle, engine) : null
    const participant = adaptPlayerToParticipant(player, battle, engine)

    engine.registerParticipant(participant)
    if (opponentParticipant) {
      engine.registerParticipant(opponentParticipant)
    }
  } else {
    const existingParticipant = engine.participants.get(String(player.playerId))
    if (!existingParticipant) {
      const participant = adaptPlayerToParticipant(player, battle, engine)
      engine.registerParticipant(participant)
    }

    const petParticipant = ensurePetRegistered(engine, player, battle)
    if (petParticipant) {
      engine.registerParticipant(petParticipant)
    }
  }

  const existingAction = engine.pendingActions.get(String(player.playerId))
  if (existingAction) {
    return { error: "Your action for this round is already locked." }
  }

  const opponent = BattleManager.getOpponent(battle, player)
  const opponentParticipant = opponent ? engine.participants.get(String(opponent.id || opponent.playerId)) : null

  syncPlayersToEngine(engine, player, opponent)

  engine.submitAction(String(player.playerId), actionType, params)

  if (battle.type === "PVP") {
    const currentTurn = BattleManager.getCurrentTurn(battle)
    if (currentTurn !== String(player.playerId)) {
      const opponentName = (opponent && opponent.name) || "your opponent"
      return {
        success: true,
        finished: false,
        waitingForOpponent: true,
        narration: `⏳ Your move has been locked in.\n\nWaiting for ${opponentName}...`
      }
    }
  } else {
    const aiAction = await determineAiAction(battle, player, opponent)
    const opponentId = opponentParticipant ? String(opponentParticipant.id) : null
    const submitted = submitOpponentAction(engine, opponentParticipant, aiAction)
    if (!submitted && opponentParticipant && opponentId) {
      engine.submitAction(opponentId, "attack", {})
    }
  }

  const resolved = await engine.resolveRound()
  syncEngineToPlayers(engine, resolved, player, opponent)

  const roundNumber = (battle.round || 0) + 1
  battle.round = roundNumber

  const narration = resolved.narration || `Round ${roundNumber} resolved.`

  let finished = false
  let victory = false

  if (resolved.finished) {
    finished = true
    battle.finished = true
    victory = resolved.winnerId && String(resolved.winnerId) === String(player.playerId)
    battle.winnerId = resolved.winnerId
    battle.loserId = resolved.loserId

    if (battle.type === "GROUP_CURSE") {
      await BattleManager.endGroupCurseBattle(player.playerId, victory)
    }
  } else if (battle.type === "PVP" || battle.type === "GROUP_CURSE") {
    BattleManager.switchTurn(battle)
  }

  if (finished) {
    removeBattleEngine(battleId)
  }

  return {
    success: true,
    finished,
    victory,
    narration,
    round: roundNumber
  }
}

function getStableBattleId(battle, player) {
  if (battle.id) return String(battle.id)
  if (battle.type === "CURSE") {
    return `curse:${String(player.playerId)}`
  }
  if (battle.type === "GROUP_CURSE") {
    return battle.id
  }
  if (battle.type === "PVP" && battle.battle && battle.battle.id) {
    return String(battle.battle.id)
  }
  if (battle.battleId) return String(battle.battleId)
  return `battle:${String(player.playerId)}:${Date.now()}`
}

function syncEngineToPlayers(engine, resolved, player, opponent) {
  if (!resolved || !resolved.participants) return

  const playerParticipant = resolved.participants.find(p => p.id === String(player.playerId))
  if (playerParticipant) {
    player.health = Math.max(0, playerParticipant.currentHp || playerParticipant.hp || player.health || 0)
    player.cursedEnergy = Math.max(0, playerParticipant.currentCe || playerParticipant.cursedEnergy || player.cursedEnergy || 0)
  }

  if (opponent) {
    const opponentId = String(opponent.id || opponent.playerId)
    const opponentParticipant = resolved.participants.find(p => p.id === opponentId)
    if (opponentParticipant) {
      opponent.hp = Math.max(0, opponentParticipant.currentHp || opponentParticipant.hp || opponent.hp || 0)
      opponent.health = opponent.hp
      opponent.ce = Math.max(0, opponentParticipant.currentCe || opponentParticipant.cursedEnergy || opponent.ce || 0)
      opponent.cursedEnergy = opponent.ce
    }
  }
}

function syncPlayersToEngine(engine, player, opponent) {
  const playerParticipant = engine.participants.get(String(player.playerId))
  if (playerParticipant) {
    playerParticipant.currentHp = player.health || 0
    playerParticipant.hp = player.health || 0
    playerParticipant.currentCe = player.cursedEnergy || 0
    playerParticipant.cursedEnergy = player.cursedEnergy || 0
  }

  if (opponent) {
    const opponentParticipant = engine.participants.get(String(opponent.id || opponent.playerId))
    if (opponentParticipant) {
      opponentParticipant.currentHp = opponent.hp || opponent.health || 0
      opponentParticipant.hp = opponent.hp || opponent.health || 0
      opponentParticipant.currentCe = opponent.ce || opponent.cursedEnergy || 0
      opponentParticipant.cursedEnergy = opponent.ce || opponent.cursedEnergy || 0
    }
  }
}

function adaptPlayerToParticipant(player, battle, engine) {
  const teamIds = battle.teamIds || {}
  const participantId = String(player.playerId || player.id)
  const existing = engine ? engine.participants.get(participantId) : null
  const strength = player.strength || player.attack || 10
  const defense = player.defense || 10
  const speed = player.speed || 10
  const technique = player.intelligence || player.technique || player.rawTechnique || 10
  const base = {
    id: participantId,
    name: player.name || "Unknown",
    teamId: teamIds[participantId] || "A",
    maxHp: player.maxHealth || player.maxHp || 100,
    maxCe: player.maxCursedEnergy || player.maxCe || 150,
    attack: strength,
    rawStrength: strength,
    defense: defense,
    rawDefense: defense,
    speed: speed,
    rawSpeed: speed,
    technique: technique,
    rawTechnique: technique,
    critRate: player.critRate || 0,
    luck: player.luck || 10,
    techniqueControl: player.techniqueControl || 0,
    gradeValue: player.grade !== undefined ? player.grade : 4,
    potential: player.potential || 0,
    techniqueLevel: player.techniqueLevel || 0,
    hasDomain: !!(player.domains && (player.domains.unlocked || player.domains.infernalPurgatory)),
    domainCeCost: 300,
    technique: player.technique || null,
    equippedItems: player.equippedItems || {}
  }

  const isCurse = !!(player.bossAbilities || player.isCurse || (player.faction && player.faction !== "sorcerer"))
  if (isCurse && !player.bossAbilities) {
    const calibration = calibrateCurseStats(base, player)
    Object.assign(base, calibration)
  }

  if (existing) {
    return {
      ...base,
      currentHp: player.health || existing.currentHp || existing.hp || 0,
      hp: player.health || existing.currentHp || existing.hp || 0,
      currentCe: player.cursedEnergy || existing.currentCe || existing.cursedEnergy || 0,
      cursedEnergy: player.cursedEnergy || existing.currentCe || existing.cursedEnergy || 0,
      maxCursedEnergy: player.maxCursedEnergy || existing.maxCe || existing.maxCursedEnergy || 150
    }
  }

  return {
    ...base,
    currentHp: player.health || 0,
    hp: player.health || 0,
    currentCe: player.cursedEnergy || 0,
    cursedEnergy: player.cursedEnergy || 0,
    maxCursedEnergy: player.maxCursedEnergy || 150
  }
}

function calibrateCurseStats(base, curse) {
  const curseGrade = curse.grade !== undefined ? curse.grade : 4
  const playerGrade = base.gradeValue !== undefined ? base.gradeValue : 4
  const gradeDiff = playerGrade - curseGrade

  let strengthMult = 1.0
  let defenseMult = 1.0
  let speedMult = 1.0

  if (gradeDiff > 0) {
    strengthMult = 1.0 + gradeDiff * 0.15
    defenseMult = 1.0 + gradeDiff * 0.1
    speedMult = 1.0 + gradeDiff * 0.1
  } else if (gradeDiff < 0) {
    const diff = Math.abs(gradeDiff)
    strengthMult = Math.max(0.6, 1.0 - diff * 0.12)
    defenseMult = Math.max(0.6, 1.0 - diff * 0.1)
    speedMult = Math.max(0.6, 1.0 - diff * 0.1)
  }

  const baseStrength = base.attack || base.rawStrength || 10
  const baseDefense = base.defense || base.rawDefense || 10
  const baseSpeed = base.speed || base.rawSpeed || 10

  return {
    rawStrength: Math.max(1, Math.floor(baseStrength * strengthMult)),
    attack: Math.max(1, Math.floor(baseStrength * strengthMult)),
    rawDefense: Math.max(1, Math.floor(baseDefense * defenseMult)),
    defense: Math.max(1, Math.floor(baseDefense * defenseMult)),
    rawSpeed: Math.max(1, Math.floor(baseSpeed * speedMult)),
    speed: Math.max(1, Math.floor(baseSpeed * speedMult))
  }
}

// AI integration import
import { decideEnemyAction } from "../../services/ai/AIBattleIntegration.js"

async function determineAiAction(battle, player, opponent) {
  if (!opponent || battle.type === "PVP") return null

  const state = BattleManager.getNarrativeState(player.playerId)
  const playerPattern = state.playerPattern || []
  const recentPlayerActions = playerPattern.slice(-5)

  const repeatedAttack = recentPlayerActions.filter(a => a === "attack").length >= 3
  const repeatedSkill = recentPlayerActions.filter(a => a === "skill").length >= 2
  const playerBlocking = recentPlayerActions.includes("block")
  const playerDodging = recentPlayerActions.includes("dodge")
  const playerUsingRct = recentPlayerActions.includes("rct")

  const opponentHp = opponent.currentHp || opponent.hp || 0
  const opponentMaxHp = opponent.maxHp || opponent.hp || 0
  const playerHp = player.health || 0
  const playerMaxHp = player.maxHealth || 0
  const hpRatio = opponentMaxHp > 0 ? opponentHp / opponentMaxHp : 1
  const playerHpRatio = playerMaxHp > 0 ? playerHp / playerMaxHp : 1

  const personality = opponent.personality || "neutral"

  try {
    const playerMemory = await import("../../services/ai/EnemyBrain.js").then(m => new m.PlayerMemory(player.playerId))
    const context = {
      playerPattern: playerPattern,
      recentPlayerActions: recentPlayerActions,
      repeatedAttack: repeatedAttack,
      repeatedSkill: repeatedSkill,
      playerBlocking: playerBlocking,
      playerDodging: playerDodging,
      playerUsingRct: playerUsingRct,
      battleRound: battle.round || 0,
      playerMemory: playerMemory
    }

    const aiDecision = await decideEnemyAction(battle, player, opponent, context)
    
    if (aiDecision && aiDecision.type) {
      const actionType = aiDecision.type.toLowerCase()
      const validActions = ["attack", "skill", "defend", "heal", "ultimate", "flee", 
                          "block", "dodge", "counter", "heavy_attack", "taunt", "rct",
                          "domain", "reverse", "execute", "absorb"]
      
      if (validActions.includes(actionType)) {
        const params = {}
        
        // Map AI decision types to engine action types
        const actionMapping = {
          attack: "attack",
          skill: "skill",
          defend: "block",
          heal: "heal",
          ultimate: "ultimate",
          flee: "flee",
          block: "block",
          dodge: "dodge",
          counter: "counter",
          heavy_attack: "heavy_attack"
        }
        
        const engineAction = actionMapping[actionType] || "attack"
        
        // Add special params for certain actions
        if (engineAction === "heavy_attack" && aiDecision.params?.stagger) {
          params.stagger = true
        }
        if (engineAction === "skill" && aiDecision.params?.skillId) {
          params.skillId = aiDecision.params.skillId
          params.skillIndex = aiDecision.params.skillIndex
        }
        
        const result = { type: engineAction, params: params }
        
        if (aiDecision.dialogue) {
          result.dialogue = aiDecision.dialogue
          result.emotion = aiDecision.emotion || "neutral"
          result.source = aiDecision.source || "ai"
          result.brainConfidence = aiDecision.brainConfidence || 0.7
        }
        
        return result
      }
    }
  } catch (error) {
    console.error("[BATTLE_AI] AI decision failed:", error.message)
    // Fall through to heuristic
  }

  // Heuristic fallback (original logic)
  if (hpRatio < 0.15 && Math.random() < 0.3) {
    return { type: "flee", params: {} }
  }

  if (hpRatio < 0.2 && Math.random() < 0.35) {
    return { type: "block", params: {} }
  }

  if (playerHpRatio < 0.15 && Math.random() < 0.7) {
    return { type: "heavy_attack", params: {} }
  }

  if (repeatedAttack && Math.random() < 0.7) {
    return { type: "counter", params: {} }
  }

  if (repeatedSkill && Math.random() < 0.6) {
    return { type: "dodge", params: {} }
  }

  if (playerBlocking && Math.random() < 0.5) {
    return { type: "heavy_attack", params: { stagger: true } }
  }

  if (playerUsingRct && Math.random() < 0.6) {
    return { type: "attack", params: {} }
  }

  if (opponent.technique && opponent.currentCe > 15 && Math.random() < 0.5) {
    const skills = (opponent.technique && opponent.technique.unlockedSkills) || []
    if (skills.length > 0) {
      const skillIndex = Math.floor(Math.random() * skills.length)
      return { type: "skill", params: { skillId: skills[skillIndex], skillIndex } }
    }
  }

  const actions = [
    { type: "attack", weight: 60 },
    { type: "block", weight: 12 },
    { type: "dodge", weight: 10 },
    { type: "heavy_attack", weight: 12 },
    { type: "counter", weight: 5 },
    { type: "flee", weight: 1 }
  ]

  const totalWeight = actions.reduce((sum, a) => sum + a.weight, 0)
  let roll = Math.random() * totalWeight

  for (const action of actions) {
    roll -= action.weight
    if (roll <= 0) {
      return { type: action.type, params: {} }
    }
  }

  return { type: "attack", params: {} }
}

function submitOpponentAction(engine, opponent, action) {
  if (!opponent || !action) return false
  const opponentId = String(opponent.id || opponent.playerId)
  const existing = engine.pendingActions.get(opponentId)
  if (existing) return false
  engine.submitAction(opponentId, action.type, action.params || {})
  return true
}

function ensurePetRegistered(engine, player, battle) {
  const activePet = player.activePet
  if (!activePet) return null
  const petId = `pet:${String(player.playerId)}`
  const existing = engine.participants.get(petId)
  if (existing) return null
  return {
    id: petId,
    name: activePet.name || "Pet",
    teamId: "A",
    maxHp: activePet.hp || 50,
    currentHp: activePet.hp || 50,
    maxCe: activePet.ce || 30,
    currentCe: activePet.ce || 30,
    rawStrength: activePet.attack || 10,
    rawDefense: activePet.defense || 5,
    rawSpeed: activePet.speed || 10,
    rawTechnique: 5,
    gradeValue: 4,
    potential: 0,
    critRate: 0,
    luck: 5,
    technique: null,
    hasDomain: false,
    domainCeCost: 300,
    domainActive: false,
    domainRounds: 0,
    bossAbilities: null,
    isBoss: false,
    isCurse: false,
    isPet: true,
    statusEffects: [],
    defending: false,
    cooldowns: {},
    equippedItems: {}
  }
}
