import { sendQuotedWithFooter } from "../../utils/messageHelper.js"
import { loadPlayerByPhone } from "../../database/playerRepo.js"
import { PetService } from "../../services/pet/PetService.js"

export async function handleRevivePet(sock, message) {
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

  if (pet.status !== "Unconscious") {
    await sendQuotedWithFooter(sock, remoteJid, "Pet is not unconscious.", message)
    return
  }

  const result = await PetService.revivePet(player, pet.id)
  if (result.success) {
    await sendQuotedWithFooter(sock, remoteJid, `💊 Revived ${pet.nickname || pet.name}!\nHP: ${pet.hp}/${pet.maxHp}`, message)
  }
}
