import { globalTechniqueEngine } from "./TechniqueEngine.js"
import { savePlayer } from "../../database/playerRepo.js"
import { loadAllPlayers } from "../../database/playerRepo.js"

const TECHNIQUE_MIGRATION_MAP = {
  "LIMITLESS": "limitless",
  "BLOOD_MANIPULATION": "blood_manipulation",
  "TEN_SHADOWS": "ten_shadows",
  "TEN_SHADOWS_TECHNIQUE": "ten_shadows",
  "RATIO": "ratio",
  "PROJECTION_SORCERY": "projection_sorcery",
  "BOOGIE_WOOGIE": "boogie_woogie",
  "CHIMERA_SHADOW_GARDEN": "chimera_shadow_garden",
  "DISASTER_CURSE": "disaster_curse",
  "AWAKENING": "awakening"
}

export async function migrateTechniques() {
  const { loadAllPlayers } = await import("../../database/playerRepo.js")
  const players = await loadAllPlayers()

  for (const player of players) {
    let modified = false

    if (player.technique) {
      const oldName = player.technique.name || player.technique
      const normalized = oldName.toUpperCase().replace(/\s+/g, "_")
      const newId = TECHNIQUE_MIGRATION_MAP[normalized]

      if (newId && player.technique.id !== newId) {
        player.technique.id = newId
        player.technique.name = oldName
        modified = true
      }
    }

    if (modified) {
      await savePlayer(player)
    }
  }

  return {
    success: true,
    migrated: players.length,
    message: `Migrated ${players.length} players to new technique system`
  }
}

export async function migratePlayerTechnique(player) {
  if (!player.technique) return player

  const oldName = player.technique.name || player.technique
  const normalized = oldName.toUpperCase().replace(/\s+/g, "_")
  const newId = TECHNIQUE_MIGRATION_MAP[normalized]

  if (newId && player.technique.id !== newId) {
    player.technique.id = newId
    player.technique.name = oldName
  }

  return player
}
