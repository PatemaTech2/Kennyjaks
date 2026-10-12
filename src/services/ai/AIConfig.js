const DEFAULT_AI_CONFIG = {
  enabled: true,
  model: "openrouter/free",
  fallbackModel: "openrouter/free",
  timeoutMs: 8000,
  maxTokens: 1200,
  temperature: 0.8,
  battleEnabled: true,
  curseDialogueEnabled: true,
  worldEventsEnabled: true,
  npcReasoningEnabled: true,
  narrationEnabled: true,
  fallbackEnabled: true
}

let cachedConfig = null

export function loadAIConfig() {
  if (cachedConfig) return cachedConfig

  const raw = process.env.AI_ENABLED
  const envEnabled = raw === undefined ? DEFAULT_AI_CONFIG.enabled : raw !== "false"

  cachedConfig = {
    enabled: envEnabled,
    model: process.env.AI_MODEL || DEFAULT_AI_CONFIG.model,
    fallbackModel: process.env.AI_FALLBACK_MODEL || DEFAULT_AI_CONFIG.fallbackModel,
    apiKey: process.env.OPENROUTER_API_KEY || "",
    baseUrl: process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1",
    timeoutMs: Number(process.env.AI_TIMEOUT_MS || DEFAULT_AI_CONFIG.timeoutMs),
    maxTokens: Number(process.env.AI_MAX_TOKENS || DEFAULT_AI_CONFIG.maxTokens),
    temperature: Number(process.env.AI_TEMPERATURE ?? DEFAULT_AI_CONFIG.temperature),
    battleEnabled: process.env.AI_BATTLE_ENABLED !== "false",
    curseDialogueEnabled: process.env.AI_CURSE_DIALOGUE_ENABLED !== "false",
    worldEventsEnabled: process.env.AI_WORLD_EVENTS_ENABLED !== "false",
    npcReasoningEnabled: process.env.AI_NPC_REASONING_ENABLED !== "false",
    narrationEnabled: process.env.AI_NARRATION_ENABLED !== "false",
    fallbackEnabled: process.env.AI_FALLBACK_ENABLED !== "false"
  }

  return cachedConfig
}

export function getAIConfig() {
  return loadAIConfig()
}

export function isAIEnabled() {
  const config = getAIConfig()
  return config.enabled && !!config.apiKey
}
