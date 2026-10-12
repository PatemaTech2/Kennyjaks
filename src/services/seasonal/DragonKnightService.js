import { getKnightState, isEventActive } from "./SeasonalEventService.js"

const DRAGON_KNIGHTS = {
  valaryia: {
    id: "valaryia",
    name: "Valaryia",
    title: "THE BLACK DRAGON",
    rank: "Dragon Knight",
    status: "alive",
    forms: ["human", "dragon", "half-dragon"],
    baseStats: { hp: 9700, ce: 4000, strength: 180, defense: 140, speed: 120 },
    dragonStats: { hp: 18500, ce: 7200, strength: 320, defense: 240, speed: 190 },
    finalStats: { hp: 23280, ce: 7200, strength: 396, defense: 280, speed: 223 },
    moves: ["fire_storm", "raging_flames"],
    dialogue: {
      intro: ["You dare challenge a Dragon Knight?", "I am Valaryia, the Black Dragon.", "Prepare to burn."],
      fireStorm: ["Feel the fury of the Black Dragon!", "BURN!", "Fire Storm!"],
      ragingFlames: ["Raging Flames!", "Consume everything!", "Nothing can withstand this heat!"],
      transform: ["Hmph. You forced my hand.", "I shall show you my true form.", "Become ash."],
      finalForm: ["ENOUGH!", "I am the Black Dragon!", "Dragon Half-Human Form!"],
      defeat: ["Impossible...", "I... have been defeated...", "The Black Dragon... falls..."]
    }
  },
  sirax: {
    id: "sirax",
    name: "Sirax",
    title: "THE YELLOW DRAGON",
    rank: "Dragon Knight",
    status: "alive",
    forms: ["human", "dragon", "lightning-dragon-god"],
    baseStats: { hp: 3000, ce: 2000, strength: 100, defense: 160, speed: 140 },
    dragonStats: { hp: 3000, ce: 2000, strength: 100, defense: 160, speed: 140 },
    godStats: { hp: 40000, ce: 10000, strength: 450, defense: 320, speed: 260 },
    moves: ["discharge", "roar_of_the_lightning_dragon"],
    dialogue: {
      intro: ["You shouldn't be here.", "Run.", "I don't want to fight you."],
      discharge: ["Discharge!", "Feel the lightning!", "Zzap!"],
      roar: ["ROAR OF THE LIGHTNING DRAGON!", "PARALYZE!", "Cannot move..."],
      falseDeath: ["No...", "I... I... didn't...", "Didn't want to do this...", "Why did you make me do this?"],
      transformation: ["I... I'm sorry...", "This is my TRUE power!", "Lightning Dragon God!"],
      bodySplit: ["You think that was it?", "My heart still beats.", "Now... face both of us!"],
      defeat: ["You are the strongest human I have ever faced.", "I thank you...", "For giving me joy...", "Even at the end."]
    }
  },
  blare: {
    id: "blare",
    name: "Blare",
    title: "THE DRAGON OF THE CRIMSON SUN",
    rank: "Dragon Knight",
    status: "alive",
    forms: ["human", "dragon", "dragon-god"],
    baseStats: { hp: 24000, ce: 9000, strength: 280, defense: 220, speed: 180 },
    dragonStats: { hp: 48000, ce: 15000, strength: 420, defense: 340, speed: 240 },
    godStats: { hp: 85000, ce: 25000, strength: 650, defense: 480, speed: 320 },
    moves: ["cruel_sun", "solar_beam", "physical_combo"],
    dialogue: {
      intro: ["Another challenger?", "Let's see what you've got.", "I am Blare, the Crimson Sun."],
      cruelSun: ["CRUEL SUN!", "Burn!", "Nothing can survive this!"],
      solarBeam: ["SOLAR BEAM!", "Feel the heat!", "PENETRATION!"],
      transform: ["Enough.", "I've seen enough.", "I'm going all out.", "CRIMSON SUN DRAGON GOD!"],
      defeat: ["Heh...", "You're... strong...", "This... was... worth it..."]
    }
  },
  ragna: {
    id: "ragna",
    name: "Ragna",
    title: "THE BARBARIAN",
    rank: "Dragon Knight",
    status: "alive",
    forms: ["human"],
    baseStats: { hp: 38000, ce: 3500, strength: 380, defense: 300, speed: 160 },
    moves: ["barbarian_crush", "dragon_breaker", "demi_dragon_rampage", "earth_shatter"],
    dialogue: {
      intro: ["Another insect dares challenge me?", "I am Ragna!", "Prepare to be crushed!"],
      crush: ["BARBARIAN CRUSH!", "SMASH!", "Feel my power!"],
      breaker: ["DRAGON BREAKER!", "Your defense means nothing!", "Break!"],
      rampage: ["DEMI-DRAGON RAMPAGE!", "Feel my wrath!", "DESTROY!"],
      earthShatter: ["EARTH SHATTER!", "The ground trembles!", "Fall!"],
      defeat: ["Impossible...", "A human... defeated me...", "This... changes nothing..."]
    }
  },
  enma: {
    id: "enma",
    name: "Enma",
    title: "THE BLADE DRAGON",
    rank: "Dragon Knight",
    status: "alive",
    forms: ["human", "dragon", "blade-dragon-god"],
    baseStats: { hp: 18000, ce: 12000, strength: 200, defense: 180, speed: 260 },
    dragonStats: { hp: 35000, ce: 18000, strength: 320, defense: 260, speed: 340 },
    godStats: { hp: 70000, ce: 30000, strength: 520, defense: 400, speed: 420 },
    moves: ["x_cutter", "dragon_cuts", "shades_of_red", "black_abyss"],
    dialogue: {
      intro: ["Interesting...", "Another challenger?", "I am Enma, the Blade Dragon.", "Let's see if you can survive."],
      xCutter: ["X CUTTER!", "Your CE is mine!", "Seal!"],
      dragonCuts: ["1000 DRAGON CUTS!", "Feel every blade!", "Bleed!"],
      shadesOfRed: ["70 SHADES OF RED...", "Can you tell reality from illusion?", "Surrender to the darkness..."],
      blackAbyss: ["BLACK ABYSS!", "Fall into the void!", "No escape..."],
      transform: ["You're... stronger than expected.", "Very well.", "BLADE DRAGON GOD!"],
      defeat: ["You... defeated me...", "Mother... will know of this...", "Aurstav... awaits..."]
    }
  }
}

export const DRAGON_KNIGHT_ORDER = ["valaryia", "sirax", "blare", "ragna", "enma"]

export function getKnightDefinition(knightId) {
  return DRAGON_KNIGHTS[knightId] || null
}

export function getAllKnights() {
  return DRAGON_KNIGHTS
}

export function getAliveKnights() {
  return Object.values(DRAGON_KNIGHTS)
}

export async function getAvailableKnights() {
  if (!(await isEventActive())) return []
  const knights = []
  for (const knight of Object.values(DRAGON_KNIGHTS)) {
    const state = await getKnightState(knight.id)
    if (!state.permanentlyDead) {
      knights.push(knight)
    }
  }
  return knights
}

export async function isKnightAlive(knightId) {
  const state = await getKnightState(knightId)
  return !state.permanentlyDead
}

export function getDragonKinModifiers(curseGrade) {
  const gradeMultipliers = {
    0: { hp: 1.6, defense: 1.5, strength: 1.4, speed: 1.2, ce: 1.5 },
    1: { hp: 1.5, defense: 1.4, strength: 1.3, speed: 1.15, ce: 1.4 },
    2: { hp: 1.4, defense: 1.3, strength: 1.2, speed: 1.1, ce: 1.3 },
    3: { hp: 1.3, defense: 1.2, strength: 1.15, speed: 1.08, ce: 1.2 },
    4: { hp: 1.2, defense: 1.15, strength: 1.1, speed: 1.05, ce: 1.1 }
  }
  return gradeMultipliers[curseGrade] || gradeMultipliers[4]
}

export function getDragonKinLoot(curseGrade) {
  const baseLoot = {
    0: { iron: 15, blackIron: 10, curseFlesh: 8, curseEssence: 6, dragonScale: 0.15, dragonHeart: 0.02 },
    1: { iron: 10, blackIron: 6, curseFlesh: 5, curseEssence: 4, dragonScale: 0.08, dragonHeart: 0.01 },
    2: { iron: 7, blackIron: 4, curseFlesh: 3, curseEssence: 2, dragonScale: 0.04, dragonHeart: 0.005 },
    3: { iron: 4, blackIron: 2, curseFlesh: 2, curseEssence: 1, dragonScale: 0.02, dragonHeart: 0.002 },
    4: { iron: 2, blackIron: 1, curseFlesh: 1, curseEssence: 1, dragonScale: 0.01, dragonHeart: 0.001 }
  }
  return baseLoot[curseGrade] || baseLoot[4]
}
