import { sendQuotedWithFooter } from "../utils/messageHelper.js"
import { loadPlayerByPhone, savePlayer } from "../database/playerRepo.js"
import { parseItemName, findItemIndexByName } from "../utils/itemNameParser.js"

export async function handleInventoryToBag(sock, message) {
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
  if (args.length < 2) {
    await sendQuotedWithFooter(sock, remoteJid, "Usage: /i2b <item>\nExample: /i2b katana", message)
    return
  }

  const rawItemName = args.slice(1).join(" ")
  const itemName = parseItemName(rawItemName)
  player.inventory = player.inventory || []
  player.bagInventory = player.bagInventory || []

  const itemIndex = findItemIndexByName(itemName, player.inventory)
  if (itemIndex === -1) {
    await sendQuotedWithFooter(sock, remoteJid, `You don't have "${itemName}" in your inventory.`, message)
    return
  }

  if (!player.equippedBag) {
    await sendQuotedWithFooter(sock, remoteJid, "You don't have a bag equipped.\nPurchase one from /shop-bag", message)
    return
  }

  const bagMax = player.bagCapacity === 9999 ? Infinity : player.bagCapacity
  if (player.bagInventory.length >= bagMax) {
    await sendQuotedWithFooter(sock, remoteJid, "Your bag is full.", message)
    return
  }

  const item = player.inventory[itemIndex]
  player.bagInventory.push({ ...item })
  player.inventory.splice(itemIndex, 1)

  await savePlayer(player)

  await sendQuotedWithFooter(sock, remoteJid, `Moved ${item.name || "Unknown Item"} to bag.`, message)
}
