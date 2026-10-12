import { globalTechniqueEngine } from "../TechniqueEngine.js"

const awakeningDefinition = {
  id: "awakening",
  name: "Awakening",
  description: "Raw cursed energy manipulation and self-enhancement.",

  skills: {
    burstGrowth: {
      id: "burstGrowth",
      name: "Burst Growth",
      type: "BUFF",
      ceCost: 40,
      cooldown: 3,
      description: "Surge with cursed energy to boost all stats.",

      effects: {
        buff: { stat: "strength", value: 15, duration: 2 },
        buff: { stat: "speed", value: 10, duration: 2 },
        damageBonus: { value: 25, duration: 2 }
      },

      onHit(attacker, defender, battle, context) {
        return {
          narration: `⚡ BURST GROWTH\nCursed energy surges through your body!\nAll stats boosted!`
        }
      }
    },

    energyBody: {
      id: "energyBody",
      name: "Energy Body",
      type: "DEFENSIVE",
      ceCost: 60,
      cooldown: 3,
      description: "Transform partially into pure cursed energy.",

      effects: {
        dodge: { chance: 0.35, duration: 1 },
        damageReduction: { value: 0.3, duration: 2 }
      },

      onHit(attacker, defender, battle, context) {
        return {
          narration: `✨ ENERGY BODY\nYou become pure cursed energy.\nAttacks phase through you!`
        }
      }
    },

    limitBreak: {
      id: "limitBreak",
      name: "Limit Break",
      type: "ULTIMATE",
      ceCost: 100,
      cooldown: 5,
      description: "Break through your limits into awakened mastery.",

      effects: {
        damageBonus: 60,
        criticalChance: { value: 0.4 },
        damageReduction: { value: 0.2, duration: 2 }
      },

      conditions: [
        { type: "ceAbove", value: 100 }
      ],

      onHit(attacker, defender, battle, context) {
        return {
          narration: `⚡ LIMIT BREAK\nYou shatter your limits.\nRaw power erupts!`
        }
      }
    }
  },

  passiveEffects: [
    {
      id: "awakening_mastery",
      name: "Awakening Mastery",
      type: "PASSIVE",
      description: "Enhanced cursed energy output",

      conditions: [],

      effects: {
        ceEfficiency: { value: 0.3 },
        damageBonus: { value: 10 }
      },

      onTrigger(attacker, defender, battle, context) {
        return {}
      }
    }
  ],

  combatRules: [
    {
      id: "burst_growth",
      trigger: "skill_used",
      priority: 10,

      canApply(attacker, defender, skill) {
        return skill.id === "burstGrowth"
      },

      apply(attacker, defender, skill, battle) {
        return {
          effect: "burst",
          strength: 15,
          speed: 10,
          damageBonus: 25,
          duration: 2,
          narration: `⚡ BURST GROWTH\nPower surges through your body!`
        }
      }
    },

    {
      id: "limit_break",
      trigger: "skill_used",
      priority: 10,

      canApply(attacker, defender, skill) {
        return skill.id === "limitBreak"
      },

      apply(attacker, defender, skill, battle) {
        return {
          effect: "limitBreak",
          damageBonus: 60,
          criticalChance: 0.4,
          damageReduction: 0.2,
          duration: 2,
          narration: `⚡ LIMIT BREAK\nYou shatter your limits!`
        }
      }
    }
  ],

  domainEffect: {
    name: "Origin of Creation",
    sureHit: true,
    effect: "conceptual_blow",
    environment: "origin",
    counterplay: ["Domain Amplification", "Conceptual resistance"],
    cost: 340,
    rounds: 3,
    rules: {
      maximumOutput: true,
      executionQuality: 1.0,
      stability: 1.0,
      conceptualDamage: true
    }
  },

  bindingVowInteractions: {
    "black-and-white": {
      effect: "awakening_surge",
      description: "Increases awakening power"
    },
    "red-meets-blue": {
      effect: "expanded_origin",
      description: "Expands origin range"
    },
    "crow-and-shinmio": {
      effect: "faster_awakening",
      description: "Faster awakening activation"
    }
  },

  counters: [
    "Domain Amplification",
    "Conceptual resistance",
    "High defense"
  ],

  countersByTechnique: {
    "Limitless": "moderate",
    "Blood Manipulation": "weak",
    "Ten Shadows Technique": "weak",
    "Projection Sorcery": "moderate",
    "Boogie Woogie": "weak"
  }
}


export default awakeningDefinition
