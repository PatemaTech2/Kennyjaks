export const DRAGON_CURSE_KING_EVENT = {
  eventId: "dragon-curse-king-summer-2026",
  name: "THE DRAGON CURSE KING",
  subtitle: "Summer Event 2026",
  startDate: "2026-08-16T00:00:00+01:00",
  endDate: null,
  active: false,
  knights: {
    valaryia: {
      id: "valaryia",
      name: "Valaryia",
      title: "THE BLACK DRAGON",
      emoji: "⚫",
      defeated: false,
      permanentlyDead: false
    },
    sirax: {
      id: "sirax",
      name: "Sirax",
      title: "THE YELLOW DRAGON",
      emoji: "🟡",
      defeated: false,
      permanentlyDead: false
    },
    blare: {
      id: "blare",
      name: "Blare",
      title: "THE DRAGON OF THE CRIMSON SUN",
      emoji: "🔴",
      defeated: false,
      permanentlyDead: false
    },
    ragna: {
      id: "ragna",
      name: "Ragna",
      title: "THE BARBARIAN",
      emoji: "⚔️",
      defeated: false,
      permanentlyDead: false
    },
    enma: {
      id: "enma",
      name: "Enma",
      title: "THE BLADE DRAGON",
      emoji: "🗡️",
      defeated: false,
      permanentlyDead: false
    }
  },
  aurstav: {
    id: "aurstav",
    name: "Aurstav",
    title: "THE ETERNAL DRAGON",
    titles: [
      "THE ETERNAL DRAGON",
      "THE DRAGON CURSE KING",
      "THE STRONGEST DRAGON CURSE",
      "THE FIRST CALAMITY GRADE CURSE"
    ],
    emoji: "🐉",
    grade: "CALAMITY",
    reputation: 200000,
    unlocked: false,
    defeated: false,
    permanentlyDead: false,
    phase: 1,
    baseStats: {
      hp: 250000,
      maxHp: 250000,
      ce: 100000,
      maxCe: 100000,
      strength: 50000,
      speed: 12000,
      defense: 45000,
      intelligence: 10000,
      luck: 250
    },
    resistances: {
      ordinaryPhysical: 0.7,
      ceAttacks: 0.6,
      burns: 0.8,
      paralysis: 0.9,
      stun: 0.85,
      bleeding: 0.75,
      ceDisruption: 0.5
    },
    rct: "MASTERED",
    rctEfficiency: 0.35,
    trueForm: "CHINESE ETERNAL DRAGON",
    dragonSoul: {
      maxActive: 5,
      summonChance: 0.35,
      cooldownRounds: 3
    },
    goldFlameStrength: 8000,
    timeScapeCooldownMs: 180000,
    maxActiveDragonSummons: 5,
    phase2Multipliers: {
      hp: 1.0,
      strength: 2.0,
      speed: 1.7,
      defense: 2.0,
      ceEfficiency: 1.5
    },
    raidScaling: {
      1: { actionFreq: 1.0, dragonSoulFreq: 1.0, defenseFreq: 1.0 },
      2: { actionFreq: 1.2, dragonSoulFreq: 1.3, defenseFreq: 1.2 },
      3: { actionFreq: 1.4, dragonSoulFreq: 1.6, defenseFreq: 1.4 },
      4: { actionFreq: 1.6, dragonSoulFreq: 1.9, defenseFreq: 1.6 },
      5: { actionFreq: 1.8, dragonSoulFreq: 2.2, defenseFreq: 1.8 },
      6: { actionFreq: 2.0, dragonSoulFreq: 2.5, defenseFreq: 2.0 },
      7: { actionFreq: 2.2, dragonSoulFreq: 2.8, defenseFreq: 2.2 },
      8: { actionFreq: 2.5, dragonSoulFreq: 3.2, defenseFreq: 2.5 }
    },
    dragonSummonTypes: [
      { name: "Flame Dragon", element: "fire", attack: 12000, defense: 8000, speed: 6000, hp: 40000, ce: 15000, pattern: "aggressive" },
      { name: "Frost Dragon", element: "ice", attack: 10000, defense: 10000, speed: 5000, hp: 50000, ce: 18000, pattern: "defensive" },
      { name: "Storm Dragon", element: "lightning", attack: 14000, defense: 6000, speed: 9000, hp: 35000, ce: 20000, pattern: "berserker" },
      { name: "Shadow Dragon", element: "shadow", attack: 11000, defense: 9000, speed: 7000, hp: 45000, ce: 16000, pattern: "tactical" },
      { name: "Divine Dragon", element: "light", attack: 13000, defense: 11000, speed: 5500, hp: 55000, ce: 22000, pattern: "support" }
    ],
    dialogue: {
      intro: ["A human?", "So you are the one who defeated my knights.", "Interesting.", "Show me whether their deaths were worth something."],
      round5Awaken: ["...Enough.", "I have seen enough.", "Now...", "Fight the Dragon Curse King."],
      serious: ["Hahaha...", "Excellent.", "COME.", "Show me everything."],
      praise: ["...So this is the power of the human who reached this height.", "You've exceeded my expectations."],
      legendaryPraise: ["...", "Stand proud.", "You were extraordinary.", "I have watched countless humans challenge the impossible.", "But you...", "You made the Dragon Curse King fight seriously."],
      phase2Intro: ["...More?", "So humanity has finally decided to come together.", "Good.", "Come.", "Let me see all of you."],
      phase2Intense: ["YES!", "THIS is what I wanted!", "COME AT ME TOGETHER!"],
      death: ["...", "Impossible...", "You... are truly... extraordinary..."],
      deathPraise: ["Stand proud.", "You were extraordinary.", "The Dragon Curse King... falls..."],
      domain: ["☀️ ETERNAL SUN DRAGON PALACE", "Burn beneath my sun."],
      goldMane: ["GOLD MANE", "Four arms. Four destinies."],
      timeScape: ["⏳ TIME SCAPE", "Aurstav is reversing the flow of time..."],
      dragonSoul: ["🐉 DRAGON SOUL ACTIVATED", "The sky has opened.", "Dragon signatures detected:"],
      goldFlame: ["🔥 GOLD FLAME", "Your cursed energy has been burned."],
      soulBurn: ["🔥 SOUL BURN", "Your soul is being consumed."],
      domainClash: ["DOMAIN CLASH", "Our domains collide!"],
      domainClashLoss: ["⚠️ DOMAIN CLASH LOST", "You have been stunned."],
      rctBrainRecovery: ["🧠 RCT", "You are attempting to regenerate the damaged parts of your brain."]
    }
  }
}

export const DRAGON_KIN_MODIFIERS = {
  fire: {
    attackType: "fire",
    fireResistance: 0.5,
    burnChance: 0.3,
    dialoguePrefix: "🐉 Dragon Kin"
  },
  stats: {
    hp: 1.3,
    defense: 1.25,
    strength: 1.2,
    speed: 1.1,
    ce: 1.2
  },
  loot: {
    ironBonus: 1.5,
    blackIronBonus: 1.5,
    curseFleshBonus: 1.5,
    curseEssenceBonus: 1.5,
    rareChanceBonus: 1.3
  }
}

export const DRAGON_MATERIALS = {
  dragonScale: {
    id: "dragon_scale",
    name: "Dragon Scale",
    rarity: "Epic",
    description: "A scale from a Dragon Kin. Used for future event crafting."
  },
  dragonHeart: {
    id: "dragon_heart",
    name: "Dragon Heart",
    rarity: "Legendary",
    description: "The heart of a Dragon Kin. Extremely rare. Used for future event crafting."
  }
}
