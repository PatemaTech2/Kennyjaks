import { BALANCE } from "../config/balance.js"

// Deterministic grade thresholds based on level.
// Grade is always derived from level so promotions are never "stuck".
export const GRADE_SCHEDULE = [
  { grade: 4, minLevel: 1 },
  { grade: 3, minLevel: 10 },
  { grade: 2, minLevel: 25 },
  { grade: 1, minLevel: 40 },
  { grade: 0, minLevel: 60 }
]

export const GRADE_TITLES = {
  4: "Grade 4 Sorcerer",
  3: "Grade 3 Sorcerer",
  2: "Grade 2 Sorcerer",
  1: "Grade 1 Sorcerer",
  0: "Special Grade Sorcerer"
}

// XP needed to advance FROM the given level to the next level.
// Grows with level so progression scales into late game.
export function xpForLevel(level) {
  return Math.floor(BALANCE.xpRequiredBase * Math.pow(1.08, level - 1))
}

export function cumulativeXpForLevel(level) {
  let total = 0
  for (let l = 1; l < level; l++) {
    total += xpForLevel(l)
  }
  return total
}

export function getLifetimeXp(player) {
  if (typeof player.lifetimeXp === "number" && player.lifetimeXp > 0) return player.lifetimeXp
  return player.xp || 0
}

export function levelFromLifetimeXp(totalXp) {
  let level = 1
  let remaining = totalXp
  while (remaining >= xpForLevel(level)) {
    remaining -= xpForLevel(level)
    level++
    if (level > 100000) break
  }
  return { level, leftoverXp: remaining }
}

export function gradeFromLevel(level) {
  let result = 4
  for (const entry of GRADE_SCHEDULE) {
    if (level >= entry.minLevel) result = entry.grade
  }
  return result
}

// Recompute level + grade from lifetime XP.
export function recalcProgression(player) {
  const oldLevel = player.level || 1
  const oldGrade = player.grade

  const lifetimeXp = getLifetimeXp(player)
  player.lifetimeXp = lifetimeXp

  const { level: computedLevel, leftoverXp } = levelFromLifetimeXp(lifetimeXp)

  player.level = computedLevel
  player.xp = leftoverXp
  player.grade = gradeFromLevel(computedLevel)
  player.sorcererGrade = GRADE_TITLES[player.grade]

  const leveled = computedLevel > oldLevel
  const promoted = oldGrade !== undefined && player.grade < oldGrade

  if (computedLevel < oldLevel) {
    console.warn(`[PROGRESSION] Player: ${player.name || player.playerId} | Level corrected from ${oldLevel} to ${computedLevel} from lifetimeXp=${lifetimeXp}`)
  }

  return {
    level: computedLevel,
    grade: player.grade,
    oldLevel,
    oldGrade,
    leveled,
    promoted,
    levelsGained: Math.max(0, computedLevel - oldLevel)
  }
}

export function getGradeLabel(grade) {
  return BALANCE.gradeLabels[grade] || "Grade 4"
}

function getAttributeMultipliers(player) {
  const multipliers = { hp: 1, ce: 1, strength: 1, defense: 1, speed: 1, intelligence: 1 }
  if (!player.potentialBonuses) return multipliers
  for (const key of Object.keys(multipliers)) {
    if (player.potentialBonuses[key]) multipliers[key] = player.potentialBonuses[key]
  }
  return multipliers
}

export function applyStatScaling(player) {
  const m = getAttributeMultipliers(player)
  const level = player.level || 1
  const totalSP = (player.skillPoints || 0) + (player.totalSpentSkillPoints || 0)

  const spTier = Math.floor(totalSP / 100)

  const baseHp = 100 + spTier * 15
  const baseCe = 150 + spTier * 12
  const baseStr = 10 + spTier
  const baseDef = 8 + Math.floor(spTier * 0.8)
  const baseSpd = 8 + Math.floor(spTier * 0.9)
  const baseInt = 10 + Math.floor(spTier * 0.5)

  const levelBonus = Math.max(0, level - 1)

  const newMaxHp = baseHp + levelBonus * 5
  const newMaxCe = baseCe + levelBonus * 4
  const newStr = baseStr + Math.floor(levelBonus * 0.5)
  const newDef = baseDef + Math.floor(levelBonus * 0.4)
  const newSpd = baseSpd + Math.floor(levelBonus * 0.3)
  const newInt = baseInt + Math.floor(levelBonus * 0.2)

  const hpRatio = player.maxHealth ? player.health / player.maxHealth : 1
  const ceRatio = player.maxCursedEnergy ? player.cursedEnergy / player.maxCursedEnergy : 1

  player.maxHealth = newMaxHp
  player.health = Math.max(1, Math.floor(newMaxHp * hpRatio)) || newMaxHp
  player.maxCursedEnergy = newMaxCe
  player.cursedEnergy = Math.max(0, Math.floor(newMaxCe * ceRatio)) || newMaxCe
  player.strength = newStr
  player.defense = newDef
  player.speed = newSpd
  player.intelligence = newInt

  player.baseStats = {
    hp: baseHp,
    ce: baseCe,
    strength: baseStr,
    defense: baseDef,
    speed: baseSpd,
    intelligence: baseInt,
    techniqueControl: player.baseStats?.techniqueControl || 0
  }
}
