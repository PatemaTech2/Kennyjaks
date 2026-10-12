export const armor = [
  {
    id: "armor_training",
    name: "Training Uniform",
    rarity: "Common",
    price: 25000,
    icon: "👕",
    description: "Basic jujutsu uniform. +20 HP",
    stats: { health: 20 },
    gradeReq: 4,
    levelReq: 1
  },
  {
    id: "armor_grade2",
    name: "Grade 2 Armor",
    rarity: "Epic",
    price: 95000,
    icon: "🛡️",
    description: "Reinforced armor. +35 DEF",
    stats: { defense: 35 },
    gradeReq: 2,
    levelReq: 10
  },
  {
    id: "armor_jujutsu_high",
    name: "Jujutsu High Uniform",
    rarity: "Rare",
    price: 60000,
    icon: "👔",
    description: "Official school uniform. +25 DEF, +10 SPD",
    stats: { defense: 25, speed: 10 },
    gradeReq: 3,
    levelReq: 8
  },
  {
    id: "armor_battle_robes",
    name: "Battle Robes",
    rarity: "Epic",
    price: 200000,
    icon: "🧥",
    description: "Heavy combat robes. +50 HP, +40 DEF",
    stats: { health: 50, defense: 40 },
    gradeReq: 2,
    levelReq: 15
  },
  {
    id: "armor_reinforced_jacket",
    name: "Reinforced Jacket",
    rarity: "Epic",
    price: 180000,
    icon: "🧥",
    description: "Steel-plated jacket. +30 DEF, +15 SPD",
    stats: { defense: 30, speed: 15 },
    gradeReq: 1,
    levelReq: 20
  },
  {
    id: "armor_spirit_cloak",
    name: "Spirit Cloak",
    rarity: "Legendary",
    price: 450000,
    icon: "🧥",
    description: "Cloak woven from cursed spirits. +60 CE, +35 DEF",
    stats: { cursedEnergy: 60, defense: 35 },
    gradeReq: 1,
    levelReq: 25
  },
  {
    id: "armor_special_armor",
    name: "Special Grade Armor",
    rarity: "Special Grade",
    price: 2000000,
    icon: "🛡️",
    description: "Armor of exceptional quality. +100 HP, +80 DEF, +5% Crit",
    stats: { health: 100, defense: 80, critRate: 5 },
    gradeReq: 0,
    levelReq: 40
  }
]
