export function getAttribute(player, attribute) {
  if (!player || !player.baseStats) return 0
  const key = attribute.toLowerCase()
  const value = player.baseStats[key]
  if (value === undefined || value === null) return 0
  return Number(value) || 0
}

export function setAttribute(player, attribute, value) {
  if (!player || !player.baseStats) return
  player.baseStats[attribute.toLowerCase()] = Number(value) || 0
}

export function addAttribute(player, attribute, delta) {
  if (!player || !player.baseStats) return
  const key = attribute.toLowerCase()
  const current = Number(player.baseStats[key]) || 0
  player.baseStats[key] = Math.max(0, current + Number(delta))
}

export function ensureAttributes(player) {
  if (!player) return
  player.baseStats = player.baseStats || {}

  const defaults = {
    hp: player.maxHealth || 100,
    ce: player.maxCursedEnergy || 50,
    strength: player.strength || 10,
    defense: player.defense || 10,
    speed: player.speed || 10,
    intelligence: player.intelligence || 10,
    stamina: player.stamina || 10,
    luck: player.luck || 10,
    techniqueControl: player.baseStats.techniqueControl || 0
  }

  for (const [key, value] of Object.entries(defaults)) {
    if (player.baseStats[key] === undefined || player.baseStats[key] === null) {
      player.baseStats[key] = value
    }
  }
}

export function getTechniqueControl(player) {
  return getAttribute(player, "techniqueControl")
}
