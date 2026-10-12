import fsExtra from "fs-extra"
import path from "path"

const LINKS_FILE = "database/telegramLinks.json"

export function ensureLinksFile() {
  const dir = path.dirname(LINKS_FILE)
  if (!fsExtra.existsSync(dir)) {
    fsExtra.ensureDirSync(dir)
  }
  if (!fsExtra.existsSync(LINKS_FILE)) {
    fsExtra.writeJSONSync(LINKS_FILE, [])
  }
}

export function loadLinks() {
  ensureLinksFile()
  try {
    return fsExtra.readJSONSync(LINKS_FILE, { throws: false }) || []
  } catch {
    return []
  }
}

export function saveLinks(links) {
  ensureLinksFile()
  fsExtra.writeJSONSync(LINKS_FILE, links)
  return links
}

// New structure: telegramId -> playerId
export function linkTelegramToPlayer(telegramId, playerId) {
  const links = loadLinks()
  
  // Remove existing links for this telegram ID
  const filtered = links.filter(link => link.telegramId !== String(telegramId))
  
  // Add new link
  filtered.push({
    telegramId: String(telegramId),
    playerId: playerId,
    linkedAt: Date.now()
  })
  
  saveLinks(filtered)
  return true
}

export function unlinkTelegram(telegramId) {
  const links = loadLinks()
  const filtered = links.filter(link => link.telegramId !== String(telegramId))
  saveLinks(filtered)
  return links.length !== filtered.length // Returns true if something was removed
}

export function getPlayerIdByTelegramId(telegramId) {
  const links = loadLinks()
  const link = links.find(link => link.telegramId === String(telegramId))
  return link ? link.playerId : null
}

export function getTelegramIdByPlayerId(playerId) {
  const links = loadLinks()
  const link = links.find(link => link.playerId === playerId)
  return link ? link.telegramId : null
}

// Keep old function for backward compatibility
export function getPhoneByTelegramId(telegramId) {
  const links = loadLinks()
  const link = links.find(link => link.telegramId === String(telegramId))
  if (link && link.phoneNumber) {
    return link.phoneNumber
  }
  // If no phoneNumber but has playerId, try to get phone from player
  if (link && link.playerId) {
    try {
      const { loadPlayerById } = require('../../database/playerRepo.js')
      const player = loadPlayerById(link.playerId)
      if (player) return player.phoneNumber
    } catch {
      // ignore
    }
  }
  return null
}

export function getTelegramIdByPhone(phoneNumber) {
  const normPhone = String(phoneNumber).replace(/\D/g, "")
  // This is deprecated but kept for compatibility
  const links = loadLinks()
  // First check if any link has phoneNumber
  let link = links.find(link => link.phoneNumber === normPhone)
  if (link) return link.telegramId
  
  // If not, check if any linked player has this phone number
  for (const link of links) {
    if (link.playerId) {
      try {
        const { loadPlayerById } = require('../../database/playerRepo.js')
        const player = loadPlayerById(link.playerId)
        if (player && player.phoneNumber === normPhone) {
          return link.telegramId
        }
      } catch {
        // ignore
      }
    }
  }
  return null
}