import { KennyJaksAI } from "./KennyJaksAI.js"
import { getAIConfig } from "./AIConfig.js"

const FALLBACK_ACTIONS = [
  { type: "ATTACK" },
  { type: "ATTACK" },
  { type: "DEFEND" },
  { type: "USE_TECHNIQUE" },
  { type: "EVADE" }
]

export class AICurseBrain {
  constructor() {
    this.ai = new KennyJaksAI()
    this.cache = new Map()
  }

  async decideAction(context) {
    const config = getAIConfig()
    if (!config.enabled || !config.battleEnabled) {
      return this.fallbackAction(context)
    }

    const prompt = this.buildDecisionPrompt(context)
    const response = await this.ai.call(prompt, { battle: true })

    if (!response.ok) {
      return this.fallbackAction(context)
    }

    const parsed = this.parseDecisionResponse(response)
    if (!parsed) {
      return this.fallbackAction(context)
    }

    return parsed
  }

  buildDecisionPrompt(context) {
    const enemy = context.enemy || {}
    const battle = context.battle || {}
    const player = context.player || {}

    return [
      "You are controlling a curse in KennyJaks.",
      "Choose ONE action from: ATTACK, DEFEND, EVADE, COUNTER, USE_TECHNIQUE, USE_DOMAIN, FLEE, TAUNT.",
      "Respond with JSON only: { \"action\": \"ATTACK\", \"dialogue\": \"...\", \"emotion\": \"...\" }.",
      "",
      `Curse: ${enemy.name || "Unknown"}`,
      `Grade: ${enemy.grade ?? "?"}`,
      `HP: ${enemy.hp ?? 0}/${enemy.maxHp ?? 0}`,
      `CE: ${enemy.ce ?? 0}/${enemy.maxCe ?? 0}`,
      `Personality: ${enemy.personality || "neutral"}`,
      `Abilities: ${(enemy.abilities || []).join(", ") || "none"}`,
      "",
      `Round: ${battle.round || 0}`,
      `Player HP: ${player.hp ?? 0}/${player.maxHp ?? 0}`,
      `Player CE: ${player.ce ?? 0}/${player.maxCe ?? 0}`,
      `Player statuses: ${(player.statusEffects || []).join(", ") || "none"}`
    ].join("\n")
  }

  parseDecisionResponse(response) {
    const text = response.text || ""
    const trimmed = text.trim()

    try {
      const parsed = JSON.parse(trimmed)
      if (parsed && typeof parsed.action === "string") {
        return {
          type: parsed.action,
          dialogue: typeof parsed.dialogue === "string" ? parsed.dialogue : "",
          emotion: typeof parsed.emotion === "string" ? parsed.emotion : "neutral",
          source: "ai"
        }
      }
    } catch {
      // not JSON, fall back below
    }

    const fallback = FALLBACK_ACTIONS[Math.floor(Math.random() * FALLBACK_ACTIONS.length)]
    return { ...fallback, source: "fallback" }
  }

  fallbackAction(context) {
    const action = FALLBACK_ACTIONS[Math.floor(Math.random() * FALLBACK_ACTIONS.length)]
    return { ...action, source: "fallback" }
  }

  async generateDialogue(context) {
    const config = getAIConfig()
    if (!config.enabled || !config.curseDialogueEnabled) {
      return null
    }

    const enemy = context.enemy || {}
    const cacheKey = `${enemy.id || enemy.name}:dialogue`

    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)
    }

    const prompt = [
      "Generate a short in-character curse dialogue line for KennyJaks.",
      "Return only the dialogue string. No quotes. No JSON.",
      "",
      `Curse: ${enemy.name || "Unknown"}`,
      `Personality: ${enemy.personality || "neutral"}`,
      `Tone: ${enemy.personality === "arrogant" ? "mocking" : enemy.personality === "stoic" ? "quiet" : "tense"}`
    ].join("\n")

    const response = await this.ai.call(prompt, { curse: true })
    if (!response.ok || !response.text) {
      return null
    }

    const text = response.text.trim().split("\n")[0] || null
    if (text && text.length <= 240) {
      this.cache.set(cacheKey, text)
      return text
    }
    return null
  }
}

export function getCurseFallbackDialogue(name) {
  const lines = [
    "You should not have come here.",
    "Another sorcerer? Fine.",
    "I will not hold back.",
    "You reek of fear.",
    "Try to keep up."
  ]
  return lines[Math.floor(Math.random() * lines.length)]
}
