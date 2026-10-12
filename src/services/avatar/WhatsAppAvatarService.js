import fs from "fs-extra"
import path from "path"

const DEFAULT_AVATAR = path.join(process.cwd(), "src", "canvas", "assets", "default-avatar.png")
const CACHE_TTL = 5 * 60 * 1000
const cache = new Map()

export async function getPlayerAvatar(sock, jid) {
  const cacheKey = jid
  const cached = cache.get(cacheKey)
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return cached.buffer
  }

  try {
    const url = await sock.profilePictureUrl(jid, "image")
    if (!url) {
      return await loadDefaultAvatar()
    }

    const buffer = await fetchAvatar(url)
    if (!buffer || buffer.length === 0) {
      return await loadDefaultAvatar()
    }

    cache.set(cacheKey, { buffer, ts: Date.now() })
    return buffer
  } catch (err) {
    console.error("[KENNYJAKS ERROR] Failed to fetch profile picture:", err.message)
    return await loadDefaultAvatar()
  }
}

async function fetchAvatar(url) {
  try {
    const response = await fetch(url)
    if (!response.ok) return null
    const arrayBuffer = await response.arrayBuffer()
    return Buffer.from(arrayBuffer)
  } catch {
    return null
  }
}

async function loadDefaultAvatar() {
  try {
    if (await fs.pathExists(DEFAULT_AVATAR)) {
      return await fs.readFile(DEFAULT_AVATAR)
    }
  } catch {}
  return null
}
