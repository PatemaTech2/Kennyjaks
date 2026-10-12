import { sendQuotedWithFooter } from "../../utils/messageHelper.js"
import { loadPlayerByPhone, savePlayer } from "../../database/playerRepo.js"
import { PetService } from "../../services/pet/PetService.js"

export async function handlePetRename(sock, message) {
  const remoteJid = message.key.remoteJid
  const sender = message.key.participant || remoteJid
  const phoneNumber = sender.split("@")[0]

  const player = await loadPlayerByPhone(phoneNumber)
  if (!player) {
    await sendQuotedWithFooter(sock, remoteJid, "You need to register first.\n\nUse /start to begin.", message)
    return
  }

  const text = (message.message?.conversation || message.message?.extendedTextMessage?.text || "").trim()
  const args = text.split(" ")
  if (args.length < 2) {
    await sendQuotedWithFooter(sock, remoteJid, "Usage: /pet-rename <new-name>", message)
    return
  }

  const newName = args.slice(1).join(" ")
  const pet = player.activePet ? PetService.getPetById(player, player.activePet) : null

  if (!pet) {
    await sendQuotedWithFooter(sock, remoteJid, "You don't have an active pet. Equip one first.", message)
    return
  }

  const result = await PetService.renamePet(player, pet.id, newName)
  if (result.error) {
    await sendQuotedWithFooter(sock, remoteJid, result.error, message)
    return
  }

  await sendQuotedWithFooter(sock, remoteJid, `✅ Your shikigami has been renamed to ${newName}!`, message)
}
