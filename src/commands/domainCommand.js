import { sendQuotedWithFooter } from "../utils/messageHelper.js"
import { loadPlayerByPhone, savePlayer, loadPlayerByName } from "../database/playerRepo.js"
import { BattleManager } from "../services/battle/BattleManager.js"
import { DomainService } from "../services/technique/DomainService.js"

export async function handleTrainDomain(sock, message) {
  const remoteJid = message.key.remoteJid
  const sender = message.key.participant || remoteJid
  const phoneNumber = sender.split("@")[0]

  const player = await loadPlayerByPhone(phoneNumber)
  if (!player) {
    await sendQuotedWithFooter(sock, remoteJid, "You need to register first.", message)
    return
  }

  const eligibility = checkDomainEligibility(player)
  if (!eligibility.eligible) {
    const lines = [
      "━━━━━━━━━━━━━━━━━━━━━━",
      "❌ DOMAIN LOCKED",
      "━━━━━━━━━━━━━━━━━━━━━━",
      "",
      "You haven't reached the level of mastery required to",
      "manifest a Domain Expansion.",
      "",
      "Requirements:",
      "",
      eligibility.rct ? "🔄 Reverse Cursed Technique: ✅" : "🔄 Reverse Cursed Technique",
      eligibility.curseKills >= 100 ? "☠️ Curse Kills: 100 ✅" : `☠️ Curse Kills: ${eligibility.curseKills} / 100`,
      "",
      "━━━━━━━━━━━━━━━━━━━━━━"
    ]
    await sendQuotedWithFooter(sock, remoteJid, lines.join("\n"), message)
    return
  }

  if (player.domains && player.domains.unlocked) {
    await sendQuotedWithFooter(sock, remoteJid, "You have already unlocked Domain Expansion.", message)
    return
  }

  player.domains = player.domains || {}
  player.domains.unlocked = true
  player.domains.name = player.domains.name || "Unnamed Domain"
  await savePlayer(player)

  await sendQuotedWithFooter(sock, remoteJid, [
    "━━━━━━━━━━━━━━━━━━━━━━",
    "DOMAIN EXPANSION UNLOCKED!",
    "━━━━━━━━━━━━━━━━━━━━━━",
    "",
    "You have met the requirements and",
    "unlocked the ability to perform",
    "Domain Expansion!",
    "",
    "Use /domain-name <name> to name your domain.",
    "Use /domain in battle to activate it.",
    "",
    "Your domain grants sure-hit effects",
    "for 3 turns.",
    "",
    "━━━━━━━━━━━━━━━━━━━━━━"
  ].join("\n"), message)
}

export function checkDomainEligibility(player) {
  const hasRct = !!(player && (player.hasRCT || (player.rct && player.rct.unlocked)))
  const curseKills = player ? (player.curseKills || 0) : 0
  return {
    eligible: hasRct || curseKills >= 100,
    rct: hasRct,
    curseKills
  }
}

export async function handleDomainName(sock, message) {
  const remoteJid = message.key.remoteJid
  const sender = message.key.participant || remoteJid
  const phoneNumber = sender.split("@")[0]

  const player = await loadPlayerByPhone(phoneNumber)
  if (!player) {
    await sendQuotedWithFooter(sock, remoteJid, "You need to register first.", message)
    return
  }

  const text = (message.message?.conversation || message.message?.extendedTextMessage?.text || "").trim()
  const args = text.split(" ").slice(1).join(" ")

  if (!args) {
    await sendQuotedWithFooter(sock, remoteJid, "Usage: /domain-name <name>\nExample: /domain-name Infinite Void", message)
    return
  }

  if (!player.domains || !player.domains.unlocked) {
    await sendQuotedWithFooter(sock, remoteJid, "You haven't unlocked Domain Expansion yet. Complete the training challenge with /train-domain.", message)
    return
  }

  player.domains.name = args
  await savePlayer(player)

  await sendQuotedWithFooter(sock, remoteJid, `Domain name set to: ${args}`, message)
}

export async function handleDomain(sock, message) {
  const remoteJid = message.key.remoteJid
  const sender = message.key.participant || remoteJid
  const phoneNumber = sender.split("@")[0]

  const player = await loadPlayerByPhone(phoneNumber)
  if (!player) {
    await sendQuotedWithFooter(sock, remoteJid, "You need to register first.", message)
    return
  }

  const eligibility = checkDomainEligibility(player)
  if (!eligibility.eligible) {
    const lines = [
      "━━━━━━━━━━━━━━━━━━━━━━",
      "❌ DOMAIN LOCKED",
      "━━━━━━━━━━━━━━━━━━━━━━",
      "",
      "You haven't reached the level of mastery required to",
      "manifest a Domain Expansion.",
      "",
      "Requirements:",
      "",
      eligibility.rct ? "🔄 Reverse Cursed Technique: ✅" : "🔄 Reverse Cursed Technique",
      eligibility.curseKills >= 100 ? "☠️ Curse Kills: 100 ✅" : `☠️ Curse Kills: ${eligibility.curseKills} / 100`,
      "",
      "━━━━━━━━━━━━━━━━━━━━━━"
    ]
    await sendQuotedWithFooter(sock, remoteJid, lines.join("\n"), message)
    return
  }

  if (!player.domains || !player.domains.unlocked) {
    await sendQuotedWithFooter(sock, remoteJid, "You haven't unlocked Domain Expansion. Complete the training challenge with /train-domain.", message)
    return
  }

  const battle = BattleManager.getActiveBattle(player.playerId)
  if (!battle) {
    await sendQuotedWithFooter(sock, remoteJid, "Domain Expansion can only be used during battle.", message)
    return
  }

  if (battle.domainActive) {
    await sendQuotedWithFooter(sock, remoteJid, "A domain is already active in this battle.", message)
    return
  }

  const result = DomainService.activate(player, battle)
  if (result.error) {
    await sendQuotedWithFooter(sock, remoteJid, result.error, message)
    return
  }

  await savePlayer(player)

  const domain = result.domain
  const effect = result.effect
   await sendQuotedWithFooter(sock, remoteJid, [
    `🌀 DOMAIN EXPANSION: ${domain.name}!`,
    "",
    `@${player.name || "Unknown"} manifests ${domain.name}.`,
    "",
    domain.description,
    "",
    `Sure-Hit: ${domain.sureHit}`,
    "",
    `Active for ${effect.rounds} rounds.`,
    `Damage x${effect.damageMult}.`,
    "",
    "Available Commands",
    "  /battack1",
    "  /btq1",
    "  /btq2",
    "  /btq3",
    "  /bblock",
    "  /bflee"
  ].join("\n"), message)
}
