import fs from "fs-extra"
import path from "path"
import { fileURLToPath } from "url"
import { ProgressionManager } from "./ProgressionManager.js"
import { ProgressionService } from "./ProgressionService.js"
import { savePlayer } from "../../database/playerRepo.js"
import { Player } from "../../models/player.js"
import { BlackFlashService, migrateBlackFlashAffinities } from "../battle/BlackFlashService.js"
import { migrateRCTPlayers, isRctMigrationCompleted, markRctMigrationComplete } from "../rct/RCTMigration.js"
import { migrateTechniqueMastery, isTechniqueMasteryMigrationCompleted, markTechniqueMasteryMigrationComplete } from "../technique/TechniqueMasteryMigration.js"
import { migrateProgressionRecalc, isProgressionRecalcCompleted, markProgressionRecalcComplete } from "./ProgressionRecalcMigration.js"
import { migrateAllPlayers as migrateCombatStats, MIGRATION_VERSION as COMBAT_STAT_MIGRATION_VERSION } from "./CombatStatMigration.js"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PLAYER_DB_PATH = path.join(process.cwd(), "database", "players")
const MIGRATION_FLAG_PATH = path.join(process.cwd(), ".kilo", "migrated", "technique_progression.json")
const BF_MIGRATION_FLAG_PATH = path.join(process.cwd(), ".kilo", "migrated", "black_flash_affinity.json")
const RECONCILIATION_FLAG_PATH = path.join(process.cwd(), ".kilo", "migrated", "progression_reconciliation.json")
const COMBAT_STAT_MIGRATION_FLAG_PATH = path.join(process.cwd(), ".kilo", "migrated", "combat_stat_reset.json")

export async function runMigration() {
  try {
    await fs.ensureDir(path.dirname(MIGRATION_FLAG_PATH))

    let bfMigrationSkipped = false
    if (await fs.pathExists(BF_MIGRATION_FLAG_PATH)) {
      try {
        const bfFlag = await fs.readJson(BF_MIGRATION_FLAG_PATH)
        bfMigrationSkipped = bfFlag?.completed === true
      } catch {}
    }

    let techMigrationSkipped = false
    if (await fs.pathExists(MIGRATION_FLAG_PATH)) {
      try {
        const flag = await fs.readJson(MIGRATION_FLAG_PATH)
        techMigrationSkipped = flag?.completed === true
      } catch {}
    }

    const players = await loadAllPlayers()
    if (players.length === 0) {
      console.log("[MIGRATION] No players found. Nothing to migrate.")
      await markMigrationComplete()
      await markBfMigrationComplete()
      await markRctMigrationComplete()
      return { total: 0, message: "No players found" }
    }

    if (!bfMigrationSkipped) {
      console.log("[MIGRATION] Starting Black Flash affinity migration...")
      const bfResults = await migrateBlackFlashAffinities(players)
      await markBfMigrationComplete()
    } else {
      console.log("[MIGRATION] Black Flash affinity migration already completed. Skipping.")
    }

    const rctMigrationSkipped = await isRctMigrationCompleted()
    if (!rctMigrationSkipped) {
      console.log("[MIGRATION] Starting RCT awakening migration...")
      const rctResults = await migrateRCTPlayers(players)
      await markRctMigrationComplete()
      console.log(`[MIGRATION] RCT migration: ${rctResults.migrated} migrated, ${rctResults.skipped} skipped`)
    } else {
      console.log("[MIGRATION] RCT awakening migration already completed. Skipping.")
    }

    // V3: Recalculate level + grade from lifetime XP for every player (idempotent, no progress lost)
    const recalcSkipped = await isProgressionRecalcCompleted()
    if (!recalcSkipped) {
      console.log("[MIGRATION] Starting V3 progression recalculation...")
      const recalcResults = await migrateProgressionRecalc(players)
      await markProgressionRecalcComplete()
      console.log(`[MIGRATION] V3 recalc: ${recalcResults.recalculated} recalculated, ${recalcResults.promotions} promotions, ${recalcResults.levelUps} level-ups`)
    } else {
      console.log("[MIGRATION] V3 progression recalculation already completed. Skipping.")
    }

    const reconciliationSkipped = await isReconciliationMigrationCompleted()
    if (!reconciliationSkipped) {
      console.log("[MIGRATION] Starting progression reconciliation migration...")
      const reconciliationResults = await reconcileAllPlayers(players)
      await markReconciliationMigrationComplete()
      console.log(`[MIGRATION] Reconciliation: ${reconciliationResults.reconciled} reconciled, ${reconciliationResults.skillsUnlocked} skills unlocked, ${reconciliationResults.masteryUnlocked} mastery skills unlocked`)
    } else {
      console.log("[MIGRATION] Progression reconciliation migration already completed. Skipping.")
    }

    const combatStatMigrationSkipped = await isCombatStatMigrationCompleted()
    if (!combatStatMigrationSkipped) {
      console.log("[MIGRATION] Starting combat stat reset migration...")
      const combatStatResults = await migrateCombatStats()
      await markCombatStatMigrationComplete()
      console.log(`[MIGRATION] Combat stat reset: ${combatStatResults.migrated} migrated, ${combatStatResults.skipped} skipped, ${combatStatResults.errors.length} errors`)
    } else {
      console.log("[MIGRATION] Combat stat reset migration already completed. Skipping.")
    }

    if (techMigrationSkipped) {
      console.log("[MIGRATION] Technique progression migration already completed. Skipping.")
      const tmMigrationSkipped = await isTechniqueMasteryMigrationCompleted()
      if (tmMigrationSkipped) {
        console.log("[MIGRATION] Technique mastery migration already completed. Skipping.")
      } else {
        console.log("[MIGRATION] Starting technique mastery migration...")
        const tmResults = await migrateTechniqueMastery(players)
        await markTechniqueMasteryMigrationComplete()
        console.log(`[MIGRATION] Technique mastery: ${tmResults.migrated} migrated, ${tmResults.skipped} skipped, ${tmResults.skillsAutoUnlocked} skills auto-unlocked, ${tmResults.shikigamiAutoConquered} shikigami auto-conquered`)
      }
      return { skipped: true, message: "Migration already completed" }
    }

    console.log("[MIGRATION] Starting technique progression migration...")
    
    const results = await ProgressionManager.migrateAllPlayers(players)

    await markMigrationComplete()

    console.log(`[MIGRATION] Complete: ${results.total} players scanned, ${results.migrated} migrated, ${results.unlocked} skills unlocked`)
    
    console.log("[MIGRATION] Starting technique mastery migration...")
    const tmResults = await migrateTechniqueMastery(players)
    await markTechniqueMasteryMigrationComplete()
    console.log(`[MIGRATION] Technique mastery: ${tmResults.migrated} migrated, ${tmResults.skipped} skipped, ${tmResults.skillsAutoUnlocked} skills auto-unlocked, ${tmResults.shikigamiAutoConquered} shikigami auto-conquered`)

    if (results.errors.length > 0) {
      console.error(`[MIGRATION] ${results.errors.length} errors encountered`)
    }

    return results
  } catch (err) {
    console.error("[MIGRATION] Fatal error:", err.message)
    return { error: err.message }
  }
}

async function loadAllPlayers() {
  const players = []
  try {
    const files = await fs.readdir(PLAYER_DB_PATH)
    const jsonFiles = files.filter(f => f.endsWith(".json"))

    for (const file of jsonFiles) {
      try {
        const rawData = await fs.readJson(path.join(PLAYER_DB_PATH, file))
        const player = new Player(rawData)
        players.push(player)
      } catch (err) {
        console.error(`[MIGRATION] Failed to load player file ${file}:`, err.message)
      }
    }
  } catch (err) {
    console.error("[MIgration] Failed to read player database:", err.message)
  }
  return players
}

async function markMigrationComplete() {
  await fs.writeJson(MIGRATION_FLAG_PATH, {
    completed: true,
    timestamp: Date.now(),
    version: "2.14.0"
  }, { spaces: 2 })
}

async function markBfMigrationComplete() {
  await fs.writeJson(BF_MIGRATION_FLAG_PATH, {
    completed: true,
    timestamp: Date.now(),
    version: "2.15.0"
  }, { spaces: 2 })
}

async function isReconciliationMigrationCompleted() {
  try {
    if (await fs.pathExists(RECONCILIATION_FLAG_PATH)) {
      const flag = await fs.readJson(RECONCILIATION_FLAG_PATH)
      return flag?.completed === true
    }
  } catch {}
  return false
}

async function markReconciliationMigrationComplete() {
  await fs.ensureDir(path.dirname(RECONCILIATION_FLAG_PATH))
  await fs.writeJson(RECONCILIATION_FLAG_PATH, {
    completed: true,
    timestamp: Date.now(),
    version: "2.16.0"
  }, { spaces: 2 })
}

async function reconcileAllPlayers(players) {
  let reconciled = 0
  let skillsUnlocked = 0
  let masteryUnlocked = 0

  for (const player of players) {
    try {
      const result = await ProgressionService.reconcilePlayerProgression(player)
      if (result.reconciled) {
        reconciled++
        skillsUnlocked += result.skillUnlocks || 0
        masteryUnlocked += result.masteryUnlocks || 0
      }
      await savePlayer(player)
    } catch (err) {
      console.error(`[MIGRATION] Failed to reconcile player ${player.playerId}:`, err.message)
    }
  }

  return { reconciled, skillsUnlocked, masteryUnlocked }
}

async function isCombatStatMigrationCompleted() {
  try {
    if (await fs.pathExists(COMBAT_STAT_MIGRATION_FLAG_PATH)) {
      const flag = await fs.readJson(COMBAT_STAT_MIGRATION_FLAG_PATH)
      return flag?.completed === true
    }
  } catch {}
  return false
}

async function markCombatStatMigrationComplete() {
  await fs.ensureDir(path.dirname(COMBAT_STAT_MIGRATION_FLAG_PATH))
  await fs.writeJson(COMBAT_STAT_MIGRATION_FLAG_PATH, {
    completed: true,
    timestamp: Date.now(),
    version: COMBAT_STAT_MIGRATION_VERSION
  }, { spaces: 2 })
}
