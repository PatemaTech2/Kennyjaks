import { loadAllPlayers, savePlayer } from "../../database/playerRepo.js"
import { applyStatScaling } from "../GradeService.js"

const MIGRATION_VERSION = "combat-stat-reset-v1"
export { MIGRATION_VERSION }

export async function migrateAllPlayers() {
  const players = await loadAllPlayers()
  const results = {
    total: players.length,
    migrated: 0,
    skipped: 0,
    errors: []
  }

  for (const player of players) {
    try {
      const playerId = player.playerId || player.phoneNumber || "unknown"

      if (player._combatStatMigrationVersion === MIGRATION_VERSION) {
        results.skipped++
        continue
      }

      const totalSP = (player.skillPoints || 0) + (player.totalSpentSkillPoints || 0)
      const level = player.level || 1

      const spTier = Math.floor(totalSP / 100)

      const baseHp = 100 + spTier * 15
      const baseCe = 150 + spTier * 12
      const baseStr = 10 + spTier
      const baseDef = 8 + Math.floor(spTier * 0.8)
      const baseSpd = 8 + Math.floor(spTier * 0.9)
      const baseInt = 10 + Math.floor(spTier * 0.5)

      const levelBonus = Math.max(0, level - 1)

      player.maxHealth = baseHp + levelBonus * 5
      player.health = player.maxHealth
      player.maxCursedEnergy = baseCe + levelBonus * 4
      player.cursedEnergy = player.maxCursedEnergy
      player.strength = baseStr + Math.floor(levelBonus * 0.5)
      player.defense = baseDef + Math.floor(levelBonus * 0.4)
      player.speed = baseSpd + Math.floor(levelBonus * 0.3)
      player.intelligence = baseInt + Math.floor(levelBonus * 0.2)

      player.baseStats = {
        hp: baseHp,
        ce: baseCe,
        strength: baseStr,
        defense: baseDef,
        speed: baseSpd,
        intelligence: baseInt,
        techniqueControl: player.baseStats?.techniqueControl || 0
      }

      player._combatStatMigrationVersion = MIGRATION_VERSION

      await savePlayer(player)
      results.migrated++
    } catch (err) {
      results.errors.push({
        playerId: player.playerId || player.phoneNumber || "unknown",
        error: err.message
      })
    }
  }

  return results
}

export async function migratePlayer(player) {
  if (!player) return { migrated: false, reason: "No player provided" }

  if (player._combatStatMigrationVersion === MIGRATION_VERSION) {
    return { migrated: false, reason: "Already migrated" }
  }

  const totalSP = (player.skillPoints || 0) + (player.totalSpentSkillPoints || 0)
  const level = player.level || 1

  const spTier = Math.floor(totalSP / 100)

  const baseHp = 100 + spTier * 15
  const baseCe = 150 + spTier * 12
  const baseStr = 10 + spTier
  const baseDef = 8 + Math.floor(spTier * 0.8)
  const baseSpd = 8 + Math.floor(spTier * 0.9)
  const baseInt = 10 + Math.floor(spTier * 0.5)

  const levelBonus = Math.max(0, level - 1)

  player.maxHealth = baseHp + levelBonus * 5
  player.health = player.maxHealth
  player.maxCursedEnergy = baseCe + levelBonus * 4
  player.cursedEnergy = player.maxCursedEnergy
  player.strength = baseStr + Math.floor(levelBonus * 0.5)
  player.defense = baseDef + Math.floor(levelBonus * 0.4)
  player.speed = baseSpd + Math.floor(levelBonus * 0.3)
  player.intelligence = baseInt + Math.floor(levelBonus * 0.2)

  player.baseStats = {
    hp: baseHp,
    ce: baseCe,
    strength: baseStr,
    defense: baseDef,
    speed: baseSpd,
    intelligence: baseInt,
    techniqueControl: player.baseStats?.techniqueControl || 0
  }

  player._combatStatMigrationVersion = MIGRATION_VERSION

  return {
    migrated: true,
    totalSP,
    spTier,
    level,
    strength: player.strength,
    maxHealth: player.maxHealth,
    maxCursedEnergy: player.maxCursedEnergy
  }
}
