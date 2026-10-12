import { globalTechniqueEngine } from "../TechniqueEngine.js"

const disasterCurseDefinition = {
  id: "disaster_curse",
  name: "Disaster Curse",
  description: "Elemental manipulation of natural disasters.",

  skills: {
    stormVortex: {
      id: "stormVortex",
      name: "Storm Vortex",
      type: "ACTIVE",
      ceCost: 40,
      cooldown: 1,
      description: "Summon a vortex of wind and debris.",

      effects: {
        aoeDamage: { value: 20 },
        pull: { strength: 1 }
      },

      onHit(attacker, defender, battle, context) {
        return {
          narration: `🌪️ STORM VORTEX\nWind and debris swirl into a devastating vortex!`
        }
      }
    },

    pressureCascade: {
      id: "pressureCascade",
      name: "Pressure Cascade",
      type: "DEBUFF",
      ceCost: 55,
      cooldown: 2,
      description: "Crushing pressure damages and slows over time.",

      effects: {
        damageOverTime: { value: 15, duration: 3 },
        slow: { chance: 0.6, amount: 0.2, duration: 3 }
      },

      onHit(attacker, defender, battle, context) {
        return {
          narration: `💨 PRESSURE CASCADE\nCrushing pressure bears down on ${defender.name || "target"}!`
        }
      }
    },

    cataclysm: {
      id: "cataclysm",
      name: "Cataclysm",
      type: "ULTIMATE",
      ceCost: 120,
      cooldown: 4,
      description: "Unleash a massive storm that devastates the battlefield.",

      effects: {
        aoeDamage: { value: 70 },
        armorPierce: true
      },

      conditions: [
        { type: "ceAbove", value: 120 }
      ],

      onHit(attacker, defender, battle, context) {
        return {
          narration: `🌪️ CATACLYSM\nThe sky splits open.\nPure devastation rains down!`
        }
      }
    }
  },

  passiveEffects: [
    {
      id: "disaster_resilience",
      name: "Disaster Resilience",
      type: "PASSIVE",
      description: "Grow stronger with damage taken",

      conditions: [
        { type: "hpBelow", value: 0.5 }
      ],

      effects: {
        damageBonus: { value: 20 },
        damageReduction: { value: 0.1 }
      },

      onTrigger(attacker, defender, battle, context) {
        return {
          narration: `🌪️ DISASTER RESILIENCE\nDamage fuels your power!\nYou grow stronger!`
        }
      }
    }
  ],

  combatRules: [
    {
      id: "pressure_dot",
      trigger: "skill_used",
      priority: 10,

      canApply(attacker, defender, skill) {
        return skill.id === "pressureCascade"
      },

      apply(attacker, defender, skill, battle) {
        return {
          effect: "damageOverTime",
          value: 15,
          duration: 3,
          slow: { chance: 0.6, duration: 3 },
          narration: `💨 PRESSURE CASCADE\nPressure bears down!`
        }
      }
    }
  ],

  domainEffect: {
    name: "Calamity Temple",
    sureHit: true,
    effect: "natural_disaster",
    environment: "cataclysm",
    counterplay: ["Domain Amplification", "High defense", "RCT"],
    cost: 300,
    rounds: 3,
    rules: {
      aoe: true,
      disasterIntensity: "increased",
      windPull: true,
      pressureDamage: true,
      environmentalDamage: true
    }
  },

  bindingVowInteractions: {
    "black-and-white": {
      effect: "disaster_surge",
      description: "Increases disaster damage"
    },
    "red-meets-blue": {
      effect: "expanded_aoe",
      description: "Expands disaster radius"
    },
    "crow-and-shinmio": {
      effect: "faster_disaster",
      description: "Faster disaster activation"
    }
  },

  counters: [
    "Domain Amplification",
    "High defense",
    "RCT",
    "Area control"
  ],

  countersByTechnique: {
    "Limitless": "moderate",
    "Blood Manipulation": "weak",
    "Ten Shadows Technique": "weak",
    "Projection Sorcery": "moderate",
    "Boogie Woogie": "weak"
  }
}


export default disasterCurseDefinition
