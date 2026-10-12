import fs from "fs-extra"
import path from "path"
import { savePlayer } from "../../database/playerRepo.js"

const MIGRATION_FLAG_PATH = path.join(process.cwd(), ".kilo", "migrated", "rct_awakening.json")
const REVERSED_TECHNIQUES_PATH = path.resolve(process.cwd(), "src", "data", "reversedTechniques.json")
let reversedTechniquesCache = null

export async function migrateRCTPlayers(players) {
  let migrated = 0
  let skipped = 0

  for (const player of players) {
    if (!player) continue

    if (player.hasRCT !== undefined && player.hasRCT === true) {
      if (!player.reversedTechnique) {
        assignReversedTechnique(player)
        try {
          await savePlayer(player)
          migrated++
          console.log(`[RCT MIGRATION] Player: ${player.name || "Unknown"} | Assigned reversed technique: ${player.reversedTechnique?.name || "None"}`)
        } catch (err) {
          console.error(`[RCT MIGRATION] Failed to save player ${player.name}:`, err.message)
        }
      } else {
        skipped++
      }
    }
  }

  return { migrated, skipped }
}

export function assignReversedTechnique(player) {
  if (!player) return null
  if (!player.technique || !player.technique.name) return null

  const techniqueName = player.technique.name
  if (!reversedTechniquesCache) {
    reversedTechniquesCache = fs.readJsonSync(REVERSED_TECHNIQUES_PATH)
  }

  const reversed = reversedTechniquesCache.techniques[techniqueName]

  if (!reversed) {
    player.reversedTechnique = {
      name: techniqueName + " Reversal",
      damage: 30,
      ceCost: 100,
      cooldown: 60,
      cooldownUnit: "seconds",
      effects: ["Heals user for 50% of damage dealt"],
      battleDialogue: "Your reversed technique flows with positive energy.",
      statusEffect: null
    }
  } else {
    player.reversedTechnique = {
      name: reversed.reverseTechnique,
      damage: reversed.damage,
      ceCost: reversed.ceCost,
      cooldown: reversed.cooldown,
      cooldownUnit: reversed.cooldownUnit,
      effects: reversed.effects,
      battleDialogue: reversed.battleDialogue,
      statusEffect: reversed.statusEffect
    }
  }

  player.reverseTechniqueUnlocked = true

  if (!player.rctMethod) {
    player.rctMethod = "legacy"
  }
  if (!player.rctAwakenedAt) {
    player.rctAwakenedAt = Date.now()
  }

  return player.reversedTechnique
}

export async function markRctMigrationComplete() {
  await fs.ensureDir(path.dirname(MIGRATION_FLAG_PATH))
  await fs.writeJson(MIGRATION_FLAG_PATH, {
    completed: true,
    timestamp: Date.now(),
    version: "2.16.0"
  }, { spaces: 2 })
}

export async function isRctMigrationCompleted() {
  try {
    if (await fs.pathExists(MIGRATION_FLAG_PATH)) {
      const flag = await fs.readJson(MIGRATION_FLAG_PATH)
      return flag?.completed === true
    }
  } catch {}
  return false
}
