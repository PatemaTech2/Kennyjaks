import { sendQuotedWithFooter } from "../../utils/messageHelper.js"
import { loadPlayerByPhone, loadPlayerById, savePlayer } from "../../database/playerRepo.js"
import { resolveTarget } from "../../utils/targetResolver.js"
import {
  createPvpChallenge,
  findPendingChallengeBetween,
  getPendingChallengeForTarget,
  acceptPvpChallenge,
  declinePvpChallenge,
  startPvPBattle,
  getPvPBattleByPlayer,
  endPvPBattle,
  isInPvPBattle
} from "../../services/battle/PvPService.js"
import { BattleManager } from "../../services/battle/BattleManager.js"
import { makeBar, universalHeader, pvpIntroBox } from "../../utils/ui.js"

export async function handleChallenge(sock, message) {
  const remoteJid = message.key.remoteJid
  const sender = message.key.participant || remoteJid
  const phoneNumber = normalizePhoneNumber(sender.split("@")[0])
  const text = (message.message?.conversation || message.message?.extendedTextMessage?.text || "").trim()
  const lowerText = text.toLowerCase()

  const player = await loadPlayerByPhone(phoneNumber)
  if (!player) {
    await sendQuotedWithFooter(sock, remoteJid, "You need to register first.\n\nUse /start to begin.", message)
    return
  }

  const normalizedPlayerId = String(player.playerId).trim()

  if (lowerText === "/ch-a" || lowerText === "/ch--a") {
    if (isInPvPBattle(normalizedPlayerId)) {
      await sendQuotedWithFooter(sock, remoteJid, "You are already in a PvP battle.", message)
      return
    }

    const pending = getPendingChallengeForTarget(normalizedPlayerId)
    if (!pending) {
      await sendQuotedWithFooter(sock, remoteJid, "You were never challenged.\n\nUse /ch @User to challenge a player.", message)
      return
    }

    const challenge = pending.challenge
    if (challenge.status !== "pending") {
      await sendQuotedWithFooter(sock, remoteJid, "This challenge is no longer valid.", message)
      return
    }

    if (Date.now() - challenge.createdAt > 2 * 60 * 1000) {
      await sendQuotedWithFooter(sock, remoteJid, "❌ That challenge has expired.\n\nChallenges only remain active for 2 minutes.", message)
      return
    }

    const accepted = acceptPvpChallenge(pending.key)
    if (!accepted) {
      await sendQuotedWithFooter(sock, remoteJid, "This challenge is no longer valid.", message)
      return
    }

    const challenger = await loadPlayerById(challenge.challengerId)
    if (!challenger) {
      await sendQuotedWithFooter(sock, remoteJid, "Challenger not found.", message)
      return
    }

    const battle = BattleManager.startPvPBattle(challenge.challengerId, challenge.targetId)
    if (!battle) {
      await sendQuotedWithFooter(sock, remoteJid, "Failed to start battle.", message)
      return
    }

    const turn = battle.turn === challenge.challengerId ? challenger.name : player.name
    const battleScreen = [
      "╔══════════════════════════════════╗",
      "          ⚔️  KENNYJAKS DUEL  ⚔️          ",
      "╚══════════════════════════════════╝",
      "",
      `🥊 @${challenger.name || "Unknown"}`,
      `HP: ${makeBar(challenger.health, challenger.maxHealth, "❤", "♡", 15)} ${challenger.health || 0}/${challenger.maxHealth || 0}`,
      `CE: ${makeBar(challenger.cursedEnergy, challenger.maxCursedEnergy, "🔵", "○", 15)} ${challenger.cursedEnergy || 0}/${challenger.maxCursedEnergy || 0}`,
      "",
      "VS",
      "",
      `🥊 @${player.name || "Unknown"}`,
      `HP: ${makeBar(player.health, player.maxHealth, "❤", "♡", 15)} ${player.health || 0}/${player.maxHealth || 0}`,
      `CE: ${makeBar(player.cursedEnergy, player.maxCursedEnergy, "🔵", "○", 15)} ${player.cursedEnergy || 0}/${player.maxCursedEnergy || 0}`,
      "",
      "━━━━━━━━━━━━━━━━━━━━━━",
      "",
      `ROUND 1`,
      `Current Turn: @${turn}`,
      "",
      "Choose your move:",
      "",
      "  /battack  /bblock  /dodge  /bflee",
      "  /btq1  /btq2  /btq3",
      "",
      "━━━━━━━━━━━━━━━━━━━━━━"
    ].join("\n")

    await sendQuotedWithFooter(sock, remoteJid, battleScreen, message)
    return
  }

  if (lowerText === "/ch-d") {
    const pending = getPendingChallengeForTarget(normalizedPlayerId)
    if (!pending) {
      await sendQuotedWithFooter(sock, remoteJid, "You were never challenged.", message)
      return
    }

    declinePvpChallenge(pending.key)
    await sendQuotedWithFooter(sock, remoteJid, `⛔ Duel Declined\n\n@${player.name || "Unknown"} declined the challenge.\n\nChallenge cancelled.`, message)
    return
  }

  if (isInPvPBattle(normalizedPlayerId)) {
    await sendQuotedWithFooter(sock, remoteJid, "You are already in a PvP battle.", message)
    return
  }

  const target = await resolveTarget(message, phoneNumber)
  if (!target) {
    await sendQuotedWithFooter(sock, remoteJid, "Reply to a player's message, then use:\n\n/ch\n\nOr tag a player:\n/ch @username", message)
    return
  }

  const targetPlayer = target.player

  if (normalizedPlayerId === String(targetPlayer.playerId).trim()) {
    await sendQuotedWithFooter(sock, remoteJid, "You cannot challenge yourself.", message)
    return
  }

  const existing = findPendingChallengeBetween(normalizedPlayerId, targetPlayer.playerId)
  if (existing) {
    await sendQuotedWithFooter(sock, remoteJid, "You already have a pending challenge with this user.", message)
    return
  }

  const challenge = createPvpChallenge(normalizedPlayerId, targetPlayer.playerId, remoteJid)
  if (!challenge) {
    await sendQuotedWithFooter(sock, remoteJid, "Could not create challenge.", message)
    return
  }

  const challengeScreen = [
    "╔══════════════════════════════════╗",
    "         ⚔️  SORCERER DUEL  ⚔️         ",
    "╚══════════════════════════════════╝",
    "",
    `  @${player.name || "Unknown"} has issued a challenge!`,
    "",
    "  Prize: None",
    "  Time Limit: 2 Minutes",
    "",
    "  ━━━━━━━━━━━━━━━━━━",
    "",
    "  Type:",
    "  /ch-a",
    "  to accept the duel.",
    "",
    "  Type:",
    "  /ch-d",
    "  to decline.",
    "",
    "══════════════════════════════════════"
  ].join("\n")

  await sendQuotedWithFooter(sock, remoteJid, challengeScreen, message)
}

function normalizePhoneNumber(value) {
  if (!value) return ""
  return String(value).replace(/\D/g, "")
}
