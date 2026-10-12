import { sendQuotedWithFooter } from "../utils/messageHelper.js"
import { loadPlayerByPhone, savePlayer } from "../database/playerRepo.js"
import { getHealCeCooldown, formatBurnoutStatus } from "../commands/healCeCommand.js"
import { BALANCE } from "../config/balance.js"
import { getPotentialInfo } from "../services/technique/PotentialService.js"
import { TechniqueMasteryService } from "../services/technique/TechniqueMasteryService.js"
import { calculateDerivedStats, getSpScaling } from "../services/AttributeService.js"
import { ReputationTitleService } from "../services/progression/ReputationTitleService.js"

export async function handleAttributes(sock, message) {
  const remoteJid = message.key.remoteJid
  const sender = message.key.participant || remoteJid
  const phoneNumber = sender.split("@")[0]

  const player = await loadPlayerByPhone(phoneNumber)
  if (!player) {
    await sendQuotedWithFooter(sock, remoteJid, "You need to register first.\n\nUse /start to begin.", message)
    return
  }

  const potentialInfo = getPotentialInfo(player.potential || "F")
  const bfAffinity = player.blackFlashAffinity
  const bfDisplay = bfAffinity !== null && bfAffinity !== undefined ? `${bfAffinity}%` : "Not set"

  const derived = calculateDerivedStats(player)
  const lines = [
    "⚔ Attributes",
    "",
    `❤️ HP       : ${player.health || 0} / ${player.maxHealth || 0}`,
    `⚡ CE       : ${player.cursedEnergy || 0} / ${player.maxCursedEnergy || 0}`,
    formatBurnoutStatus(player),
    `⚔ Strength : ${derived.strength}`,
    `💨 Speed    : ${derived.speed}`,
    `🧠 Intelli  : ${derived.intelligence}`,
    `🛡 Defense  : ${derived.defense}`,
    `💪 Stamina  : ${derived.stamina}`,
    `🍀 Luck     : ${derived.luck}`,
    `🎯 Tech Ctrl: ${derived.techniqueControl}`,
    "",
    `Potential  : ${(player.potential || "F")} (${potentialInfo?.label || "F"})`,
    "",
    "━━━━━━━━━━━━━━━━━━━━",
    "",
    "⚫ Black Flash Affinity",
    bfDisplay,
    "",
    "━━━━━━━━━━━━━━━━━━━━",
    "",
    "🔄 Reverse Cursed Technique",
    (player.hasRCT || (player.rct && player.rct.unlocked)) ? `✅ ${player.reversedTechnique?.name || "Mastered"}` : "❌ Locked",
    ""
  ]

  const techniqueName = player.technique?.name
  const isTenShadows = techniqueName === "Ten Shadows Technique" || techniqueName === "Ten Shadows"
  if (isTenShadows) {
    const shikigamiCount = player.shikigamiMastery?.conquered?.length || 0
    lines.push("━━━━━━━━━━━━━━━━━━━━")
    lines.push("")
    lines.push("🐉 Ten Shadows")
    lines.push(`Shikigami Conquered: ${shikigamiCount}/10`)
    if (player.activeShikigami) {
      const activeShiki = TechniqueMasteryService.getShikigamiById(player.activeShikigami)
      if (activeShiki) {
        lines.push(`Active: ${activeShiki.emoji} ${activeShiki.name}`)
      }
    }
    lines.push("")
  }

  lines.push(
    "━━━━━━━━━━━━━━━━━━━━",
    "",
    `Available SP: ${player.skillPoints || 0}`,
    "",
    "Usage: /sp <attribute> <amount>",
    "Supported: hp, ce, strength, defense, speed, intelligence, luck, stamina, techniquecontrol"
  )

  const repTitle = ReputationTitleService.getReputationTitle(player.reputation)
  if (repTitle) {
    lines.push("")
    lines.push("━━━━━━━━━━━━━━━━━━━━")
    lines.push("")
    lines.push(`Reputation: ${(player.reputation || 0).toLocaleString()}`)
    lines.push(`Reputation Title: ${repTitle.title}`)
  }

  await sendQuotedWithFooter(sock, remoteJid, lines.join("\n"), message)
}

export async function handleSpendPoints(sock, message) {
  const remoteJid = message.key.remoteJid
  const sender = message.key.participant || remoteJid
  const phoneNumber = sender.split("@")[0]

  const player = await loadPlayerByPhone(phoneNumber)
  if (!player) {
    await sendQuotedWithFooter(sock, remoteJid, "You need to register first.\n\nUse /start to begin.", message)
    return
  }

  const text = (message.message.conversation || message.message.extendedTextMessage?.text || "").trim()
  const args = text.split(" ")
  if (args.length < 3) {
    await sendQuotedWithFooter(sock, remoteJid, "Usage: /sp <attribute> <amount>", message)
    return
  }

  const attribute = args[1].toLowerCase()
  const amount = parseInt(args[2], 10)

  const validAttributes = ["hp", "ce", "strength", "defense", "speed", "intelligence", "luck", "stamina", "techniquecontrol"]
  if (!validAttributes.includes(attribute)) {
    await sendQuotedWithFooter(sock, remoteJid, "Invalid attribute. Supported: hp, ce, strength, defense, speed, intelligence, luck, stamina, techniquecontrol", message)
    return
  }

  const availableSp = player.skillPoints || 0
  if (amount > availableSp) {
    await sendQuotedWithFooter(sock, remoteJid, `Not enough SP. You have ${availableSp}.`, message)
    return
  }

  const scaling = getSpScaling(attribute)
  if (!scaling) {
    await sendQuotedWithFooter(sock, remoteJid, "Invalid attribute.", message)
    return
  }

  player.skillPoints = availableSp - amount
  player.totalSpentSkillPoints = (player.totalSpentSkillPoints || 0) + amount
  player.baseStats = player.baseStats || {}

  if (attribute === "hp") {
    player.baseStats.hp = (player.baseStats.hp || 0) + (scaling * amount)
    player.maxHealth = (player.maxHealth || 0) + (scaling * amount)
    player.health = (player.health || 0) + (scaling * amount)
  } else if (attribute === "ce") {
    player.baseStats.ce = (player.baseStats.ce || 0) + (scaling * amount)
    player.maxCursedEnergy = (player.maxCursedEnergy || 0) + (scaling * amount)
    player.cursedEnergy = (player.cursedEnergy || 0) + (scaling * amount)
  } else if (attribute === "strength") {
    player.baseStats.strength = (player.baseStats.strength || 0) + (scaling * amount)
    player.strength = (player.strength || 0) + (scaling * amount)
  } else if (attribute === "defense") {
    player.baseStats.defense = (player.baseStats.defense || 0) + (scaling * amount)
    player.defense = (player.defense || 0) + (scaling * amount)
  } else if (attribute === "speed") {
    player.baseStats.speed = (player.baseStats.speed || 0) + (scaling * amount)
    player.speed = (player.speed || 0) + (scaling * amount)
  } else if (attribute === "intelligence") {
    player.baseStats.intelligence = (player.baseStats.intelligence || 0) + (scaling * amount)
    player.intelligence = (player.intelligence || 0) + (scaling * amount)
  } else if (attribute === "luck") {
    player.baseStats.luck = (player.baseStats.luck || 0) + (scaling * amount)
    player.luck = (player.luck || 0) + (scaling * amount)
  } else if (attribute === "stamina") {
    player.baseStats.stamina = (player.baseStats.stamina || 0) + (scaling * amount)
  } else if (attribute === "techniquecontrol") {
    player.baseStats.techniqueControl = (player.baseStats.techniqueControl || 0) + (scaling * amount)
  }

  await savePlayer(player)
  await sendQuotedWithFooter(sock, remoteJid, `+${amount} ${attribute} allocated. Remaining SP: ${player.skillPoints || 0}`, message)
}
