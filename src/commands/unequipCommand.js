import { sendQuotedWithFooter } from "../utils/messageHelper.js"
import { loadPlayerByPhone, savePlayer } from "../database/playerRepo.js"

const validTypes = ["weapon", "armor", "accessory", "uniform"]

export async function handleUnequip(sock, message) {
  const remoteJid = message.key.remoteJid
  const sender = message.key.participant || remoteJid
  const phoneNumber = sender.split("@")[0]

  const player = await loadPlayerByPhone(phoneNumber)
  if (!player) {
    await sendQuotedWithFooter(sock, remoteJid, "You need to register first.\n\nUse /start to begin.", message)
    return
  }

  const text = (message.message?.conversation || message.message?.extendedTextMessage?.text || "").trim()

  const shorthandMatch = text.match(/^\/unequip-(\w+)$/)
  if (shorthandMatch) {
    const type = shorthandMatch[1].toLowerCase()
    await doUnequip(sock, message, player, remoteJid, type)
    return
  }

  const args = text.split(" ")
  if (args.length < 2) {
    await sendQuotedWithFooter(sock, remoteJid, "Usage: /unequip <type>\nTypes: weapon, armor, accessory, uniform", message)
    return
  }

  const type = args[1].toLowerCase()
  await doUnequip(sock, message, player, remoteJid, type)
}

async function doUnequip(sock, message, player, remoteJid, type) {
  if (!validTypes.includes(type)) {
    await sendQuotedWithFooter(sock, remoteJid, "Invalid type. Use: weapon, armor, accessory, uniform", message)
    return
  }

  player.equippedItems = player.equippedItems || {}
  const equipped = player.equippedItems[type]

  if (!equipped) {
    await sendQuotedWithFooter(sock, remoteJid, `You don't have any ${type} equipped.`, message)
    return
  }

  const stats = equipped.stats || {}

  const key = `equipped${type.charAt(0).toUpperCase() + type.slice(1)}`
  player[key] = null
  delete player.equippedItems[type]

  const statRemovals = []
  if (stats.health) { player.maxHealth -= stats.health; player.health -= stats.health; player.health = Math.max(1, player.health); statRemovals.push(`HP -${stats.health}`) }
  if (stats.attack) { player.strength -= stats.attack; statRemovals.push(`ATK -${stats.attack}`) }
  if (stats.defense) { player.defense -= stats.defense; statRemovals.push(`DEF -${stats.defense}`) }
  if (stats.cursedEnergy) { player.maxCursedEnergy -= stats.cursedEnergy; player.cursedEnergy -= stats.cursedEnergy; player.cursedEnergy = Math.max(0, player.cursedEnergy); statRemovals.push(`CE -${stats.cursedEnergy}`) }
  if (stats.speed) { player.speed -= stats.speed; statRemovals.push(`SPD -${stats.speed}`) }
  if (stats.critRate) { player.critRate = Math.max(0, (player.critRate || 0) - stats.critRate); statRemovals.push(`CRIT -${stats.critRate}%`) }
  if (stats.accuracy) { player.accuracy = Math.max(0, (player.accuracy || 0) - stats.accuracy); statRemovals.push(`ACC -${stats.accuracy}%`) }
  if (stats.blockChance) { player.blockChance = Math.max(0, (player.blockChance || 0) - stats.blockChance); statRemovals.push(`BLOCK -${stats.blockChance}%`) }

  await savePlayer(player)

  const response = [
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    "✅ UNEQUIPPED",
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    "",
    `Removed: ${equipped.icon || "📦"} ${equipped.name || "Unknown"}`,
    `Type: ${type}`,
    statRemovals.length > 0 ? `Stats removed: ${statRemovals.join(", ")}` : "",
    "",
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  ].filter(Boolean).join("\n")

  await sendQuotedWithFooter(sock, remoteJid, response, message)
}
