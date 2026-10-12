import { loadCurseDatabase, getCurseById, createCurseFromDB, getWeightedGrade, getWeightedCurse } from "./CurseService.js"
import fsExtra from "fs-extra"
import path from "path"
import { randomInt } from "../../utils/generator.js"

const GROUP_CURSE_PATH = path.resolve("database/groupCurse.json")
const activeGroupCurses = new Map()

function loadGroupCurses() {
  try {
    return fsExtra.readJsonSync(GROUP_CURSE_PATH) || {}
  } catch {
    return {}
  }
}

function saveGroupCurses(data) {
  fsExtra.ensureDirSync(path.dirname(GROUP_CURSE_PATH))
  fsExtra.writeJsonSync(GROUP_CURSE_PATH, data, { spaces: 2 })
}

export function getActiveGroupCurse(groupId) {
  return activeGroupCurses.get(String(groupId)) || null
}

export function spawnGroupCurse(groupId, options = {}) {
  const db = loadCurseDatabase()
  if (db.length === 0) return null

  const grade = options.grade !== undefined ? options.grade : getWeightedGrade(options.playerLevel || 1)
  const curseId = getWeightedCurse(grade)
  if (!curseId) return null

  const curse = createCurseFromDB(curseId, options.playerLevel || 1, options.playerGrade || 4)
  const entry = {
    groupId: String(groupId),
    curse,
    spawnedAt: Date.now(),
    expiresAt: Date.now() + (30 * 60 * 1000),
    defeated: false,
    defeatedBy: null,
    attempts: 0
  }

  activeGroupCurses.set(String(groupId), entry)
  saveGroupCurses(Object.fromEntries(activeGroupCurses.entries()))
  return entry
}

export function despawnGroupCurse(groupId) {
  const key = String(groupId)
  activeGroupCurses.delete(key)
  const data = loadGroupCurses()
  delete data[key]
  saveGroupCurses(data)
}

export function getGroupCurseByGroupId(groupId) {
  return activeGroupCurses.get(String(groupId)) || null
}

export function defeatGroupCurse(groupId, playerId) {
  const entry = activeGroupCurses.get(String(groupId))
  if (!entry) return null
  entry.defeated = true
  entry.defeatedBy = String(playerId)
  entry.defeatedAt = Date.now()
  activeGroupCurses.delete(String(groupId))
  const data = loadGroupCurses()
  delete data[String(groupId)]
  saveGroupCurses(data)
  return entry
}

export function cleanupStaleGroupCurses() {
  const now = Date.now()
  for (const [groupId, entry] of activeGroupCurses.entries()) {
    if (entry.expiresAt && entry.expiresAt < now) {
      activeGroupCurses.delete(groupId)
      const data = loadGroupCurses()
      delete data[groupId]
      saveGroupCurses(data)
    }
  }
}

export function loadActiveGroupCursesFromDisk() {
  const data = loadGroupCurses()
  const now = Date.now()
  for (const [groupId, entry] of Object.entries(data)) {
    if (entry.expiresAt && entry.expiresAt < now) {
      delete data[groupId]
      continue
    }
    if (entry.curse && !entry.defeated) {
      activeGroupCurses.set(groupId, entry)
    }
  }
  saveGroupCurses(data)
}
