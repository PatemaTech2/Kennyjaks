import { globalTechniqueEngine } from "../TechniqueEngine.js"

const ratioDefinition = {
  id: "ratio",
  name: "Ratio",
  description: "Spatial ratio manipulation that identifies and exploits weak points.",

  skills: {
    ratio73: {
      id: "ratio73",
      name: "7:3 Ratio",
      type: "ACTIVE",
      ceCost: 35,
      cooldown: 0,
      description: "Identify the 7:3 weak point ratio in the target.",

      effects: {
        debuff: { stat: "defense", value: -15, duration: 2 },
        mark: { count: 1, duration: 3 }
      },

      onHit(attacker, defender, battle, context) {
        return {
          narration: `⚖️ 7:3\nWeak point identified.\n${defender.name || "Target"}'s defense is compromised.`
        }
      }
    },

    ratio66: {
      id: "ratio66",
      name: "6:6:6:6:6",
      type: "ACTIVE",
      ceCost: 55,
      cooldown: 2,
      description: "Amplify the ratio — all parts attack simultaneously.",

      effects: {
        damageBonus: 30,
        attacksPerTurn: 2
      },

      conditions: [
        { type: "momentum", value: 3 }
      ],

      onHit(attacker, defender, battle, context) {
        return {
          narration: `⚖️ 6:6:6:6:6\nAll five converge simultaneously.\nDouble impact!`
        }
      }
    },

    ratio99: {
      id: "ratio99",
      name: "9:9:9:9:9",
      type: "ULTIMATE",
      ceCost: 100,
      cooldown: 4,
      description: "Perfect ratio — devastating finishing blow.",

      effects: {
        damage: 55,
        armorPierce: true,
        stun: { chance: 0.5, duration: 1 }
      },

      conditions: [
        { type: "ceAbove", value: 100 },
        { type: "momentum", value: 8 }
      ],

      onHit(attacker, defender, battle, context) {
        return {
          narration: `⚖️ 9:9:9:9:9\nPerfect ratio achieved.\nAll points converge. Nothing remains.`
        }
      }
    }
  },

  passiveEffects: [
    {
      id: "ratio_perception",
      name: "Ratio Perception",
      type: "PASSIVE",
      description: "Automatically identify opponent weak points",

      conditions: [],

      effects: {
        accuracy: { value: 10 }
      },

      onTrigger(attacker, defender, battle, context) {
        return {}
      }
    }
  ],

  combatRules: [
    {
      id: "ratio_weak_point",
      trigger: "skill_used",
      priority: 10,

      canApply(attacker, defender, skill) {
        return ["ratio73", "ratio66", "ratio99"].includes(skill.id)
      },

      apply(attacker, defender, skill, battle) {
        const multiplier = skill.id === "ratio73" ? 1.2 : skill.id === "ratio66" ? 1.5 : 2.0
        return {
          effect: "weakPoint",
          multiplier,
          narration: `⚖️ ${skill.name}\nWeak point exploited!`
        }
      }
    }
  ],

  domainEffect: {
    name: "Idle Death Gamble",
    sureHit: true,
    effect: "weak_point_focus",
    environment: "ratio_field",
    counterplay: ["Domain Amplification", "High defense", "Multiple targets"],
    cost: 260,
    rounds: 3,
    rules: {
      weakPointExposure: true,
      precisionBonus: 0.4,
      critChance: 0.4,
      bodyTargeting: true,
      limbTargeting: true,
      terrainTargeting: true
    }
  },

  bindingVowInteractions: {
    "black-and-white": {
      effect: "precision_surge",
      description: "Increases weak point exploitation"
    },
    "red-meets-blue": {
      effect: "expanded_ratio_range",
      description: "Expands ratio targeting area"
    },
    "crow-and-shinmio": {
      effect: "faster_ratio_detection",
      description: "Faster weak point identification"
    }
  },

  counters: [
    "Domain Amplification",
    "High defense",
    "Multiple targets",
    "Unpredictable movement"
  ],

  countersByTechnique: {
    "Limitless": "moderate",
    "Blood Manipulation": "weak",
    "Ten Shadows Technique": "weak",
    "Projection Sorcery": "moderate",
    "Boogie Woogie": "weak"
  }
}


export default ratioDefinition
