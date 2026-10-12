import { BALANCE } from "../config/balance.js"
import { getPotentialInfo } from "./technique/PotentialService.js"

const SP_SCALING = {
  strength: 0.01,
  speed: 0.009,
  hp: 0.01,
  ce: 0.0067,
  intelligence: 0.005,
  defense: 0.008,
  stamina: 0.01,
  luck: 0.001,
  techniquecontrol: 0.002
}

export function getSpScaling(attribute) {
  return SP_SCALING[attribute] || 0
}

export function calculateDerivedStats(player) {
  const sp = player.totalSpentSkillPoints || 0
  const base = player.baseStats || {}
  const potential = (player.potential || "F").toUpperCase()
  const potentialInfo = getPotentialInfo(potential)
  const potentialMultiplier = potentialInfo?.multiplier || 1.0

  const spTier = Math.floor(sp / 100)

  const strength = (base.strength || 10) + Math.floor(spTier * SP_SCALING.strength)
  const speed = (base.speed || 10) + Math.floor(spTier * SP_SCALING.speed)
  const hp = (base.hp || 100) + Math.floor(spTier * SP_SCALING.hp)
  const ce = (base.ce || 150) + Math.floor(spTier * SP_SCALING.ce)
  const intelligence = (base.intelligence || 10) + Math.floor(spTier * SP_SCALING.intelligence)
  const defense = (base.defense || 10) + Math.floor(spTier * SP_SCALING.defense)
  const stamina = (base.stamina || 10) + Math.floor(spTier * SP_SCALING.stamina)
  const luck = (base.luck || 10) + Math.floor(spTier * SP_SCALING.luck)
  const techniqueControl = (base.techniqueControl || 0) + Math.floor(spTier * SP_SCALING.techniquecontrol)

  const finalStrength = Math.floor(strength * potentialMultiplier)
  const finalSpeed = Math.floor(speed * potentialMultiplier)
  const finalHp = Math.floor(hp * potentialMultiplier)
  const finalCe = Math.floor(ce * potentialMultiplier)
  const finalIntelligence = Math.floor(intelligence * potentialMultiplier)
  const finalDefense = Math.floor(defense * potentialMultiplier)
  const finalStamina = Math.floor(stamina * potentialMultiplier)
  const finalLuck = Math.floor(luck * potentialMultiplier)
  const finalTechniqueControl = Math.floor(techniqueControl * potentialMultiplier)

  return {
    strength: finalStrength,
    speed: finalSpeed,
    hp: finalHp,
    ce: finalCe,
    intelligence: finalIntelligence,
    defense: finalDefense,
    stamina: finalStamina,
    luck: finalLuck,
    techniqueControl: finalTechniqueControl,
    raw: {
      strength,
      speed,
      hp,
      ce,
      intelligence,
      defense,
      stamina,
      luck,
      techniqueControl
    },
    sp,
    potential,
    potentialMultiplier
  }
}

export function migratePlayerStats(player) {
  if (!player) return player

  player.baseStats = player.baseStats || {}
  player.baseStats.hp = player.baseStats.hp || player.maxHealth || 100
  player.baseStats.ce = player.baseStats.ce || player.maxCursedEnergy || 50
  player.baseStats.strength = player.baseStats.strength || player.strength || 10
  player.baseStats.defense = player.baseStats.defense || player.defense || 10
  player.baseStats.speed = player.baseStats.speed || player.speed || 10
  player.baseStats.intelligence = player.baseStats.intelligence || player.intelligence || 10
  player.baseStats.stamina = player.baseStats.stamina || 10
  player.baseStats.luck = player.baseStats.luck !== undefined ? player.baseStats.luck : (player.luck || 10)
  player.baseStats.techniqueControl = player.baseStats.techniqueControl || 0

  player.reputation = player.reputation || 0
  player.curseKills = player.curseKills || 0
  player.specialGradeKills = player.specialGradeKills || 0
  player.curseKillsByGrade = player.curseKillsByGrade || {}
  player.skillPoints = player.skillPoints || 0

  return player
}

export async function migrateAllPlayersTechniqueControl() {
  const { loadAllPlayers, savePlayer } = await import("../database/playerRepo.js")
  const players = await loadAllPlayers()

  let migrated = 0
  for (const player of players) {
    const hadTechniqueControl = Object.prototype.hasOwnProperty.call(player.baseStats || {}, "techniqueControl")
    migratePlayerStats(player)
    if (!hadTechniqueControl) {
      await savePlayer(player)
      migrated++
    }
  }

  return { migrated, total: players.length }
}
