export const CURSE_LOOT_TABLES = {
  4: [
    { id: "material_iron", name: "Iron", icon: "🪨", rarity: "Common", type: "material", quantity: 1, weight: 50 },
    { id: "material_curse_flesh", name: "Curse Flesh", icon: "💀", rarity: "Common", type: "material", quantity: 1, weight: 40 },
    { id: "material_leather", name: "Leather", icon: "🐹", rarity: "Common", type: "material", quantity: 1, weight: 30 }
  ],
  3: [
    { id: "material_iron", name: "Iron", icon: "🪨", rarity: "Common", type: "material", quantity: 2, weight: 40 },
    { id: "material_black_iron", name: "Black Iron", icon: "⚫", rarity: "Uncommon", type: "material", quantity: 1, weight: 30 },
    { id: "material_curse_flesh", name: "Curse Flesh", icon: "💀", rarity: "Common", type: "material", quantity: 2, weight: 25 },
    { id: "material_wood", name: "Wood", icon: "🪵", rarity: "Common", type: "material", quantity: 1, weight: 20 }
  ],
  2: [
    { id: "material_black_iron", name: "Black Iron", icon: "⚫", rarity: "Uncommon", type: "material", quantity: 2, weight: 35 },
    { id: "material_curse_essence", name: "Curse Essence", icon: "🔷", rarity: "Rare", type: "material", quantity: 1, weight: 25 },
    { id: "material_curse_flesh", name: "Curse Flesh", icon: "💀", rarity: "Common", type: "material", quantity: 3, weight: 20 },
    { id: "material_iron", name: "Iron", icon: "🪨", rarity: "Common", type: "material", quantity: 3, weight: 15 }
  ],
  1: [
    { id: "material_curse_essence", name: "Curse Essence", icon: "🔷", rarity: "Rare", type: "material", quantity: 2, weight: 30 },
    { id: "material_black_iron", name: "Black Iron", icon: "⚫", rarity: "Uncommon", type: "material", quantity: 3, weight: 25 },
    { id: "material_curse_flesh", name: "Curse Flesh", icon: "💀", rarity: "Common", type: "material", quantity: 5, weight: 15 },
    {
      id: "material_death_painting",
      name: "Death Painting",
      icon: "🩸",
      rarity: "Extremely Rare",
      type: "material",
      quantity: 1,
      weight: 5
    }
  ],
  0: [
    { id: "material_curse_essence", name: "Curse Essence", icon: "🔷", rarity: "Rare", type: "material", quantity: 5, weight: 25 },
    {
      id: "material_legendary_fragment",
      name: "Legendary Finger Fragment",
      icon: "👑",
      rarity: "Ultra Rare",
      type: "material",
      quantity: 1,
      weight: 10
    },
    {
      id: "material_death_painting",
      name: "Death Painting",
      icon: "🩸",
      rarity: "Extremely Rare",
      type: "material",
      quantity: 1,
      weight: 8
    },
    {
      id: "material_special_grade_core",
      name: "Special Grade Core",
      icon: "💎",
      rarity: "Ultra Rare",
      type: "material",
      quantity: 1,
      weight: 5
    }
  ]
}

export function generateCurseLoot(opponent) {
  const grade = opponent.grade !== undefined ? opponent.grade : 4
  const table = CURSE_LOOT_TABLES[grade] || CURSE_LOOT_TABLES[4]

  const rarities = ["Common", "Uncommon", "Rare", "Very Rare"]
  const drops = []

  for (const rarity of rarities) {
    const rarityWeight = {
      "Common": 60,
      "Uncommon": 30,
      "Rare": 12,
      "Very Rare": 3
    }[rarity]

    if (Math.random() * 100 < rarityWeight) {
      const candidates = table.filter(i => i.rarity === rarity ||
        (rarity === "Common" && i.rarity === "Common")
      )
      if (candidates.length > 0) {
        const totalWeight = candidates.reduce((sum, i) => sum + i.weight, 0)
        let roll = Math.random() * totalWeight
        let selected = candidates[0]
        for (const candidate of candidates) {
          roll -= candidate.weight
          if (roll <= 0) {
            selected = candidate
            break
          }
        }
        if (selected) {
          const quantity = Math.max(1, Math.floor(selected.quantity * (0.8 + Math.random() * 0.4)))
          drops.push({
            id: selected.id,
            name: selected.name,
            icon: selected.icon,
            rarity: selected.rarity,
            type: "material",
            quantity: quantity
          })
        }
      }
    }
  }

  const guaranteed = table.filter(i => i.rarity === "Common")
  if (guaranteed.length > 0 && drops.length === 0) {
    const item = guaranteed[0]
    drops.push({
      id: item.id,
      name: item.name,
      icon: item.icon,
      rarity: item.rarity,
      type: "material",
      quantity: item.quantity
    })
  }

  return drops
}
