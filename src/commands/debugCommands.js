import { sendQuotedWithFooter } from "../utils/messageHelper.js"
import { buildRegistry } from "../services/commandRegistry.js"

export async function handleDebugCommands(sock, message) {
  const remoteJid = message.key.remoteJid
  const registry = buildRegistry()
  const allEntries = Array.from(registry.getAllCommands().values())

  const broken = []
  const partial = []
  const working = []

  for (const entry of allEntries) {
    const id = entry.command || entry.prefix || "<unknown>"
    if (!entry || typeof entry.handler !== "function") {
      broken.push(`${id} ❌ Handler missing or invalid`)
      continue
    }
    if (!entry.usage || !entry.description) {
      partial.push(`${id} ⚠️ Missing usage or description`)
      working.push(id)
      continue
    }
    working.push(id)
  }

  const lines = [
    "KENNYJAKS COMMAND HEALTH",
    "",
    `Total Commands: ${allEntries.length}`,
    `✓ Working: ${working.length}`,
    `⚠️ Partial: ${partial.length}`,
    `❌ Broken: ${broken.length}`,
    "",
  ]

  if (broken.length) {
    lines.push("BROKEN:")
    lines.push(...broken.slice(0, 15))
    lines.push("")
  }
  if (partial.length) {
    lines.push("PARTIAL:")
    lines.push(...partial.slice(0, 15))
    lines.push("")
  }

  if (!broken.length && !partial.length) {
    lines.push("All registered commands are healthy.")
  }

  await sendQuotedWithFooter(sock, remoteJid, lines.join("\n"), message)
}
