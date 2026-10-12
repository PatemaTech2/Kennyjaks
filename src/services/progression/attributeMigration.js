import { loadAllPlayers, savePlayer } from "../../database/playerRepo.js"
import { migratePlayerStats } from "../../services/AttributeService.js"

export async function runAttributeMigration() {
  const players = await loadAllPlayers()
  let migrated = 0
  for (const player of players) {
    const before = JSON.stringify(player.baseStats || {})
    migratePlayerStats(player)
    const after = JSON.stringify(player.baseStats || {})
    if (before !== after) {
      await savePlayer(player)
      migrated++
    }
  }
  console.log(`[MIGRATION] Attribute migration complete. ${migrated} players updated.`)
  return migrated
}
