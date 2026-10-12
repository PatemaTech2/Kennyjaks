import { globalTechniqueEngine } from "../TechniqueEngine.js"

const boogieWoogieDefinition = {
  id: "boogie_woogie",
  name: "Boogie Woogie",
  description: "Position-swapping technique that manipulates spatial positions.",

  skills: {
    clapSwap: {
      id: "clapSwap",
      name: "Clap Swap",
      type: "MOVEMENT",
      ceCost: 30,
      cooldown: 1,
      description: "Swap positions with a marked target.",

      effects: {
        swap: {},
        stun: { chance: 0.25, duration: 1 }
      },

      conditions: [
        { type: "hasMark", count: 1 }
      ],

      onHit(attacker, defender, battle, context) {
        return {
          narration: `👏 CLAP SWAP\n*Clap*\nPositions swap instantly!\n${defender.name || "Target"} is disoriented.`
        }
      }
    },

    doubleClap: {
      id: "doubleClap",
      name: "Double Clap",
      type: "MOVEMENT",
      ceCost: 50,
      cooldown: 2,
      description: "Swap with two targets simultaneously.",

      effects: {
        swap: {},
        confusion: { chance: 0.4, duration: 1 },
        damageBonus: 20
      },

      conditions: [
        { type: "hasMark", count: 2 }
      ],

      onHit(attacker, defender, battle, context) {
        return {
          narration: `👏👏 DOUBLE CLAP\n*Clap clap*\nTwo positions swap at once!`
        }
      }
    },

    tripleClapFeint: {
      id: "tripleClapFeint",
      name: "Triple Clap Feint",
      type: "COUNTER",
      ceCost: 70,
      cooldown: 3,
      description: "Three consecutive swaps ending with a devastating counterattack.",

      effects: {
        swap: {},
        damageBonus: 40,
        criticalChance: { value: 0.3 }
      },

      conditions: [
        { type: "hasMark", count: 2 },
        { type: "momentum", value: 5 }
      ],

      onHit(attacker, defender, battle, context) {
        return {
          narration: `👏👏👏 TRIPLE CLAP FEINT\nA feint... then a devastating counterattack!`
        }
      }
    }
  },

  passiveEffects: [
    {
      id: "swap_mastery",
      name: "Swap Mastery",
      type: "PASSIVE",
      description: "Enhanced swapping ability",

      conditions: [],

      effects: {
        speedBonus: { value: 10 }
      },

      onTrigger(attacker, defender, battle, context) {
        return {}
      }
    }
  ],

  combatRules: [
    {
      id: "clap_swap",
      trigger: "skill_used",
      priority: 10,

      canApply(attacker, defender, skill) {
        return skill.id === "clapSwap"
      },

      apply(attacker, defender, skill, battle) {
        return {
          effect: "swap",
          stun: { chance: 0.25, duration: 1 },
          narration: `👏 CLAP SWAP\n*Clap*\nPositions swap!`
        }
      }
    },

    {
      id: "counter_swap",
      trigger: "incoming_attack",
      priority: 80,

      canApply(attacker, defender, attack) {
        const technique = defender.technique
        if (!technique || technique.id !== "boogie_woogie") return false

        const tripleClap = defender.techniqueMastery && defender.techniqueMastery["Triple Clap Feint"] && defender.techniqueMastery["Triple Clap Feint"].unlocked
        if (!tripleClap) return false

        return defender.marks >= 2 && defender.momentum >= 5
      },

      apply(attacker, defender, attack, battle) {
        const counterDamage = attack.damage * 1.5
        attack.damage = 0
        attack.reflected = true
        attack.reflectedDamage = counterDamage

        return {
          countered: true,
          damage: counterDamage,
          narration: `👏👏👏 TRIPLE CLAP FEINT\nAttack reflected with devastating counterforce!`
        }
      }
    }
  ],

  domainEffect: {
    name: "Endless Exchange Hall",
    sureHit: true,
    effect: "unstable_positions",
    environment: "swap_hall",
    counterplay: ["Domain Amplification", "Anchor destruction", "Position lock"],
    cost: 250,
    rounds: 3,
    rules: {
      unstablePositions: true,
      unlimitedClaps: true,
      allyRepositioning: true,
      fakeClaps: true,
      swapAnchors: true
    }
  },

  bindingVowInteractions: {
    "black-and-white": {
      effect: "swap_power",
      description: "Increases swap damage"
    },
    "red-meets-blue": {
      effect: "expanded_swap_range",
      description: "Expands swap range and affected targets"
    },
    "crow-and-shinmio": {
      effect: "faster_claps",
      description: "Faster clap execution"
    }
  },

  counters: [
    "Domain Amplification",
    "Anchor destruction",
    "Position lock",
    "Isolation"
  ],

  countersByTechnique: {
    "Limitless": "moderate",
    "Blood Manipulation": "weak",
    "Ten Shadows Technique": "moderate",
    "Projection Sorcery": "weak",
    "Shrine": "moderate"
  }
}

export default boogieWoogieDefinition
