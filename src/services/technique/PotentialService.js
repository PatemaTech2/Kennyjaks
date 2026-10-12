import { POTENTIAL_SYSTEM } from "../../config/balance.js"

function weightedRandomPotential() {
  const grades = Object.entries(POTENTIAL_SYSTEM.grades)
  const total = grades.reduce((sum, [, g]) => sum + g.weight, 0)
  let r = Math.random() * total
  for (const [grade, data] of grades) {
    r -= data.weight
    if (r <= 0) return grade
  }
  return "F"
}

export function assignPotential(player) {
  const grade = weightedRandomPotential()
  player.potential = grade
  player.potentialBonuses = { ...POTENTIAL_SYSTEM.grades[grade].multipliers }
  return grade
}

export function getPotentialInfo(grade) {
  return POTENTIAL_SYSTEM.grades[grade] || POTENTIAL_SYSTEM.grades.F
}

export function applyPotentialToStats(player) {
  const grade = player.potential || "F"
  const info = POTENTIAL_SYSTEM.grades[grade]
  if (!info) return player

  const multipliers = info.multipliers
  if (multipliers.hp) player.maxHealth = Math.floor((player.maxHealth || 100) * multipliers.hp)
  if (multipliers.ce) player.maxCursedEnergy = Math.floor((player.maxCursedEnergy || 150) * multipliers.ce)
  if (multipliers.strength) player.strength = Math.floor((player.strength || 10) * multipliers.strength)
  if (multipliers.defense) player.defense = Math.floor((player.defense || 10) * multipliers.defense)
  if (multipliers.speed) player.speed = Math.floor((player.speed || 10) * multipliers.speed)
  if (multipliers.intelligence) player.intelligence = Math.floor((player.intelligence || 10) * multipliers.intelligence)

  if (multipliers.hp) player.health = player.maxHealth
  if (multipliers.ce) player.cursedEnergy = player.maxCursedEnergy

  return player
}

export function getPotentialDisplay(player) {
  const grade = player.potential || "F"
  const info = POTENTIAL_SYSTEM.grades[grade] || POTENTIAL_SYSTEM.grades.F
  const lines = [
    `Potential: ${grade}`,
    `${info.label} Potential`,
    info.description
  ]
  return lines.join("\n")
}
