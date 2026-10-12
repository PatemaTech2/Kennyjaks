import { ProgressionManager } from "./ProgressionManager.js"
import { TechniqueMasteryService } from "../technique/TechniqueMasteryService.js"
import { loadAllPlayers, savePlayer } from "../../database/playerRepo.js"

export async function syncPlayerUnlocks(player) {
  if (!player) return { unlocked: [], masteryUnlocked: [], messages: "" }

  const progressionResult = await ProgressionManager.checkAllUnlocks(player)
  const masteryResult = await TechniqueMasteryService.checkAllMasteryUnlocks(player)

  const messages = []
  if (progressionResult?.messages) messages.push(progressionResult.messages)
  if (masteryResult?.messages) messages.push(masteryResult.messages)

  return {
    unlocked: progressionResult?.unlocked || [],
    masteryUnlocked: masteryResult?.unlocked || [],
    messages: messages.join("\n\n━━━━━━━━━━━━━━━━━━━━━━\n\n")
  }
}

export async function syncLevelUnlocks(player) {
  if (!player) return { unlocked: [], masteryUnlocked: [], messages: "" }
  return syncPlayerUnlocks(player)
}

export async function syncAllPlayerUnlocks() {
  const players = await loadAllPlayers()
  let updated = 0

  for (const player of players) {
    const beforeTechnique = JSON.stringify(player.technique?.unlockedSkills || [])
    const beforeProgression = JSON.stringify(player.progression?.unlockedSkills || [])
    const beforeMastery = JSON.stringify(player.techniqueMastery || {})

    await syncPlayerUnlocks(player)

    const afterTechnique = JSON.stringify(player.technique?.unlockedSkills || [])
    const afterProgression = JSON.stringify(player.progression?.unlockedSkills || [])
    const afterMastery = JSON.stringify(player.techniqueMastery || {})

    if (beforeTechnique !== afterTechnique || beforeProgression !== afterProgression || beforeMastery !== afterMastery) {
      await savePlayer(player)
      updated++
    }
  }

  return { total: players.length, updated }
}
