export const medicine = [
  {
    id: "medicine_senzu_bean",
    name: "Senzu Bean",
    rarity: "Legendary",
    price: 5000000,
    icon: "🌱",
    description: "Fully restore HP and CE. Remove all status effects.",
    effect: { fullHeal: true, fullRestoreCE: true, cureAll: true },
    category: "Medicine",
    tier: "luxury"
  },
  {
    id: "medicine_speed_booster",
    name: "Speed Booster",
    rarity: "Rare",
    price: 60000,
    icon: "⚡",
    description: "Grants +25% Speed for 30 seconds.",
    effect: { buff: { type: "speed", amount: 25, duration: 30000 } },
    category: "Medicine",
    tier: "medium"
  },
  {
    id: "medicine_strength_booster",
    name: "Strength Booster",
    rarity: "Rare",
    price: 90000,
    icon: "💪",
    description: "Grants +35 Attack for 45 seconds.",
    effect: { buff: { type: "attack", amount: 35, duration: 45000 } },
    category: "Medicine",
    tier: "medium"
  },
  {
    id: "medicine_ce_booster",
    name: "CE Booster",
    rarity: "Rare",
    price: 120000,
    icon: "🔷",
    description: "Restores 100 CE.",
    effect: { restoreCE: 100 },
    category: "Medicine",
    tier: "medium"
  },
  {
    id: "medicine_focus_pill",
    name: "Focus Pill",
    rarity: "Epic",
    price: 180000,
    icon: "🧠",
    description: "Increases technique accuracy.",
    effect: { buff: { type: "accuracy", amount: 25, duration: 120000 } },
    category: "Medicine",
    tier: "medium"
  },
  {
    id: "medicine_first_aid",
    name: "First Aid Kit",
    rarity: "Uncommon",
    price: 40000,
    icon: "🩹",
    description: "Heals 120 HP.",
    effect: { heal: 120 },
    category: "Medicine",
    tier: "cheap"
  },
  {
    id: "medicine_adrenaline_shot",
    name: "Adrenaline Shot",
    rarity: "Legendary",
    price: 350000,
    icon: "💉",
    description: "Ignore one fatal hit.",
    effect: { adrenaline: true },
    category: "Medicine",
    tier: "luxury"
  }
]
