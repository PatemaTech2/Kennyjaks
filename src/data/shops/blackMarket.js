export const blackMarketItems = [
  {
    id: "bm_1",
    name: "Cursed Corpse Arm",
    rarity: "Epic",
    price: 25000,
    icon: "🦴",
    description: "Powerful cursed remains. Increases cursed energy regeneration.",
    type: "misc",
    effect: { cursedEnergyRegen: 5 },
    stock: 3
  },
  {
    id: "bm_2",
    name: "Sukuna Finger Fragment",
    rarity: "Legendary",
    price: 100000,
    icon: "👆",
    description: "A piece of the King of Curses. Tremendous power.",
    type: "misc",
    effect: { strength: 10, cursedEnergy: 20 },
    stock: 1
  },
  {
    id: "bm_3",
    name: "Domain Amplification Manual",
    rarity: "Mythic",
    price: 500000,
    icon: "📖",
    description: "Forbidden technique manual. Grants domain expansion knowledge.",
    type: "misc",
    effect: { domainExpansion: true },
    stock: 1
  },
  {
    id: "bm_4",
    name: "Reverse Cursed Energy",
    rarity: "Legendary",
    price: 200000,
    icon: "💊",
    description: "Healing energy of the Gojo clan. Restores health and CE.",
    type: "consumable",
    effect: { heal: 100, cursedEnergy: 50 },
    stock: 5
  },
  {
    id: "bm_5",
    name: "Black Flash Training Manual",
    rarity: "Rare",
    price: 50000,
    icon: "⚡",
    description: "Train your body to achieve Black Flash more consistently.",
    type: "misc",
    effect: { blackFlashChance: 2 },
    stock: 3
  }
]
