import { getAIConfig } from "./AIConfig.js"
import { getAllAITools } from "./AIToolRegistry.js"

export class KennyJaksAI {
  constructor() {
    this.config = getAIConfig()
  }

  async call(prompt, context = {}) {
    if (!this.config.enabled) {
      return { ok: false, reason: "ai_disabled" }
    }

    const apiKey = process.env.OPENROUTER_API_KEY
    if (!apiKey) {
      return { ok: false, reason: "missing_api_key" }
    }

    const url = `${this.config.baseUrl}/chat/completions`
    const body = {
      model: this.config.model,
      messages: [
        {
          role: "system",
          content: this.buildSystemPrompt(context)
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: this.config.maxTokens,
      temperature: this.config.temperature,
      tools: this.buildToolDefinitions(),
      tool_choice: "auto"
    }

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
          "HTTP-Referer": "https://kennyjaks.local",
          "X-Title": "KennyJaks"
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(this.config.timeoutMs)
      })

      if (!response.ok) {
        const text = await response.text().catch(() => "")
        return { ok: false, reason: "provider_error", status: response.status, detail: text }
      }

      const data = await response.json()
      return this.parseResponse(data)
    } catch (error) {
      if (error.name === "TimeoutError" || error.name === "AbortError") {
        return { ok: false, reason: "timeout" }
      }
      return { ok: false, reason: "network_error", detail: error.message }
    }
  }

  buildSystemPrompt(context) {
    const parts = [
      "You are the Game Master for KennyJaks, a Jujutsu Kaisen-themed text RPG.",
      "You are NOT the authority on numerical rules.",
      "You MAY request safe game tools.",
      "The deterministic game engine decides whether requested tool calls are legal.",
      "Never claim to directly change HP, CE, XP, inventory, or progression.",
      "If asked for numbers, narrate qualitatively and let the engine apply actual values.",
      "Always output valid JSON when requesting tools.",
      "Allowed tool names: get_player_state, get_battle_state, get_enemy_state, get_technique, get_domain, get_location_state, get_world_state, apply_status_effect, change_momentum, start_domain, trigger_black_flash, save_legendary_battle."
    ]

    if (context.battle) {
      parts.push("Current context: battle.")
    }
    if (context.curse) {
      parts.push("Current context: curse encounter.")
    }
    if (context.world) {
      parts.push("Current context: world event.")
    }

    return parts.join("\n")
  }

  buildToolDefinitions() {
    return getAllAITools().map(tool => ({
      type: "function",
      function: {
        name: tool.name,
        description: tool.description,
        parameters: tool.schema
      }
    }))
  }

  parseResponse(data) {
    const choice = data?.choices?.[0]
    if (!choice) {
      return { ok: false, reason: "empty_response" }
    }

    const message = choice.message || {}
    const toolCalls = message.tool_calls || []

    if (toolCalls.length > 0) {
      const calls = toolCalls.map(call => {
        const fn = call.function || {}
        let args = {}
        try {
          args = JSON.parse(fn.arguments || "{}")
        } catch {
          args = { _parse_error: true, raw: fn.arguments }
        }
        return {
          id: call.id,
          name: fn.name,
          arguments: args
        }
      })
      return { ok: true, toolCalls: calls, raw: data }
    }

    const content = message.content || ""
    return { ok: true, text: content, raw: data }
  }
}
