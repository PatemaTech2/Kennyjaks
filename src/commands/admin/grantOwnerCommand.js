import { sendQuotedWithFooter } from "../../utils/messageHelper.js"
import { isOwnerOrModerator, addTempOwner, removeTempOwner, getTempOwnerRemainingMs, normalizePhoneNumber, loadTempOwners } from "../../services/PermissionService.js"

export async function handleGrantOwner(sock, message) {
  const remoteJid = message.key.remoteJid
  const sender = message.key.participant || remoteJid
  const phoneNumber = normalizePhoneNumber(sender.split("@")[0])

  if (!isOwnerOrModerator(phoneNumber)) {
    await sendQuotedWithFooter(sock, remoteJid, "⛔ This command is restricted to the Bot Owner.", message)
    return
  }

  const text = (message.message?.conversation || message.message?.extendedTextMessage?.text || "").trim()
  const args = text.split(" ").slice(1)

  if (args.length < 1) {
    await sendQuotedWithFooter(sock, remoteJid, "Usage: /grant-owner <@phone> [duration]\nDuration: 1d, 1w, 1m, or ms (default: 1 month)\nExample: /grant-owner 2349035952633 1m", message)
    return
  }

  const targetRef = args[0].replace("@", "").replace(/\D/g, "")
  const durationStr = args[1] || "1m"

  const durationMs = parseDuration(durationStr)
  if (!durationMs) {
    await sendQuotedWithFooter(sock, remoteJid, "Invalid duration. Use: 1d, 1w, 1m, or milliseconds.", message)
    return
  }

  const entry = addTempOwner(targetRef, durationMs)
  const expiresAt = new Date(entry.expiresAt).toISOString()

  await sendQuotedWithFooter(sock, remoteJid, `✅ Granted temporary owner access to ${targetRef}.\nExpires: ${expiresAt}`, message)
}

export async function handleRevokeOwner(sock, message) {
  const remoteJid = message.key.remoteJid
  const sender = message.key.participant || remoteJid
  const phoneNumber = normalizePhoneNumber(sender.split("@")[0])

  if (!isOwnerOrModerator(phoneNumber)) {
    await sendQuotedWithFooter(sock, remoteJid, "⛔ This command is restricted to the Bot Owner.", message)
    return
  }

  const text = (message.message?.conversation || message.message?.extendedTextMessage?.text || "").trim()
  const args = text.split(" ").slice(1)

  if (args.length < 1) {
    await sendQuotedWithFooter(sock, remoteJid, "Usage: /revoke-owner <@phone>\nExample: /revoke-owner 2349035952633", message)
    return
  }

  const targetRef = args[0].replace("@", "").replace(/\D/g, "")
  const remaining = getTempOwnerRemainingMs(targetRef)

  removeTempOwner(targetRef)

  if (remaining > 0) {
    await sendQuotedWithFooter(sock, remoteJid, `✅ Revoked temporary owner access from ${targetRef}.\nThey had ${formatDuration(remaining)} remaining.`, message)
  } else {
    await sendQuotedWithFooter(sock, remoteJid, `ℹ️ ${targetRef} did not have active temporary owner access.`, message)
  }
}

export async function handleTempOwners(sock, message) {
  const remoteJid = message.key.remoteJid
  const sender = message.key.participant || remoteJid
  const phoneNumber = normalizePhoneNumber(sender.split("@")[0])

  if (!isOwnerOrModerator(phoneNumber)) {
    await sendQuotedWithFooter(sock, remoteJid, "⛔ This command is restricted to the Bot Owner.", message)
    return
  }

  const entries = loadTempOwners()
  const now = Date.now()
  const active = entries.filter(e => now < e.expiresAt)

  if (active.length === 0) {
    await sendQuotedWithFooter(sock, remoteJid, "No active temporary owners.", message)
    return
  }

  const lines = active.map(e => {
    const remaining = e.expiresAt - now
    return `${e.phone} — expires in ${formatDuration(remaining)}`
  })

  await sendQuotedWithFooter(sock, remoteJid, `Active temporary owners:\n\n${lines.join("\n")}`, message)
}

function parseDuration(str) {
  const s = String(str).trim().toLowerCase()
  if (!s) return null

  if (/^\d+$/.test(s)) {
    return parseInt(s, 10)
  }

  const m = s.match(/^(\d+)(d|w|m|ms)?$/)
  if (!m) return null

  const value = parseInt(m[1], 10)
  const unit = m[2] || "ms"

  switch (unit) {
    case "d":
      return value * 24 * 60 * 60 * 1000
    case "w":
      return value * 7 * 24 * 60 * 60 * 1000
    case "m":
      return value * 30 * 24 * 60 * 60 * 1000
    case "ms":
      return value
    default:
      return null
  }
}

function formatDuration(ms) {
  if (ms <= 0) return "0s"
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) return `${days}d ${hours % 24}h`
  if (hours > 0) return `${hours}h ${minutes % 60}m`
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`
  return `${seconds}s`
}
