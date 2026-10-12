import { sendQuotedWithFooter } from "../../utils/messageHelper.js"
import { loadPlayerByPhone } from "../../database/playerRepo.js"
import { PetService } from "../../services/pet/PetService.js"

export async function handlePetSkills(sock, message) {
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

  const lines = [
    `✨ ${pet.nickname || pet.name || "Unknown"} Skills`,
    "",
    `Passive: ${pet.passive || "None"}`,
    "",
    "Active Techniques:"
  ]

  if (pet.activeTechniques && pet.activeTechniques.length > 0) {
    pet.activeTechniques.forEach((tech, i) => {
      lines.push(`${i + 1}. ${tech || "Unknown"}`)
    })
  } else {
    lines.push("No active techniques.")
  }

  await sendQuotedWithFooter(sock, remoteJid, lines.join("\n"), message)
}
