import { getActiveCurse, clearActiveCurse } from "./CurseService.js"
import { getPvPBattle, endPvPBattle, pvpBattles, startPvPBattle } from "./PvPService.js"
import { savePlayer, loadPlayerById } from "../../database/playerRepo.js"
import { globalStatusEngine } from "./StatusEngine.js"
import { createBattleState, BATTLE_PHASE, updatePhase, adjustMomentum, registerPlayerAction, registerCurseAction, getComebackPotential, isLegendary, buildLegendaryRecord } from "./BattleStateService.js"
import { getBattleEngine } from "./BattleEngineStore.js"
import { getActiveGroupCurse, defeatGroupCurse } from "./GroupCurseService.js"

const narrativeStates = new Map()
const battleRewardsGranted = new Map()
const groupCurseBattles = new Map()

export class BattleManager {
  static getActiveBattle(playerId) {
    const groupCurse = this.getActiveGroupCurseBattle(playerId)
    if (groupCurse) {
      const battleId = groupCurse.id
      const engine = getBattleEngine(battleId)
      return { type: "GROUP_CURSE", battle: groupCurse, battleId, engine }
    }

    const curse = getActiveCurse(playerId)
    if (curse) {
      const battleId = `curse:${String(playerId)}`
      const engine = getBattleEngine(battleId)
      const battle = { type: "CURSE", opponent: curse, battleId, engine }
      if (battleRewardsGranted.get(playerId)) {
        battle.rewardsGranted = true
      }
      return battle
    }
    const pvp = getPvPBattleByPlayer(playerId)
    if (pvp) {
      const battleId = pvp.id
      const engine = getBattleEngine(battleId)
      return { type: "PVP", battle: pvp, battleId, engine }
    }
    return null
  }

  static markRewardsGranted(playerId) {
    battleRewardsGranted.set(playerId, true)
  }

  static clearRewardsGranted(playerId) {
    battleRewardsGranted.delete(playerId)
  }

  static getRewardsGranted(playerId) {
    return battleRewardsGranted.get(playerId) || false
  }

  static getNarrativeState(playerId) {
    if (!narrativeStates.has(playerId)) {
      narrativeStates.set(playerId, createBattleState())
    }
    return narrativeStates.get(playerId)
  }

  static clearNarrativeState(playerId) {
    narrativeStates.delete(playerId)
  }

  static getBattlePhase(playerId) {
    const state = this.getNarrativeState(playerId)
    return state.phase
  }

  static updateBattlePhase(playerId, playerHp, playerMaxHp) {
    const state = this.getNarrativeState(playerId)
    state.phase = updatePhase(state, playerHp, playerMaxHp)
    return state.phase
  }

  static adjustMomentum(playerId, delta) {
    const state = this.getNarrativeState(playerId)
    adjustMomentum(state, delta)
    return state.momentum
  }

  static registerPlayerAction(playerId, action) {
    const state = this.getNarrativeState(playerId)
    registerPlayerAction(state, action)
  }

  static registerCurseAction(playerId, action) {
    const state = this.getNarrativeState(playerId)
    registerCurseAction(state, action)
  }

  static getComebackPotential(playerId, playerHp, playerMaxHp, playerLevel, enemyGrade, enemyHp, enemyMaxHp) {
    const state = this.getNarrativeState(playerId)
    return getComebackPotential(state, playerHp, playerMaxHp, playerLevel, enemyGrade, enemyHp, enemyMaxHp)
  }

  static checkLegendary(playerId, playerHp, playerMaxHp, enemyGrade, enemyLevel, playerGrade, curse) {
    const state = this.getNarrativeState(playerId)
    const legendary = isLegendary(state, playerHp, playerMaxHp, enemyGrade, enemyLevel, playerGrade)
    if (legendary) {
      state.legendary = true
      state.phase = BATTLE_PHASE.LEGENDARY
    }
    return legendary
  }

  static buildLegendaryRecord(playerId, player, curse, victory) {
    const state = this.getNarrativeState(playerId)
    return buildLegendaryRecord(state, player, curse, victory)
  }

  static async startGroupCurseBattle(playerId, curse, options = {}) {
    const groupId = options.groupId || null
    const battleId = groupId ? `groupcurse:${String(groupId)}:${String(playerId)}` : `curse:${String(playerId)}`
    const engine = getBattleEngine(battleId)

    const participant = {
      id: String(playerId),
      name: (await loadPlayerById(playerId))?.name || "Sorcerer",
      maxHp: (await loadPlayerById(playerId))?.maxHealth || 100,
      currentHp: (await loadPlayerById(playerId))?.health || 100,
      maxCe: (await loadPlayerById(playerId))?.maxCursedEnergy || 150,
      currentCe: (await loadPlayerById(playerId))?.cursedEnergy || 0,
      rawStrength: (await loadPlayerById(playerId))?.strength || 10,
      rawDefense: (await loadPlayerById(playerId))?.defense || 10,
      rawSpeed: (await loadPlayerById(playerId))?.speed || 10,
      rawTechnique: (await loadPlayerById(playerId))?.technique || 10,
      gradeValue: (await loadPlayerById(playerId))?.grade ?? 4,
      potential: (await loadPlayerById(playerId))?.potential || 0,
      critRate: (await loadPlayerById(playerId))?.critRate || 0,
      luck: (await loadPlayerById(playerId))?.luck || 10,
      technique: (await loadPlayerById(playerId))?.technique || null,
      hasDomain: !!(await loadPlayerById(playerId))?.domains?.unlocked,
      domainCeCost: 300,
      equippedItems: (await loadPlayerById(playerId))?.equippedItems || {}
    }

    const curseParticipant = {
      id: String(curse.id),
      name: curse.name || "Curse",
      maxHp: curse.maxHp || curse.hp || 100,
      currentHp: curse.hp || curse.maxHp || 100,
      maxCe: curse.maxCe || curse.ce || 0,
      currentCe: curse.ce || curse.maxCe || 0,
      rawStrength: curse.strength || 10,
      rawDefense: curse.defense || 5,
      rawSpeed: curse.speed || 10,
      rawTechnique: curse.techniqueDamage || 10,
      gradeValue: curse.grade ?? 4,
      potential: 0,
      critRate: 0,
      luck: 10,
      technique: null,
      hasDomain: !!curse.domainExpansion,
      domainCeCost: 300,
      equippedItems: {},
      isCurse: true
    }

    engine.init(battleId, "NORMAL")
    engine.registerParticipant(participant)
    engine.registerParticipant(curseParticipant)

    const speed = participant.rawSpeed || 10
    const curseSpeed = curseParticipant.rawSpeed || 10
    const turn = speed >= curseSpeed ? String(playerId) : String(curse.id)

    const battle = {
      id: battleId,
      type: "GROUP_CURSE",
      groupId,
      playerIds: [String(playerId)],
      turn,
      playerActions: {},
      statusEffects: {},
      startedAt: Date.now(),
      finished: false,
      winnerId: null,
      loserId: null,
      draw: false,
      chatId: options.chatId || null,
      round: 0,
      domainActive: false,
      domainName: null,
      domainRounds: 0,
      battleMode: options.battleMode || "NORMAL",
      battleLog: [],
      curse
    }

    groupCurseBattles.set(battleId, battle)
    return battle
  }

  static getActiveGroupCurseBattle(playerId) {
    for (const [battleId, battle] of groupCurseBattles.entries()) {
      if (battle.playerIds.includes(String(playerId)) && !battle.finished) {
        return battle
      }
    }
    return null
  }

  static async startPvPBattle(challengerId, targetId, options = {}) {
    const challenger = await loadPlayerById(challengerId)
    const target = await loadPlayerById(targetId)
    if (!challenger || !target) return null

    const battle = startPvPBattle(challengerId, targetId, options.chatId, options)
    if (!battle) return null

    battle.type = "PVP"
    battle.challenger = challenger
    battle.target = target
    battle.challengerHp = challenger.health
    battle.targetHp = target.health
    battle.challengerCe = challenger.cursedEnergy
    battle.targetCe = target.cursedEnergy
    battle.statusEffects = { [challengerId]: [], [targetId]: [] }
    battle.startedAt = Date.now()
    battle.finished = false
    battle.battleMode = options.battleMode || "NORMAL"

    const challengerSpeed = challenger.speed || 10
    const targetSpeed = target.speed || 10

    if (challengerSpeed > targetSpeed) {
      battle.turn = challengerId
    } else if (targetSpeed > challengerSpeed) {
      battle.turn = targetId
    } else {
      battle.turn = Math.random() < 0.5 ? challengerId : targetId
    }

    return battle
  }

  static async endGroupCurseBattle(playerId, victory) {
    const battle = this.getActiveGroupCurseBattle(playerId)
    if (!battle) return

    const groupId = battle.groupId
    const curse = battle.curse

    battle.finished = true
    if (victory) {
      battle.winnerId = String(playerId)
      battle.loserId = `curse_${curse.id}`
      if (groupId) {
        defeatGroupCurse(groupId, playerId)
      }
    } else {
      battle.winnerId = `curse_${curse.id}`
      battle.loserId = String(playerId)
    }

    const player = await loadPlayerById(playerId)
    if (player) {
      if (victory) {
        player.pvpWins = (player.pvpWins || 0) + 1
      } else {
        player.pvpLosses = (player.pvpLosses || 0) + 1
      }
      await savePlayer(player)
    }

    groupCurseBattles.delete(battle.id)
    this.clearRewardsGranted(playerId)
    globalStatusEngine.clearAll(playerId)
    this.clearNarrativeState(playerId)
  }

  static async endBattle(playerId, victory) {
    const pvp = getPvPBattleByPlayer(playerId)
    if (pvp) {
      const playerIds = pvp.playerIds || [pvp.player1Id, pvp.player2Id].filter(Boolean)
      const winnerId = victory ? playerId : playerIds.find(id => id !== playerId)
      const loserId = victory ? playerIds.find(id => id !== playerId) : playerId

      const winner = await loadPlayerById(winnerId)
      const loser = await loadPlayerById(loserId)
      if (winner) {
        winner.pvpWins = (winner.pvpWins || 0) + 1
        await savePlayer(winner)
      }
      if (loser) {
        loser.pvpLosses = (loser.pvpLosses || 0) + 1
        await savePlayer(loser)
      }

      endPvPBattle(pvp.id)
    }
    const curse = getActiveCurse(playerId)
    if (curse) {
      clearActiveCurse(playerId)
    }
    this.clearRewardsGranted(playerId)
    globalStatusEngine.clearAll(playerId)
    this.clearNarrativeState(playerId)
  }

  static isInBattle(playerId) {
    const battle = this.getActiveBattle(playerId)
    if (battle && (battle.type === "CURSE" || battle.type === "PVP" || battle.type === "GROUP_CURSE")) {
      return true
    }
    return false
  }

  static getCurrentTurn(battle) {
    if (battle.type === "PVP") {
      if (battle.playerIds && battle.playerIds.length > 2) {
        return battle.turn
      }
      if (battle.battle) {
        return battle.battle.turn
      }
      return battle.turn
    }
    if (battle.type === "GROUP_CURSE") {
      return battle.turn
    }
    return battle.turn
  }

  static switchTurn(battle) {
    if (battle.type === "PVP") {
      const pvp = battle.battle || battle
      const ids = pvp.playerIds || []
      if (ids.length >= 2) {
        const currentIndex = ids.indexOf(pvp.turn)
        const nextIndex = (currentIndex + 1) % ids.length
        pvp.turn = ids[nextIndex]
      }
    } else if (battle.type === "GROUP_CURSE") {
      const current = battle.turn
      const next = current === battle.playerIds[0] ? String(battle.curse.id) : battle.playerIds[0]
      battle.turn = next
    }
  }

  static getOpponent(battle, player) {
    if (battle.type === "PVP") {
      if (battle.battle) {
        const pvp = battle.battle
        const ids = pvp.playerIds || []
        const playerIndex = ids.indexOf(String(player.playerId))
        if (playerIndex >= 0 && ids.length >= 2) {
          const opponentIndex = playerIndex === 0 ? 1 : 0
          const opponentId = ids[opponentIndex]
          if (String(pvp.challenger?.playerId) === opponentId) return pvp.challenger
          if (String(pvp.target?.playerId) === opponentId) return pvp.target
        }
        if (String(player.playerId) === String(pvp.challenger?.playerId)) return pvp.target
        return pvp.challenger
      }
      if (battle.playerIds) {
        const opponentId = battle.playerIds.find(id => id !== player.playerId)
        if (opponentId) {
          const opponent = battle.challenger?.playerId === opponentId ? battle.challenger : battle.target
          if (opponent) return opponent
          return { playerId: opponentId, name: "Opponent" }
        }
      }
      return null
    }
    if (battle.type === "GROUP_CURSE") {
      return battle.curse
    }
    return battle.opponent
  }

  static getPlayerFromBattle(battle, playerId) {
    if (battle.type === "PVP") {
      const pvp = battle.battle
      if (String(playerId) === String(pvp.challenger?.playerId)) return pvp.challenger
      if (String(playerId) === String(pvp.target?.playerId)) return pvp.target
      return null
    }
    if (battle.type === "GROUP_CURSE") {
      if (String(playerId) === String(battle.playerIds[0])) {
        return {
          playerId: battle.playerIds[0],
          name: (battle.curse && battle.curse.name) || "Player"
        }
      }
    }
    return null
  }

  static getOpponentFromBattle(battle, playerId) {
    if (battle.type === "PVP") {
      const pvp = battle.battle
      if (String(playerId) === String(pvp.challenger?.playerId)) return pvp.target
      if (String(playerId) === String(pvp.target?.playerId)) return pvp.challenger
      return null
    }
    if (battle.type === "GROUP_CURSE") {
      return battle.curse
    }
    return battle.opponent
  }

  static applyStatusEffects(battle, playerId) {
    const effects = globalStatusEngine.getStatuses(playerId) || []
    const damage = []
    for (const effect of effects) {
      if (effect.effect) {
        const player = this.getPlayerFromBattle(battle, playerId)
        if (player) {
          const oldHp = player.health
          effect.effect(player)
          const dmg = oldHp - player.health
          if (dmg > 0) {
            damage.push({ type: effect.type, emoji: effect.emoji || "⚠️", damage: dmg })
          }
        }
      }
    }
    return damage
  }

  static formatStatusEffects(playerId) {
    const effects = globalStatusEngine.getStatuses(playerId) || []
    if (effects.length === 0) return ""
    return effects.map(s => `${s.emoji || "⚠️"} ${s.label || s.type}`).join("  ")
  }
}

function getPvPBattleByPlayer(playerId) {
  for (const battle of pvpBattles.values()) {
    if (battle.player1Id === playerId || battle.player2Id === playerId) {
      return battle
    }
  }
  return null
}
