import { AICurseBrain } from "./AICurseBrain.js"
import { pickNarrationTone, getFallbackNarration } from "./AINarrator.js"
import { getAIConfig } from "./AIConfig.js"

export class AIBattleController {
  constructor() {
    this.curseBrain = new AICurseBrain()
  }

  async requestCurseAction(context) {
    const config = getAIConfig()
    if (!config.enabled || !config.battleEnabled) {
      return null
    }

    const decision = await this.curseBrain.decideAction(context)
    if (!decision) return null

    return {
      action: this.normalizeAction(decision.type),
      dialogue: decision.dialogue || null,
      emotion: decision.emotion || "neutral",
      source: decision.source || "ai"
    }
  }

  async requestNarration(context) {
    const config = getAIConfig()
    if (!config.enabled || !config.narrationEnabled) {
      return null
    }

    const tone = pickNarrationTone({
      hasBlackFlash: context.hasBlackFlash || false,
      hasDomain: context.hasDomain || false,
      isBoss: context.isBoss || false,
      momentumSwing: context.momentumSwing || 0
    })

    const enemyName = context.enemy?.name || "your opponent"
    const fallback = getFallbackNarration(enemyName)

    return {
      tone,
      fallback,
      enemyName
    }
  }

  normalizeAction(raw) {
    const map = {
      ATTACK: "attack",
      DEFEND: "block",
      EVADE: "dodge",
      COUNTER: "attack",
      USE_TECHNIQUE: "skill",
      USE_DOMAIN: "domain",
      FLEE: "flee",
      TAUNT: "taunt"
    }

    const key = String(raw || "").toUpperCase()
    return map[key] || "attack"
  }
}

export function getFallbackBattleAction() {
  return {
    action: "attack",
    dialogue: null,
    emotion: "neutral",
    source: "fallback"
  }
}
