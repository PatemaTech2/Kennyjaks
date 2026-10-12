// Centralized permission configuration + sender normalization.
// Bot Moderator and Bot Owner are determined ONLY by these lists, never by
// WhatsApp group-admin metadata.

import { OWNER_NUMBERS, MODERATOR_NUMBERS, TEMP_OWNERS_FILE } from "../config/constants.js"
import fsExtra from "fs-extra"
import path from "path"

export const BOT_OWNER = OWNER_NUMBERS
export const BOT_MODERATORS = MODERATOR_NUMBERS

let tempOwnersCache = null
let tempOwnersCacheExpiry = 0

// Owner IDs from owner.json - cached phone numbers
let ownerJsonPhoneNumbers = new Set()
let ownerJsonCacheExpiry = 0
const OWNER_JSON_CACHE_TTL_MS = 60_000 // 1 minute

function ensureTempOwnersFile() {
  const dir = path.dirname(TEMP_OWNERS_FILE)
  if (!fsExtra.existsSync(dir)) {
    fsExtra.ensureDirSync(dir)
  }
  if (!fsExtra.existsSync(TEMP_OWNERS_FILE)) {
    fsExtra.writeJSONSync(TEMP_OWNERS_FILE, [])
  }
}

export function loadTempOwners() {
  const now = Date.now()
  if (tempOwnersCache && now < tempOwnersCacheExpiry) {
    return tempOwnersCache
  }

  ensureTempOwnersFile()
  try {
    const raw = fsExtra.readJSONSync(TEMP_OWNERS_FILE, { throws: false }) || []
    const valid = raw.filter(entry => entry.expiresAt && Date.now() < entry.expiresAt)
    tempOwnersCache = valid
    tempOwnersCacheExpiry = now + 30_000
    return tempOwnersCache
  } catch {
    tempOwnersCache = []
    tempOwnersCacheExpiry = now + 30_000
    return tempOwnersCache
  }
}

export function saveTempOwners(entries) {
  ensureTempOwnersFile()
  fsExtra.writeJSONSync(TEMP_OWNERS_FILE, entries)
  tempOwnersCache = entries
  tempOwnersCacheExpiry = Date.now() + 30_000
  return entries
}

export function addTempOwner(phoneNumber, durationMs) {
  const entries = loadTempOwners()
  const norm = normalizePhoneNumber(phoneNumber)
  const existing = entries.find(e => normalizePhoneNumber(e.phone) === norm)
  if (existing) {
    existing.expiresAt = Date.now() + durationMs
  } else {
    entries.push({ phone: norm, expiresAt: Date.now() + durationMs })
  }
  saveTempOwners(entries)
  return entries.find(e => normalizePhoneNumber(e.phone) === norm)
}

export function removeTempOwner(phoneNumber) {
  const norm = normalizePhoneNumber(phoneNumber)
  const entries = loadTempOwners().filter(e => normalizePhoneNumber(e.phone) !== norm)
  saveTempOwners(entries)
  return entries
}

export function getTempOwnerExpiry(phoneNumber) {
  const norm = normalizePhoneNumber(phoneNumber)
  const entry = loadTempOwners().find(e => normalizePhoneNumber(e.phone) === norm)
  return entry ? entry.expiresAt : null
}

// Normalize any phone/JID-ish string into digits-only (no +, no @, no spaces).
export function normalizePhoneNumber(input) {
  if (!input) return ""
  return String(input)
    .replace(/\D/g, "") // keep digits only
}

// Normalize a WhatsApp JID (e.g. 2347037148740@s.whatsapp.net or ...@g.us) to digits.
export function normalizeJid(jid) {
  if (!jid) return ""
  const local = String(jid).split("@")[0]
  return normalizePhoneNumber(local)
}

// Get the phone number (digits only) from a message key.
export function getPhoneNumberFromJid(jid) {
  return normalizeJid(jid)
}

// Load phone numbers from owner.json (player IDs)
async function loadOwnerJsonPhoneNumbers() {
  try {
    const ownerJsonPath = path.resolve("owner.json")
    if (!fsExtra.existsSync(ownerJsonPath)) {
      // Create empty file if doesn't exist
      await fsExtra.writeJson(ownerJsonPath, [], { spaces: 2 })
      return new Set()
    }
    
    const ownerIds = await fsExtra.readJson(ownerJsonPath)
    if (!Array.isArray(ownerIds)) {
      return new Set()
    }
    
    // Resolve player IDs to phone numbers
    const phoneNumbers = new Set()
    for (const playerId of ownerIds) {
      if (typeof playerId !== 'string') continue
      
      // Try to load player by ID to get phone number
      try {
        // Use dynamic import to avoid circular dependency
        const { loadPlayerById } = await import("../database/playerRepo.js")
        const player = await loadPlayerById(playerId)
        if (player && player.phoneNumber) {
          const norm = normalizePhoneNumber(player.phoneNumber)
          if (norm) {
            phoneNumbers.add(norm)
          }
        }
      } catch (err) {
        // If player not found or error, skip
        console.warn(`[PermissionService] Could not resolve player ID ${playerId} from owner.json: ${err.message}`)
      }
    }
    
    return phoneNumbers
  } catch (err) {
    console.error("[PermissionService] Failed to load owner.json:", err)
    return new Set()
  }
}

// Initialize owner.json phone numbers cache
export async function initOwnerJsonCache() {
  ownerJsonPhoneNumbers = await loadOwnerJsonPhoneNumbers()
  ownerJsonCacheExpiry = Date.now() + OWNER_JSON_CACHE_TTL_MS
}

// Check if owner.json cache needs refresh and refresh if needed
export async function refreshOwnerJsonCacheIfNeeded() {
  const now = Date.now()
  if (now >= ownerJsonCacheExpiry) {
    ownerJsonPhoneNumbers = await loadOwnerJsonPhoneNumbers()
    ownerJsonCacheExpiry = now + OWNER_JSON_CACHE_TTL_MS
  }
}

export function isOwner(phoneNumber) {
  const norm = normalizePhoneNumber(phoneNumber)
  return BOT_OWNER.some(n => normalizePhoneNumber(n) === norm)
}

export function isModerator(phoneNumber) {
  const norm = normalizePhoneNumber(phoneNumber)
  return BOT_MODERATORS.some(n => normalizePhoneNumber(n) === norm)
}

export function isOwnerOrModerator(phoneNumber) {
  // Check regular owner/moderator lists
  if (isOwner(phoneNumber) || isModerator(phoneNumber)) {
    return true
  }
  
  // Check temp owners
  if (isTempOwner(phoneNumber)) {
    return true
  }
  
  // Check owner.json phone numbers (sync check of cached set)
  const norm = normalizePhoneNumber(phoneNumber)
  if (ownerJsonPhoneNumbers.has(norm)) {
    return true
  }
  
  return false
}

export function isTempOwner(phoneNumber) {
  const norm = normalizePhoneNumber(phoneNumber)
  const entry = loadTempOwners().find(e => normalizePhoneNumber(e.phone) === norm)
  return !!entry && Date.now() < entry.expiresAt
}

export function getTempOwnerRemainingMs(phoneNumber) {
  const expiry = getTempOwnerExpiry(phoneNumber)
  if (!expiry) return 0
  return Math.max(0, expiry - Date.now())
}