import fsExtra from "fs-extra"
import path from "path"
import { normalizePhoneNumber } from "./PermissionService.js"

const BANNED_FILE = "database/banned.json"

let bannedCache = null
let cacheExpiry = 0
const CACHE_TTL_MS = 60_000

async function loadBanned() {
  try {
    await fsExtra.ensureFile(BANNED_FILE)
    const data = await fsExtra.readJson(BANNED_FILE)
    if (Array.isArray(data)) return data
    return []
  } catch {
    return []
  }
}

async function saveBanned(entries) {
  await fsExtra.ensureFile(BANNED_FILE)
  await fsExtra.writeJson(BANNED_FILE, entries, { spaces: 2 })
  bannedCache = entries.map(e => e.phone)
  cacheExpiry = Date.now() + CACHE_TTL_MS
}

function isCacheValid() {
  return bannedCache && Date.now() < cacheExpiry
}

export async function isBanned(phoneNumber) {
  const norm = normalizePhoneNumber(phoneNumber)
  if (!norm) return false
  if (isCacheValid()) {
    return bannedCache.includes(norm)
  }
  const entries = await loadBanned()
  bannedCache = entries.map(e => e.phone)
  cacheExpiry = Date.now() + CACHE_TTL_MS
  return bannedCache.includes(norm)
}

export async function banUser(phoneNumber, reason = "") {
  const norm = normalizePhoneNumber(phoneNumber)
  if (!norm) return null
  const entries = await loadBanned()
  const existing = entries.find(e => normalizePhoneNumber(e.phone) === norm)
  if (existing) {
    existing.bannedAt = Date.now()
    existing.reason = reason
    await saveBanned(entries)
    return existing
  }
  const entry = { phone: norm, bannedAt: Date.now(), reason }
  entries.push(entry)
  await saveBanned(entries)
  return entry
}

export async function unbanUser(phoneNumber) {
  const norm = normalizePhoneNumber(phoneNumber)
  if (!norm) return false
  const entries = await loadBanned()
  const filtered = entries.filter(e => normalizePhoneNumber(e.phone) !== norm)
  if (filtered.length === entries.length) return false
  await saveBanned(filtered)
  return true
}

export async function getBannedUsers() {
  if (isCacheValid()) return [...bannedCache]
  const entries = await loadBanned()
  bannedCache = entries.map(e => e.phone)
  cacheExpiry = Date.now() + CACHE_TTL_MS
  return entries.map(e => e.phone)
}
