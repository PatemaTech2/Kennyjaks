import { weapons } from "../../data/items/weapons.js"
import { armor as armorItems } from "../../data/items/armor.js"
import { accessories as accessoryItems } from "../../data/items/accessories.js"

export const outfitShop = {
  id: "outfit",
  name: "Outfit Shop",
  emoji: "⚔️",
  description: "Buy weapons, uniforms, armor, and accessories.",
  command: "/shop-outfit",
  categories: ["Weapons", "Armor", "Uniforms", "Accessories"],
  items: [
    ...weapons,
    ...armorItems,
    {
      id: "outfit_6",
      name: "Sorcerer Uniform",
      type: "uniform",
      rarity: "Common",
      price: 15000,
      icon: "👕",
      description: "Standard jujutsu uniform. +10 DEF",
      stats: { defense: 10 },
      gradeReq: 4,
      levelReq: 1
    },
    ...accessoryItems
  ]
}
