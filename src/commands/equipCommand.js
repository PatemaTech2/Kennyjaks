import { sendQuotedWithFooter } from "../utils/messageHelper.js"
import { loadPlayerByPhone, savePlayer } from "../database/playerRepo.js"
import { parseItemName, findItemByName } from "../utils/itemNameParser.js"

const validTypes = ["weapon", "armor", "accessory", "uniform"]

export async function handleEquip(sock, message) {
  const remoteJid = message.key.remoteJid
  const sender = message.key.participant || remoteJid
  const phoneNumber = sender.split("@")[0]

  const player = await loadPlayerByPhone(phoneNumber)
  if (!player) {
    await sendQuotedWithFooter(sock, remoteJid, "You need to register first.\n\nUse /start to begin.", message)
    return
  }

  const text = (message.message?.conversation || message.message?.extendedTextMessage?.text || "").trim()

  const shorthandMatch = text.match(/^\/equip-(\w+)(?:\s+(.*))?$/)
  if (shorthandMatch) {
    const inferredType = shorthandMatch[1].toLowerCase()
    const rawItemName = shorthandMatch[2] || ""
    await doEquip(sock, message, player, phoneNumber, remoteJid, inferredType, rawItemName)
    return
  }

  const args = text.split(" ")

  if (args.length < 2) {
    await sendQuotedWithFooter(sock, remoteJid, "Usage:\n/equip weapon <name>\n/equip armor <name>\n/equip <weapon-name>\nExample: /equip katana", message)
    return
  }

  if (args.length < 3) {
    await doEquip(sock, message, player, phoneNumber, remoteJid, "weapon", args[1])
    return
  }

  const type = args[1].toLowerCase()
  const rawItemName = args.slice(2).join(" ")
  await doEquip(sock, message, player, phoneNumber, remoteJid, type, rawItemName)
}

async function doEquip(sock, message, player, phoneNumber, remoteJid, type, rawItemName) {
  if (!validTypes.includes(type)) {
    await sendQuotedWithFooter(sock, remoteJid, "Invalid type. Use: weapon, armor, accessory, uniform", message)
    return
  }

  const itemName = parseItemName(rawItemName)
  if (!itemName) {
    await sendQuotedWithFooter(sock, remoteJid, "Usage: /equip <type> <item-name>\nExample: /equip weapon iron-katana", message)
    return
  }

  player.inventory = player.inventory || []

  const typeFilter = type === "uniform" ? "armor" : type
  const typeItems = player.inventory.filter(i => i.type === typeFilter || i.type === "uniform")
  const item = findItemByName(itemName, typeItems)

  if (!item) {
    if (typeItems.length === 0) {
      await sendQuotedWithFooter(sock, remoteJid, `You don't have any ${type}s in your inventory.`, message)
      return
    }
    await sendQuotedWithFooter(sock, remoteJid, `You don't have a ${type} named "${itemName}" in your inventory.`, message)
    return
  }

  const stats = item.stats || item.effect || {}

  player.equippedItems = player.equippedItems || {}
  player[equipKey(type)] = item.name

  const statBoosts = []
  if (stats.health) { player.maxHealth += stats.health; player.health += stats.health; statBoosts.push(`HP +${stats.health}`) }
  if (stats.attack) { player.strength += stats.attack; statBoosts.push(`ATK +${stats.attack}`) }
  if (stats.defense) { player.defense += stats.defense; statBoosts.push(`DEF +${stats.defense}`) }
  if (stats.cursedEnergy) { player.maxCursedEnergy += stats.cursedEnergy; player.cursedEnergy += stats.cursedEnergy; statBoosts.push(`CE +${stats.cursedEnergy}`) }
  if (stats.speed) { player.speed += stats.speed; statBoosts.push(`SPD +${stats.speed}`) }
  if (stats.critRate) { player.critRate = (player.critRate || 0) + stats.critRate; statBoosts.push(`CRIT +${stats.critRate}%`) }
  if (stats.accuracy) { player.accuracy = (player.accuracy || 0) + stats.accuracy; statBoosts.push(`ACC +${stats.accuracy}%`) }
  if (stats.blockChance) { player.blockChance = (player.blockChance || 0) + stats.blockChance; statBoosts.push(`BLOCK +${stats.blockChance}%`) }

  player.equippedItems[type] = {
    name: item.name,
    stats: stats,
    icon: item.icon || "📦",
    type: item.type,
    durability: item.durability || stats.maxDurability || null,
    maxDurability: item.maxDurability || stats.maxDurability || null,
    skills: item.skills || null,
    passive: item.passive || null,
    weight: item.weight || null,
    rarity: item.rarity || null,
    crafted: item.crafted || false,
    isCursed: item.isCursed || false,
    isLiving: item.isLiving || false,
    customName: item.customName || null
  }

  const durLine = []
  if (type === "weapon" && player.equippedItems[type].durability) {
    durLine.push(`Durability: ${player.equippedItems[type].durability}/${player.equippedItems[type].maxDurability}`)
  }

  await savePlayer(player)

  const skills = item.skills || []
  const commandsList = []
  if (type === "weapon") {
    commandsList.push("In battle, use:")
    commandsList.push(`  /w  - ${skills[0] || "Basic Attack"}`)
    commandsList.push(`  /w1 - ${skills[1] || "Heavy Attack"}`)
    commandsList.push(`  /w2 - ${skills[2] || "Special Attack"}`)
  }

  const response = [
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    "✅ EQUIPPED",
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    "",
    `Item: ${item.icon || "📦"} ${item.name || "Unknown"}`,
    `Type: ${type}`,
    statBoosts.length > 0 ? `Stats: ${statBoosts.join(", ")}` : "",
    item.passive ? `Passive: ${item.passive}` : "",
    ...durLine,
    ...commandsList,
    "",
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  ].filter(Boolean).join("\n")

  await sendQuotedWithFooter(sock, remoteJid, response, message)
}

function equipKey(type) {
  return `equipped${type.charAt(0).toUpperCase() + type.slice(1)}`
}
