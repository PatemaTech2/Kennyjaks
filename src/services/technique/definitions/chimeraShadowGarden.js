import { globalTechniqueEngine } from "../TechniqueEngine.js"

const chimeraShadowGardenDefinition = {
  id: "chimera_shadow_garden",
  name: "Chimera Shadow Garden",
  description: "Shadow manipulation that creates an inescapable shadow realm.",

  skills: {
    shadowLurk: {
      id: "shadowLurk",
      name: "Shadow Lurk",
      type: "DEFENSIVE",
      ceCost: 30,
      cooldown: 2,
      description: "Merge with shadows to become untargetable.",

      effects: {
        dodge: { chance: 1.0, duration: 1 },
        ceRegen: { value: 20 }
      },

      onHit(attacker, defender, battle, context) {
        return {
          narration: `🌑 SHADOW LURK\nYou merge with shadows.\nYou cannot be targeted this turn.`
        }
      }
    },

    shadowTendrils: {
      id: "shadowTendrils",
      name: "Shadow Tendrils",
      type: "ACTIVE",
      ceCost: 45,
      cooldown: 1,
      description: "Lash out with shadow appendages.",

      effects: {
        damageBonus: 30,
        slow: { chance: 0.5, duration: 2 }
      },

      onHit(attacker, defender, battle, context) {
        return {
          narration: `🌑 SHADOW TENDRILS\nShadow tendrils lash out and bind ${defender.name || "target"}!`
        }
      }
    },

    shadowGardenConvergence: {
      id: "shadowGardenConvergence",
      name: "Shadow Garden: Convergence",
      type: "ULTIMATE",
      ceCost: 100,
      cooldown: 4,
      description: "All shadows converge into a devastating strike.",

      effects: {
        aoeDamage: { value: 50 },
        ceToDamage: { value: 30 }
      },

      conditions: [
        { type: "ceAbove", value: 100 }
      ],

      onHit(attacker, defender, battle, context) {
        return {
          narration: `🌑 SHADOW GARDEN: CONVERGENCE\nAll shadows converge.\nThe garden devours everything.`
        }
      }
    }
  },

  passiveEffects: [
    {
      id: "shadow_regen",
      name: "Shadow Regeneration",
      type: "PASSIVE",
      description: "Regenerate CE while in shadow",

      conditions: [],

      effects: {
        ceRegen: { value: 5 }
      },

      onTrigger(attacker, defender, battle, context) {
        return {}
      }
    }
  ],

  combatRules: [
    {
      id: "shadow_lurk",
      trigger: "skill_used",
      priority: 10,

      canApply(attacker, defender, skill) {
        return skill.id === "shadowLurk"
      },

      apply(attacker, defender, skill, battle) {
        return {
          effect: "untargetable",
          duration: 1,
          ceRegen: 20,
          narration: `🌑 SHADOW LURK\nYou vanish into shadow.\nYou cannot be targeted.`
        }
      }
    },

    {
      id: "shadow_tendrils",
      trigger: "skill_used",
      priority: 10,

      canApply(attacker, defender, skill) {
        return skill.id === "shadowTendrils"
      },

      apply(attacker, defender, skill, battle) {
        return {
          effect: "slow",
          chance: 0.5,
          duration: 2,
          damageBonus: 30,
          narration: `🌑 SHADOW TENDRILS\nShadow tendrils lash out!`
        }
      }
    }
  ],

  domainEffect: {
    name: "Garden of the Black Divine",
    sureHit: true,
    effect: "shadow_battlefield",
    environment: "shadow_garden",
    counterplay: ["Domain Amplification", "Light techniques", "Area attacks"],
    cost: 260,
    rounds: 3,
    rules: {
      shadowVolume: "increased",
      summoningEase: true,
      unexpectedPositions: true,
      shadowMovement: true,
      coordinatedShikigami: true
    }
  },

  bindingVowInteractions: {
    "black-and-white": {
      effect: "shikigami_power_surge",
      description: "Increases shikigami attack power"
    },
    "red-meets-blue": {
      effect: "expanded_shadow_range",
      description: "Increases shadow movement and summoning range"
    },
    "crow-and-shinmio": {
      effect: "faster_summoning",
      description: "Faster shikigami summoning"
    }
  },

  counters: [
    "Domain Amplification",
    "Light techniques",
    "Area attacks",
    "Mahoraga (if adapted)"
  ],

  countersByTechnique: {
    "Limitless": "moderate",
    "Blood Manipulation": "weak",
    "Shrine": "moderate",
    "Projection Sorcery": "weak",
    "Boogie Woogie": "moderate"
  }
}


export default chimeraShadowGardenDefinition
