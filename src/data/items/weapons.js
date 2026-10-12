export const weapons = [
  {
    id: "weapon_iron_katana",
    name: "Iron Katana",
    rarity: "Common",
    price: 45000,
    icon: "⚔️",
    description: "A basic steel blade. +15 ATK",
    stats: { attack: 15 },
    durability: 100,
    weight: 3,
    gradeReq: 4,
    levelReq: 5,
    category: "Swords",
    skills: ["Slash", "Heavy Slash", "Final Strike"],
    passive: "None"
  },
  {
    id: "weapon_katana",
    name: "Katana",
    rarity: "Uncommon",
    price: 25000,
    icon: "⚔️",
    description: "A well-balanced blade. +20 ATK",
    stats: { attack: 20 },
    durability: 100,
    weight: 3,
    gradeReq: 4,
    levelReq: 1,
    category: "Swords",
    skills: ["Swift Cut", "Piercing Thrust", "Iai Strike"],
    passive: "Quick Draw"
  },
  {
    id: "weapon_cursed_katana",
    name: "Cursed Katana",
    rarity: "Rare",
    price: 160000,
    icon: "⚔️",
    description: "Infused with cursed energy. +40 ATK",
    stats: { attack: 40 },
    durability: 100,
    weight: 4,
    gradeReq: 3,
    levelReq: 10,
    category: "Swords",
    skills: ["Cursed Slash", "Soul Drain", "Dread Strike"],
    passive: "Cursed Edge"
  },
  {
    id: "weapon_special_katana",
    name: "Special Grade Katana",
    rarity: "Legendary",
    price: 2000000,
    icon: "⚔️",
    description: "A blade of exceptional quality. +90 ATK, +10 SPD",
    stats: { attack: 90, speed: 10 },
    durability: 120,
    weight: 5,
    gradeReq: 1,
    levelReq: 30,
    category: "Swords",
    skills: ["Master's Cut", "Heaven's Slash", "Domain Cleave"],
    passive: "Precision"
  },
  {
    id: "weapon_void_blade",
    name: "Void Blade",
    rarity: "Special Grade",
    price: 10000000,
    icon: "⚔️",
    description: "Cuts through space itself. +150 ATK, +20 SPD, +5% Critical",
    stats: { attack: 150, speed: 20, critRate: 5 },
    durability: 150,
    weight: 6,
    gradeReq: 0,
    levelReq: 50,
    category: "Swords",
    skills: ["Void Slash", "Spatial Tear", "Reality Break"],
    passive: "Dimensional Cut"
  },
  {
    id: "weapon_spear",
    name: "Cursed Spear",
    rarity: "Rare",
    price: 180000,
    icon: "🗡️",
    description: "Extended reach. +35 ATK, +15 SPD",
    stats: { attack: 35, speed: 15 },
    durability: 110,
    weight: 4,
    gradeReq: 3,
    levelReq: 12,
    category: "Polearms",
    skills: ["Precise Jab", "Wide Sweep", "Pinpoint Strike"],
    passive: "Long Reach"
  },
  {
    id: "weapon_inverted_spear",
    name: "Inverted Spear",
    rarity: "Rare",
    price: 120000,
    icon: "🦴",
    description: "Pierces defenses. +45 ATK. Special: Ignores 15% defense",
    stats: { attack: 45, defensePierce: 15 },
    durability: 100,
    weight: 5,
    gradeReq: 3,
    levelReq: 8,
    category: "Polearms",
    skills: ["Armor Pierce", "Vital Thrust", "Fatal Strike"],
    passive: "Defense Penetrator"
  },
  {
    id: "weapon_nodachi",
    name: "Nodachi",
    rarity: "Rare",
    price: 140000,
    icon: "🗡️",
    description: "Long, heavy blade. +55 ATK. Special: 20% crit vs large targets",
    stats: { attack: 55, critVsLarge: 20 },
    durability: 110,
    weight: 7,
    gradeReq: 3,
    levelReq: 14,
    category: "Swords",
    skills: ["Wide Slash", "Leaping Strike", "Decisive Blow"],
    passive: "Heavy Blade"
  },
  {
    id: "weapon_tanto",
    name: "Tanto",
    rarity: "Uncommon",
    price: 35000,
    icon: "🔪",
    description: "Short but deadly. +25 ATK, +15 SPD. Special: +25% crit rate",
    stats: { attack: 25, speed: 15, critRate: 25 },
    durability: 80,
    weight: 2,
    gradeReq: 4,
    levelReq: 6,
    category: "Knives",
    skills: ["Quick Stab", "Precise Thrust", "Fatal Pin"],
    passive: "Backstab"
  },
  {
    id: "weapon_polearm",
    name: "Naginata",
    rarity: "Epic",
    price: 380000,
    icon: "🪯",
    description: "Curved blade on a pole. +50 ATK, +20 SPD",
    stats: { attack: 50, speed: 20 },
    durability: 115,
    weight: 5,
    gradeReq: 1,
    levelReq: 22,
    category: "Polearms",
    skills: ["Crescent Moon", "Sky Sweep", "Blossom Storm"],
    passive: "Sweep Attack"
  },
  {
    id: "weapon_blessed_spear",
    name: "Blessed Spear",
    rarity: "Epic",
    price: 650000,
    icon: "🛐",
    description: "Purifies curses. +70 ATK, +25% vs cursed targets",
    stats: { attack: 70, vsCursed: 25 },
    durability: 115,
    weight: 6,
    gradeReq: 1,
    levelReq: 28,
    category: "Polearms",
    skills: ["Divine Pierce", "Blessed Sweep", "Purification Strike"],
    passive: "Curse Slayer"
  },
  {
    id: "weapon_void_halberd",
    name: "Void Halberd",
    rarity: "Special Grade",
    price: 20000000,
    icon: "🌌",
    description: "Cosmic polearm. +120 ATK, +22 SPD. Special: 30% chance to nullify enemy technique",
    stats: { attack: 120, speed: 22, nullifyTech: 30 },
    durability: 150,
    weight: 8,
    gradeReq: 0,
    levelReq: 48,
    category: "Polearms",
    skills: ["Gravity Impalement", "Event Horizon", "Cosmic Collapse"],
    passive: "Nullify"
  },
  {
    id: "weapon_cursed_knife",
    name: "Cursed Knife",
    rarity: "Uncommon",
    price: 30000,
    icon: "🔪",
    description: "Small blade with high crit. +15 ATK, +10% Critical",
    stats: { attack: 15, critRate: 10 },
    durability: 80,
    weight: 2,
    gradeReq: 4,
    levelReq: 3,
    category: "Knives",
    skills: ["Precise Cut", "Shadow Stab", "Venomous Strike"],
    passive: "Critical Eye"
  },
  {
    id: "weapon_shadow_dagger",
    name: "Shadow Dagger",
    rarity: "Rare",
    price: 95000,
    icon: "🌑",
    description: "Throws shadows with each strike. +38 ATK, +10 SPD",
    stats: { attack: 38, speed: 10 },
    durability: 100,
    weight: 3,
    gradeReq: 3,
    levelReq: 15,
    category: "Knives",
    skills: ["Shadow Pierce", "Dark Flurry", "Nightmare Stab"],
    passive: "Shadow Step"
  },
  {
    id: "weapon_demon_sniper",
    name: "Demon Sniper",
    rarity: "Special Grade",
    price: 15000000,
    icon: "🔫",
    description: "Long-range cursed technique rifle. +110 ATK, +30 SPD. No melee bonus",
    stats: { attack: 110, speed: 30, noMeleeBonus: true },
    durability: 120,
    weight: 4,
    gradeReq: 0,
    levelReq: 45,
    category: "Knives",
    skills: ["Sniper Shot", "Headshot", "One Shot Kill"],
    passive: "Headshot"
  },
  {
    id: "weapon_playful_cloud",
    name: "Playful Cloud",
    rarity: "Rare",
    price: 140000,
    icon: "☁️",
    description: "Three-section staff. +60 ATK. No CE scaling on techniques",
    stats: { attack: 60, noCeScaling: true },
    durability: 120,
    weight: 5,
    gradeReq: 3,
    levelReq: 10,
    category: "Special Grade Weapons",
    skills: ["Triple Strike", "Whirling Defense", "Cloud Step"],
    passive: "Chain Mastery"
  },
  {
    id: "weapon_sorcerer_gauntlet",
    name: "Sorcerer Gauntlet",
    rarity: "Epic",
    price: 350000,
    icon: "🧤",
    description: "Reinforced for close combat. +55 ATK, +10 DEF",
    stats: { attack: 55, defense: 10 },
    durability: 110,
    weight: 4,
    gradeReq: 1,
    levelReq: 18,
    category: "Special Grade Weapons",
    skills: ["Rapid Punch", "Charging Uppercut", "Finisher"],
    passive: "Counter"
  },
  {
    id: "weapon_cursed_hammer",
    name: "Cursed Hammer",
    rarity: "Epic",
    price: 420000,
    icon: "🔨",
    description: "Heavy impact weapon. +70 ATK, -5 SPD",
    stats: { attack: 70, speed: -5 },
    durability: 130,
    weight: 9,
    gradeReq: 1,
    levelReq: 20,
    category: "Special Grade Weapons",
    skills: ["Ground Slam", "Crushing Blow", "Earthquake"],
    passive: "Heavy Impact"
  },
  {
    id: "weapon_executioner_sword",
    name: "Executioner Sword",
    rarity: "Epic",
    price: 500000,
    icon: "🗡️",
    description: "Massive two-handed blade. +85 ATK. Special: +25% crit vs low HP",
    stats: { attack: 85, critVsLow: 25 },
    durability: 125,
    weight: 10,
    gradeReq: 1,
    levelReq: 25,
    category: "Special Grade Weapons",
    skills: ["Decapitate", "Execution's Call", "Final Judgement"],
    passive: "Finisher"
  },
  {
    id: "weapon_dragon_axe",
    name: "Dragon Axe",
    rarity: "Epic",
    price: 800000,
    icon: "🪓",
    description: "Heavy axe with spinning attacks. +75 ATK, +5 SPD. Special: 20% cleave",
    stats: { attack: 75, speed: 5, cleave: 20 },
    durability: 120,
    weight: 8,
    gradeReq: 0,
    levelReq: 32,
    category: "Special Grade Weapons",
    skills: ["Axe Throw", "Spinning Lunge", "Dragon's Roar"],
    passive: "Cleave"
  },
  {
    id: "weapon_thunder_rapier",
    name: "Thunder Rapier",
    rarity: "Rare",
    price: 110000,
    icon: "⚡",
    description: "Fast thrusting sword with electric edge. +42 ATK, +20 SPD",
    stats: { attack: 42, speed: 20 },
    durability: 100,
    weight: 4,
    gradeReq: 2,
    levelReq: 14,
    category: "Special Grade Weapons",
    skills: ["Lightning Thrust", "Static Field", "Thunderclap"],
    passive: "Electrified"
  },
  {
    id: "weapon_soul_reaper",
    name: "Soul Reaper Scythe",
    rarity: "Special Grade",
    price: 25000000,
    icon: "🔔",
    description: "Harvests souls. +130 ATK, +15 SPD. Special: Steals 5% HP on hit",
    stats: { attack: 130, speed: 15, lifesteal: 5 },
    durability: 150,
    weight: 7,
    gradeReq: 0,
    levelReq: 50,
    category: "Special Grade Weapons",
    skills: ["Soul Harvest", "Reap", "Death's Scythe"],
    passive: "Soul Steal"
  },
  {
    id: "weapon_wind_glaive",
    name: "Wind Glaive",
    rarity: "Rare",
    price: 105000,
    icon: "🌪️",
    description: "Throwing glaive. +48 ATK, +18 SPD. Special: Returns after throw",
    stats: { attack: 48, speed: 18, returns: true },
    durability: 100,
    weight: 3,
    gradeReq: 2,
    levelReq: 16,
    category: "Special Grade Weapons",
    skills: ["Glaive Throw", "Wind Cutter", "Aerial Assault"],
    passive: "Return"
  },
  {
    id: "weapon_chain_scythe",
    name: "Chain Scythe",
    rarity: "Epic",
    price: 700000,
    icon: "⛓️",
    description: "Extended reach weapon. +65 ATK, +25 SPD. Special: +15% dodge",
    stats: { attack: 65, speed: 25, dodge: 15 },
    durability: 115,
    weight: 6,
    gradeReq: 0,
    levelReq: 30,
    category: "Special Grade Weapons",
    skills: ["Chain Sweep", "Flanking Strike", "Entangle"],
    passive: "Dodge"
  },
  {
    id: "weapon_split_soul_katana",
    name: "Split Soul Katana",
    rarity: "Special Grade",
    price: 35000000,
    icon: "🗡️",
    description: "Strikes the soul directly, bypassing physical defense. +140 ATK. Ignores 30% defense",
    stats: { attack: 140, defensePierce: 30 },
    durability: 150,
    weight: 6,
    gradeReq: 0,
    levelReq: 50,
    category: "Swords",
    skills: ["Soul Slice", "Phantom Edge", "Soul Rend"],
    passive: "Soul Pierce"
  },
  {
    id: "weapon_dragon_bone",
    name: "Dragon Bone",
    rarity: "Special Grade",
    price: 30000000,
    icon: "🦴",
    description: "Ancient bone weapon that channels cursed energy. +135 ATK, +10 SPD. +10% crit rate per hit (stacking)",
    stats: { attack: 135, speed: 10, critRate: 10, stackingCrit: true },
    durability: 140,
    weight: 5,
    gradeReq: 0,
    levelReq: 48,
    category: "Special Grade Weapons",
    skills: ["Bone Spear", "Dragon's Maw", "Ancient Roar"],
    passive: "Dragon's Legacy"
  },
  {
    id: "weapon_inverted_spear_heaven",
    name: "Inverted Spear of Heaven",
    rarity: "Special Grade",
    price: 18000000,
    icon: "🌑",
    description: "The legendary Anti-Getou weapon. +125 ATK, +25 SPD. Special: 100% nullify on full guard",
    stats: { attack: 125, speed: 25, nullifyTech: 100 },
    durability: 140,
    weight: 6,
    gradeReq: 0,
    levelReq: 45,
    category: "Polearms",
    skills: ["Heaven's Lance", "Anti-Nullify", "Divine Reversal"],
    passive: "Nullify"
  }
]

export const weaponSkills = {
  "Slash": {
    name: "Slash",
    description: "Basic weapon strike",
    damageMultiplier: 1.0,
    ceCost: 0
  },
  "Heavy Slash": {
    name: "Heavy Slash",
    description: "Powerful overhead strike",
    damageMultiplier: 1.5,
    ceCost: 20
  },
  "Final Strike": {
    name: "Final Strike",
    description: "Charged finishing attack",
    damageMultiplier: 2.0,
    ceCost: 50
  },
  "Swift Cut": {
    name: "Swift Cut",
    description: "Fast blade technique",
    damageMultiplier: 1.0,
    ceCost: 10
  },
  "Piercing Thrust": {
    name: "Piercing Thrust",
    description: "Ignores 10% defense",
    damageMultiplier: 1.2,
    ceCost: 15,
    defensePierce: 10
  },
  "Iai Strike": {
    name: "Iai Strike",
    description: "Draw and strike with increased crit",
    damageMultiplier: 1.8,
    ceCost: 30,
    critRate: 25
  },
  "Cursed Slash": {
    name: "Cursed Slash",
    description: "Infused with cursed energy",
    damageMultiplier: 1.3,
    ceCost: 25
  },
  "Soul Drain": {
    name: "Soul Drain",
    description: "Steals 15% HP on hit",
    damageMultiplier: 1.4,
    ceCost: 35,
    lifesteal: 15
  },
  "Dread Strike": {
    name: "Dread Strike",
    description: "Fears the target",
    damageMultiplier: 1.6,
    ceCost: 40,
    status: "fear"
  },
  "Master's Cut": {
    name: "Master's Cut",
    description: "Flawless strike",
    damageMultiplier: 1.5,
    ceCost: 30,
    critRate: 20
  },
  "Heaven's Slash": {
    name: "Heaven's Slash",
    description: "Celestial blade technique",
    damageMultiplier: 2.0,
    ceCost: 60
  },
  "Domain Cleave": {
    name: "Domain Cleave",
    description: "Expands domain for wide-area slash",
    damageMultiplier: 2.5,
    ceCost: 100,
    status: "domain"
  },
  "Precise Jab": {
    name: "Precise Jab",
    description: "Accurate thrust attack",
    damageMultiplier: 1.1,
    ceCost: 10
  },
  "Wide Sweep": {
    name: "Wide Sweep",
    description: "Hits multiple targets",
    damageMultiplier: 1.3,
    ceCost: 25
  },
  "Pinpoint Strike": {
    name: "Pinpoint Strike",
    description: "Crits on weak spot",
    damageMultiplier: 1.8,
    ceCost: 40,
    critRate: 50
  },
  "Quick Stab": {
    name: "Quick Stab",
    description: "Fast thrust",
    damageMultiplier: 0.9,
    ceCost: 5
  },
  "Precise Thrust": {
    name: "Precise Thrust",
    description: "High accuracy attack",
    damageMultiplier: 1.2,
    ceCost: 20
  },
  "Fatal Pin": {
    name: "Fatal Pin",
    description: "Critical strike if enemy below 30% HP",
    damageMultiplier: 2.5,
    ceCost: 45,
    critVsLow: 30
  },
  "Crescent Moon": {
    name: "Crescent Moon",
    description: "Curved blade arc",
    damageMultiplier: 1.3,
    ceCost: 25
  },
  "Sky Sweep": {
    name: "Sky Sweep",
    description: "Overhead spinning attack",
    damageMultiplier: 1.6,
    ceCost: 35
  },
  "Blossom Storm": {
    name: "Blossom Storm",
    description: "Rapid multi-hit attack",
    damageMultiplier: 1.8,
    ceCost: 50,
    hits: 3
  },
  "Shadow Pierce": {
    name: "Shadow Pierce",
    description: "Darkness-infused thrust",
    damageMultiplier: 1.3,
    ceCost: 20
  },
  "Dark Flurry": {
    name: "Dark Flurry",
    description: "Multiple shadow strikes",
    damageMultiplier: 1.5,
    ceCost: 35,
    hits: 2
  },
  "Nightmare Stab": {
    name: "Nightmare Stab",
    description: "Causes sleep effect",
    damageMultiplier: 1.7,
    ceCost: 40,
    status: "sleep"
  },
  "Sniper Shot": {
    name: "Sniper Shot",
    description: "Long-range precise shot",
    damageMultiplier: 2.0,
    ceCost: 50
  },
  "Headshot": {
    name: "Headshot",
    description: "Guaranteed crit to head",
    damageMultiplier: 2.5,
    ceCost: 80,
    critRate: 100
  },
  "One Shot Kill": {
    name: "One Shot Kill",
    description: "Lethal attack, 5% chance to instantly kill",
    damageMultiplier: 3.0,
    ceCost: 150
  },
  "Triple Strike": {
    name: "Triple Strike",
    description: "Three quick hits",
    damageMultiplier: 1.2,
    ceCost: 30,
    hits: 3
  },
  "Whirling Defense": {
    name: "Whirling Defense",
    description: "Deflect and counter",
    damageMultiplier: 1.0,
    ceCost: 20,
    block: true
  },
  "Cloud Step": {
    name: "Cloud Step",
    description: "Evade and reposition",
    damageMultiplier: 0,
    ceCost: 15,
    dodge: 100
  },
  "Rapid Punch": {
    name: "Rapid Punch",
    description: "Multiple punch combo",
    damageMultiplier: 1.3,
    ceCost: 25,
    hits: 2
  },
  "Charging Uppercut": {
    name: "Charging Uppercut",
    description: "Knockback uppercut",
    damageMultiplier: 1.6,
    ceCost: 35,
    critRate: 20
  },
  "Finisher": {
    name: "Finisher",
    description: "Devastating combo ender",
    damageMultiplier: 2.2,
    ceCost: 60
  },
  "Ground Slam": {
    name: "Ground Slam",
    description: "Knockdown AoE",
    damageMultiplier: 1.8,
    ceCost: 40,
    status: "stun"
  },
  "Crushing Blow": {
    name: "Crushing Blow",
    description: "Armor-breaking strike",
    damageMultiplier: 1.5,
    ceCost: 30,
    defensePierce: 20
  },
  "Earthquake": {
    name: "Earthquake",
    description: "Shakes the battlefield",
    damageMultiplier: 2.5,
    ceCost: 80,
    status: "stun"
  },
  "Decapitate": {
    name: "Decapitate",
    description: "Instant kill if enemy below 20%",
    damageMultiplier: 3.0,
    ceCost: 70
  },
  "Execution's Call": {
    name: "Execution's Call",
    description: "Increased damage as enemy HP lowers",
    damageMultiplier: 2.0,
    ceCost: 50
  },
  "Final Judgement": {
    name: "Final Judgement",
    description: "Massive execution attack",
    damageMultiplier: 3.5,
    ceCost: 100
  },
  "Axe Throw": {
    name: "Axe Throw",
    description: "Ranged axe throw",
    damageMultiplier: 1.5,
    ceCost: 30
  },
  "Spinning Lunge": {
    name: "Spinning Lunge",
    description: "360-degree spinning attack",
    damageMultiplier: 1.7,
    ceCost: 35,
    hits: 2
  },
  "Dragon's Roar": {
    name: "Dragon's Roar",
    description: "Intimidating roar reduces enemy accuracy",
    damageMultiplier: 1.0,
    ceCost: 25,
    debuff: "accuracy"
  },
  "Lightning Thrust": {
    name: "Lightning Thrust",
    description: "Electric-charged thrust",
    damageMultiplier: 1.4,
    ceCost: 25
  },
  "Static Field": {
    name: "Static Field",
    description: "Builds electricity for next attack",
    damageMultiplier: 0,
    ceCost: 20,
    prep: true
  },
  "Thunderclap": {
    name: "Thunderclap",
    description: "Charged lightning strike",
    damageMultiplier: 2.0,
    ceCost: 50
  },
  "Soul Harvest": {
    name: "Soul Harvest",
    description: "Absorbs enemy soul",
    damageMultiplier: 1.5,
    ceCost: 40,
    lifesteal: 20
  },
  "Reap": {
    name: "Reap",
    description: "Soul-based slash",
    damageMultiplier: 1.8,
    ceCost: 50
  },
  "Death's Scythe": {
    name: "Death's Scythe",
    description: "Soul-reaping combo",
    damageMultiplier: 2.5,
    ceCost: 80,
    hits: 2
  },
  "Glaive Throw": {
    name: "Glaive Throw",
    description: "Throwing attack",
    damageMultiplier: 1.5,
    ceCost: 30
  },
  "Wind Cutter": {
    name: "Wind Cutter",
    description: "Wind-blade projectile",
    damageMultiplier: 1.3,
    ceCost: 20
  },
  "Aerial Assault": {
    name: "Aerial Assault",
    description: "Jumping throw attack",
    damageMultiplier: 1.7,
    ceCost: 35
  },
  "Chain Sweep": {
    name: "Chain Sweep",
    description: "Wide chain attack",
    damageMultiplier: 1.4,
    ceCost: 25,
    hits: 2
  },
  "Flanking Strike": {
    name: "Flanking Strike",
    description: "Attacks from the side",
    damageMultiplier: 1.8,
    ceCost: 35,
    critRate: 30
  },
  "Entangle": {
    name: "Entangle",
    description: "Binds the enemy",
    damageMultiplier: 1.0,
    ceCost: 20,
    status: "bind"
  },
  "Soul Slice": {
    name: "Soul Slice",
    description: "Soul-cutting slash",
    damageMultiplier: 1.8,
    ceCost: 45
  },
  "Phantom Edge": {
    name: "Phantom Edge",
    description: "Strikes from multiple angles",
    damageMultiplier: 2.0,
    ceCost: 60,
    hits: 2
  },
  "Soul Rend": {
    name: "Soul Rend",
    description: "Devastating soul attack",
    damageMultiplier: 2.8,
    ceCost: 100
  },
  "Bone Spear": {
    name: "Bone Spear",
    description: "Bone projectile thrust",
    damageMultiplier: 1.6,
    ceCost: 40
  },
  "Dragon's Maw": {
    name: "Dragon's Maw",
    description: "Bone dragon appears and attacks",
    damageMultiplier: 2.2,
    ceCost: 70,
    hits: 3
  },
  "Ancient Roar": {
    name: "Ancient Roar",
    description: "Forces enemy to kneel",
    damageMultiplier: 1.5,
    ceCost: 35,
    status: "fear"
  },
  "Heaven's Lance": {
    name: "Heaven's Lance",
    description: "Light-based thrust",
    damageMultiplier: 1.8,
    ceCost: 50
  },
  "Anti-Nullify": {
    name: "Anti-Nullify",
    description: "Breaks through defenses",
    damageMultiplier: 2.0,
    ceCost: 60,
    defensePierce: 50
  },
  "Divine Reversal": {
    name: "Divine Reversal",
    description: "Counter-attack after blocking",
    damageMultiplier: 2.5,
    ceCost: 75,
    block: true
  }
}
