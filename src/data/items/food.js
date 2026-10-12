export const food = [
  {
    id: "food_bread",
    name: "Bread",
    rarity: "Common",
    price: 1000,
    icon: "🍞",
    description: "Simple but filling. Restores 20 HP.",
    effect: { heal: 20 },
    category: "Foods",
    tier: "cheap"
  },
  {
    id: "food_rice_ball",
    name: "Rice Ball",
    rarity: "Common",
    price: 2000,
    icon: "🍙",
    description: "A classic. Restores 30 HP.",
    effect: { heal: 30 },
    category: "Foods",
    tier: "cheap"
  },
  {
    id: "food_dumplings",
    name: "Dumplings",
    rarity: "Common",
    price: 3000,
    icon: "🥟",
    description: "Steamed to perfection. Restores 35 HP.",
    effect: { heal: 35 },
    category: "Foods",
    tier: "cheap"
  },
  {
    id: "food_fries",
    name: "Fries",
    rarity: "Common",
    price: 2500,
    icon: "🥔",
    description: "Crispy and salty. Restores 20 HP and boosts morale.",
    effect: { heal: 20, buff: { type: "morale", amount: 1, duration: 180000 } },
    category: "Foods",
    tier: "cheap"
  },
  {
    id: "food_curry_rice",
    name: "Curry Rice",
    rarity: "Common",
    price: 5000,
    icon: "🍛",
    description: "Hearty and warming. Restores 50 HP and 5 CE.",
    effect: { heal: 50, restoreCE: 5 },
    category: "Foods",
    tier: "cheap"
  },
  {
    id: "food_instant_noodles",
    name: "Instant Noodles",
    rarity: "Common",
    price: 4500,
    icon: "🍜",
    description: "Quick and convenient. Restores 40 HP.",
    effect: { heal: 40 },
    category: "Foods",
    tier: "cheap"
  },
  {
    id: "food_sandwich",
    name: "Sandwich",
    rarity: "Uncommon",
    price: 6000,
    icon: "🥪",
    description: "Fresh and satisfying. Restores 55 HP.",
    effect: { heal: 55 },
    category: "Foods",
    tier: "cheap"
  },
  {
    id: "food_fried_chicken",
    name: "Fried Chicken",
    rarity: "Uncommon",
    price: 8000,
    icon: "🍗",
    description: "Crispy and delicious. Restores 70 HP.",
    effect: { heal: 70 },
    category: "Foods",
    tier: "cheap"
  },
  {
    id: "food_sushi",
    name: "Sushi",
    rarity: "Medium",
    price: 15000,
    icon: "🍣",
    description: "Fresh seafood. Restores 100 HP and 20 CE.",
    effect: { heal: 100, restoreCE: 20 },
    category: "Foods",
    tier: "medium"
  },
  {
    id: "food_bbq_ribs",
    name: "BBQ Ribs",
    rarity: "Medium",
    price: 20000,
    icon: "🍖",
    description: "Slow-cooked and tender. Restores 120 HP.",
    effect: { heal: 120 },
    category: "Foods",
    tier: "medium"
  },
  {
    id: "food_steak",
    name: "Steak",
    rarity: "Medium",
    price: 40000,
    icon: "🥩",
    description: "Perfectly grilled. Restores 180 HP and 30 CE.",
    effect: { heal: 180, restoreCE: 30 },
    category: "Foods",
    tier: "medium"
  },
  {
    id: "food_bento_deluxe",
    name: "Bento Deluxe",
    rarity: "Medium",
    price: 35000,
    icon: "🍱",
    description: "A complete meal. Restores 160 HP.",
    effect: { heal: 160 },
    category: "Foods",
    tier: "medium"
  },
  {
    id: "food_pasta",
    name: "Pasta",
    rarity: "Medium",
    price: 22000,
    icon: "🍝",
    description: "Italian classic. Restores 100 HP.",
    effect: { heal: 100 },
    category: "Foods",
    tier: "medium"
  },
  {
    id: "food_tempura",
    name: "Tempura",
    rarity: "Medium",
    price: 18000,
    icon: "🍤",
    description: "Lightly battered. Restores 90 HP.",
    effect: { heal: 90 },
    category: "Foods",
    tier: "medium"
  },
  {
    id: "food_yakitori",
    name: "Yakitori",
    rarity: "Medium",
    price: 16000,
    icon: "🍢",
    description: "Grilled chicken skewers. Restores 85 HP.",
    effect: { heal: 85 },
    category: "Foods",
    tier: "medium"
  },
  {
    id: "food_hot_pot",
    name: "Hot Pot",
    rarity: "Rare",
    price: 50000,
    icon: "🥘",
    description: "Simmered to perfection. Restores 200 HP.",
    effect: { heal: 200 },
    category: "Foods",
    tier: "medium"
  },
  {
    id: "food_premium_katsu",
    name: "Premium Katsu Set",
    rarity: "Rare",
    price: 120000,
    icon: "🍱",
    description: "A luxurious meal. Fully restores HP and restores 80 CE.",
    effect: { fullHeal: true, restoreCE: 80 },
    category: "Foods",
    tier: "luxury"
  },
  {
    id: "food_legendary_udon",
    name: "Legendary Udon",
    rarity: "Rare",
    price: 150000,
    icon: "🍜",
    description: "Slow-simmered broth. Fully restores HP and restores 100 CE.",
    effect: { fullHeal: true, restoreCE: 100 },
    category: "Foods",
    tier: "luxury"
  },
  {
    id: "food_wagyu_steak",
    name: "Wagyu Steak",
    rarity: "Rare",
    price: 500000,
    icon: "🥩",
    description: "Premium marbled beef. Fully restores HP and restores 150 CE.",
    effect: { fullHeal: true, restoreCE: 150 },
    category: "Foods",
    tier: "luxury"
  },
  {
    id: "food_emperor_sushi",
    name: "Emperor Sushi Platter",
    rarity: "Epic",
    price: 800000,
    icon: "🍣",
    description: "An imperial feast. Fully restores HP and restores 180 CE.",
    effect: { fullHeal: true, restoreCE: 180 },
    category: "Foods",
    tier: "luxury"
  },
  {
    id: "food_royal_feast",
    name: "Royal Feast",
    rarity: "Legendary",
    price: 2500000,
    icon: "👑",
    description: "A feast fit for royalty. Fully restores HP, restores 300 CE, grants Attack Buff.",
    effect: { fullHeal: true, restoreCE: 300, buff: { type: "attack", amount: 30, duration: 180000 } },
    category: "Foods",
    tier: "luxury"
  }
]

export const drinks = [
  {
    id: "drink_water",
    name: "Water",
    rarity: "Common",
    price: 3000,
    icon: "💧",
    description: "Essential hydration. Restores Thirst to 100.",
    effect: { restoreThirst: 100 },
    category: "Drinks",
    tier: "cheap"
  },
  {
    id: "drink_coke",
    name: "Coke",
    rarity: "Common",
    price: 6000,
    icon: "🥤",
    description: "Classic cola. Restores 20 Thirst and 5 CE.",
    effect: { restoreThirst: 20, restoreCE: 5 },
    category: "Drinks",
    tier: "cheap"
  },
  {
    id: "drink_pepsi",
    name: "Pepsi",
    rarity: "Common",
    price: 6000,
    icon: "🥤",
    description: "Sweeps you off your feet. Restores 20 Thirst.",
    effect: { restoreThirst: 20 },
    category: "Drinks",
    tier: "cheap"
  },
  {
    id: "drink_sprite",
    name: "Sprite",
    rarity: "Common",
    price: 6500,
    icon: "🍋",
    description: "Lemon-lime refreshment. Restores 25 Thirst.",
    effect: { restoreThirst: 25 },
    category: "Drinks",
    tier: "cheap"
  },
  {
    id: "drink_juice",
    name: "Juice",
    rarity: "Uncommon",
    price: 10000,
    icon: "🧃",
    description: "Fresh fruit juice. Restores 35 Thirst and 15 HP.",
    effect: { restoreThirst: 35, heal: 15 },
    category: "Drinks",
    tier: "cheap"
  },
  {
    id: "drink_coffee",
    name: "Coffee",
    rarity: "Uncommon",
    price: 12000,
    icon: "☕",
    description: "Stimulates the mind. Restores 10 Thirst and grants Speed +5% for 30 seconds.",
    effect: { restoreThirst: 10, buff: { type: "speed", amount: 5, duration: 30000 } },
    category: "Drinks",
    tier: "cheap"
  },
  {
    id: "drink_energy_drink",
    name: "Energy Drink",
    rarity: "Rare",
    price: 35000,
    icon: "⚡",
    description: "Electric charge in a can. Restores 40 CE and grants Attack Buff for 30 seconds.",
    effect: { restoreCE: 40, buff: { type: "attack", amount: 15, duration: 30000 } },
    category: "Drinks",
    tier: "medium"
  },
  {
    id: "drink_sake",
    name: "Sake",
    rarity: "Uncommon",
    price: 50000,
    icon: "🍶",
    description: "Traditional rice wine. Restores 40 Thirst and 20 CE. May randomly boost Attack or reduce Accuracy.",
    effect: { restoreThirst: 40, restoreCE: 20, randomBuff: true },
    category: "Drinks",
    tier: "medium"
  }
]
