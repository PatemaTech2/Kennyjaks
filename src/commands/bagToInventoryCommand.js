import { sendQuotedWithFooter } from "../utils/messageHelper.js"
import { loadPlayerByPhone, savePlayer } from "../database/playerRepo.js"
import { parseItemName, findItemIndexByName } from "../utils/itemNameParser.js"

export async function handleBagToInventory(sock, message) {
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
    await sendQuotedWithFooter(sock, remoteJid, "Usage: /b2i <item>\nExample: /b2i katana", message)
    return
  }

  const rawItemName = args.slice(1).join(" ")
  const itemName = parseItemName(rawItemName)
  player.inventory = player.inventory || []
  player.bagInventory = player.bagInventory || []

  const itemIndex = findItemIndexByName(itemName, player.bagInventory)
  if (itemIndex === -1) {
    await sendQuotedWithFooter(sock, remoteJid, `You don't have "${itemName}" in your bag.`, message)
    return
  }

  const usedSlots = player.inventory.reduce((sum, i) => sum + (i.quantity || 1), 0)
  if (usedSlots >= player.inventoryCapacity) {
    await sendQuotedWithFooter(sock, remoteJid, "Your inventory is full.", message)
    return
  }

  const item = player.bagInventory[itemIndex]
  player.inventory.push({ ...item })
  player.bagInventory.splice(itemIndex, 1)

  await savePlayer(player)

  await sendQuotedWithFooter(sock, remoteJid, `Moved ${item.name || "Unknown Item"} to inventory.`, message)
}
