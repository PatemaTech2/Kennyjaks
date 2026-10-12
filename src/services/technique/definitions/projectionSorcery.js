import { globalTechniqueEngine } from "../TechniqueEngine.js"

const projectionSorceryDefinition = {
  id: "projection_sorcery",
  name: "Projection Sorcery",
  description: "Frame-based movement manipulation that makes the user impossibly fast.",

  skills: {
    frameAnalysis: {
      id: "frameAnalysis",
      name: "Frame Analysis",
      type: "PASSIVE",
      ceCost: 0,
      cooldown: 0,
      description: "Analyze movement frames to anticipate attacks.",

      effects: {
        dodgeChance: { value: 0.2 },
        accuracy: { value: 10 }
      },

      onHit(attacker, defender, battle, context) {
        return {}
      }
    },

    projection2D: {
      id: "projection2D",
      name: "2D Projection",
      type: "ACTIVE",
      ceCost: 40,
      cooldown: 1,
      description: "Create a 2D projection to confuse and attack from blind spots.",

      effects: {
        damageBonus: 20,
        dodgeChance: { value: 0.15 }
      },

      onHit(attacker, defender, battle, context) {
        return {
          narration: `📐 2D PROJECTION\nA projection attacks from a blind spot!`
        }
      }
    },

    projection3D: {
      id: "projection3D",
      name: "3D Projection",
      type: "ACTIVE",
      ceCost: 60,
      cooldown: 2,
      description: "Create multiple 3D projections that attack in sequence.",

      effects: {
        damageBonus: 25,
        attacksPerTurn: 2,
        confusion: { chance: 0.3, duration: 1 }
      },

      onHit(attacker, defender, battle, context) {
        return {
          narration: `📐 3D PROJECTION\nMultiple projections attack from all angles!`
        }
      }
    },

    infinityProjection: {
      id: "infinityProjection",
      name: "Infinity Projection",
      type: "ULTIMATE",
      ceCost: 100,
      cooldown: 4,
      description: "Project infinitely, overwhelming the enemy with afterimages.",

      effects: {
        aoeDamage: { value: 45 },
        confusion: { chance: 0.6, duration: 2 }
      },

      conditions: [
        { type: "ceAbove", value: 100 }
      ],

      onHit(attacker, defender, battle, context) {
        return {
          narration: `📐 INFINITY PROJECTION\nInfinite afterimages overwhelm the target!`
        }
      }
    }
  },

  passiveEffects: [
    {
      id: "frame_mastery",
      name: "Frame Mastery",
      type: "PASSIVE",
      description: "Enhanced movement and reaction speed",

      conditions: [],

      effects: {
        speedBonus: { value: 15 },
        dodgeChance: { value: 0.15 }
      },

      onTrigger(attacker, defender, battle, context) {
        return {}
      }
    }
  ],

  combatRules: [
    {
      id: "projection_dodge",
      trigger: "incoming_attack",
      priority: 50,

      canApply(attacker, defender, attack) {
        const technique = defender.technique
        if (!technique || technique.id !== "projection_sorcery") return false
        if (attack.isDomainSureHit) return false

        const frameAnalysis = defender.techniqueMastery && defender.techniqueMastery["Frame Analysis"] && defender.techniqueMastery["Frame Analysis"].unlocked
        if (!frameAnalysis) return false

        const speedDiff = (defender.speed || 0) - (attacker.speed || 0)
        const dodgeChance = 0.15 + Math.max(0, speedDiff) * 0.01

        return Math.random() < dodgeChance
      },

      apply(attacker, defender, attack, battle) {
        attack.damage = 0
        attack.missed = true

        return {
          dodged: true,
          narration: `📐 FRAME ANALYSIS\nYou read the attack's frames and evade perfectly.`
        }
      }
    }
  ],

  domainEffect: {
    name: "Time Cell Moon Palace",
    sureHit: true,
    effect: "frame_governed_movement",
    environment: "frame_locked",
    counterplay: ["Domain Amplification", "Frame disruption", "Speed bursts"],
    cost: 270,
    rounds: 3,
    rules: {
      enemyMovementPredictable: true,
      failedMovementFrameLock: true,
      superiorInitiative: true,
      movementFrameRate: 24,
      enemyFrameDelay: 2
    }
  },

  bindingVowInteractions: {
    "black-and-white": {
      effect: "frame_perfection",
      description: "Perfect frame execution"
    },
    "red-meets-blue": {
      effect: "expanded_projection_range",
      description: "Expands projection range"
    },
    "crow-and-shinmio": {
      effect: "faster_frame_rate",
      description: "Increases frame execution speed"
    }
  },

  counters: [
    "Domain Amplification",
    "Frame disruption",
    "Speed bursts",
    "Area attacks"
  ],

  countersByTechnique: {
    "Limitless": "moderate",
    "Blood Manipulation": "weak",
    "Ten Shadows Technique": "moderate",
    "Shrine": "moderate",
    "Boogie Woogie": "weak"
  }
}


export default projectionSorceryDefinition
