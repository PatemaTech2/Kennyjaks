export const COMMAND_CATEGORY_DEFINITIONS = [
  {
    key: "battle",
    displayName: "BATTLE",
    label: "Battle",
    icon: "⚔️",
    aliases: ["battle", "battles", "combat", "pvp"],
    order: 10,
    description: "Curse battles, PvP duels and combat actions."
  },
  {
    key: "training",
    displayName: "TRAINING",
    label: "Training",
    icon: "🎯",
    aliases: ["training", "progression", "train", "skills", "stats"],
    order: 20,
    description: "Train skills, spend points and grow stronger."
  },
  {
    key: "techniques",
    displayName: "TECHNIQUES",
    label: "Techniques",
    icon: "🌀",
    aliases: ["techniques", "technique", "tq", "cursed"],
    order: 30,
    description: "Manage your cursed techniques and skills."
  },
  {
    key: "rct",
    displayName: "RCT",
    label: "RCT",
    icon: "🩸",
    aliases: ["rct", "reverse", "reverse-cursed", "healing"],
    order: 40,
    description: "Reverse Cursed Technique healing and energy."
  },
  {
    key: "domain",
    displayName: "DOMAIN",
    label: "Domain",
    icon: "🏯",
    aliases: ["domain", "domains", "expansion"],
    order: 50,
    description: "Domain Expansion unlocking and control."
  },
  {
    key: "player",
    displayName: "PLAYER",
    label: "Player",
    icon: "👤",
    aliases: ["player", "profile", "p", "me"],
    order: 60,
    description: "Your profile, stats and progression."
  },
  {
    key: "economy",
    displayName: "ECONOMY",
    label: "Economy",
    icon: "💰",
    aliases: ["economy", "eco", "money", "wallet", "bank"],
    order: 70,
    description: "Yen, wallet, bank and gambling."
  },
  {
    key: "shops",
    displayName: "SHOPS",
    label: "Shops",
    icon: "🛒",
    aliases: ["shops", "shop", "store", "market"],
    order: 80,
    description: "Buy weapons, food, medicine, bags and more."
  },
  {
    key: "inventory",
    displayName: "INVENTORY",
    label: "Inventory",
    icon: "🎒",
    aliases: ["inventory", "inv", "bag", "items"],
    order: 90,
    description: "Manage inventory, equipment and consumables."
  },
  {
    key: "summons",
    displayName: "SUMMONS",
    label: "Summons",
    icon: "🐾",
    aliases: ["summons", "summon", "pets", "pet", "shikigami"],
    order: 100,
    description: "Hatch eggs, summon allies and train shikigami."
  },
  {
    key: "crafting",
    displayName: "CRAFTING",
    label: "Crafting",
    icon: "🛠️",
    aliases: ["crafting", "craft", "forge"],
    order: 110,
    description: "Loot and the crafting workshop."
  },
  {
    key: "utility",
    displayName: "UTILITY",
    label: "Utility",
    icon: "⚙️",
    aliases: ["utility", "utilities", "tools", "guide", "help"],
    order: 120,
    description: "Help, manuals, stickers and useful tools."
  },
  {
    key: "world",
    displayName: "WORLD",
    label: "World",
    icon: "🗺️",
    aliases: ["world", "exploration", "cursehunt", "hunt"],
    order: 135,
    description: "Travel the world, search for curses and hunt them down."
  },
  {
    key: "daily",
    displayName: "DAILY",
    label: "Daily",
    icon: "🌅",
    aliases: ["daily", "dailies"],
    order: 140,
    description: "Claim daily rewards and repeatables."
  },
  {
    key: "dashboard",
    displayName: "DASHBOARD",
    label: "Dashboard",
    icon: "📊",
    aliases: ["dashboard", "dash", "leaderboard", "lb"],
    order: 150,
    description: "Leaderboards, server stats and registry."
  },
  {
    key: "seasonal",
    displayName: "SEASONAL EVENT",
    label: "Seasonal",
    icon: "🐉",
    aliases: ["seasonal", "event", "dragon"],
    order: 155,
    description: "Limited-time seasonal events and challenges."
  },
  {
    key: "events",
    displayName: "EVENTS",
    label: "Events",
    icon: "🎂",
    aliases: ["events", "birthday", "special"],
    order: 145,
    description: "Special events and celebrations."
  },
  {
    key: "cards",
    displayName: "CARDS",
    label: "Cards",
    icon: "🃏",
    aliases: ["cards", "card", "deck", "collectibles"],
    order: 125,
    description: "Collect JJK character cards and build your deck."
  },
  {
    key: "group",
    displayName: "GROUP",
    label: "Group",
    icon: "👥",
    aliases: ["group", "groups", "guild", "clan"],
    order: 130,
    description: "Group management commands."
  },
  {
    key: "profile",
    displayName: "PROFILE",
    label: "Profile",
    icon: "👤",
    aliases: ["profile", "set-title", "set-bio", "set-badge", "profile-style", "sprites", "sprite", "set-sprite", "sprite-v"],
    order: 110,
    description: "Customize your profile with titles, bios, badges, styles, and sprites."
  },
  {
    key: "developer",
    displayName: "DEVELOPER",
    label: "Developer",
    icon: "🧪",
    aliases: ["developer", "dev", "admin", "owner"],
    order: 160,
    description: "Owner or moderator-only maintenance commands."
  },
  {
    key: "kloot",
    displayName: "KLOOT",
    label: "Kloot",
    icon: "📦",
    aliases: ["kloot", "scroll", "zero", "benimaru"],
    order: 140,
    description: "Specialized loots with unique abilities."
  }
]

export const COMMAND_DEFINITIONS = [
  {
    command: "/start",
    aliases: ["/start-curse", "/start-sorcerer"],
    handlerName: "handleStart",
    category: "player",
    usage: "/start",
    description: "Register as a sorcerer and begin your KennyJaks journey.",
    examples: ["/start"],
    requiresRegistration: false
  },
  {
    command: "/set-name",
    handlerName: "handleSetName",
    category: "player",
    usage: "/set-name <name>",
    description: "Rename your sorcerer profile.",
    examples: ["/set-name Yuji"]
  },
  {
    command: "/profile",
    handlerName: "handleProfile",
    category: "player",
    usage: "/profile",
    description: "View your player profile card.",
    examples: ["/profile"]
  },
  {
    command: "/att",
    handlerName: "handleAttributes",
    category: "player",
    usage: "/att",
    description: "View your attributes, Black Flash affinity and training progress.",
    examples: ["/att"]
  },
  {
    command: "/rep",
    handlerName: "handleReputation",
    category: "player",
    usage: "/rep",
    description: "View your reputation, Calamity status, and kill counts.",
    examples: ["/rep"]
  },
  {
    command: "/event",
    handlerName: "handleEvent",
    category: "seasonal",
    usage: "/event",
    description: "View the current seasonal event status.",
    examples: ["/event"]
  },
  {
    command: "/challenge",
    handlerName: "handleDragonChallenge",
    category: "seasonal",
    usage: "/challenge <knight|Aurstav>",
    description: "Challenge a Dragon Knight or Aurstav.",
    examples: ["/challenge Valaryia", "/challenge Aurstav"]
  },
  {
    command: "/aurstav",
    handlerName: "handleAurstavCommand",
    category: "seasonal",
    usage: "/aurstav [raid]",
    description: "Challenge Aurstav, the Dragon Curse King.",
    examples: ["/aurstav", "/aurstav raid"]
  },
  {
    command: "/pot",
    aliases: ["/potential"],
    handlerName: "handlePotential",
    category: "player",
    usage: "/pot",
    description: "Inspect your potential tier and its bonus effects.",
    examples: ["/pot"]
  },
  {
    command: "/inventory",
    handlerName: "handleInventory",
    category: "inventory",
    usage: "/inventory",
    description: "Open your inventory and see stored items.",
    examples: ["/inventory"]
  },
  {
    command: "/bag",
    handlerName: "handleBag",
    category: "inventory",
    usage: "/bag",
    description: "View the contents of your bag storage.",
    examples: ["/bag"]
  },
  {
    command: "/i2b",
    handlerName: "handleInventoryToBag",
    category: "inventory",
    usage: "/i2b <item>",
    description: "Move an item from inventory into your bag.",
    examples: ["/i2b healing-potion"]
  },
  {
    command: "/b2i",
    handlerName: "handleBagToInventory",
    category: "inventory",
    usage: "/b2i <item>",
    description: "Move an item from your bag back into inventory.",
    examples: ["/b2i cursed-sword"]
  },
  {
    command: "/equip",
    handlerName: "handleEquip",
    category: "inventory",
    usage: "/equip <item>",
    description: "Equip a weapon or equipment item.",
    examples: ["/equip black-iron-katana"]
  },
  {
    command: "/unequip",
    handlerName: "handleUnequip",
    category: "inventory",
    usage: "/unequip <item>",
    description: "Unequip an item and return it to inventory.",
    examples: ["/unequip cursed-sword"]
  },
  {
    command: "/craft",
    aliases: ["/craft-name"],
    handlerName: "handleCraft",
    category: "crafting",
    usage: "/craft <recipe>",
    description: "Open the crafting workshop and create new equipment.",
    examples: ["/craft iron-sword"]
  },
  {
    command: "/craft-name",
    prefix: "/craft-name",
    handlerName: "handleCraftName",
    category: "crafting",
    usage: "/craft-name <item>",
    description: "Craft a specific item by name.",
    examples: ["/craft-name dragon-slayer"]
  },
  {
    command: "/heal-ce",
    handlerName: "handleHealCe",
    category: "inventory",
    usage: "/heal-ce",
    description: "Recover your cursed energy instantly.",
    examples: ["/heal-ce"]
  },
  {
    command: "/eat",
    handlerName: "handleEat",
    category: "inventory",
    usage: "/eat <food>",
    description: "Consume food to restore HP.",
    examples: ["/eat ramen"]
  },
  {
    command: "/drink",
    handlerName: "handleDrink",
    category: "inventory",
    usage: "/drink <drink>",
    description: "Drink a beverage to restore CE and reduce thirst.",
    examples: ["/drink water"]
  },
  {
    command: "/technique",
    aliases: ["/tq"],
    handlerName: "handleTechnique",
    category: "techniques",
    usage: "/technique",
    description: "View your cursed technique, skill tree and mastery options.",
    examples: ["/technique"]
  },
  {
    command: "/train",
    prefix: "/train ",
    handlerName: "handleTechnique",
    category: "training",
    usage: "/train <skill|shikigami-name>",
    description: "Assign training to a technique skill or, for Ten Shadows users, conquer a shikigami.",
    examples: ["/train basic-strike", "/train nue"]
  },
  {
    command: "/train-status",
    handlerName: "handleTrainStatus",
    category: "training",
    usage: "/train-status",
    description: "Review your current training progress and next unlocks.",
    examples: ["/train-status"]
  },
  {
    command: "/yuji-train",
    handlerName: "handleYujiTrain",
    category: "training",
    usage: "/yuji-train",
    description: "Train martial arts with Yuji Itadori to unlock new battle attacks.",
    examples: ["/yuji-train"]
  },
  {
    command: "/sp",
    prefix: "/sp ",
    handlerName: "handleSpendPoints",
    category: "training",
    usage: "/sp <attribute> <points>",
    description: "Spend stat points to increase your attributes.",
    examples: ["/sp attack 5"]
  },
  {
    command: "/wallet",
    handlerName: "handleWallet",
    category: "economy",
    usage: "/wallet",
    description: "View how much Yen you have on hand.",
    examples: ["/wallet"]
  },
  {
    command: "/bank",
    handlerName: "handleBank",
    category: "economy",
    usage: "/bank",
    description: "View your bank account and savings.",
    examples: ["/bank"]
  },
  {
    command: "/deposit",
    handlerName: "handleDeposit",
    category: "economy",
    usage: "/deposit <amount>",
    description: "Deposit Yen from your wallet into the bank.",
    examples: ["/deposit 500"]
  },
  {
    command: "/withdraw",
    aliases: ["/wd"],
    handlerName: "handleWithdraw",
    category: "economy",
    usage: "/withdraw <amount>",
    description: "Withdraw Yen from your bank into your wallet.",
    examples: ["/withdraw 300"]
  },
  {
    command: "/send",
    handlerName: "handleSend",
    category: "economy",
    usage: "/send <@user> <amount>",
    description: "Transfer Yen from your wallet to another player.",
    examples: ["/send @1234567890 1000"]
  },
  {
    command: "/gamble-red",
    handlerName: "handleGamble",
    category: "economy",
    usage: "/gamble-red <amount>",
    description: "Gamble Yen on the red table.",
    examples: ["/gamble-red 200"]
  },
  {
    command: "/gamble-blue",
    handlerName: "handleGamble",
    category: "economy",
    usage: "/gamble-blue <amount>",
    description: "Gamble Yen on the blue table.",
    examples: ["/gamble-blue 200"]
  },
  {
    command: "/gamble-black",
    handlerName: "handleGamble",
    category: "economy",
    usage: "/gamble-black <amount>",
    description: "Risk Yen on the black gamble.",
    examples: ["/gamble-black 300"]
  },
  {
    command: "/gamble-green",
    handlerName: "handleGamble",
    category: "economy",
    usage: "/gamble-green <amount>",
    description: "Try the green gamble for a different payout.",
    examples: ["/gamble-green 150"]
  },
  {
    command: "/play",
    handlerName: "handleGambleGames",
    category: "economy",
    usage: "/play <game> <bet>",
    description: "Play gambling games: dice, flip, slots, higher, poker, blackjack",
    examples: ["/play dice 100", "/play slots 50", "/play blackjack 200"]
  },
  {
    command: "/shops",
    handlerName: "handleShops",
    category: "shops",
    usage: "/shops",
    description: "Browse all available shops in KennyJaks.",
    examples: ["/shops"]
  },
  {
    command: "/shop-food",
    handlerName: "handleShopFood",
    category: "shops",
    usage: "/shop-food",
    description: "Open the food shop to buy healing items.",
    examples: ["/shop-food"]
  },
  {
    command: "/shop-food-<item>",
    prefix: "/shop-food-",
    handlerName: "handleShopFood",
    category: "shops",
    usage: "/shop-food-<item>",
    description: "Purchase a food item from the food shop.",
    examples: ["/shop-food-ramen"],
    hidden: true
  },
  {
    command: "/shop-drink",
    handlerName: "handleShopDrink",
    category: "shops",
    usage: "/shop-drink",
    description: "Open the drink shop to buy CE and hydration items.",
    examples: ["/shop-drink"]
  },
  {
    command: "/shop-drink-<item>",
    prefix: "/shop-drink-",
    handlerName: "handleShopDrink",
    category: "shops",
    usage: "/shop-drink-<item>",
    description: "Purchase a drink from the drink shop.",
    examples: ["/shop-drink-water"],
    hidden: true
  },
  {
    command: "/shop-meds",
    aliases: ["/shop-medicine"],
    handlerName: "handleShopMedicine",
    category: "shops",
    usage: "/shop-meds",
    description: "Open the medicine shop for cures and restorative items.",
    examples: ["/shop-meds"]
  },
  {
    command: "/shop-medicine-<item>",
    prefix: "/shop-medicine-",
    handlerName: "handleShopMedicine",
    category: "shops",
    usage: "/shop-medicine-<item>",
    description: "Buy a medicine item directly by name.",
    examples: ["/shop-medicine-health-potion"],
    hidden: true
  },
  {
    command: "/shop-meds-<item>",
    prefix: "/shop-meds-",
    handlerName: "handleShopMedicine",
    category: "shops",
    usage: "/shop-meds-<item>",
    description: "Buy medicine directly from the shop.",
    examples: ["/shop-meds-antidote"],
    hidden: true
  },
  {
    command: "/shop-weapon",
    handlerName: "handleShopWeapon",
    category: "shops",
    usage: "/shop-weapon",
    description: "Open the weapon shop for weapons and gear.",
    examples: ["/shop-weapon"]
  },
  {
    command: "/shop-weapon-<item>",
    prefix: "/shop-weapon-",
    handlerName: "handleShopWeapon",
    category: "shops",
    usage: "/shop-weapon-<item>",
    description: "Buy a weapon directly by item name.",
    examples: ["/shop-weapon-katana"],
    hidden: true
  },
  {
    command: "/shop-armor",
    handlerName: "handleShopArmor",
    category: "shops",
    usage: "/shop-armor",
    description: "Open the armor shop for defensive gear.",
    examples: ["/shop-armor"]
  },
  {
    command: "/shop-armor-<item>",
    prefix: "/shop-armor-",
    handlerName: "handleShopArmor",
    category: "shops",
    usage: "/shop-armor-<item>",
    description: "Purchase armor directly by item name.",
    examples: ["/shop-armor-plate-mail"],
    hidden: true
  },
  {
    command: "/shop-accessory",
    handlerName: "handleShopAccessory",
    category: "shops",
    usage: "/shop-accessory",
    description: "Open the accessory shop for trinkets and charms.",
    examples: ["/shop-accessory"]
  },
  {
    command: "/shop-accessory-<item>",
    prefix: "/shop-accessory-",
    handlerName: "handleShopAccessory",
    category: "shops",
    usage: "/shop-accessory-<item>",
    description: "Buy an accessory directly by item name.",
    examples: ["/shop-accessory-ring-of-power"],
    hidden: true
  },
  {
    command: "/shop-bag",
    handlerName: "handleShopBag",
    category: "shops",
    usage: "/shop-bag",
    description: "Open the bag shop for extra storage space.",
    examples: ["/shop-bag"]
  },
  {
    command: "/shop-bag-<item>",
    prefix: "/shop-bag-",
    handlerName: "handleShopBag",
    category: "shops",
    usage: "/shop-bag-<item>",
    description: "Buy a bag directly from the shop.",
    examples: ["/shop-bag-large"],
    hidden: true
  },
  {
    command: "/shop-outfit",
    handlerName: "handleShopOutfit",
    category: "shops",
    usage: "/shop-outfit",
    description: "Open the outfit shop for clothing and style items.",
    examples: ["/shop-outfit"]
  },
  {
    command: "/shop-egg",
    handlerName: "handleShopEgg",
    category: "shops",
    usage: "/shop-egg",
    description: "Open the egg shop and review summon eggs.",
    examples: ["/shop-egg"]
  },
  {
    command: "/blackmarket",
    handlerName: "handleBlackMarket",
    category: "shops",
    usage: "/blackmarket",
    description: "Open the black market for rare items.",
    examples: ["/blackmarket"]
  },
  {
    command: "/buy",
    aliases: ["/purchase"],
    handlerName: "handleBuy",
    category: "shops",
    usage: "/buy <item>",
    description: "Purchase an item from the current shop.",
    examples: ["/buy water", "/buy black-iron-katana"]
  },
  {
    command: "/hatch",
    handlerName: "handleHatch",
    category: "summons",
    usage: "/hatch",
    description: "Hatch a summoned egg into a new ally.",
    examples: ["/hatch"]
  },
  {
    command: "/daily",
    handlerName: "handleDaily",
    category: "daily",
    usage: "/daily",
    description: "Claim your daily reward and complete repeatable tasks.",
    examples: ["/daily"]
  },
  {
    command: "/spawnenemy",
    handlerName: "handleSpawnEnemy",
    category: "battle",
    usage: "/spawnenemy",
    description: "Spawn a random curse to battle.",
    examples: ["/spawnenemy"]
  },
  {
    command: "/spawnpack",
    handlerName: "handleSpawnPack",
    category: "cards",
    usage: "/spawnpack",
    description: "Open a card pack (6-12 cards, 2 guaranteed rare). Costs ¥10,000. 30s cooldown.",
    examples: ["/spawnpack"]
  },
  {
    command: "/claim-pack",
    handlerName: "handleClaimPack",
    category: "cards",
    usage: "/claim-pack",
    description: "Claim your pending card pack and add cards to your deck.",
    examples: ["/claim-pack"]
  },
  {
    command: "/run",
    handlerName: "handleRunFromCurse",
    category: "battle",
    usage: "/run",
    description: "Run away from a curse encounter.",
    examples: ["/run"]
  },
  {
    command: "/battack",
    handlerName: "handleMartialArts",
    category: "battle",
    usage: "/battack",
    description: "Execute a normal attack in battle.",
    examples: ["/battack"]
  },
  {
    command: "/fight",
    handlerName: "handleFight",
    category: "battle",
    usage: "/fight",
    description: "Engage the active group curse in battle.",
    examples: ["/fight"]
  },
  {
    command: "/setgrouppfp",
    handlerName: "handleSetGroupPfp",
    category: "group",
    usage: "/setgrouppfp",
    description: "Set the group's curse image (reply to an image).",
    examples: ["/setgrouppfp"]
  },
  {
    command: "/battack1",
    handlerName: "handleMartialArts",
    category: "battle",
    usage: "/battack1",
    description: "Use Uppercut in battle.",
    examples: ["/battack1"]
  },
  {
    command: "/battack2",
    handlerName: "handleMartialArts",
    category: "battle",
    usage: "/battack2",
    description: "Use Jab in battle.",
    examples: ["/battack2"]
  },
  {
    command: "/battack3",
    handlerName: "handleMartialArts",
    category: "battle",
    usage: "/battack3",
    description: "Use Roundhouse Kick in battle.",
    examples: ["/battack3"]
  },
  {
    command: "/battack4",
    handlerName: "handleMartialArts",
    category: "battle",
    usage: "/battack4",
    description: "Use Body Blow in battle.",
    examples: ["/battack4"]
  },
  {
     command: "/bblock",
     handlerName: "handleBattleCommand",
     category: "battle",
     usage: "/bblock",
     description: "Block incoming damage in battle.",
     examples: ["/bblock"]
   },
   {
     command: "/dodge",
     handlerName: "handleBattleCommand",
     category: "battle",
     usage: "/dodge",
     description: "Attempt to dodge an incoming attack based on speed.",
     examples: ["/dodge"]
   },
   {
     command: "/counter",
     handlerName: "handleBattleCommand",
     category: "battle",
     usage: "/counter",
     description: "Counterattack after a perfect block.",
     examples: ["/counter"]
   },
   {
     command: "/bflee",
     handlerName: "handleBattleCommand",
     category: "battle",
     usage: "/bflee",
     description: "Attempt to flee from an active battle.",
     examples: ["/bflee"]
   },
  {
    command: "/btq1",
    handlerName: "handleBattleCommand",
    category: "battle",
    usage: "/btq1 [binding-vows] [declaration]",
    description: "Use your first technique in battle. Optional: add Binding Vows with 'vow x vow x vow' and a technique declaration.",
    examples: ["/btq1", "/btq1 black-and-white", "/btq1 black-and-white x red-meets-blue HOLLOW PURPLE"]
  },
  {
    command: "/btq2",
    handlerName: "handleBattleCommand",
    category: "battle",
    usage: "/btq2 [binding-vows] [declaration]",
    description: "Use your second technique in battle. Optional: add Binding Vows with 'vow x vow x vow' and a technique declaration.",
    examples: ["/btq2", "/btq2 black-and-white", "/btq2 black-and-white x red-meets-blue HOLLOW PURPLE"]
  },
  {
    command: "/btq3",
    handlerName: "handleBattleCommand",
    category: "battle",
    usage: "/btq3 [binding-vows] [declaration]",
    description: "Use your third technique in battle. Optional: add Binding Vows with 'vow x vow x vow' and a technique declaration.",
    examples: ["/btq3", "/btq3 black-and-white", "/btq3 black-and-white x red-meets-blue HOLLOW PURPLE"]
  },
  {
    command: "/rct-burst",
    handlerName: "handleBattleCommand",
    category: "rct",
    usage: "/rct-burst",
    description: "Use a burst RCT heal in battle.",
    examples: ["/rct-burst"]
  },
  {
    command: "/rct-slow",
    handlerName: "handleBattleCommand",
    category: "rct",
    usage: "/rct-slow",
    description: "Use a slow RCT heal during battle.",
    examples: ["/rct-slow"]
  },
  {
    command: "/rtu",
    handlerName: "handleBattleCommand",
    category: "rct",
    usage: "/rtu",
    description: "Activate a Reverse Technique during combat.",
    examples: ["/rtu"]
  },
  {
    command: "/w",
    handlerName: "handleBattleCommand",
    category: "battle",
    usage: "/w",
    description: "Use a weapon skill in battle.",
    examples: ["/w"]
  },
  {
    command: "/w1",
    handlerName: "handleBattleCommand",
    category: "battle",
    usage: "/w1",
    description: "Use weapon skill one in battle.",
    examples: ["/w1"]
  },
  {
    command: "/w2",
    handlerName: "handleBattleCommand",
    category: "battle",
    usage: "/w2",
    description: "Use weapon skill two in battle.",
    examples: ["/w2"]
  },
  {
    command: "/w3",
    handlerName: "handleBattleCommand",
    category: "battle",
    usage: "/w3",
    description: "Use weapon skill three in battle.",
    examples: ["/w3"]
  },
  {
     command: "/bstats",
     handlerName: "handleBattleCommand",
     category: "battle",
     usage: "/bstats",
     description: "View your battle stats during combat.",
     examples: ["/bstats"]
   },
   {
     command: "/legends",
     handlerName: "handleLegends",
     category: "battle",
     usage: "/legends",
     description: "View the top legendary battles.",
     examples: ["/legends"]
   },
   {
     command: "/bra",
     handlerName: "handleBranchInfo",
     category: "battle",
     usage: "/bra",
     description: "Inspect your current battle branch and bonuses.",
     examples: ["/bra"]
   },
  {
    command: "/bf",
    handlerName: "handleBf",
    category: "battle",
    usage: "/bf",
    description: "View Black Flash information and your affinity.",
    examples: ["/bf"]
  },
  {
    command: "/ch",
    handlerName: "handleChallenge",
    category: "battle",
    usage: "/ch",
    description: "Challenge another sorcerer to a PvP match.",
    examples: ["/ch"]
  },
  {
    command: "/ch-a",
    handlerName: "handleChallenge",
    category: "battle",
    usage: "/ch-a",
    description: "Accept a player challenge.",
    examples: ["/ch-a"]
  },
  {
    command: "/ch-d",
    handlerName: "handleChallenge",
    category: "battle",
    usage: "/ch-d",
    description: "Decline a player challenge.",
    examples: ["/ch-d"]
  },
  {
    command: "/rt",
    handlerName: "handleRctStatus",
    category: "rct",
    usage: "/rt",
    description: "View your Reverse Cursed Technique status.",
    examples: ["/rt"]
  },
  {
    command: "/rct-auto",
    handlerName: "handleRctAuto",
    category: "rct",
    usage: "/rct-auto",
    description: "Toggle RCT auto-heal on or off.",
    examples: ["/rct-auto"]
  },
  {
    command: "/rt-train",
    aliases: ["/rct-train"],
    handlerName: "handleRtTrain",
    category: "rct",
    usage: "/rt-train",
    description: "View or manage Reverse Technique training streaks.",
    examples: ["/rt-train"]
  },
  {
    command: "/train-rct",
    handlerName: "handleRctTrain",
    category: "rct",
    usage: "/train-rct",
    description: "Open the Reverse Technique training screen.",
    examples: ["/train-rct"]
  },
  {
    command: "/train-rct-confirm",
    handlerName: "handleTrainRctConfirm",
    category: "rct",
    usage: "/train-rct-confirm",
    description: "Confirm your Reverse Technique training action.",
    examples: ["/train-rct-confirm"]
  },
  {
    command: "/rct-give",
    handlerName: "handleRctGive",
    category: "rct",
    usage: "/rct-give <@user> <amount>",
    description: "Give Reverse Cursed Technique energy to another player.",
    examples: ["/rct-give @1234567890 50"]
  },
  {
    command: "/train-domain",
    handlerName: "handleTrainDomain",
    category: "domain",
    usage: "/train-domain",
    description: "Start the challenge to unlock Domain Expansion.",
    examples: ["/train-domain"]
  },
  {
    command: "/domain-name",
    handlerName: "handleDomainName",
    category: "domain",
    usage: "/domain-name <name>",
    description: "Name your Domain Expansion.",
    examples: ["/domain-name Heavenly-Chain"]
  },
  {
    command: "/domain",
    handlerName: "handleDomain",
    category: "domain",
    usage: "/domain",
    description: "Activate your Domain Expansion in battle.",
    examples: ["/domain"]
  },
  {
    command: "/summon",
    prefix: "/summon ",
    handlerName: "handleSummonShikigami",
    category: "summons",
    usage: "/summon <name>",
    description: "Equip a conquered shikigami to assist you in battle.",
    examples: ["/summon nue"]
  },
  {
    command: "/binding-vows",
    handlerName: "handleBindingVows",
    category: "techniques",
    usage: "/binding-vows",
    description: "View available Binding Vows and your Technique Control.",
    examples: ["/binding-vows", "/bv"],
    aliases: ["/bv"]
  },
  {
    command: "/train-shikigami",
    handlerName: "handleTrainShikigami",
    category: "summons",
    usage: "/train-shikigami",
    description: "View the Ten Shadows shikigami training interface.",
    examples: ["/train-shikigami"]
  },
  {
    command: "/train-<shikigami-id>",
    prefix: "/train-",
    handlerName: "handleTrainShikigamiForId",
    category: "summons",
    usage: "/train-<shikigami-id>",
    description: "Start a shikigami ritual battle to conquer a specific shikigami.",
    examples: ["/train-divine-dogs", "/train-nue"]
  },
  {
    command: "/pet",
    handlerName: "handlePet",
    category: "summons",
    usage: "/pet",
    description: "View your equipped summon or active shikigami.",
    examples: ["/pet"]
  },
  {
    command: "/pets",
    handlerName: "handlePets",
    category: "summons",
    usage: "/pets",
    description: "List all your owned summons and shikigami.",
    examples: ["/pets"]
  },
  {
    command: "/pet-info",
    handlerName: "handlePetInfo",
    category: "summons",
    usage: "/pet-info <pet-id>",
    description: "View detailed stats for one of your summons.",
    examples: ["/pet-info nue"]
  },
  {
    command: "/pet-equip",
    handlerName: "handlePetEquip",
    category: "summons",
    usage: "/pet-equip <pet-id>",
    description: "Equip a summon or shikigami for battle.",
    examples: ["/pet-equip nue"]
  },
  {
    command: "/pet-unequip",
    handlerName: "handleUnsummonPet",
    category: "summons",
    usage: "/pet-unequip",
    description: "Unequip your current summon or shikigami.",
    examples: ["/pet-unequip"]
  },
  {
    command: "/pet-feed",
    handlerName: "handleFeedPet",
    category: "summons",
    usage: "/pet-feed <item>",
    description: "Feed your summon to restore health or bond.",
    examples: ["/pet-feed meat"]
  },
  {
    command: "/pet-train",
    handlerName: "handlePetTrain",
    category: "summons",
    usage: "/pet-train",
    description: "Train your summon to increase its power.",
    examples: ["/pet-train"]
  },
  {
    command: "/pet-heal",
    handlerName: "handleHealPet",
    category: "summons",
    usage: "/pet-heal",
    description: "Heal your summon after a battle.",
    examples: ["/pet-heal"]
  },
  {
    command: "/pet-rename",
    handlerName: "handlePetRename",
    category: "summons",
    usage: "/pet-rename <name>",
    description: "Rename your summon or shikigami.",
    examples: ["/pet-rename Shadow" ]
  },
  {
    command: "/petstats",
    handlerName: "handlePetStats",
    category: "summons",
    usage: "/petstats",
    description: "View summary stats for your summons.",
    examples: ["/petstats"]
  },
  {
    command: "/petskills",
    handlerName: "handlePetSkills",
    category: "summons",
    usage: "/petskills",
    description: "View ability and skill information for your summon.",
    examples: ["/petskills"]
  },
  {
    command: "/petevolve",
    handlerName: "handlePetEvolve",
    category: "summons",
    usage: "/petevolve",
    description: "Evolve your summon to a stronger form.",
    examples: ["/petevolve"]
  },
  {
    command: "/revivepet",
    handlerName: "handleRevivePet",
    category: "summons",
    usage: "/revivepet",
    description: "Revive a fallen summon.",
    examples: ["/revivepet"]
  },
  {
    command: "/manual",
    handlerName: "handleManual",
    category: "utility",
    usage: "/manual",
    description: "Open the complete KennyJaks beginner manual.",
    examples: ["/manual"]
  },
  {
    command: "/manual-<page>",
    prefix: "/manual-",
    handlerName: "handleManualPage",
    category: "utility",
    usage: "/manual-<page>",
    description: "Open a specific manual page.",
    examples: ["/manual-7"],
    hidden: true
  },
  {
    command: "/menu",
    handlerName: "handleMenu",
    category: "utility",
    usage: "/menu",
    description: "Open the polished KennyJaks command hub.",
    examples: ["/menu"]
  },
  {
    command: "/help",
    handlerName: "handleHelp",
    category: "utility",
    usage: "/help [category|command]",
    description: "Get detailed help for categories or individual commands.",
    examples: ["/help", "/help combat", "/help buy"]
  },
  {
    command: "/stats",
    handlerName: "handleStats",
    category: "utility",
    usage: "/stats",
    description: "Show server statistics and bot activity.",
    examples: ["/stats"]
  },
  {
    command: "/news",
    handlerName: "handleNews",
    category: "utility",
    usage: "/news",
    description: "Read the latest game news and updates.",
    examples: ["/news"]
  },
  {
    command: "/comments",
    handlerName: "handleComments",
    category: "utility",
    usage: "/comments",
    description: "Leave feedback or view bot comments.",
    examples: ["/comments"]
  },
  {
    command: "/link",
    handlerName: "handleLink",
    category: "utility",
    usage: "/link",
    description: "Generate or view a helpful bot link.",
    examples: ["/link"]
  },
  {
    command: "/sticker",
    handlerName: "handleSticker",
    category: "utility",
    usage: "/sticker",
    description: "Create a sticker from an image or media.",
    examples: ["/sticker"]
  },
  {
    command: "/take",
    handlerName: "handleTake",
    category: "utility",
    usage: "/take",
    description: "Steal a sticker from a pack or image.",
    examples: ["/take"]
  },
  {
    command: "/toimg",
    handlerName: "handleToimg",
    category: "utility",
    usage: "/toimg",
    description: "Convert a sticker into a PNG image.",
    examples: ["/toimg"]
  },
  {
    command: "/togif",
    handlerName: "handleTogif",
    category: "utility",
    usage: "/togif",
    description: "Convert a sticker into a GIF.",
    examples: ["/togif"]
  },
  {
    command: "/sticker-info",
    handlerName: "handleStickerInfo",
    category: "utility",
    usage: "/sticker-info",
    description: "Get metadata about a sticker.",
    examples: ["/sticker-info"]
  },
  {
    command: "/list",
    handlerName: "handleList",
    category: "dashboard",
    usage: "/list",
    description: "View the bot's server registry and setup status.",
    examples: ["/list"]
  },
  {
    command: "/leaderboard",
    handlerName: "handleLeaderboard",
    category: "dashboard",
    usage: "/leaderboard",
    description: "View the global leaderboard.",
    examples: ["/leaderboard"]
  },
  {
    command: "/server",
    handlerName: "handleServer",
    category: "dashboard",
    usage: "/server",
    description: "Show the bot server status.",
    examples: ["/server"]
  },
  {
    command: "/give-domain",
    handlerName: "handleGiveDomain",
    permission: "owner",
    category: "developer",
    usage: "/give-domain <@user>",
     description: "Grant Domain expansion access to another player.",
     examples: ["/give-domain @1234567890"]
  },
  {
    command: "/give-sp",
    handlerName: "handleGiveSkillPoints",
    permission: "owner",
    category: "developer",
    usage: "/give-sp <amount>\n/give-sp <@user> <amount>",
    description: "Grant skill points to yourself or another player.",
    examples: ["/give-sp 100", "/give-sp @1234567890 50"]
  },
  {
    command: "/give-rep",
    handlerName: "handleGiveReputation",
    permission: "owner",
    category: "developer",
    usage: "/give-rep <amount>\n/give-rep <@user> <amount>",
    description: "Grant reputation points to yourself or another player.",
    examples: ["/give-rep 200", "/give-rep @1234567890 500"]
  },
  {
    command: "/give-level",
    handlerName: "handleGiveLevel",
    permission: "owner",
    category: "developer",
    usage: "/give-level <amount>\n/give-level <@user> <amount>",
    description: "Grant levels to yourself or another player.",
    examples: ["/give-level 5", "/give-level @1234567890 3"]
  },
  {
    command: "/rem-level",
    handlerName: "handleRemoveLevel",
    permission: "owner",
    category: "developer",
    usage: "/rem-level <amount>\n/rem-level <@user> <amount>",
    description: "Remove levels from yourself or another player.",
    examples: ["/rem-level 5", "/rem-level @1234567890 3"]
  },
  {
    command: "/set-grade",
    handlerName: "handleSetGrade",
    permission: "owner",
    category: "developer",
    usage: "/set-grade <grade>\n/set-grade <@user> <grade>",
    description: "Set a player's grade. Valid: 4, 3, 2, 1, 0",
    examples: ["/set-grade 0", "/set-grade @1234567890 1"]
  },
  {
    command: "/run-combat-migration",
    handlerName: "handleRunCombatMigration",
    permission: "owner",
    category: "developer",
    usage: "/run-combat-migration",
    description: "Recalculate all players' combat attributes from SP using the new formula (100 SP = 1 Strength).",
    examples: ["/run-combat-migration"]
  },
  {
    command: "/debug-commands",
    handlerName: "handleDebugCommands",
    permission: "owner",
    category: "developer",
    usage: "/debug-commands",
    description: "Inspect the command registry for health and duplicates.",
    examples: ["/debug-commands"]
  },
  {
    command: "/enable",
    handlerName: "handleEnable",
    permission: "owner",
    category: "developer",
    usage: "/enable [module]",
    description: "Enable KennyJaks or a specific module in a group.",
    examples: ["/enable", "/enable economy"]
  },
  {
    command: "/disable",
    handlerName: "handleDisable",
    permission: "owner",
    category: "developer",
    usage: "/disable [module]",
    description: "Disable KennyJaks or a specific module in a group.",
    examples: ["/disable", "/disable combat"]
  },
  {
    command: "/help-enable",
    handlerName: "handleHelpEnable",
    permission: "owner",
    category: "developer",
    usage: "/help-enable",
    description: "Show group authorization info for KennyJaks.",
    examples: ["/help-enable"]
  },
  {
    command: "/group-settings",
    aliases: ["/gsettings"],
    handlerName: "handleGroupSettings",
    permission: "owner",
    category: "developer",
    usage: "/group-settings",
    description: "View KennyJaks group module settings.",
    examples: ["/group-settings"]
  },
  {
    command: "/toggle-<module>",
    prefix: "/toggle-",
    handlerName: "handleToggle",
    permission: "owner",
    category: "developer",
    usage: "/toggle-<module>",
    description: "Toggle a group module on or off.",
    examples: ["/toggle-combat", "/toggle-economy"],
    hidden: true
  },
  {
    command: "/location",
    handlerName: "handleLocation",
    category: "world",
    usage: "/location",
    description: "View your current location and its history.",
    examples: ["/location"]
  },
  {
    command: "/grant-owner",
    handlerName: "handleGrantOwner",
    permission: "owner",
    category: "developer",
    usage: "/grant-owner <@phone> [duration]",
    description: "Grant temporary owner access to a user. Duration: 1d, 1w, 1m, or ms (default: 1 month).",
    examples: ["/grant-owner 2349035952633 1m"]
  },
  {
    command: "/revoke-owner",
    handlerName: "handleRevokeOwner",
    permission: "owner",
    category: "developer",
    usage: "/revoke-owner <@phone>",
    description: "Revoke temporary owner access from a user.",
    examples: ["/revoke-owner 2349035952633"]
  },
  {
    command: "/temp-owners",
    handlerName: "handleTempOwners",
    permission: "owner",
    category: "developer",
    usage: "/temp-owners",
    description: "List all active temporary owners and their expiry times.",
    examples: ["/temp-owners"]
  },
  {
    command: "/reset",
    handlerName: "handleReset",
    permission: "owner",
    category: "developer",
    usage: "/reset <@user or phone>",
    description: "Reset a player's account back to the beginning. Clears all data and restores default stats.",
    examples: ["/reset @2349035952633", "/reset 2349035952633"]
  },
  {
    command: "/delete",
    handlerName: "handleDelete",
    permission: "owner",
    category: "developer",
    usage: "/delete <@user>\nOr quote a user's message then /delete",
    description: "Permanently delete a player's account. The user must use /start to begin a new journey.",
    examples: ["/delete @2349035952633", "/delete (quote user's message)"]
  },
  {
    command: "/ban",
    handlerName: "handleBan",
    permission: "owner",
    category: "developer",
    usage: "/ban <@user> [reason]\nOr quote a user's message then /ban",
    description: "Ban a user from using the bot. Banned users cannot send any commands.",
    examples: ["/ban @2349035952633", "/ban @2349035952633 spamming"]
  },
  {
    command: "/unban",
    handlerName: "handleUnban",
    permission: "owner",
    category: "developer",
    usage: "/unban <@user>\nOr quote a user's message then /unban",
    description: "Lift a ban from a user, allowing them to use the bot again.",
    examples: ["/unban @2349035952633", "/unban (quote user's message)"]
  },
  {
    command: "/taunt",
    handlerName: "handleTaunt",
    category: "battle",
    usage: "/taunt",
    description: "Taunt your opponent during battle. Can affect their emotional state.",
    examples: ["/taunt"]
  },
   {
     command: "/claim-card",
     handlerName: "handleClaimCard",
     category: "cards",
     usage: "/claim-card",
     description: "Claim a spawned JJK character card for your deck.",
     examples: ["/claim-card"]
   },
   {
     command: "/deck",
     prefix: "/deck",
     handlerName: "handleDeckCommand",
     category: "cards",
     usage: "/deck [card name]",
     description: "View your card deck or search for a specific card.",
     examples: ["/deck", "/deck Gojo", "/deckGojo"]
   },
   {
     command: "/spawncard",
     handlerName: "handleSpawnCard",
     category: "cards",
     usage: "/spawncard",
     description: "Spawn a random JJK character card for this chat.",
     examples: ["/spawncard"]
   },
   {
     command: "/duel",
     handlerName: "handleDuel",
     category: "cards",
     usage: "/duel <phone> or /duel npc",
     description: "Challenge another player or NPC to a card duel.",
     examples: ["/duel 1234567890", "/duel npc"]
   },
   {
     command: "/attack",
     handlerName: "handleCardAttack",
     category: "cards",
     usage: "/attack <card_number>",
     description: "Attack with a card during a duel.",
     examples: ["/attack 1", "/attack 3"]
   },
   {
     command: "/collection",
     handlerName: "handleCollection",
     category: "cards",
     usage: "/collection",
     description: "View your card collection stats and details.",
     examples: ["/collection"]
   },
   {
     command: "/sellcard",
     handlerName: "handleSellCard",
     category: "cards",
     usage: "/sellcard <number> | list | my | buy <id>",
     description: "Sell cards for yen, view the market, or buy cards.",
     examples: ["/sellcard 1", "/sellcard list", "/sellcard my"]
   },
{
    command: "/tradecard",
    handlerName: "handleTradeCard",
    category: "cards",
    usage: "/tradecard <phone> <card_number>",
    description: "Trade a card with another player.",
    examples: ["/tradecard 1234567890 1"]
  },
  {
    command: "/ctrade",
    handlerName: "handleCtrade",
    category: "cards",
    usage: "/ctrade <card name> (quote user)",
    description: "Trade a card with another player while quoting them.",
    examples: ["/ctrade card_name (quote user)"]
  },
  {
    command: "/set-title",
    handlerName: "handleSetTitle",
    category: "profile",
    usage: "/set-title <title>",
    description: "Set a custom title for your profile.",
    examples: ["/set-title ☠️ Shadow Sovereign"]
  },
  {
    command: "/set-bio",
    handlerName: "handleSetBio",
    category: "profile",
    usage: "/set-bio <bio>",
    description: "Set a custom bio for your profile. Supports emojis and symbols.",
    examples: ["/set-bio ☠️ Grade 1 sorcerer | Shadow Sovereign"]
  },
  {
    command: "/set-badge",
    handlerName: "handleSetBadge",
    category: "profile",
    usage: "/set-badge <emoji>",
    description: "Set a custom badge emoji for your profile.",
    examples: ["/set-badge 👑", "/set-badge ☠️"]
  },
  {
    command: "/profile-style",
    handlerName: "handleSetProfileStyle",
    category: "profile",
    usage: "/profile-style <A|B|C|D|E>",
    description: "Change your profile card style.",
    examples: ["/profile-style B"]
  },
  {
    command: "/setpfp",
    handlerName: "handleSetPfp",
    category: "profile",
    usage: "/setpfp (reply to image)",
    description: "Set your profile picture by replying to an image.",
    examples: ["/setpfp"]
  },
  {
    command: "/pfpstyles",
    handlerName: "handlePfpStyles",
    category: "profile",
    usage: "/pfpstyles [number]",
    description: "View or change your profile accent color.",
    examples: ["/pfpstyles", "/pfpstyles 3"]
  },
  {
    command: "/sprites",
    handlerName: "handleSprites",
    category: "profile",
    usage: "/sprites",
    description: "View all available sprites you can use.",
    examples: ["/sprites"]
  },
  {
    command: "/sprite-v",
    handlerName: "handleSpriteView",
    category: "profile",
    usage: "/sprite-v <number>",
    description: "View a specific sprite by number.",
    examples: ["/sprite-v 1"]
  },
  {
    command: "/set-sprite",
    handlerName: "handleSetSprite",
    category: "profile",
    usage: "/set-sprite <number>",
    description: "Set a sprite as your current avatar.",
    examples: ["/set-sprite 1"]
  },
  {
    command: "/yt",
    handlerName: "handleYouTubeSearch",
    category: "utility",
    usage: "/yt <song name>",
    description: "Search YouTube Music for a song.",
    examples: ["/yt Never Gonna Give You Up"]
  },
  {
    command: "/ytset",
    handlerName: "handleYouTubeSet",
    category: "utility",
    usage: "/ytset <number>",
    description: "Set a YouTube Music song to your profile from search results.",
    examples: ["/ytset 1"]
  },
  {
    command: "/birthday",
    handlerName: "handleBirthday",
    category: "events",
    usage: "/birthday",
    description: "Claim your birthday bonus during the birthday event.",
    examples: ["/birthday"]
  },
  {
    command: "/seal",
    handlerName: "handleSeal",
    category: "kloot",
    usage: "/seal",
    description: "Seal a curse into a Curse Binding Scroll.",
    examples: ["/seal"]
  },
  {
    command: "/scroll-curse-release",
    handlerName: "handleScrollRelease",
    category: "kloot",
    usage: "/scroll-curse-release",
    description: "Summon your sealed curse.",
    examples: ["/scroll-curse-release"]
  },
  {
    command: "/curse-element",
    handlerName: "handleCurseElement",
    category: "kloot",
    usage: "/curse-element <element>",
    description: "Set element for sealed curse.",
    examples: ["/curse-element fire"]
  },
  {
    command: "/set-cursename",
    handlerName: "handleSetCurseName",
    category: "kloot",
    usage: "/set-cursename <name>",
    description: "Set name for sealed curse.",
    examples: ["/set-cursename Flame Demon"]
  },
  {
    command: "/set-cursebio",
    handlerName: "handleSetCurseBio",
    category: "kloot",
    usage: "/set-cursebio <bio>",
    description: "Set bio for sealed curse.",
    examples: ["/set-cursebio A powerful fire curse"]
  },
  {
    command: "/zero-use",
    handlerName: "handleZeroGravityUse",
    category: "kloot",
    usage: "/zero-use",
    description: "Reduce gravity around opponent.",
    examples: ["/zero-use"]
  },
  {
    command: "/nova",
    handlerName: "handleNova",
    category: "kloot",
    usage: "/nova",
    description: "Sacrifice 90% HP to mix domains and create Nova Ball.",
    examples: ["/nova"]
  },
  {
    command: "/burn",
    handlerName: "handleBurn",
    category: "kloot",
    usage: "/burn",
    description: "One-shot enemy with Benimaru's flames.",
    examples: ["/burn"]
  },
  {
    command: "/flaura",
    handlerName: "handleFlaura",
    category: "kloot",
    usage: "/flaura",
    description: "Create flame environment that damages enemy.",
    examples: ["/flaura"]
  },
  {
    command: "/everburn",
    handlerName: "handleEverburn",
    category: "kloot",
    usage: "/everburn",
    description: "Sacrifice 100% HP for 60 seconds of ultimate power.",
    examples: ["/everburn"]
  },
  {
    command: "/give-kloot",
    handlerName: "handleGiveKloot",
    category: "developer",
    usage: "/give-kloot <tag user> <kloot name>",
    description: "Give a kloot to a user (admin only).",
    examples: ["/give-kloot @user zero_gravity"]
  }
]

export function getCategoryDefinitionByKey(key) {
  return COMMAND_CATEGORY_DEFINITIONS.find(category => category.key === key)
}

export function getCategoryLabels() {
  return COMMAND_CATEGORY_DEFINITIONS.reduce((map, category) => {
    map[category.key] = category.label
    return map
  }, {})
}

export function getVisibleCommandDefinitions() {
  return COMMAND_DEFINITIONS.filter(cmd => !cmd.hidden)
}

export function getCommandDefinitionByCommand(command) {
  const normalized = command.toLowerCase()
  return COMMAND_DEFINITIONS.find(def => {
    if (def.command && def.command.toLowerCase() === normalized) return true
    if (def.aliases && def.aliases.map(a => a.toLowerCase()).includes(normalized)) return true
    return false
  })
}
