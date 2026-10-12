import { ProgressionService } from "./progression/ProgressionService.js"

export function calculateXpRequired(level) {
  return ProgressionService.getXPRequiredForLevel(level)
}

export function addXp(player, amount) {
  return ProgressionService.addXP(player, amount)
}

export function recalculatePlayer(player) {
  return ProgressionService.recalculateProgression(player)
}

export { applyStatScaling } from "./GradeService.js"
