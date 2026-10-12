import { loadPlayerByPhone, loadPlayerById, savePlayer } from "../../database/playerRepo.js"
import { normalizePhoneNumber } from "../../services/PermissionService.js"

export const pvpChallenges = new Map()
export const pvpBattles = new Map()
const CHALLENGE_TIMEOUT_MS = 2 * 60 * 1000

function normalizePlayerId(raw) {
  if (!raw) return null
  return String(raw).trim()
}

export function createPvpChallenge(challengerId, targetId, chatId) {
  const cId = normalizePlayerId(challengerId)
  const tId = normalizePlayerId(targetId)
  if (!cId || !tId) return null
  if (cId === tId) return null

  const existing = findPendingChallengeBetween(cId, tId)
  if (existing) return null

  const key = `${cId}:${tId}:${Date.now()}`
  const challenge = {
    id: key,
    challengerId: cId,
    targetId: tId,
    chatId: chatId || null,
    createdAt: Date.now(),
    status: "pending"
  }
  pvpChallenges.set(key, challenge)

  setTimeout(() => {
    const c = pvpChallenges.get(key)
    if (c && c.status === "pending") {
      c.status = "expired"
      pvpChallenges.delete(key)
    }
  }, CHALLENGE_TIMEOUT_MS)

  return challenge
}

export function findPendingChallengeBetween(playerA, playerB) {
  const a = normalizePlayerId(playerA)
  const b = normalizePlayerId(playerB)
  if (!a || !b) return null
  for (const [key, challenge] of pvpChallenges.entries()) {
    if (challenge.status !== "pending") continue
    if (
      (challenge.challengerId === a && challenge.targetId === b) ||
      (challenge.challengerId === b && challenge.targetId === a)
    ) {
      return { key, challenge }
    }
  }
  return null
}

export function getPendingChallengeForTarget(targetId) {
  const tId = normalizePlayerId(targetId)
  if (!tId) return null
  const now = Date.now()
  for (const [key, challenge] of pvpChallenges.entries()) {
    if (challenge.targetId === tId && challenge.status === "pending") {
      if (now - challenge.createdAt > CHALLENGE_TIMEOUT_MS) {
        challenge.status = "expired"
        pvpChallenges.delete(key)
        continue
      }
      return { key, challenge }
    }
  }
  return null
}

export function acceptPvpChallenge(key) {
  const challenge = pvpChallenges.get(key)
  if (!challenge || challenge.status !== "pending") return null
  if (Date.now() - challenge.createdAt > CHALLENGE_TIMEOUT_MS) {
    challenge.status = "expired"
    pvpChallenges.delete(key)
    return null
  }
  challenge.status = "accepted"
  pvpChallenges.delete(key)
  return challenge
}

export function declinePvpChallenge(key) {
  const challenge = pvpChallenges.get(key)
  if (!challenge || challenge.status !== "pending") return null
  challenge.status = "declined"
  pvpChallenges.delete(key)
  return challenge
}

  export function startPvPBattle(challengerId, targetId, chatId, options = {}) {
    const cId = normalizePlayerId(challengerId)
    const tId = normalizePlayerId(targetId)
    if (!cId || !tId) return null

    const battleId = `pvp:${cId}:${tId}:${Date.now()}`
    const battle = {
      id: battleId,
      type: "PVP",
      mode: options.mode || "1v1",
      playerIds: [cId, tId],
      teamIds: options.teamIds || { [cId]: "A", [tId]: "B" },
      turn: null,
      playerActions: {},
      statusEffects: {},
      startedAt: Date.now(),
      finished: false,
      winnerId: null,
      loserId: null,
      draw: false,
      chatId: chatId || null,
      round: 0,
      domainActive: false,
      domainName: null,
      domainRounds: 0,
      battleMode: options.battleMode || "NORMAL",
      battleLog: []
    }

    pvpBattles.set(battleId, battle)
    return battle
  }

export function getPvPBattle(battleId) {
  return pvpBattles.get(battleId) || null
}

export function getPvPBattleByPlayer(playerId) {
  const pId = normalizePlayerId(playerId)
  if (!pId) return null
  for (const battle of pvpBattles.values()) {
    const ids = battle.playerIds || [battle.player1Id, battle.player2Id].filter(Boolean)
    if (ids.includes(pId) && !battle.finished) {
      return battle
    }
  }
  return null
}

export function isInPvPBattle(playerId) {
  return getPvPBattleByPlayer(playerId) !== null
}

export function endPvPBattle(battleId) {
  pvpBattles.delete(battleId)
}

export function cleanupStaleBattles() {
  const now = Date.now()
  for (const [battleId, battle] of pvpBattles.entries()) {
    if (battle.finished) {
      pvpBattles.delete(battleId)
      continue
    }
    if (now - battle.startedAt > 30 * 60 * 1000) {
      battle.finished = true
      pvpBattles.delete(battleId)
    }
  }
}

export function createTeamChallenge(challengerId, targetIds, chatId, options = {}) {
  const cId = normalizePlayerId(challengerId)
  const tIds = targetIds.map(id => normalizePlayerId(id)).filter(Boolean)
  if (!cId || tIds.length === 0) return null

  const allIds = [cId, ...tIds]
  const uniqueIds = [...new Set(allIds)]
  if (uniqueIds.length !== allIds.length) return null

  const mode = options.mode || deriveMode(tIds.length)
  const teamIds = options.teamIds || buildTeamIds(cId, tIds, mode)

  const battleId = `pvp:${uniqueIds.sort().join(":")}:${Date.now()}`
  const battle = {
    id: battleId,
    type: "PVP",
    mode,
    playerIds: uniqueIds,
    teamIds,
    turn: null,
    playerActions: {},
    statusEffects: {},
    startedAt: Date.now(),
    finished: false,
    winnerId: null,
    loserId: null,
    draw: false,
    chatId: chatId || null,
    round: 0,
    domainActive: false,
    domainName: null,
    domainRounds: 0,
    battleMode: options.battleMode || "MATCHED",
    pendingAcceptances: tIds,
    challengerId: cId,
    accepted: [cId]
  }

  pvpBattles.set(battleId, battle)
  return battle
}

function deriveMode(targetCount) {
  if (targetCount === 1) return "1v1"
  if (targetCount === 2) return "2v1"
  return "TEAM"
}

function buildTeamIds(challengerId, targetIds, mode) {
  const teamIds = {}
  teamIds[challengerId] = "A"
  targetIds.forEach((id, index) => {
    teamIds[id] = mode === "2v1" || mode === "1v2" ? "B" : index === 0 ? "A" : "B"
  })
  return teamIds
}

export function acceptTeamChallenge(battleId, playerId) {
  const battle = pvpBattles.get(battleId)
  if (!battle || battle.finished) return null
  if (!battle.pendingAcceptances) return null

  const pId = normalizePlayerId(playerId)
  if (!battle.pendingAcceptances.includes(pId)) return null

  battle.pendingAcceptances = battle.pendingAcceptances.filter(id => id !== pId)
  if (!battle.accepted) battle.accepted = []
  battle.accepted.push(pId)

  return battle
}

export function getPendingAcceptances(battleId) {
  const battle = pvpBattles.get(battleId)
  if (!battle) return []
  return battle.pendingAcceptances || []
}

export function isTeamReady(battleId) {
  const battle = pvpBattles.get(battleId)
  if (!battle) return false
  return (battle.pendingAcceptances || []).length === 0
}

export function updatePvPAction(battleId, playerId, action) {
  const battle = pvpBattles.get(battleId)
  if (!battle || battle.finished) return null
  battle.playerActions = battle.playerActions || {}
  battle.playerActions[playerId] = { action, timestamp: Date.now() }
  return battle
}

export function getPvPAction(battleId, playerId) {
  const battle = pvpBattles.get(battleId)
  if (!battle || !battle.playerActions) return null
  return battle.playerActions[playerId] || null
}

export function getAllPvPActions(battleId) {
  const battle = pvpBattles.get(battleId)
  if (!battle || !battle.playerActions) return {}
  return { ...battle.playerActions }
}

export function clearPvPActions(battleId) {
  const battle = pvpBattles.get(battleId)
  if (!battle) return
  battle.playerActions = {}
}

export function isPvPRoundLocked(battleId) {
  const battle = pvpBattles.get(battleId)
  if (!battle) return false
  return battle.roundLocked || false
}

export function setPvPRoundLocked(battleId, locked) {
  const battle = pvpBattles.get(battleId)
  if (!battle) return
  battle.roundLocked = locked
}

export function getOpponentTeam(battleId, teamId) {
  const battle = pvpBattles.get(battleId)
  if (!battle || !battle.teamIds) return null

  const opponentTeam = new Set()
  for (const [pid, tid] of Object.entries(battle.teamIds)) {
    if (tid !== teamId) {
      opponentTeam.add(tid)
    }
  }

  if (opponentTeam.size === 1) {
    return Array.from(opponentTeam)[0]
  }
  return null
}

export function getTeamMembers(battleId, teamId) {
  const battle = pvpBattles.get(battleId)
  if (!battle || !battle.teamIds) return []
  return Object.entries(battle.teamIds)
    .filter(([_, tid]) => tid === teamId)
    .map(([pid]) => pid)
}
