import { loadAllPlayers, savePlayer } from "../../database/playerRepo.js"
import { gradeFromLevel, GRADE_TITLES, cumulativeXpForLevel } from "../GradeService.js"
import { ProgressionService } from "../progression/ProgressionService.js"

export async function applyToAllPlayers(operation) {
  const players = await loadAllPlayers()
  const results = []

  for (const player of players) {
    try {
      await operation(player)
      await savePlayer(player)
      results.push({ playerId: player.playerId, name: player.name, success: true })
    } catch (err) {
      results.push({ playerId: player.playerId, name: player.name, success: false, error: err.message })
    }
  }

  return results
}

export async function bulkAddLevels(amount) {
  return applyToAllPlayers(async (player) => {
    player.lifetimeXp = cumulativeXpForLevel(Math.max(1, (player.level || 1) + amount))
    await ProgressionService.reconcilePlayerProgression(player)
  })
}

export async function bulkRemoveLevels(amount) {
  return applyToAllPlayers(async (player) => {
    const newLevel = Math.max(1, (player.level || 1) - amount)
    player.lifetimeXp = cumulativeXpForLevel(newLevel)
    await ProgressionService.reconcilePlayerProgression(player)
  })
}

export async function bulkAddSkillPoints(amount) {
  return applyToAllPlayers(async (player) => {
    player.skillPoints = (player.skillPoints || 0) + amount
  })
}

export async function bulkSetGrade(grade) {
  const minLevel = GRADE_SCHEDULE.find(entry => entry.grade === grade)?.minLevel || 1
  return applyToAllPlayers(async (player) => {
    const currentLevel = player.level || 1
    if (currentLevel < minLevel) {
      player.lifetimeXp = cumulativeXpForLevel(minLevel)
    }
    await ProgressionService.reconcilePlayerProgression(player)
  })
}
