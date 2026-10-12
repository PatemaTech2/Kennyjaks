import { loadAllPlayers, savePlayer } from "../database/playerRepo.js"
import { checkDomainEligibility } from "../commands/domainCommand.js"

export async function runDomainEligibilityMigration() {
  const players = await loadAllPlayers()
  let updated = 0
  let errors = 0

  for (const player of players) {
    try {
      const eligibility = checkDomainEligibility(player)
      if (!eligibility.eligible) continue
      if (player.domains && player.domains.unlocked) continue

      player.domains = player.domains || {}
      player.domains.unlocked = true
      player.domains.name = player.domains.name || "Unnamed Domain"
      await savePlayer(player)
      updated++
    } catch (err) {
      errors++
      console.error(`[DOMAIN MIGRATION] Failed for ${player.name || player.playerId}:`, err.message)
    }
  }

  console.log(`[DOMAIN MIGRATION] Complete: ${updated}/${players.length} players marked domain-eligible, ${errors} errors`)
  return { updated, total: players.length, errors }
}
