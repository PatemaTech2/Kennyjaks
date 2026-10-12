import { sendQuotedWithFooter } from "../../utils/messageHelper.js"
import { loadPlayerByPhone } from "../../database/playerRepo.js"
import { PetService } from "../../services/pet/PetService.js"
import { findItemByName } from "../../utils/itemNameParser.js"

export async function handleFeedPet(sock, message) {
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
    await sendQuotedWithFooter(sock, remoteJid, "Usage: /feed <food>\nExample: /feed raw-meat", message)
    return
  }

  const rawFoodName = args.slice(1).join(" ")
  const foodName = rawFoodName.replace(/-/g, " ")

  player.inventory = player.inventory || []
  const foodItem = findItemByName(foodName, player.inventory.filter(i => i.type === "consumable"))
  if (!foodItem) {
    await sendQuotedWithFooter(sock, remoteJid, `You don't have "${foodName}" in your inventory.`, message)
    return
  }

  const pet = player.activePet ? PetService.getPetById(player, player.activePet) : null
  if (!pet) {
    await sendQuotedWithFooter(sock, remoteJid, "You don't have an active pet.", message)
    return
  }

  const result = await PetService.feedPet(player, pet.id, foodItem)
  if (result.error) {
    await sendQuotedWithFooter(sock, remoteJid, result.error, message)
    return
  }

  await sendQuotedWithFooter(sock, remoteJid, `🍖 Fed ${pet.nickname || pet.name} ${foodItem.name}.\nXP Gained: +${result.xpGain}`, message)
}
