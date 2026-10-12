import { getMongoDb, isMongoConnected, connectMongo } from "./mongoService.js"
import { Player } from "../models/player.js"
import { cumulativeXpForLevel } from "../services/GradeService.js"
import { normalizePhoneNumber } from "../services/PermissionService.js"
import fsExtra from "fs-extra"
import path from "path"
import { DATABASE_PATH } from "../config/constants.js"

const COLLECTION = "players"

const playersDir = path.resolve(DATABASE_PATH)
const playerCache = new Map()
const CACHE_TTL_MS = 5 * 60 * 1000

function getCached(key, type) {
  const entry = playerCache.get(`${type}:${key}`)
  if (!entry) return null
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    playerCache.delete(`${type}:${key}`)
    return null
  }
  return entry.player
}

function setCached(key, type, player) {
  playerCache.set(`${type}:${key}`, { player, timestamp: Date.now() })
}

function sanitizeProgression(player) {
  const warnings = []
  if (!Number.isFinite(player.xp) || player.xp < 0) {
    player.xp = Math.max(0, Math.floor(player.xp || 0))
    warnings.push(`xp clamped to ${player.xp}`)
  }
  if (!Number.isFinite(player.level) || player.level < 1) {
    player.level = Math.max(1, Math.floor(player.level || 1))
    warnings.push(`level clamped to ${player.level}`)
  }
  if (!Number.isFinite(player.lifetimeXp) || player.lifetimeXp < 0) {
    player.lifetimeXp = Math.max(0, Math.floor(player.lifetimeXp || 0))
    warnings.push(`lifetimeXp clamped to ${player.lifetimeXp}`)
  }
  if (warnings.length) {
    console.warn(`[PROGRESSION WARNING] Player: ${player.name || player.playerId} | ${warnings.join(", ")}`)
  }
}

function getFilePath(playerId) {
  return path.join(playersDir, `${playerId}.json`)
}

export async function ensureDbDir() {
  await fsExtra.ensureDir(playersDir)
}

async function loadPlayerFile(phoneNumber) {
  await ensureDbDir()
  const normalized = normalizePhoneNumber(phoneNumber)
  try {
    const files = await fsExtra.readdir(playersDir)
    for (const file of files) {
      if (!file.endsWith(".json")) continue
      const filePath = path.join(playersDir, file)
      const data = await fsExtra.readJson(filePath)
      if (normalizePhoneNumber(data.phoneNumber) === normalized) {
        return new Player(data)
      }
    }
  } catch {}
  return null
}

async function savePlayerFile(player) {
  await ensureDbDir()
  const filePath = getFilePath(player.playerId)
  await fsExtra.writeJson(filePath, player, { spaces: 2 })
}

async function loadPlayerFileById(playerId) {
  await ensureDbDir()
  try {
    const filePath = getFilePath(playerId)
    if (await fsExtra.pathExists(filePath)) {
      const data = await fsExtra.readJson(filePath)
      return new Player(data)
    }
  } catch {}
  return null
}

export async function playerExists(phoneNumber) {
  if (isMongoConnected()) {
    const db = getMongoDb()
    const doc = await db.collection(COLLECTION).findOne({ phoneNumber: normalizePhoneNumber(phoneNumber) }, { projection: { _id: 1 } })
    return !!doc
  }
  const cached = getCached(normalizePhoneNumber(phoneNumber), "phone")
  if (cached) return true
  return !!(await loadPlayerFile(phoneNumber))
}

export async function loadPlayerByPhone(phoneNumber) {
  const normalized = normalizePhoneNumber(phoneNumber)
  const cached = getCached(normalized, "phone")
  if (cached) return cached

  if (isMongoConnected()) {
    const db = getMongoDb()
    const doc = await db.collection(COLLECTION).findOne({ phoneNumber: normalized })
    if (doc) {
      const player = new Player(doc)
      setCached(normalized, "phone", player)
      setCached(player.playerId, "id", player)
      if (player.name) setCached(player.name.toLowerCase().trim(), "name", player)
      return player
    }
  } else {
    const player = await loadPlayerFile(phoneNumber)
    if (player) {
      setCached(normalized, "phone", player)
      setCached(player.playerId, "id", player)
      if (player.name) setCached(player.name.toLowerCase().trim(), "name", player)
      return player
    }
  }
  return null
}

export async function loadPlayerByName(name) {
  const normalized = name.toLowerCase().trim()
  const cached = getCached(normalized, "name")
  if (cached) return cached

  if (isMongoConnected()) {
    const db = getMongoDb()
    const doc = await db.collection(COLLECTION).findOne({ name: normalized })
    if (doc) {
      const player = new Player(doc)
      setCached(normalized, "name", player)
      setCached(player.phoneNumber, "phone", player)
      setCached(player.playerId, "id", player)
      return player
    }
  } else {
    await ensureDbDir()
    try {
      const files = await fsExtra.readdir(playersDir)
      for (const file of files) {
        if (!file.endsWith(".json")) continue
        const filePath = path.join(playersDir, file)
        const data = await fsExtra.readJson(filePath)
        if (data.name && data.name.toLowerCase() === normalized) {
          const player = new Player(data)
          setCached(normalized, "name", player)
          setCached(player.phoneNumber, "phone", player)
          setCached(player.playerId, "id", player)
          return player
        }
      }
    } catch {}
  }
  return null
}

export async function savePlayer(player) {
  sanitizeProgression(player)

  if (player.phoneNumber) {
    player.phoneNumber = normalizePhoneNumber(player.phoneNumber)
  }

  if (isMongoConnected()) {
    const db = getMongoDb()
    const filter = { playerId: player.playerId }
    const update = {
      $set: {
        ...player,
        updatedAt: new Date()
      },
      $setOnInsert: {
        createdAt: new Date()
      }
    }
    const options = { upsert: true, returnDocument: "after" }
    const result = await db.collection(COLLECTION).findOneAndUpdate(filter, update, options)
    const saved = result.value
    if (saved) {
      setCached(saved.phoneNumber, "phone", saved)
      setCached(saved.playerId, "id", saved)
      if (saved.name) setCached(saved.name.toLowerCase().trim(), "name", saved)
      return new Player(saved)
    }
    return player
  }

  await savePlayerFile(player)
  setCached(player.phoneNumber, "phone", player)
  setCached(player.playerId, "id", player)
  if (player.name) setCached(player.name.toLowerCase().trim(), "name", player)
  return player
}

export async function loadPlayerById(playerId) {
  const cached = getCached(playerId, "id")
  if (cached) return cached

  if (isMongoConnected()) {
    const db = getMongoDb()
    const doc = await db.collection(COLLECTION).findOne({ playerId })
    if (doc) {
      const player = new Player(doc)
      setCached(playerId, "id", player)
      if (player.phoneNumber) setCached(player.phoneNumber, "phone", player)
      if (player.name) setCached(player.name.toLowerCase().trim(), "name", player)
      return player
    }
  } else {
    const player = await loadPlayerFileById(playerId)
    if (player) {
      setCached(playerId, "id", player)
      if (player.phoneNumber) setCached(player.phoneNumber, "phone", player)
      if (player.name) setCached(player.name.toLowerCase().trim(), "name", player)
      return player
    }
  }
  return null
}

export async function loadAllPlayers() {
  if (isMongoConnected()) {
    const db = getMongoDb()
    const docs = await db.collection(COLLECTION).find({}).toArray()
    return docs.map(doc => new Player(doc))
  }

  await ensureDbDir()
  try {
    const files = await fsExtra.readdir(playersDir)
    const players = []
    for (const file of files) {
      if (!file.endsWith(".json")) continue
      const filePath = path.join(playersDir, file)
      const data = await fsExtra.readJson(filePath)
      if (!data.playerId && !data.phoneNumber) continue
      players.push(new Player(data))
    }
    return players
  } catch {
    return []
  }
}

export function getSavePath() {
  return isMongoConnected() ? "mongodb://players" : playersDir
}

export async function deletePlayer(phoneNumber) {
  if (isMongoConnected()) {
    const db = getMongoDb()
    await db.collection(COLLECTION).deleteOne({ phoneNumber: normalizePhoneNumber(phoneNumber) })
    return
  }
  await ensureDbDir()
  const normalized = normalizePhoneNumber(phoneNumber)
  try {
    const files = await fsExtra.readdir(playersDir)
    for (const file of files) {
      if (!file.endsWith(".json")) continue
      const filePath = path.join(playersDir, file)
      const data = await fsExtra.readJson(filePath)
      if (normalizePhoneNumber(data.phoneNumber) === normalized) {
        await fsExtra.remove(filePath)
        return
      }
    }
  } catch {}
}

export async function clearAllPlayers() {
  if (isMongoConnected()) {
    const db = getMongoDb()
    await db.collection(COLLECTION).deleteMany({})
    return
  }
  await ensureDbDir()
  try {
    await fsExtra.emptyDir(playersDir)
  } catch {
    await fsExtra.ensureDir(playersDir)
  }
}

export async function migrateInventoryCapacity() {
  const players = await loadAllPlayers()
  let migrated = 0
  for (const player of players) {
    if (!player.inventoryCapacity || player.inventoryCapacity < 30) {
      player.inventoryCapacity = 30
      await savePlayer(player)
      migrated++
    }
  }
  return migrated
}
