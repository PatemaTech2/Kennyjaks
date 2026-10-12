export const accessories = [
  {
    id: "accessory_cursed_ring",
    name: "Cursed Ring",
    rarity: "Rare",
    price: 120000,
    icon: "💍",
    description: "A ring that channels cursed energy. +50 CE",
    stats: { cursedEnergy: 50 },
    gradeReq: 3,
    levelReq: 10
  },
  {
    id: "accessory_lucky_coin",
    name: "Lucky Coin",
    rarity: "Rare",
    price: 90000,
    icon: "🪙",
    description: "Brings good fortune. +10 SPD, +5% Crit",
    stats: { speed: 10, critRate: 5 },
    gradeReq: 3,
    levelReq: 12
  },
  {
    id: "accessory_strength_belt",
    name: "Strength Belt",
    rarity: "Rare",
    price: 110000,
    icon: "🎀",
    description: "Enhances physical power. +30 ATK",
    stats: { attack: 30 },
    gradeReq: 3,
    levelReq: 14
  },
  {
    id: "accessory_focus_amulet",
    name: "Focus Amulet",
    rarity: "Epic",
    price: 250000,
    icon: "🔮",
    description: "Improves technique precision. +15% Accuracy, +20 CE",
    stats: { accuracy: 15, cursedEnergy: 20 },
    gradeReq: 2,
    levelReq: 18
  },
  {
    id: "accessory_tactical_lens",
    name: "Tactical Lens",
    rarity: "Epic",
    price: 300000,
    icon: "🔭",
    description: "Analyzes weaknesses. +20% Crit, +15 SPD",
    stats: { critRate: 20, speed: 15 },
    gradeReq: 2,
    levelReq: 22
  },
  {
    id: "accessory_protective_talisman",
    name: "Protective Talisman",
    rarity: "Epic",
    price: 280000,
    icon: "📿",
    description: "Wards off critical hits. +50 DEF, +15% Block Chance",
    stats: { defense: 50, blockChance: 15 },
    gradeReq: 1,
    levelReq: 24
  },
  {
    id: "accessory_dragon_scale_necklace",
    name: "Dragon Scale Necklace",
    rarity: "Legendary",
    price: 500000,
    icon: "🐉",
    description: "Harness dragon's might. +70 ATK, +70 DEF, +30 CE",
    stats: { attack: 70, defense: 70, cursedEnergy: 30 },
    gradeReq: 1,
    levelReq: 30
  },
  {
    id: "accessory_void_essence",
    name: "Void Essence Charm",
    rarity: "Special Grade",
    price: 2000000,
    icon: "🌀",
    description: "Essence from the void. +120 ATK, +120 DEF, +100 CE, +10% Crit",
    stats: { attack: 120, defense: 120, cursedEnergy: 100, critRate: 10 },
    gradeReq: 0,
    levelReq: 45
  }
]
