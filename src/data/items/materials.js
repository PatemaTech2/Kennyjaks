export const materials = [
  {
    id: "material_iron",
    name: "Iron",
    rarity: "Common",
    price: 5000,
    icon: "🪨",
    description: "Basic crafting material for weapons.",
    type: "material",
    tier: 1
  },
  {
    id: "material_black_iron",
    name: "Black Iron",
    rarity: "Uncommon",
    price: 20000,
    icon: "⚫",
    description: "Stronger than iron. Used for mid-tier weapons.",
    type: "material",
    tier: 2
  },
  {
    id: "material_wood",
    name: "Wood",
    rarity: "Common",
    price: 3000,
    icon: "🪵",
    description: "Basic wood for handles and staffs.",
    type: "material",
    tier: 1
  },
  {
    id: "material_leather",
    name: "Leather",
    rarity: "Common",
    price: 4000,
    icon: "🐹",
    description: "Animal hide for bindings and grips.",
    type: "material",
    tier: 1
  },
  {
    id: "material_curse_flesh",
    name: "Curse Flesh",
    rarity: "Common",
    price: 8000,
    icon: "💀",
    description: "Flesh from defeated curses. Essential for crafting.",
    type: "material",
    tier: 1
  },
  {
    id: "material_curse_essence",
    name: "Curse Essence",
    rarity: "Rare",
    price: 150000,
    icon: "🔷",
    description: "Concentrated cursed energy. Creates cursed weapons.",
    type: "material",
    tier: 3
  },
  {
    id: "material_death_painting",
    name: "Death Painting",
    rarity: "Extremely Rare",
    price: 800000,
    icon: "🩸",
    description: "Fragment of a death painting. Creates living weapons.",
    type: "material",
    tier: 5
  },
  {
    id: "material_legendary_fragment",
    name: "Legendary Finger Fragment",
    rarity: "Ultra Rare",
    price: 2000000,
    icon: "👑",
    description: "Remnant of a legendary sorcerer. Creates ultimate weapons.",
    type: "material",
    tier: 6
  },
  {
    id: "material_special_grade_core",
    name: "Special Grade Core",
    rarity: "Ultra Rare",
    price: 3000000,
    icon: "💎",
    description: "Core of a special grade curse. Creates special grade weapons.",
    type: "material",
    tier: 7
  }
]

export function findMaterialById(id) {
  return materials.find(m => m.id === id)
}

export function findMaterialByName(name) {
  const lower = name.toLowerCase().replace(/\s+/g, "_")
  return materials.find(m => m.id.replace("material_", "") === lower || m.name.toLowerCase() === name.toLowerCase())
}
