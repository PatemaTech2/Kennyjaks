import { globalTechniqueEngine } from "../TechniqueEngine.js"

const tenShadowsDefinition = {
  id: "ten_shadows",
  name: "Ten Shadows Technique",
  description: "Summon and command shikigami from the shadows.",

  skills: {
    shadowStep: {
      id: "shadowStep",
      name: "Shadow Step",
      type: "MOVEMENT",
      ceCost: 20,
      cooldown: 1,
      description: "Move through shadows to reposition.",

      effects: {
        dodge: { chance: 0.25 },
        reposition: { range: 1 }
      },

      onHit(attacker, defender, battle, context) {
        return {
          narration: `👥 SHADOW STEP\nYou melt into shadows and reappear elsewhere.`
        }
      }
    },

    divineDogs: {
      id: "divineDogs",
      name: "Divine Dogs",
      type: "SUMMON",
      ceCost: 35,
      cooldown: 3,
      description: "Summon shadow dogs to attack.",

      effects: {
        summon: { entity: "divine_dogs", duration: 3 }
      },

      onHit(attacker, defender, battle, context) {
        return {
          narration: `🐕 DIVINE DOGS\nShadow dogs emerge from the darkness!`
        }
      }
    },

    nue: {
      id: "nue",
      name: "Nue",
      type: "SUMMON",
      ceCost: 50,
      cooldown: 4,
      description: "Summon Nue for aerial strikes.",

      effects: {
        summon: { entity: "nue", duration: 3 },
        stun: { chance: 0.3, duration: 1 }
      },

      onHit(attacker, defender, battle, context) {
        return {
          narration: `🦅 NUE\nThe great Nue descends from above!`
        }
      }
    },

    rabbitEscape: {
      id: "rabbitEscape",
      name: "Rabbit Escape",
      type: "MOVEMENT",
      ceCost: 30,
      cooldown: 2,
      description: "Swap positions to confuse enemies.",

      effects: {
        swap: {},
        confusion: { chance: 0.4, duration: 1 }
      },

      onHit(attacker, defender, battle, context) {
        return {
          narration: `🐰 RABBIT ESCAPE\nPositions swap in an instant!\n${defender.name || "Target"} is disoriented.`
        }
      }
    },

    domainExpansion: {
      id: "domainExpansion",
      name: "Ten Shadows: Domain Expansion",
      type: "DOMAIN",
      ceCost: 150,
      cooldown: 5,
      description: "Chimera Shadow Garden — an inescapable shadow realm.",

      effects: {
        domain: {
          name: "Chimera Shadow Garden",
          sureHit: true,
          duration: 3,
          damage: 40
        }
      },

      conditions: [
        { type: "ceAbove", value: 150 }
      ],

      onHit(attacker, defender, battle, context) {
        return {
          narration: `🌑 CHIMERA SHADOW GARDEN\nDomain Expansion.\nAll is consumed by shadow.`
        }
      }
    }
  },

  passiveEffects: [
    {
      id: "shadow_affinity",
      name: "Shadow Affinity",
      type: "PASSIVE",
      description: "Enhanced shadow manipulation",

      conditions: [],

      effects: {
        dodgeChance: { value: 0.1 }
      },

      onTrigger(attacker, defender, battle, context) {
        return {}
      }
    }
  ],

  combatRules: [
    {
      id: "shadow_step_dodge",
      trigger: "skill_used",
      priority: 10,

      canApply(attacker, defender, skill) {
        return skill.id === "shadowStep"
      },

      apply(attacker, defender, skill, battle) {
        return {
          effect: "dodge",
          chance: 0.25,
          narration: `👥 SHADOW STEP\nYou vanish into shadow.`
        }
      }
    },

    {
      id: "divine_dogs_summon",
      trigger: "skill_used",
      priority: 10,

      canApply(attacker, defender, skill) {
        return skill.id === "divineDogs"
      },

      apply(attacker, defender, skill, battle) {
        return {
          effect: "summon",
          entity: "divine_dogs",
          duration: 3,
          narration: `🐕 DIVINE DOGS\nShadow dogs emerge!`
        }
      }
    },

    {
      id: "rabbit_escape_swap",
      trigger: "skill_used",
      priority: 10,

      canApply(attacker, defender, skill) {
        return skill.id === "rabbitEscape"
      },

      apply(attacker, defender, skill, battle) {
        return {
          effect: "swap",
          confusion: { chance: 0.4, duration: 1 },
          narration: `🐰 RABBIT ESCAPE\nPositions swap!`
        }
      }
    }
  ],

  domainEffect: {
    name: "Chimera Shadow Garden",
    sureHit: true,
    effect: "shadow_battlefield",
    environment: "shadow_realm",
    counterplay: ["Domain Amplification", "Light techniques", "Area attacks"],
    cost: 320,
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


export default tenShadowsDefinition
