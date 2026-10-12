import { normalizeJid } from "../services/PermissionService.js"

// Central command parser. Single source of truth for command extraction.
// Handles: uppercase/lowercase, extra spaces, quoted messages, mentions,
// group messages, private messages.

function extractRawText(message) {
  if (!message || !message.message) return ""
  const m = message.message
  // Plain text
  if (m.conversation) return m.conversation
  // Extended text (e.g. quoted replies, mentions)
  if (m.extendedTextMessage && m.extendedTextMessage.text) return m.extendedTextMessage.text
  // Image/Video/etc with caption
  if (m.imageMessage && m.imageMessage.caption) return m.imageMessage.caption
  if (m.videoMessage && m.videoMessage.caption) return m.videoMessage.caption
  if (m.documentMessage && m.documentMessage.caption) return m.documentMessage.caption
  if (m.viewOnceMessage && m.viewOnceMessage.message) {
    const vm = m.viewOnceMessage.message
    if (vm.conversation) return vm.conversation
    if (vm.extendedTextMessage && vm.extendedTextMessage.text) return vm.extendedTextMessage.text
    if (vm.imageMessage && vm.imageMessage.caption) return vm.imageMessage.caption
    if (vm.videoMessage && vm.videoMessage.caption) return vm.videoMessage.caption
  }
  return ""
}

export function parseCommand(message) {
  const raw = (extractRawText(message) || "").trim()

  const senderJid = (message?.key?.participant) || (message?.key?.remoteJid) || ""
  const sender = normalizeJid(senderJid)

  const isGroup = (message?.key?.remoteJid || "").endsWith("@g.us")

  const mentionedUsers = (message?.message?.extendedTextMessage?.contextInfo?.mentionedJid || [])
    .map(jid => normalizeJid(jid))
    .filter(Boolean)

  const quotedMessage = message?.message?.extendedTextMessage?.contextInfo?.quotedMessage || null

  // Normalize: lowercase command, collapse whitespace
  const normalized = raw.replace(/\s+/g, " ").trim()
  const parts = normalized.split(" ")
  let command = ""
  let args = []

  if (parts.length > 0 && parts[0].startsWith("/")) {
    command = parts[0].toLowerCase()
    args = parts.slice(1)
  }

  return {
    raw,
    command,
    args,
    sender,
    senderJid,
    isGroup,
    mentionedUsers,
    quotedMessage
  }
}
