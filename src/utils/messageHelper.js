import { premiumBox, EMOJI, getFooter, errorBox as uiErrorBox, confirmBox as uiConfirmBox } from "./ui.js"

export async function sendQuoted(sock, jid, text, message) {
  return sock.sendMessage(jid, { text }, { quoted: message })
}

export async function sendQuotedWithFooter(sock, jid, text, message) {
  return sock.sendMessage(jid, { text: `${text}\n${getFooter()}` }, { quoted: message })
}

export async function sendQuotedRaw(sock, jid, text, message) {
  return sock.sendMessage(jid, { text }, { quoted: message })
}

export function formatError(title, details) {
  const lines = [
    `❌ ${title}`,
    "",
    ...details.map(d => d),
    "",
    "━━━━━━━━━━━━━━━━━━━━━━"
  ]
  return lines.join("\n")
}

export function formatSuccess(title, details) {
  const lines = [
    `✅ ${title}`,
    "",
    ...details.map(d => d),
    "",
    "━━━━━━━━━━━━━━━━━━━━━━"
  ]
  return lines.join("\n")
}

export function formatLoading(action) {
  const loadMessages = [
    "Searching inventory...",
    "Contacting Jujutsu Headquarters...",
    "Preparing cursed energy...",
    "Generating sticker...",
    "Analyzing media...",
    "Processing request...",
    "Loading data..."
  ]
  const msg = loadMessages[Math.floor(Math.random() * loadMessages.length)]
  return `${msg}`
}

export function createPremiumResponse(title, contentLines, footer = "") {
  return premiumBox(title, contentLines, footer)
}

export function errorBox(message) {
  return uiErrorBox(message)
}

export function successBox(title, message) {
  return uiConfirmBox(title, message)
}

export { EMOJI }
