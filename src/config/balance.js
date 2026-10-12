export const BALANCE = {
  xpRequiredBase: 10000,
  xpMultiplierPerLevel: 1,
  gradePromotionXp: 100000,
  reviveCooldownMs: 5 * 60 * 1000,
  fleeBaseChance: 0.5,
  blockDamageReduction: 0.5,
  criticalChance: 0.05,
  playerBaseAttack: 10,
  blackFlashChance: 0.09,
  pvpReward: { xp: 500, yen: 2000 },
  blackFlashMultiplier: 2,
  rctHealPct: 0.1,
  rctBurstCeCost: 400,
  rctSlowCeCost: 100,
  rctGiveCeCost: 500,
  rctBurstCooldownMs: 3 * 60 * 1000,
  rctSlowCooldownMs: 3 * 60 * 1000,
  rctGiveCooldownMs: 56 * 60 * 1000,
  rctSlowHeal: 50,
  worldAnnounceChance: 0.05,
  groupLink: "https://chat.whatsapp.com/kennyjaks",
  curseBaseAttack: {
    4: { min: 4, max: 8 },
    3: { min: 8, max: 14 },
    2: { min: 14, max: 22 },
    1: { min: 20, max: 35 },
    0: { min: 30, max: 55 }
  },
  attributeScaling: {
    hp: 10,
    ce: 8,
    strength: 1,
    defense: 0.8,
    speed: 0.9,
    intelligence: 0.5
  },
  curseStats: {
    4: {
      hp: { min: 80, max: 120 },
      ce: { min: 60, max: 100 },
      strength: { min: 8, max: 12 },
      defense: { min: 6, max: 10 },
      speed: { min: 6, max: 10 },
      xp: { min: 200, max: 300 },
      yen: { min: 2000, max: 3000 },
      sp: 1
    },
    3: {
      hp: { min: 150, max: 250 },
      ce: { min: 120, max: 200 },
      strength: { min: 12, max: 18 },
      defense: { min: 10, max: 16 },
      speed: { min: 10, max: 14 },
      xp: { min: 500, max: 700 },
      yen: { min: 5000, max: 8000 },
      sp: 1
    },
    2: {
      hp: { min: 300, max: 500 },
      ce: { min: 250, max: 400 },
      strength: { min: 18, max: 28 },
      defense: { min: 15, max: 25 },
      speed: { min: 14, max: 22 },
      xp: { min: 1000, max: 1500 },
      yen: { min: 10000, max: 15000 },
      sp: 1
    },
    1: {
      hp: { min: 800, max: 1500 },
      ce: { min: 600, max: 1200 },
      strength: { min: 25, max: 45 },
      defense: { min: 20, max: 40 },
      speed: { min: 20, max: 35 },
      xp: { min: 3000, max: 5000 },
      yen: { min: 30000, max: 50000 },
      sp: 1
    },
    0: {
      hp: { min: 2000, max: 4000 },
      ce: { min: 1500, max: 3000 },
      strength: { min: 40, max: 70 },
      defense: { min: 30, max: 60 },
      speed: { min: 25, max: 45 },
      xp: { min: 10000, max: 15000 },
      yen: { min: 100000, max: 150000 },
      sp: 2
    }
  },
  gradeLabels: {
    4: "Grade 4",
    3: "Grade 3",
    2: "Grade 2",
    1: "Grade 1",
    0: "Special Grade"
  },
  rewardPackages: {
    4: { xp: { min: 800, max: 1000 }, yen: { min: 15000, max: 20000 }, sp: 1 },
    3: { xp: { min: 500, max: 800 }, yen: { min: 10000, max: 15000 }, sp: 1 },
    2: { xp: { min: 2000, max: 2500 }, yen: { min: 30000, max: 40000 }, sp: 1 },
    1: { xp: { min: 7000, max: 8000 }, yen: { min: 70000, max: 80000 }, sp: 1 },
    0: { xp: { min: 20000, max: 25000 }, yen: { min: 100000, max: 120000 }, sp: 1 }
  },
  TRAINING_CONFIG: {
    skillRequirements: {
      "Infinity Basics": { level: 5, trainingMinutes: 30 },
      "Spatial Awareness": { level: 5, trainingMinutes: 30 },
      "Barrier Creation": { level: 10, trainingMinutes: 120 },
      "Attraction Basics": { level: 5, trainingMinutes: 30 },
      "Repulsion Basics": { level: 5, trainingMinutes: 30 },
      "Matter Collapse": { level: 10, trainingMinutes: 120 },
      "Blood Sensing": { level: 5, trainingMinutes: 30 },
      "Blood Clot": { level: 5, trainingMinutes: 30 },
      "Piercing Blood": { level: 10, trainingMinutes: 120 },
      "Canine Bond": { level: 5, trainingMinutes: 30 },
      "Pack Tactics": { level: 5, trainingMinutes: 30 },
      "Perfect Self-Reflection": { level: 10, trainingMinutes: 120 },
      "Wing Bindings": { level: 5, trainingMinutes: 30 },
      "Elephant Control": { level: 5, trainingMinutes: 30 },
      "Lightning Wrapper": { level: 10, trainingMinutes: 120 },
      "Amplification Basics": { level: 5, trainingMinutes: 30 },
      "Power Conversion": { level: 5, trainingMinutes: 30 },
      "Shredding Burst": { level: 10, trainingMinutes: 120 },
      "Collapse Basics": { level: 5, trainingMinutes: 30 },
      "Zone Control": { level: 5, trainingMinutes: 30 },
      "Collapse Wave": { level: 10, trainingMinutes: 120 },
      "Cutting Precision": { level: 5, trainingMinutes: 30 },
      "Hitbox Theory": { level: 5, trainingMinutes: 30 },
      "Radiant Slash": { level: 10, trainingMinutes: 120 },
      "Swap Speed": { level: 5, trainingMinutes: 30 },
      "Swap Range": { level: 5, trainingMinutes: 30 },
      "Clap Swap": { level: 10, trainingMinutes: 120 },
      "Basic Shadow": { level: 5, trainingMinutes: 30 },
      "Shadow Merge": { level: 5, trainingMinutes: 30 },
      "Shadow Bind": { level: 10, trainingMinutes: 120 },
      "Hephaestion": { level: 5, trainingMinutes: 30 },
      "Wind Control": { level: 5, trainingMinutes: 30 },
      "Hurricane Slam": { level: 10, trainingMinutes: 120 },
      "Burst Growth": { level: 5, trainingMinutes: 30 },
      "Cursed Surge": { level: 5, trainingMinutes: 30 },
      "Limit Break": { level: 10, trainingMinutes: 120 },
      "Energy Body": { level: 5, trainingMinutes: 30 },
      "Phase Shift": { level: 5, trainingMinutes: 30 },
      "Soul Diffusion": { level: 10, trainingMinutes: 120 }
    }
  },
  treasuryNumber: "2348164981506"
}

export const POTENTIAL_SYSTEM = {
  grades: {
    A: {
      label: "A (Legendary)",
      description: "Double ALL attributes",
      multipliers: { hp: 2, strength: 2, defense: 2, speed: 2, intelligence: 2, ce: 2 },
      weight: 0.5,
      color: "#ffd700"
    },
    B: {
      label: "B (Excellent)",
      description: "Increase Strength and Speed significantly",
      multipliers: { strength: 1.5, speed: 1.5 },
      weight: 3,
      color: "#c0c0c0"
    },
    C: {
      label: "C (Good)",
      description: "Increase Speed and CE efficiency",
      multipliers: { speed: 1.3, ce: 1.2 },
      weight: 12,
      color: "#4a90d9"
    },
    D: {
      label: "D (Average)",
      description: "Increase Intelligence",
      multipliers: { intelligence: 1.5 },
      weight: 25,
      color: "#50a050"
    },
    E: {
      label: "E (Below Average)",
      description: "Increase HP and Defense",
      multipliers: { hp: 1.3, defense: 1.2 },
      weight: 35,
      color: "#d97706"
    },
    F: {
      label: "F (Low)",
      description: "No bonus. Base stats only.",
      multipliers: {},
      weight: 24.5,
      color: "#6b7280"
    }
  }
}


