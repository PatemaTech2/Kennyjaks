export function checkThirstPenalty(player) {
  const thirst = player.thirst !== undefined && player.thirst !== null ? player.thirst : 100
  if (thirst <= 0) return 0.40
  if (thirst < 25) return 0.20
  if (thirst < 50) return 0.10
  if (thirst < 75) return 0.05
  return 0
}

export function checkThirstSpeedMultiplier(player) {
  const thirst = player.thirst !== undefined && player.thirst !== null ? player.thirst : 100
  if (thirst <= 0) return 0.60
  if (thirst < 25) return 0.80
  if (thirst < 50) return 0.90
  if (thirst < 75) return 0.95
  return 1.0
}

export function isThirstDepleted(player) {
  const thirst = player.thirst !== undefined && player.thirst !== null ? player.thirst : 100
  return thirst <= 0
}
