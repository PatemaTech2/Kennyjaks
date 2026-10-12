import { validateAIToolCall } from "./AIToolRegistry.js"

export function parseAIResponse(raw) {
  if (!raw || typeof raw !== "object") {
    return { parsed: false, error: "empty_response" }
  }

  const choice = raw.choices?.[0]
  if (!choice || !choice.message) {
    return { parsed: false, error: "missing_message" }
  }

  const message = choice.message
  const result = {
    text: message.content || "",
    toolCalls: [],
    parsed: true
  }

  const rawCalls = message.tool_calls || []
  for (const call of rawCalls) {
    const fn = call.function || {}
    let args = {}
    try {
      args = JSON.parse(fn.arguments || "{}")
    } catch {
      args = { _parse_error: true, raw: fn.arguments }
    }

    const validation = validateAIToolCall(fn.name, args)
    result.toolCalls.push({
      id: call.id,
      name: fn.name,
      arguments: args,
      valid: validation.valid,
      validationError: validation.error || null
    })
  }

  return result
}

export function extractDialogue(parsed) {
  const text = (parsed.text || "").trim()
  if (!text) return null
  return text
}

export function extractToolCalls(parsed) {
  const valid = (parsed.toolCalls || []).filter(call => call.valid)
  return valid
}
