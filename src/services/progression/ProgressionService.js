import { ProgressionManager } from "./ProgressionManager.js"
import { TechniqueMasteryService } from "../technique/TechniqueMasteryService.js"
import { ReputationTitleService } from "./ReputationTitleService.js"
import { recalcProgression, getLifetimeXp, applyStatScaling, cumulativeXpForLevel, xpForLevel, levelFromLifetimeXp, GRADE_SCHEDULE } from "../GradeService.js"
import { loadPlayerByPhone, savePlayer } from "../../database/playerRepo.js"
import { syncPlayerUnlocks } from "./ProgressionSyncService.js"

export const ProgressionService = {
  getXPRequiredForLevel(level) {
    return xpForLevel(level)
  },

  getCumulativeXpForLevel(level) {
    return cumulativeXpForLevel(level)
  },

  getLevelFromXP(totalXp) {
    return levelFromLifetimeXp(totalXp).level
  },

  getXPProgress(totalXp) {
    const { level, leftoverXp } = levelFromLifetimeXp(totalXp)
    const needed = xpForLevel(level)
    const toNext = Math.max(0, needed - leftoverXp)
    const pct = Math.min(1, needed > 0 ? leftoverXp / needed : 0)
    return { level, current: leftoverXp, needed, toNext, pct }
  },

  getLevelProgress(player) {
    const level = player.level || 1
    const current = player.xp || 0
    const needed = xpForLevel(level)
    const toNext = Math.max(0, needed - current)
    const pct = Math.min(1, needed > 0 ? current / needed : 0)
    return { level, current, needed, toNext, pct }
  },

  addXP(player, amount) {
    if (!Number.isFinite(amount) || amount <= 0) {
      return { xpGained: 0, levelUps: 0, gradePromoted: false, oldGrade: player.grade, newGrade: player.grade, level: player.level || 1 }
    }

    const before = player.level || 1
    let lifetimeXp = getLifetimeXp(player)
    lifetimeXp += amount
    player.lifetimeXp = lifetimeXp
    player.xp = player.xp || 0

    const result = recalcProgression(player)

    if (result.levelsGained > 0) {
      player.skillPoints = (player.skillPoints || 0) + result.levelsGained
    }

    applyStatScaling(player)

    return {
      xpGained: amount,
      levelUps: result.levelsGained,
      gradePromoted: result.promoted,
      oldGrade: result.oldGrade,
      newGrade: player.grade,
      level: player.level,
      beforeLevel: before,
      afterLevel: player.level
    }
  },

  async awardXP(playerId, amount) {
    const player = await loadPlayerByPhone(playerId)
    if (!player) return null
    const result = this.addXP(player, amount)
    await this.reconcilePlayerProgression(player)
    await savePlayer(player)
    return result
  },

  recalculateProgression(player) {
    return recalcProgression(player)
  },

  repairPlayer(player) {
    if (!player) return null
    const before = player.level || 1
    const lifetimeXp = getLifetimeXp(player)
    const { level: calcLevel } = levelFromLifetimeXp(lifetimeXp)
    player.lifetimeXp = lifetimeXp
    const result = recalcProgression(player)
    return {
      repaired: true,
      before,
      after: player.level,
      levelsGained: result.levelsGained,
      gradePromoted: result.promoted
    }
  },

  validateProgression(player) {
    if (!player) return []
    const warnings = []
    if (!Number.isFinite(player.xp) || player.xp < 0) {
      player.xp = Math.max(0, Math.floor(player.xp || 0))
      warnings.push(`xp clamped to ${player.xp}`)
    }
    if (!Number.isFinite(player.level) || player.level < 1) {
      player.level = Math.max(1, Math.floor(player.level || 1))
      warnings.push(`level clamped to ${player.level}`)
    }
    if (!Number.isFinite(player.lifetimeXp) || player.lifetimeXp < 0) {
      player.lifetimeXp = Math.max(0, Math.floor(player.lifetimeXp || 0))
      warnings.push(`lifetimeXp clamped to ${player.lifetimeXp}`)
    }
    return warnings
  },

  async reconcilePlayerProgression(player) {
    if (!player) return { reconciled: false, reason: "No player" }

    const beforeLevel = player.level || 1
    const beforeGrade = player.grade

    recalcProgression(player)

    const currentLevel = player.level || 1
    if (currentLevel < beforeLevel) {
      player.level = beforeLevel
    }

    applyStatScaling(player)
    ReputationTitleService.reconcileReputation(player)

    const skillUnlocks = await ProgressionManager.checkAllUnlocks(player)
    const masteryUnlocks = await TechniqueMasteryService.checkAllMasteryUnlocks(player)

    const levelUps = Math.max(0, currentLevel - beforeLevel)
    if (levelUps > 0) {
      player.skillPoints = (player.skillPoints || 0) + levelUps
    }

    return {
      reconciled: true,
      levelUps,
      gradePromoted: player.grade !== beforeGrade,
      skillUnlocks: skillUnlocks ? skillUnlocks.unlocked.length : 0,
      masteryUnlocks: masteryUnlocks ? masteryUnlocks.unlocked.length : 0
    }
  },

  getReputationTitle(reputation) {
    return ReputationTitleService.getReputationTitle(reputation)
  },

  getCurseReputation(grade) {
    return ReputationTitleService.generateCurseReputation(grade)
  },

  async awardBulkLevels(amount) {
    const { loadAllPlayers, savePlayer } = await import("../../database/playerRepo.js")
    const players = await loadAllPlayers()
    const results = []

    for (const player of players) {
      try {
        player.lifetimeXp = cumulativeXpForLevel(Math.max(1, (player.level || 1) + amount))
        await this.reconcilePlayerProgression(player)
        await savePlayer(player)
        results.push({ playerId: player.playerId, name: player.name, success: true })
      } catch (err) {
        results.push({ playerId: player.playerId, name: player.name, success: false, error: err.message })
      }
    }

    return results
  },

  async awardBulkSetGrade(grade) {
    const { loadAllPlayers, savePlayer } = await import("../../database/playerRepo.js")
    const players = await loadAllPlayers()
    const results = []

    const minLevel = GRADE_SCHEDULE.find(entry => entry.grade === grade)?.minLevel || 1

    for (const player of players) {
      try {
        const currentLevel = player.level || 1
        if (currentLevel < minLevel) {
          player.lifetimeXp = cumulativeXpForLevel(minLevel)
        }
        await this.reconcilePlayerProgression(player)
        await savePlayer(player)
        results.push({ playerId: player.playerId, name: player.name, success: true })
      } catch (err) {
        results.push({ playerId: player.playerId, name: player.name, success: false, error: err.message })
      }
    }

    return results
  }
}
