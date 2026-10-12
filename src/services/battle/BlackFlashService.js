import { savePlayer } from "../../database/playerRepo.js"
import { BALANCE } from "../../config/balance.js"

export const BLACK_FLASH_AFFINITY_MIN = 0.5
export const BLACK_FLASH_AFFINITY_MAX = 4.0

export const POTENTIAL_BLACK_FLASH_BONUS = {
  A: 1.5,
  B: 1.0,
  C: 0.6,
  D: 0.3,
  E: 0.1,
  F: 0.0
}

export const ENEMY_GRADE_PRESSURE = {
  4: 0.0,
  3: 0.25,
  2: 0.6,
  1: 1.0,
  0: 2.5
}

export const CONSECUTIVE_ATTACK_BONUS = [0, 0.5, 1.0, 2.0, 3.5]

export class BlackFlashService {
  constructor() {
    this.states = new Map()
  }

  generateAffinity() {
    const min = BLACK_FLASH_AFFINITY_MIN
    const max = BLACK_FLASH_AFFINITY_MAX
    const raw = min + Math.random() * (max - min)
    return Math.round(raw * 1000) / 1000
  }

  onNormalAttack(playerId, opponent, player) {
    const state = getOrCreateState(playerId)
    state.consecutiveNormalAttacks += 1

    if (player && opponent && player.cursedEnergy === 0 && (opponent.ce || opponent.cursedEnergy || 0) > 0) {
      state.perfectBlackFlash = true
      console.log("[BLACK FLASH] Perfect Black Flash triggered (CE=0)")
      return { triggered: true, perfect: true }
    }

    const finalChance = this.calculateBlackFlashChance(player, opponent, state)
    state.lastChance = finalChance

    if (Math.random() < finalChance / 100) {
      state.pending = true
      state.perfectBlackFlash = false
      return { triggered: true, perfect: false }
    }
    return { triggered: false }
  }

  calculateBlackFlashChance(player, opponent, state) {
    if (!player) return 0

    const affinity = player.blackFlashAffinity || this.generateAffinity()
    const baseChance = affinity

    let bonus = 0

    const potential = player.potential || "F"
    bonus += POTENTIAL_BLACK_FLASH_BONUS[potential] || 0

    if (opponent) {
      const enemyGrade = opponent.grade !== undefined ? opponent.grade : opponent.enemyGrade || 4
      bonus += ENEMY_GRADE_PRESSURE[enemyGrade] || 0
    }

    const consecutive = state.consecutiveNormalAttacks || 0
    if (consecutive > 0 && consecutive <= CONSECUTIVE_ATTACK_BONUS.length) {
      bonus += CONSECUTIVE_ATTACK_BONUS[consecutive - 1] || 0
    } else if (consecutive > CONSECUTIVE_ATTACK_BONUS.length) {
      bonus += CONSECUTIVE_ATTACK_BONUS[CONSECUTIVE_ATTACK_BONUS.length - 1]
    }

    if (state.focusBoost) {
      bonus += state.focusBoost
    }

    let finalChance = baseChance + bonus
    const maxChance = 15
    finalChance = Math.min(finalChance, maxChance)
    finalChance = Math.max(finalChance, 0)

    return Math.round(finalChance * 1000) / 1000
  }

  onNonAttackAction(playerId) {
    const state = this.states.get(playerId)
    if (state) {
      state.consecutiveNormalAttacks = 0
      state.pending = false
      state.focusBoost = 0
    }
  }

  onBattleEnd(playerId) {
    const state = this.states.get(playerId)
    if (state) {
      state.consecutiveNormalAttacks = 0
      state.pending = false
      state.focusBoost = 0
      state.perfectBlackFlash = false
    }
  }

  consumePending(playerId) {
    const state = this.states.get(playerId)
    if (state && state.pending) {
      state.pending = false
      return true
    }
    return false
  }

  isPerfectBlackFlash(playerId) {
    const state = this.states.get(playerId)
    return state ? state.perfectBlackFlash === true : false
  }

  clearPerfectFlag(playerId) {
    const state = this.states.get(playerId)
    if (state) {
      state.perfectBlackFlash = false
    }
  }

  getConsecutiveAttacks(playerId) {
    const state = this.states.get(playerId)
    return state ? state.consecutiveNormalAttacks : 0
  }

  getLastChance(playerId) {
    const state = this.states.get(playerId)
    return state ? state.lastChance || 0 : 0
  }

  addFocusBoost(playerId, amount) {
    const state = getOrCreateState(playerId)
    state.focusBoost = (state.focusBoost || 0) + amount
  }
}

const states = new Map()

function getOrCreateState(playerId) {
  if (!states.has(playerId)) {
    states.set(playerId, {
      consecutiveNormalAttacks: 0,
      pending: false,
      perfectBlackFlash: false,
      lastChance: 0,
      focusBoost: 0
    })
  }
  return states.get(playerId)
}

export async function migrateBlackFlashAffinities(players) {
  let migrated = 0
  let skipped = 0

  for (const player of players) {
    if (!player) continue
    if (player.blackFlashAffinity !== undefined && player.blackFlashAffinity !== null) {
      skipped++
      continue
    }

    const bfService = new BlackFlashService()
    player.blackFlashAffinity = bfService.generateAffinity()

    try {
      await savePlayer(player)
      migrated++
      console.log(`[MIGRATION] Player: ${player.name || "Unknown"} | Black Flash Affinity: ${player.blackFlashAffinity}%`)
    } catch (err) {
      console.error(`[MIGRATION] Failed to save player ${player.name}:`, err.message)
    }
  }

  console.log(`[MIGRATION] Complete: ${migrated} players migrated, ${skipped} skipped (already had affinity)`)
  return { migrated, skipped }
}
