export const SKILL_EFFECTS = {
  "Infinity Basics": {
    description: "Basic barrier that reduces incoming damage",
    damageReduction: 5,
    tier: 1
  },
  "Spatial Awareness": {
    description: "Enhanced perception increases dodge chance",
    dodgeChance: 5,
    tier: 1
  },
  "Barrier Creation": {
    description: "Create infinite barrier",
    damageReduction: 15,
    ceRegen: 2,
    tier: 2
  },
  "Attraction Basics": {
    description: "Pull enemies closer",
    pullRange: 1,
    tier: 1
  },
  "Repulsion Basics": {
    description: "Push enemies away with force",
    pushDamage: 5,
    tier: 1
  },
  "Matter Collapse": {
    description: "Collapse matter at a molecular level",
    damageBonus: 20,
    armorPierce: true,
    tier: 2
  },
  "Blood Sensing": {
    description: "Detect cursed energy through blood",
    accuracy: 10,
    tier: 1
  },
  "Blood Clot": {
    description: "Harden blood for defense",
    damageReduction: 8,
    tier: 1
  },
  "Piercing Blood": {
    description: "Pierce through defenses",
    armorPierce: true,
    damageBonus: 10,
    tier: 2
  },
  "Piercing Focus": {
    description: "Focus blood into concentrated attacks",
    criticalChance: 10,
    tier: 1
  },
  "Piercing Range": {
    description: "Extend blood attack range",
    range: 1,
    tier: 1
  },
  "Bloody Spray": {
    description: "Spray blood in all directions",
    aoeDamage: 15,
    tier: 2
  },
  "Blood Armor": {
    description: "Form armor from hardened blood",
    damageReduction: 12,
    maxHpBonus: 20,
    tier: 1
  },
  "Flow Control": {
    description: "Control blood flow for speed",
    speedBonus: 5,
    tier: 1
  },
  "Crimson Bullets": {
    description: "Fire projectiles of blood",
    projectileDamage: 18,
    attacksPerTurn: 2,
    tier: 2
  },
  "Weapon Shaping": {
    description: "Shape blood into weapons",
    weaponDamage: 10,
    tier: 1
  },
  "Material Bond": {
    description: "Bond blood to materials",
    durability: 10,
    tier: 1
  },
  "Blood Blade": {
    description: "Form a blade of blood",
    weaponDamage: 25,
    criticalChance: 15,
    tier: 2
  },
  "Canine Bond": {
    description: "Bond with shadow dogs",
    summonDamage: 10,
    tier: 1
  },
  "Pack Tactics": {
    description: "Coordinate multiple shikigami",
    summonCount: 2,
    tier: 1
  },
  "Perfect Self-Reflection": {
    description: "Reflect attacks perfectly",
    reflectChance: 30,
    damageBonus: 15,
    tier: 2
  },
  "Wing Bindings": {
    description: "Bind wings for mobility",
    speedBonus: 10,
    tier: 1
  },
  "Elephant Control": {
    description: "Control the elephant shikigami",
    summonHealth: 30,
    tier: 1
  },
  "Lightning Wrapper": {
    description: "Wrap in lightning",
    damageBonus: 25,
    stunChance: 20,
    tier: 2
  },
  "Toxic Cloud": {
    description: "Release toxic shadow cloud",
    poisonDamage: 8,
    tier: 1
  },
  "Swamp Bindings": {
    description: "Bind targets in shadow swamp",
    slowChance: 25,
    tier: 2
  },
  "Demon Dog Weave": {
    description: "Weave shadow dogs into complex forms",
    summonDamage: 20,
    summonCount: 3,
    tier: 2
  },
  "Shadow Step": {
    description: "Step through shadows",
    dodgeChance: 15,
    tier: 1
  },
  "Dark Expansion": {
    description: "Expand shadow domain",
    shadowDamage: 12,
    tier: 1
  },
  "Grand Scale Manipulation": {
    description: "Manipulate shadows on a grand scale",
    aoeDamage: 30,
    summonCount: 4,
    tier: 2
  },
  "Amplification Basics": {
    description: "Amplify cursed energy",
    damageBonus: 10,
    tier: 1
  },
  "Power Conversion": {
    description: "Convert energy to power",
    ceToDamage: 2,
    tier: 1
  },
  "Shredding Burst": {
    description: "Burst of amplified energy",
    damageBonus: 35,
    ceCost: 30,
    tier: 2
  },
  "Collapse Basics": {
    description: "Basic collapse technique",
    pullDamage: 8,
    tier: 1
  },
  "Zone Control": {
    description: "Control collapse zone",
    zoneSize: 2,
    tier: 1
  },
  "Collapse Wave": {
    description: "Wave of collapsing force",
    aoeDamage: 25,
    pullRange: 2,
    tier: 2
  },
  "Cutting Precision": {
    description: "Precision cutting attacks",
    accuracy: 15,
    criticalChance: 10,
    tier: 1
  },
  "Hitbox Theory": {
    description: "Exploit weak points",
    armorPierce: true,
    tier: 1
  },
  "Radiant Slash": {
    description: "Slash with radiant energy",
    damageBonus: 30,
    range: 2,
    tier: 2
  },
  "Frame Analysis": {
    description: "Analyze movement frames",
    dodgeChance: 20,
    tier: 1
  },
  "Time Lock": {
    description: "Lock enemy in time",
    stunChance: 30,
    tier: 1
  },
  "Number Lock": {
    description: "Lock multiple frames",
    stunChance: 50,
    damageBonus: 15,
    tier: 2
  },
  "Swap Speed": {
    description: "Fast swapping",
    speedBonus: 15,
    tier: 1
  },
  "Swap Range": {
    description: "Extended swap range",
    swapRange: 3,
    tier: 1
  },
  "Clap Swap": {
    description: "Swap with a clap",
    swapDamage: 20,
    stunChance: 25,
    tier: 2
  },
  "Double Mark": {
    description: "Mark two positions",
    markCount: 2,
    tier: 1
  },
  "Echo Position": {
    description: "Echo swap position",
    echoDamage: 15,
    tier: 1
  },
  "Rotation Strike": {
    description: "Strike while rotating",
    damageBonus: 25,
    aoeDamage: 10,
    tier: 2
  },
  "Basic Shadow": {
    description: "Basic shadow manipulation",
    shadowDamage: 8,
    tier: 1
  },
  "Shadow Merge": {
    description: "Merge with shadows",
    dodgeChance: 20,
    tier: 1
  },
  "Shadow Bind": {
    description: "Bind with shadows",
    slowChance: 30,
    tier: 2
  },
  "Heavenly Opposition": {
    description: "Opposite force manipulation",
    damageBonus: 15,
    damageReduction: 10,
    tier: 1
  },
  "Falling Blossom": {
    description: "Falling blossom technique",
    criticalChance: 15,
    tier: 1
  },
  "Divine Dogs": {
    description: "Summon divine dogs",
    summonDamage: 15,
    summonCount: 2,
    tier: 2
  },
  "Maximum Output": {
    description: "Output at maximum",
    damageBonus: 40,
    ceCost: 40,
    tier: 2
  },
  "Eight-Handled Sword": {
    description: "Wield the eight-handled sword",
    weaponDamage: 30,
    range: 2,
    tier: 2
  },
  "Cursed Energy Discharge": {
    description: "Discharge cursed energy",
    aoeDamage: 20,
    knockback: true,
    tier: 1
  },
  "Cursed Energy Lapse": {
    description: "Lapse cursed energy",
    damageBonus: 20,
    tier: 1
  },
  "Cursed Technique Reversal": {
    description: "Reverse cursed technique",
    healAmount: 20,
    damageBonus: 15,
    tier: 2
  },
  "Cursed Technique Lapse": {
    description: "Lapse technique application",
    damageBonus: 25,
    armorPierce: true,
    tier: 2
  }
}
