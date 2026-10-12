const KLOOT_DEFINITIONS = {
  curse_binding_scroll: {
    id: "curse_binding_scroll",
    name: "Curse Binding Scroll",
    chance: 0.09,
    description: "A sacred scroll that can seal curses into service."
  },
  zero_gravity: {
    id: "zero_gravity",
    name: "Zero Gravity",
    chance: 0.12,
    description: "Manipulate gravity to cripple opponents."
  },
  benimaru: {
    id: "benimaru",
    name: "Benimaru",
    chance: 0.02,
    repRequired: 500000,
    description: "Divine flames that can burn everything."
  }
}

export class KlootService {
  static getDefinitions() {
    return KLOOT_DEFINITIONS
  }

  static hasKloot(player, klootId) {
    return (player.kloots || []).includes(klootId)
  }

  static addKloot(player, klootId) {
    if (!player.kloots) player.kloots = []
    if (!player.kloots.includes(klootId)) {
      player.kloots.push(klootId)
    }
  }

  static removeKloot(player, klootId) {
    if (!player.kloots) return
    player.kloots = player.kloots.filter(id => id !== klootId)
  }

  static isOnCooldown(player, klootId) {
    const cooldowns = player.klootCooldowns || {}
    const cooldownEnd = cooldowns[klootId]
    if (!cooldownEnd) return false
    return Date.now() < cooldownEnd
  }

  static setCooldown(player, klootId, durationMs) {
    if (!player.klootCooldowns) player.klootCooldowns = {}
    player.klootCooldowns[klootId] = Date.now() + durationMs
  }

  static getSealedCurses(player) {
    return player.sealedCurses || []
  }

  static addSealedCurse(player, curse) {
    if (!player.sealedCurses) player.sealedCurses = []
    player.sealedCurses.push(curse)
  }

  static updateSealedCurse(player, index, updates) {
    if (!player.sealedCurses || !player.sealedCurses[index]) return null
    const curse = player.sealedCurses[index]
    Object.assign(curse, updates)
    return curse
  }

  static getActiveSealedCurse(player) {
    return player.activeSealedCurseIndex !== undefined ? player.sealedCurses?.[player.activeSealedCurseIndex] : null
  }

  static setActiveSealedCurse(player, index) {
    player.activeSealedCurseIndex = index
  }

  static rollBattleKloots(player) {
    const rewards = []
    const roll = Math.random()

    for (const [id, def] of Object.entries(KLOOT_DEFINITIONS)) {
      if (roll < def.chance && !this.hasKloot(player, id)) {
        if (def.repRequired && (player.reputation || 0) < def.repRequired) {
          continue
        }
        rewards.push(id)
      }
    }

    return rewards
  }

  static rollCardReward() {
    const roll = Math.random()
    if (roll < 0.05) return { rarity: "SS", name: "Legendary Cursed Card" }
    if (roll < 0.15) return { rarity: "S", name: "Rare Cursed Card" }
    if (roll < 0.4) return { rarity: "A", name: "Uncommon Cursed Card" }
    return { rarity: "B", name: "Common Cursed Card" }
  }

  static getCooldownRemaining(player, klootId) {
    const cooldowns = player.klootCooldowns || {}
    const cooldownEnd = cooldowns[klootId]
    if (!cooldownEnd) return 0
    return Math.max(0, cooldownEnd - Date.now())
  }
}
