export function formatError(title, details) {
  const lines = [
    "╭━━━━━━━━━━━━━━━━━━━━━━━╮",
    `┃ ❌ ${title}`,
    "╰━━━━━━━━━━━━━━━━━━━━━━━╯",
    ""
  ]
  details.forEach(detail => {
    lines.push(detail)
  })
  lines.push("")
  lines.push("━━━━━━━━━━━━━━━━━━━━━━")
  return lines.join("\n")
}

export function formatSuccess(title, details) {
  const lines = [
    "╭━━━━━━━━━━━━━━━━━━━━━━━╮",
    `┃ ✅ ${title}`,
    "╰━━━━━━━━━━━━━━━━━━━━━━━╯",
    ""
  ]
  details.forEach(detail => {
    lines.push(detail)
  })
  lines.push("")
  lines.push("━━━━━━━━━━━━━━━━━━━━━━")
  return lines.join("\n")
}

export function formatWarning(title, details) {
  const lines = [
    "╭━━━━━━━━━━━━━━━━━━━━━━━╮",
    `┃ ⚠️ ${title}`,
    "╰━━━━━━━━━━━━━━━━━━━━━━━╯",
    ""
  ]
  details.forEach(detail => {
    lines.push(detail)
  })
  lines.push("")
  lines.push("━━━━━━━━━━━━━━━━━━━━━━")
  return lines.join("\n")
}

export function getLoadingMessage() {
  const messages = [
    "Searching inventory...",
    "Contacting Jujutsu Headquarters...",
    "Preparing cursed energy...",
    "Generating sticker...",
    "Analyzing media...",
    "Processing request...",
    "Loading data...",
    "Connecting to server...",
    "Fetching profile...",
    "Calculating rewards..."
  ]
  return messages[Math.floor(Math.random() * messages.length)]
}
