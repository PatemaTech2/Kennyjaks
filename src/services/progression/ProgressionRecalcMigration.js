import fs from "fs-extra"
import path from "path"
import { savePlayer } from "../../database/playerRepo.js"
import { recalculatePlayer } from "../../services/LevelUpService.js"
import { GRADE_TITLES } from "../../services/GradeService.js"

const MIGRATION_FLAG_PATH = path.join(process.cwd(), ".kilo", "migrated", "progression_recalc_v3.json")

// Recalculate every player's level + grade from lifetime XP.
// No progress is lost: lifetimeXp is preserved (initialized from xp if absent),
// grades are recomputed from level, and stats are re-derived from level.
export async function migrateProgressionRecalc(players) {
  let recalculated = 0
  let promotions = 0
  let levelUps = 0

  for (const player of players) {
    if (!player) continue

    // Ensure lifetimeXp exists (initialize from current xp pool).
    if (player.lifetimeXp === undefined || player.lifetimeXp === null) {
      player.lifetimeXp = player.xp || 0
    }
    if (!player.baseStats) {
      player.baseStats = {
        hp: player.maxHealth || 100,
        ce: player.maxCursedEnergy || 50,
        strength: player.strength || 10,
        defense: player.defense || 10,
        speed: player.speed || 10,
        intelligence: player.intelligence || 10
      }
    }

    const before = player.level || 1
    const beforeGrade = player.grade

    const result = recalculatePlayer(player)

    if (result.level > before) levelUps += (result.level - before)
    if (result.promoted) promotions++
    recalculated++

    try {
      await savePlayer(player)
    } catch (err) {
      console.error(`[PROG RECALC] Failed to save ${player.name}:`, err.message)
    }
  }

  return { recalculated, promotions, levelUps }
}

export async function isProgressionRecalcCompleted() {
  try {
    if (await fs.pathExists(MIGRATION_FLAG_PATH)) {
      const flag = await fs.readJson(MIGRATION_FLAG_PATH)
      return flag?.completed === true
    }
  } catch {}
  return false
}

export async function markProgressionRecalcComplete() {
  await fs.ensureDir(path.dirname(MIGRATION_FLAG_PATH))
  await fs.writeJson(MIGRATION_FLAG_PATH, {
    completed: true,
    timestamp: Date.now(),
    version: "3.0.0"
  }, { spaces: 2 })
}
