import { BattleManager } from "../battle/BattleManager.js"
import { WorldStateService } from "../world/WorldStateService.js"
import { globalStatusEngine } from "../battle/StatusEngine.js"

export function buildBattleContext(battle, player, opponent) {
  if (!battle) return null

  const participantState = {
    battleId: battle.battleId || null,
    mode: battle.battleMode || "NORMAL",
    round: battle.round || 0,
    finished: !!battle.finished,
    playerId: player?.playerId || null,
    opponentId: opponent?.playerId || null,
    momentum: {},
    availableActions: [],
    committedActions: [],
    statuses: [],
    domains: [],
    activeEffects: []
  }

  return participantState
}

export function buildCurseContext(curse, battleMemory = []) {
  if (!curse) return null

  return {
    id: curse.id || curse.curseId || null,
    name: curse.name || "Unknown Curse",
    grade: curse.grade,
    hp: curse.hp || curse.currentHp || 0,
    maxHp: curse.maxHp || curse.hp || 0,
    ce: curse.ce || curse.currentCe || 0,
    maxCe: curse.maxCe || curse.ce || 0,
    technique: curse.technique || curse.cursedTechnique || null,
    domain: curse.domain || curse.domainExpansion || null,
    personality: curse.personality || "neutral",
    abilities: curse.bossAbilities || curse.abilities || [],
    statuses: curse.statusEffects || [],
    battleMemory: battleMemory.slice(-8)
  }
}

export function buildWorldContext(locationId, playerId) {
  const location = locationId ? { id: locationId } : null
  const activeEncounters = locationId ? WorldStateService.getActiveEncounters(locationId) : []
  const roaming = WorldStateService.getActiveRoamingBosses()

  return {
    location,
    activeEncounters: activeEncounters.map(e => ({
      id: e.id,
      name: e.name,
      grade: e.grade,
      isBoss: !!e.isBoss
    })),
    roamingBosses: roaming.map(b => ({
      id: b.id,
      name: b.name,
      locationId: b.locationId
    }))
  }
}

export function buildPlayerContext(player) {
  if (!player) return null

  return {
    id: player.playerId,
    name: player.name,
    level: player.level,
    grade: player.grade,
    reputation: player.reputation || 0,
    technique: player.technique || null,
    techniqueControl: player.techniqueControl || 0,
    hp: player.health || 0,
    maxHp: player.maxHealth || 0,
    ce: player.cursedEnergy || 0,
    maxCe: player.maxCursedEnergy || 0,
    statusEffects: (globalStatusEngine.getStatuses(player.playerId) || []).map(s => s.type),
    location: player.currentLocation || null,
    activePet: player.activePet || null,
    hasDomain: !!(player.domains && (player.domains.unlocked || player.domains.infernalPurgatory)),
    hasRCT: !!player.rct || !!player.reverseTechnique
  }
}

export function buildGameContext({ type = "world", battle, player, opponent, curse, locationId }) {
  const base = {
    type,
    player: buildPlayerContext(player),
    world: buildWorldContext(locationId || player?.currentLocation, player?.playerId)
  }

  if (type === "battle" && battle) {
    base.battle = buildBattleContext(battle, player, opponent)
    base.enemy = buildCurseContext(curse || opponent)
  } else if (type === "encounter" && curse) {
    base.enemy = buildCurseContext(curse)
  }

  return base
}
