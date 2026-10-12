import { KennyJaksAI } from "./KennyJaksAI.js"
import { AIBattleController } from "./AIBattleController.js"
import { AICurseBrain } from "./AICurseBrain.js"
import { parseAIResponse, extractDialogue, extractToolCalls } from "./AIResponseParser.js"
import { getAIConfig, isAIEnabled } from "./AIConfig.js"
import { validateAIToolCall } from "./AIToolRegistry.js"

export class AIWorldEngine {
  constructor() {
    this.ai = new KennyJaksAI()
    this.battleController = new AIBattleController()
    this.curseBrain = new AICurseBrain()
    this.cache = new Map()
  }

  isEnabled() {
    return isAIEnabled()
  }

  async requestCurseDecision(context) {
    const config = getAIConfig()
    if (!config.enabled || !config.battleEnabled) {
      return null
    }
    return this.curseBrain.decideAction(context)
  }

  async requestCurseDialogue(context) {
    const config = getAIConfig()
    if (!config.enabled || !config.curseDialogueEnabled) {
      return null
    }
    return this.curseBrain.generateDialogue(context)
  }

  async requestBattleNarration(context) {
    const config = getAIConfig()
    if (!config.enabled || !config.narrationEnabled) {
      return null
    }
    return this.battleController.requestNarration(context)
  }

  async requestWorldArrivalNarration(context) {
    const config = getAIConfig()
    if (!config.enabled || !config.worldEventsEnabled) {
      return null
    }

    const prompt = [
      "Generate a short atmospheric arrival narration for KennyJaks.",
      "Return only the narration string. No quotes. No JSON.",
      "",
      `Location: ${context.world?.location?.name || "Unknown"}`,
      `Player reputation: ${context.player?.reputation || 0}`,
      `Tone: tense, mysterious, Jujutsu Kaisen-style.`
    ].join("\n")

    const response = await this.ai.call(prompt, { world: true })
    if (!response.ok || !response.text) {
      return null
    }

    const text = response.text.trim().split("\n")[0] || null
    if (text && text.length <= 240) {
      return text
    }
    return null
  }

  async callWithTools(prompt, context = {}) {
    const config = getAIConfig()
    if (!config.enabled) {
      return { ok: false, reason: "ai_disabled", fallback: true }
    }

    const response = await this.ai.call(prompt, context)
    if (!response.ok) {
      return { ok: false, reason: response.reason, fallback: true }
    }

    const parsed = parseAIResponse(response)
    if (!parsed.parsed) {
      return { ok: false, reason: "parse_failed", fallback: true }
    }

    const validToolCalls = extractToolCalls(parsed)
    const dialogue = extractDialogue(parsed)

    return {
      ok: true,
      dialogue,
      toolCalls: validToolCalls,
      fallback: false
    }
  }

  getCacheKey(context) {
    const ctx = context || {}
    return `${ctx.battleId || "world"}:${ctx.round || 0}:${ctx.playerId || "unknown"}`
  }

  cacheSet(key, value) {
    this.cache.set(key, value)
  }

  cacheGet(key) {
    return this.cache.get(key) || null
  }
}

export const aiWorldEngine = new AIWorldEngine()
