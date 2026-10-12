export const AI_TOOLS = {
  get_player_state: {
    name: "get_player_state",
    description: "Get current player state for context.",
    schema: {
      type: "object",
      properties: {},
      required: []
    },
    validate: () => ({ valid: true })
  },
  get_battle_state: {
    name: "get_battle_state",
    description: "Get current battle state.",
    schema: {
      type: "object",
      properties: {},
      required: []
    },
    validate: () => ({ valid: true })
  },
  get_enemy_state: {
    name: "get_enemy_state",
    description: "Get current enemy/curse state.",
    schema: {
      type: "object",
      properties: {},
      required: []
    },
    validate: () => ({ valid: true })
  },
  get_technique: {
    name: "get_technique",
    description: "Get technique definition.",
    schema: {
      type: "object",
      properties: {
        techniqueId: { type: "string" }
      },
      required: ["techniqueId"]
    },
    validate: (params) => {
      if (!params || typeof params.techniqueId !== "string") {
        return { valid: false, error: "techniqueId must be a string." }
      }
      return { valid: true }
    }
  },
  get_domain: {
    name: "get_domain",
    description: "Get domain definition.",
    schema: {
      type: "object",
      properties: {
        domainId: { type: "string" }
      },
      required: ["domainId"]
    },
    validate: (params) => {
      if (!params || typeof params.domainId !== "string") {
        return { valid: false, error: "domainId must be a string." }
      }
      return { valid: true }
    }
  },
  get_location_state: {
    name: "get_location_state",
    description: "Get current location state.",
    schema: {
      type: "object",
      properties: {},
      required: []
    },
    validate: () => ({ valid: true })
  },
  get_world_state: {
    name: "get_world_state",
    description: "Get high-level world state.",
    schema: {
      type: "object",
      properties: {},
      required: []
    },
    validate: () => ({ valid: true })
  },
  apply_status_effect: {
    name: "apply_status_effect",
    description: "Request a status effect application. This is a request only; the deterministic engine may reject it.",
    schema: {
      type: "object",
      properties: {
        target: { type: "string", enum: ["player", "enemy"] },
        effect: { type: "string" },
        duration: { type: "integer", minimum: 1, maximum: 10 }
      },
      required: ["target", "effect", "duration"]
    },
    validate: (params) => {
      if (!params || !["player", "enemy"].includes(params.target)) {
        return { valid: false, error: "target must be player or enemy." }
      }
      if (!params.effect || typeof params.effect !== "string") {
        return { valid: false, error: "effect must be a string." }
      }
      const duration = Number(params.duration)
      if (!Number.isInteger(duration) || duration < 1 || duration > 10) {
        return { valid: false, error: "duration must be an integer between 1 and 10." }
      }
      return { valid: true }
    }
  },
  change_momentum: {
    name: "change_momentum",
    description: "Request a momentum change. This is a request only; the deterministic engine may reject it.",
    schema: {
      type: "object",
      properties: {
        target: { type: "string", enum: ["player", "enemy"] },
        delta: { type: "integer", minimum: -20, maximum: 20 }
      },
      required: ["target", "delta"]
    },
    validate: (params) => {
      if (!params || !["player", "enemy"].includes(params.target)) {
        return { valid: false, error: "target must be player or enemy." }
      }
      const delta = Number(params.delta)
      if (!Number.isInteger(delta) || delta < -20 || delta > 20) {
        return { valid: false, error: "delta must be an integer between -20 and 20." }
      }
      return { valid: true }
    }
  },
  start_domain: {
    name: "start_domain",
    description: "Request domain activation. This is a request only; the deterministic engine may reject it.",
    schema: {
      type: "object",
      properties: {
        actor: { type: "string", enum: ["player", "enemy"] }
      },
      required: ["actor"]
    },
    validate: (params) => {
      if (!params || !["player", "enemy"].includes(params.actor)) {
        return { valid: false, error: "actor must be player or enemy." }
      }
      return { valid: true }
    }
  },
  trigger_black_flash: {
    name: "trigger_black_flash",
    description: "Request black flash trigger. This is a request only; the deterministic engine may reject it.",
    schema: {
      type: "object",
      properties: {
        actor: { type: "string", enum: ["player", "enemy"] }
      },
      required: ["actor"]
    },
    validate: (params) => {
      if (!params || !["player", "enemy"].includes(params.actor)) {
        return { valid: false, error: "actor must be player or enemy." }
      }
      return { valid: true }
    }
  },
  save_legendary_battle: {
    name: "save_legendary_battle",
    description: "Request legendary battle record. This is a request only; the deterministic engine may reject it.",
    schema: {
      type: "object",
      properties: {
        locationId: { type: "string" },
        reason: { type: "string" }
      },
      required: ["locationId", "reason"]
    },
    validate: (params) => {
      if (!params || typeof params.locationId !== "string") {
        return { valid: false, error: "locationId must be a string." }
      }
      if (!params.reason || typeof params.reason !== "string") {
        return { valid: false, error: "reason must be a string." }
      }
      return { valid: true }
    }
  }
}

export function getAITool(name) {
  return AI_TOOLS[name] || null
}

export function getAllAITools() {
  return Object.values(AI_TOOLS)
}

export function validateAIToolCall(name, params = {}) {
  const tool = AI_TOOLS[name]
  if (!tool) {
    return { valid: false, error: `Unknown tool: ${name}` }
  }
  return tool.validate(params)
}
