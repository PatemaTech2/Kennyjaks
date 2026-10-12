import { globalTechniqueEngine } from "../TechniqueEngine.js"

const bloodManipulationDefinition = {
  id: "blood_manipulation",
  name: "Blood Manipulation",
  description: "Control blood as a medium for both offense and defense.",

  skills: {
    flowingRedScale: {
      id: "flowingRedScale",
      name: "Flowing Red Scale",
      type: "BUFF",
      ceCost: 30,
      cooldown: 3,
      description: "Harden blood to boost physical capabilities.",

      effects: {
        buff: { stat: "strength", value: 10, duration: 3 },
        buff: { stat: "speed", value: 5, duration: 3 },
        damageReduction: { value: 0.15, duration: 3 }
      },

      onHit(attacker, defender, battle, context) {
        return {
          narration: `🩸 FLOWING RED SCALE\nBlood hardens into crimson armor.\nPhysical capabilities surge!`
        }
      }
    },

    supernova: {
      id: "supernova",
      name: "Supernova",
      type: "ACTIVE",
      ceCost: 60,
      cooldown: 2,
      description: "Explosive blood blast that damages in a wide radius.",

      effects: {
        aoeDamage: { value: 35 },
        push: { strength: 1 }
      },

      onHit(attacker, defender, battle, context) {
        return {
          narration: `💥 SUPERNOVA\nBlood explodes outward in a devastating blast!`
        }
      }
    },

    piercingBlood: {
      id: "piercingBlood",
      name: "Piercing Blood",
      type: "ACTIVE",
      ceCost: 45,
      cooldown: 1,
      description: "High-velocity blood projectile with armor penetration.",

      effects: {
        damageBonus: 45,
        armorPierce: true
      },

      conditions: [
        { type: "momentum", value: 5 }
      ],

      onHit(attacker, defender, battle, context) {
        return {
          narration: `🩸 PIERCING BLOOD\nBlood accelerates to extreme velocity.\nIt pierces through defenses!`
        }
      }
    },

    crimsonBinding: {
      id: "crimsonBinding",
      name: "Crimson Binding",
      type: "DEBUFF",
      ceCost: 50,
      cooldown: 3,
      description: "Bind enemies in solidified blood tendrils.",

      effects: {
        slow: { chance: 0.8, amount: 0.3, duration: 3 },
        damageOverTime: { value: 10, duration: 3 }
      },

      onHit(attacker, defender, battle, context) {
        return {
          narration: `🔴 CRIMSON BINDING\nBlood tendrils wrap around ${defender.name || "target"}.\nMovement is restricted!`
        }
      }
    },

    bloodMeteor: {
      id: "bloodMeteor",
      name: "Blood Meteor",
      type: "ULTIMATE",
      ceCost: 100,
      cooldown: 5,
      description: "Condense all blood into a devastating projectile.",

      effects: {
        aoeDamage: { value: 80 },
        armorPierce: true
      },

      conditions: [
        { type: "ceAbove", value: 100 }
      ],

      onHit(attacker, defender, battle, context) {
        return {
          narration: `🩸 BLOOD METEOR\nAll blood condenses into a massive projectile.\nIt crashes down with devastating force!`
        }
      }
    }
  },

  passiveEffects: [
    {
      id: "blood_mastery",
      name: "Blood Manipulation Mastery",
      type: "PASSIVE",
      description: "Enhanced blood control",

      conditions: [],

      effects: {
        ceEfficiency: { value: 0.2 }
      },

      onTrigger(attacker, defender, battle, context) {
        return {}
      }
    }
  ],

  combatRules: [
    {
      id: "flowing_red_scale_buff",
      trigger: "skill_used",
      priority: 10,

      canApply(attacker, defender, skill) {
        return skill.id === "flowingRedScale"
      },

      apply(attacker, defender, skill, battle) {
        return {
          effect: "buff",
          stat: "strength",
          value: 10,
          duration: 3,
          narration: `🩸 FLOWING RED SCALE\nBlood hardens into armor.\nStrength and speed increase!`
        }
      }
    },

    {
      id: "supernova_aoe",
      trigger: "skill_used",
      priority: 10,

      canApply(attacker, defender, skill) {
        return skill.id === "supernova"
      },

      apply(attacker, defender, skill, battle) {
        return {
          effect: "aoe",
          damage: 35,
          push: 1,
          narration: `💥 SUPERNOVA\nBlood explodes in all directions!`
        }
      }
    },

    {
      id: "piercing_blood_penetrate",
      trigger: "skill_used",
      priority: 10,

      canApply(attacker, defender, skill) {
        return skill.id === "piercingBlood"
      },

      apply(attacker, defender, skill, battle) {
        return {
          effect: "pierce",
          damage: 45,
          armorPierce: true,
          narration: `🩸 PIERCING BLOOD\nBlood pierces through defenses!`
        }
      }
    }
  ],

  domainEffect: {
    name: "Crimson Blood Palace",
    sureHit: true,
    effect: "blood_control",
    environment: "blood_domain",
    counterplay: ["Blood resistance", "RCT", "Blood sealing"],
    cost: 280,
    rounds: 3,
    rules: {
      bloodTracking: true,
      bloodTraps: true,
      piercingBloodAngles: true,
      movementRestriction: 0.7,
      enhancedFlowingRedScale: true
    }
  },

  bindingVowInteractions: {
    "black-and-white": {
      effect: "damage_surge",
      description: "Massive blood damage increase"
    },
    "red-meets-blue": {
      effect: "aoe_expansion",
      description: "Expands Supernova and Blood Meteor radius"
    },
    "crow-and-shinmio": {
      effect: "faster_activation",
      description: "Faster blood technique execution"
    }
  },

  counters: [
    "Blood resistance",
    "Reverse Cursed Technique",
    "Blood sealing techniques",
    "Rapid movement"
  ],

  countersByTechnique: {
    "Limitless": "moderate",
    "Shrine": "moderate",
    "Ten Shadows Technique": "weak",
    "Projection Sorcery": "weak",
    "Boogie Woogie": "moderate"
  }
}


export default bloodManipulationDefinition
