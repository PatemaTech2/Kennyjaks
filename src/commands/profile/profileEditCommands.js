import { sendQuotedWithFooter } from "../../utils/messageHelper.js"
import { loadPlayerByPhone, savePlayer } from "../../database/playerRepo.js"

export async function handleSetTitle(sock, message) {
  const remoteJid = message.key.remoteJid
  const sender = message.key.participant || remoteJid
  const phoneNumber = sender.split("@")[0]
  const text = (message.message?.conversation || message.message?.extendedTextMessage?.text || "").trim()
  const args = text.split(" ").slice(1)
  const title = args.join(" ").trim()

  if (!title) {
    await sendQuotedWithFooter(sock, remoteJid, "Usage: /set-title <your custom title>\n\nExample: /set-title ☠️ Shadow Sovereign", message)
    return
  }

  const player = await loadPlayerByPhone(phoneNumber)
  if (!player) {
    await sendQuotedWithFooter(sock, remoteJid, "You need to register first.\n\nUse /start to begin.", message)
    return
  }

  player.profileTitle = title
  await savePlayer(player)

  await sendQuotedWithFooter(sock, remoteJid, `✅ Profile title updated!\n\nNew title: ${title}`, message)
}

export async function handleSetBio(sock, message) {
  const remoteJid = message.key.remoteJid
  const sender = message.key.participant || remoteJid
  const phoneNumber = sender.split("@")[0]
  const text = (message.message?.conversation || message.message?.extendedTextMessage?.text || "").trim()
  const args = text.split(" ").slice(1)
  const bio = args.join(" ").trim()

  if (!bio) {
    await sendQuotedWithFooter(sock, remoteJid, "Usage: /set-bio <your custom bio>\n\nSupports emojis and custom symbols!\nExample: /set-bio ☠️ Grade 1 sorcerer | Shadow Sovereign", message)
    return
  }

  const player = await loadPlayerByPhone(phoneNumber)
  if (!player) {
    await sendQuotedWithFooter(sock, remoteJid, "You need to register first.\n\nUse /start to begin.", message)
    return
  }

  player.profileBio = bio
  await savePlayer(player)

  await sendQuotedWithFooter(sock, remoteJid, `✅ Profile bio updated!\n\nNew bio: ${bio}`, message)
}

export async function handleSetBadge(sock, message) {
  const remoteJid = message.key.remoteJid
  const sender = message.key.participant || remoteJid
  const phoneNumber = sender.split("@")[0]
  const text = (message.message?.conversation || message.message?.extendedTextMessage?.text || "").trim()
  const args = text.split(" ").slice(1)
  const badge = args.join(" ").trim()

  if (!badge) {
    await sendQuotedWithFooter(sock, remoteJid, "Usage: /set-badge <emoji/badge>\n\nExample: /set-badge 👑\nExample: /set-badge ☠️", message)
    return
  }

  const player = await loadPlayerByPhone(phoneNumber)
  if (!player) {
    await sendQuotedWithFooter(sock, remoteJid, "You need to register first.\n\nUse /start to begin.", message)
    return
  }

  player.profileBadge = badge
  await savePlayer(player)

  await sendQuotedWithFooter(sock, remoteJid, `✅ Profile badge updated!\n\nNew badge: ${badge}`, message)
}

export async function handleSetProfileStyle(sock, message) {
  const remoteJid = message.key.remoteJid
  const sender = message.key.participant || remoteJid
  const phoneNumber = sender.split("@")[0]
  const text = (message.message?.conversation || message.message?.extendedTextMessage?.text || "").trim()
  const args = text.split(" ").slice(1)
  const style = (args[0] || "").toUpperCase()

  if (!["A", "B", "C", "D", "E", "TECH"].includes(style)) {
    await sendQuotedWithFooter(sock, remoteJid, "Usage: /profile-style <A|B|C|D|E|TECH>\n\nA - Classic dual panel\nB - Compact vertical\nC - Split screen\nD - Horizontal card\nE - Peak anime character sheet\nTECH - Black & white tech profile", message)
    return
  }

  const player = await loadPlayerByPhone(phoneNumber)
  if (!player) {
    await sendQuotedWithFooter(sock, remoteJid, "You need to register first.\n\nUse /start to begin.", message)
    return
  }

  player.profileStyle = style
  await savePlayer(player)

  await sendQuotedWithFooter(sock, remoteJid, `✅ Profile style updated to ${style}!`, message)
}
