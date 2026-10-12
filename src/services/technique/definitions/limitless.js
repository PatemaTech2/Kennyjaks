import { globalTechniqueEngine } from "../TechniqueEngine.js"

const limitlessDefinition = {
  id: "limitless",
  name: "Limitless",
  description: "Space manipulation technique that controls the distance between objects and attacks.",

  skills: {
    blue: {
      id: "blue",
      name: "Blue",
      type: "ACTIVE",
      ceCost: 40,
      cooldown: 0,
      description: "Attraction force that pulls the target closer.",

      effects: {
        pull: { strength: 1, range: 1 }
      },

      onHit(attacker, defender, battle, context) {
        return {
          narration: `🔵 BLUE\nNegative space collapses.\n${defender.name || "Target"} is pulled irresistibly toward ${attacker.name || "you"}!`
        }
      }
    },

    red: {
      id: "red",
      name: "Red",
      type: "ACTIVE",
      ceCost: 50,
      cooldown: 0,
      description: "Repulsive force that pushes the target away with explosive power.",

      effects: {
        push: { strength: 2 },
        damageBonus: 15
      },

      onHit(attacker, defender, battle, context) {
        return {
          narration: `🔴 RED\nPositive space explodes outward.\n${defender.name || "Target"} is blasted away!`
        }
      }
    },

    purple: {
      id: "purple",
      name: "Purple",
      type: "ULTIMATE",
      ceCost: 120,
      cooldown: 3,
      description: "Hollow Purple — the fusion of Blue and Red. A devastating spatial collapse.",

      effects: {
        damage: 60,
        armorPierce: true,
        aoe: false
      },

      conditions: [
        { type: "ceAbove", value: 120 }
      ],

      onHit(attacker, defender, battle, context) {
        return {
          narration: `🟣 PURPLE\nBlue and Red collide.\nReality itself disintegrates along a single line.\nNothing survives contact with Hollow Purple.`
        }
      }
    },

    infinity: {
      id: "infinity",
      name: "Infinity",
      type: "PASSIVE",
      ceCost: 0,
      cooldown: 0,
      description: "Passive defense that divides space between attacks and the user.",

      effects: {
        damageReduction: { value: 0.9 },
        dodgeChance: { value: 0.3 }
      },

      onHit(attacker, defender, battle, context) {
        return {}
      }
    },

    sixEyes: {
      id: "sixEyes",
      name: "Six Eyes",
      type: "PASSIVE",
      ceCost: 0,
      cooldown: 0,
      description: "Drastically improves CE efficiency, perception, and technique precision.",

      effects: {
        ceEfficiency: { value: 0.5 },
        accuracy: { value: 20 },
        techniqueControl: { value: 15 }
      },

      onHit(attacker, defender, battle, context) {
        return {}
      }
    }
  },

  passiveEffects: [
    {
      id: "infinity_passive",
      name: "Infinity",
      type: "PASSIVE",
      description: "Divides space to stop ordinary attacks",

      conditions: [],

      effects: {
        damageReduction: { value: 0.9 },
        dodgeChance: { value: 0.3 }
      },

      onTrigger(attacker, defender, battle, context) {
        return {
          narration: `∞ INFINITY\nSpace divides.\nThe attack approaches...\n...but never reaches you.`
        }
      }
    },

    {
      id: "six_eyes_passive",
      name: "Six Eyes",
      type: "PASSIVE",
      description: "Enhanced perception and CE efficiency",

      conditions: [],

      effects: {
        ceEfficiency: { value: 0.5 },
        accuracy: { value: 20 }
      },

      onTrigger(attacker, defender, battle, context) {
        return {}
      }
    }
  ],

  combatRules: [
    {
      id: "infinity_stop_attack",
      trigger: "incoming_attack",
      priority: 100,

      canApply(attacker, defender, attack) {
        const technique = defender.technique
        if (!technique || technique.id !== "limitless") return false

        const hasInfinity = defender.techniqueMastery && defender.techniqueMastery["Infinity"] && defender.techniqueMastery["Infinity"].unlocked
        if (!hasInfinity) return false

        if (attack.isDomainSureHit) return false
        if (attack.isDomainAmplification) return false
        if (attack.specialCondition === "domain_amplification") return false

        return true
      },

      apply(attacker, defender, attack, battle) {
        const reduced = attack.damage * (1 - 0.9)
        attack.damage = Math.max(0, reduced)

        return {
          blocked: true,
          narration: `∞ INFINITY\nSpace divides between ${attacker.name || "the attack"} and ${defender.name || "you"}.\nThe attack cannot reach its target.`
        }
      }
    },

    {
      id: "blue_pull",
      trigger: "skill_used",
      priority: 10,

      canApply(attacker, defender, skill) {
        return skill.id === "blue"
      },

      apply(attacker, defender, skill, battle) {
        return {
          effect: "pull",
          strength: 1,
          narration: `🔵 BLUE\nAttraction force pulls ${defender.name || "target"} closer.`
        }
      }
    },

    {
      id: "red_push",
      trigger: "skill_used",
      priority: 10,

      canApply(attacker, defender, skill) {
        return skill.id === "red"
      },

      apply(attacker, defender, skill, battle) {
        return {
          effect: "push",
          strength: 2,
          damageBonus: 15,
          narration: `🔴 RED\nRepulsive force blasts ${defender.name || "target"} away!`
        }
      }
    },

    {
      id: "purple_devastation",
      trigger: "skill_used",
      priority: 10,

      canApply(attacker, defender, skill) {
        return skill.id === "purple"
      },

      apply(attacker, defender, skill, battle) {
        return {
          effect: "devastating",
          damage: 60,
          armorPierce: true,
          narration: `🟣 PURPLE\nHollow Purple disintegrates everything in its path.`
        }
      }
    }
  ],

  infinityRules: {
    ordinaryAttacks: false,
    blackFlash: { bypass: true },
    domainSureHit: { bypass: true },
    domainAmplification: { bypass: true },
    specialConditions: {
      "void_penetration": { bypass: true }
    }
  },

  infinityNarration: "∞ INFINITY\nSpace divides.\nThe attack approaches...\n...but never reaches you.",

  domainEffect: {
    name: "Unlimited Void",
    sureHit: true,
    effect: "cognitive_overload",
    environment: "infinite_information",
    counterplay: ["Domain Amplification", "Domain Expansion", "World Cutting Slash"],
    cost: 300,
    rounds: 3,
    rules: {
      enemyDecisionSpeed: 0.1,
      techniqueActivationDelay: 2,
      movementImpairment: 0.5,
      physicalStrengthReduction: 0.01
    }
  },

  bindingVowInteractions: {
    "black-and-white": {
      effect: "ce_output_surge",
      description: "Massive CE output increase at HP cost"
    },
    "red-meets-blue": {
      effect: "technique_radius_expansion",
      description: "Expands Blue/Red range"
    },
    "crow-and-shinmio": {
      effect: "faster_activation",
      description: "Reduces technique charge time"
    },
    "the-goat": {
      effect: "maximum_output",
      description: "Pushes technique to absolute maximum"
    }
  },

  counters: [
    "Domain Amplification",
    "Domain Expansion",
    "World Cutting Slash",
    "Space bypass techniques",
    "Black Flash under specific conditions"
  ],

  countersByTechnique: {
    "Shrine": "weak",
    "Blood Manipulation": "moderate",
    "Ten Shadows Technique": "moderate",
    "Projection Sorcery": "weak",
    "Boogie Woogie": "weak"
  }
}

export default limitlessDefinition
