import { sendQuotedWithFooter } from "../../utils/messageHelper.js"
import { isOwnerOrModerator, normalizePhoneNumber } from "../../services/PermissionService.js"
import { loadPlayerByPhone, savePlayer, loadAllPlayers, deletePlayer } from "../../database/playerRepo.js"
import { Player } from "../../models/player.js"

export async function handleReset(sock, message) {
  const remoteJid = message.key.remoteJid
  const sender = message.key.participant || remoteJid
  const phoneNumber = normalizePhoneNumber(sender.split("@")[0])

  if (!isOwnerOrModerator(phoneNumber)) {
    await sendQuotedWithFooter(sock, remoteJid, "⛔ This command is restricted to the Bot Owner and Bot Moderators.", message)
    return
  }

  const text = (message.message?.conversation || message.message?.extendedTextMessage?.text || "").trim()
  const args = text.split(" ").slice(1)

  if (args.length < 1 && !message.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
    await sendQuotedWithFooter(sock, remoteJid, "Usage: /reset <@phone>\nOr quote a player's message and use /reset\n\nExample: /reset @2349035952633", message)
    return
  }

  // Try to extract phone from quoted message first
  let targetPhone = ""
  const quotedMessage = message.message?.extendedTextMessage?.contextInfo?.quotedMessage
  if (quotedMessage) {
    const quotedSender = message.message?.extendedTextMessage?.contextInfo?.participant
    if (quotedSender) {
      targetPhone = normalizePhoneNumber(quotedSender.split("@")[0])
    }
  }

  // Fall back to argument parsing
  if (!targetPhone && args.length > 0) {
    targetPhone = args[0].replace("@", "").replace(/\D/g, "")
  }

  // Also check mentioned users
  if (!targetPhone) {
    const mentioned = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || []
    if (mentioned.length > 0) {
      targetPhone = normalizePhoneNumber(mentioned[0].split("@")[0])
    }
  }

  if (!targetPhone || targetPhone.length === 0) {
    await sendQuotedWithFooter(sock, remoteJid, "❌ Could not identify a target user. Mention a user, quote their message, or provide a phone number.", message)
    return
  }

  // Load the target player
  const targetPlayer = await loadPlayerByPhone(targetPhone)
  if (!targetPlayer) {
    await sendQuotedWithFooter(sock, remoteJid, `❌ Player not found for phone: ${targetPhone}`, message)
    return
  }

  const targetName = targetPlayer.name
  const targetId = targetPlayer.playerId

  // Delete the player entirely
  await deletePlayer(targetPhone)

  // Create a fresh player with same ID and phone — fully reset
  const freshPlayer = new Player({
    playerId: targetId,
    phoneNumber: targetPhone,
    name: targetName,
    currentSprite: "johnken.png",
    currentSpriteName: "johnken",
    profileStyle: "TECH",
    level: 1,
    xp: 0,
    lifetimeXp: 0,
    wallet: 0,
    bank: 0,
    health: 100,
    maxHealth: 100,
    cursedEnergy: 50,
    maxCursedEnergy: 50,
    strength: 10,
    defense: 10,
    speed: 10,
    intelligence: 10,
    luck: 10,
    grade: 4,
    sorceryType: null,
    technique: null
  })
  await savePlayer(freshPlayer)

  // Update ALL existing players to use the new TECH profile style
  const allPlayers = await loadAllPlayers()
  let updatedCount = 0
  for (const p of allPlayers) {
    if (p.playerId !== targetId && p.profileStyle !== "TECH") {
      p.profileStyle = "TECH"
      await savePlayer(p)
      updatedCount++
    }
  }

  await sendQuotedWithFooter(sock, remoteJid,
    `✅ RESET COMPLETE\n\n` +
    `🔄 ${targetName} (ID: ${targetId})\n` +
    `Reset all data back to the beginning.\n` +
    `📋 ${updatedCount} other players updated to tech profile.\n\n` +
    `New stats: Lv.1 | ¥0 | Grade 4 | johnken sprite`, message)
}
