import { weaponSkills } from "../../data/items/weapons.js"

const LIVING_WEAPON_ABILITIES = {
  atk: ["Soul Resonance", "Evolve", "Living Blade", "Adaptive Strike", "Ascension"],
  def: ["Shield Form", "Barrier Pulse", "Guard Evolution", "Aegis Core", "Absolute Defense"],
  spd: ["Swift Soul", "Phase Walk", "Velocity Surge", "Dimensional Dash", "Infinity Stride"],
  sup: ["Spirit Bond", "Technique Amplification", "Energy Transfer", "Synergy", "Domain Echo"],
  rng: ["Lucky Strikes", "Critical Evolution", "Fortuitous Strikes", "Destiny's Favor", "Miracle Strike"],
  nul: ["Curse Nullifier", "Technique Reflection", "Absorption", "Immunity", "Divine Protection"],
  spc: ["Six Eyes", "Limitless Technique", "Infinity", "Cursed Object", "Devil's Luck"],
  hck: ["Hunger Boost", "Blood Surge", "Life Drain", "Vitality Theft", "Immortal Coil"],
  ice: ["Frost Aura", "Blizzard Strike", "Frozen Domain", "Absolute Zero", "Eternal Winter"],
  fir: ["Flame Core", "Inferno Strike", "Fire Domain", "Meteor Call", "Rengoku"],
  ele: ["Lightning Form", "Thunder Strike", "Storm Domain", "Lightning Armor", "Raijin"],
  sha: ["Shadow Merge", "Void Walk", "Darkness Domain", "Abyssal Strike", "Null Void"]
}

export const LIVING_WEAPON_TIERS = [
  { name: "Awakening", minLevel: 1, icon: "⭐", statBonus: 0.1 },
  { name: "Mutation", minLevel: 10, icon: "⭐⭐", statBonus: 0.2 },
  { name: "Awakening+", minLevel: 25, icon: "⭐⭐⭐", statBonus: 0.35 },
  { name: "True Form", minLevel: 50, icon: "⭐⭐⭐⭐", statBonus: 0.5 },
  { name: "Divine Form", minLevel: 100, icon: "⭐⭐⭐⭐⭐", statBonus: 0.8 }
]

export function getLivingWeaponAbilities(playerTechnique) {
  const key = playerTechnique?.substring(0, 3)?.toLowerCase() || "atk"
  return LIVING_WEAPON_ABILITIES[key] || LIVING_WEAPON_ABILITIES.atk
}

export function getLivingWeaponTier(level) {
  const tier = [...LIVING_WEAPON_TIERS].reverse().find(t => level >= t.minLevel)
  return tier || LIVING_WEAPON_TIERS[0]
}

export function processLivingWeaponXP(player, damageDealt) {
  const weapon = player.equippedItems?.weapon
  if (!weapon || !weapon.isLiving) return null

  weapon.exp = weapon.exp || 0
  weapon.level = weapon.level || 1

  const expGain = Math.floor(damageDealt * (weapon.isCursed ? 2 : 1))
  weapon.exp += expGain

  const expForNextLevel = weapon.level * 1000
  let leveledUp = false
  while (weapon.exp >= expForNextLevel) {
    weapon.exp -= expForNextLevel
    weapon.level++
    leveledUp = true
    const tier = getLivingWeaponTier(weapon.level)
    weapon.tier = tier.name
    weapon.tierIcon = tier.icon
    weapon.statMultiplier = 1 + tier.statBonus
  }

  if (leveledUp) {
    const newTier = getLivingWeaponTier(weapon.level)
    const abilities = getLivingWeaponAbilities(player.technique)
    const abilityIndex = weapon.level >= 50 ? 4 : weapon.level >= 25 ? 3 : weapon.level >= 10 ? 2 : weapon.level >= 5 ? 1 : 0
    weapon.evolvedAbility = abilities[abilityIndex] || abilities[0]
    weapon.skills = [...(weapon.skills || abilities.slice(0, 3)), weapon.evolvedAbility]
  }

  return leveledUp ? { level: weapon.level, exp: weapon.exp, evolutions: weapon.evolvedAbility || null } : null
}

export function getLivingWeaponDialogue(level) {
  const tier = getLivingWeaponTier(level)
  const dialogues = {
    "Awakening": ["I am awake.", "My blade stirs.", "Forged anew."],
    "Mutation": ["I evolve with each strike!", "My power grows!", "Can you keep up?"],
    "Awakening+": ["I am no longer just a weapon.", "Transcending limits.", "Witness my true form."],
    "True Form": ["I am the void made blade.", "All shall be severed.", "My will is absolute."],
    "Divine Form": ["I am the end of all things.", "Reality bends to my edge.", "Divine judgment manifests."]
  }
  const pool = dialogues[tier.name] || ["I serve my wielder."]
  return pool[Math.floor(Math.random() * pool.length)]
}
