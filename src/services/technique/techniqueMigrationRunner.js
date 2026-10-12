import fs from "fs-extra"
import path from "path"
import { migrateTechniques, migratePlayerTechnique } from "./techniqueMigration.js"

const MIGRATION_VERSION = 2
const MIGRATION_FILE = path.join(process.cwd(), "database", "techniqueMigration.json")

async function loadMigrationState() {
  try {
    if (await fs.pathExists(MIGRATION_FILE)) {
      return await fs.readJson(MIGRATION_FILE)
    }
  } catch {}
  return { version: 0, migratedAt: null }
}

async function saveMigrationState(state) {
  await fs.ensureDir(path.dirname(MIGRATION_FILE))
  await fs.writeJson(MIGRATION_FILE, state, { spaces: 2 })
}

export async function runTechniqueMigration() {
  const state = await loadMigrationState()

  if (state.version >= MIGRATION_VERSION) {
    return {
      success: true,
      skipped: true,
      message: `Technique migration already at version ${state.version}`
    }
  }

  console.log("[TECHNIQUE MIGRATION] Starting migration to version", MIGRATION_VERSION)

  try {
    const result = await migrateTechniques()

    state.version = MIGRATION_VERSION
    state.migratedAt = new Date().toISOString()
    state.playersMigrated = result.migrated
    await saveMigrationState(state)

    console.log(`[TECHNIQUE MIGRATION] Migrated ${result.migrated} players`)

    return {
      success: true,
      skipped: false,
      ...result
    }
  } catch (err) {
    console.error("[TECHNIQUE MIGRATION] Failed:", err)
    return {
      success: false,
      error: err.message
    }
  }
}

export async function migrateSinglePlayer(player) {
  return migratePlayerTechnique(player)
}
