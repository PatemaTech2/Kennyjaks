import fs from "fs"
import path from "path"

const SKINS_DIR = path.resolve("Kennyjaksskins")

export function getAvailableSprites() {
  try {
    if (!fs.existsSync(SKINS_DIR)) return []
    return fs.readdirSync(SKINS_DIR)
      .filter(f => f.endsWith(".png") || f.endsWith(".jpg"))
      .sort()
  } catch {
    return []
  }
}

export function getSpriteByNumber(num) {
  const files = getAvailableSprites()
  const idx = num - 1
  if (idx < 0 || idx >= files.length) return null
  return { file: files[idx], number: num }
}

export function getSpriteBuffer(spriteFile) {
  const spritePath = path.join(SKINS_DIR, spriteFile)
  if (fs.existsSync(spritePath)) {
    return fs.readFileSync(spritePath)
  }
  return null
}

export function getSpriteName(spriteFile) {
  return spriteFile.replace(".png", "").replace(".jpg", "")
}