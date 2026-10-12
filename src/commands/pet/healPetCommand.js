import { sendQuotedWithFooter } from "../../utils/messageHelper.js"
import { loadPlayerByPhone } from "../../database/playerRepo.js"
import { PetService } from "../../services/pet/PetService.js"
import { findItemByName } from "../../utils/itemNameParser.js"

export async function handleHealPet(sock, message) {
  const remoteJid = message.key.remoteJid
  const sender = message.key.participant || remoteJid
  const phoneNumber = sender.split("@")[0]

  const player = await loadPlayerByPhone(phoneNumber)
  if (!player) {
    await sendQuotedWithFooter(sock, remoteJid, "You need to register first.\n\nUse /start to begin.", message)
    return
  }

  const pet = player.activePet ? PetService.getPetById(player, player.activePet) : null
  if (!pet) {
    await sendQuotedWithFooter(sock, remoteJid, "You don't have an active pet.", message)
    return
  }

  player.inventory = player.inventory || []
  const healItems = player.inventory.filter(i => i.effect?.heal && i.type === "consumable")
  if (healItems.length === 0) {
    await sendQuotedWithFooter(sock, remoteJid, "You have no healing items.", message)
    return
  }

  const bestItem = healItems.reduce((a, b) => (b.effect.heal || 0) > (a.effect.heal || 0) ? b : a)
  const result = await PetService.healPet(player, pet.id, bestItem)
  if (result.error) {
    await sendQuotedWithFooter(sock, remoteJid, result.error, message)
    return
  }

  await sendQuotedWithFooter(sock, remoteJid, `💊 Healed ${pet.nickname || pet.name} with ${bestItem.name}.\nHP: ${pet.hp}/${pet.maxHp}`, message)
}
