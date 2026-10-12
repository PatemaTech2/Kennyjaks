import { sendQuotedWithFooter } from "../../utils/messageHelper.js"
import { loadPlayerByPhone } from "../../database/playerRepo.js"
import { PetService } from "../../services/pet/PetService.js"

export async function handlePetStats(sock, message) {
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
    `📊 ${pet.nickname || pet.name || "Unknown"} Stats`,
    "",
    `Level: ${pet.level || 1}`,
    `XP: ${pet.xp || 0}`,
    `HP: ${pet.hp || 0}/${pet.maxHp || 0}`,
    `Attack: ${pet.attack || 0}`,
    `Defense: ${pet.defense || 0}`,
    `Speed: ${pet.speed || 0}`,
    `Hunger: ${(pet.hunger || 0)}%`,
    `Loyalty: ${(pet.loyalty || 0)}%`,
    `Mood: ${pet.mood || "Neutral"}`,
    `Status: ${pet.status || "Healthy"}`,
    `Wins: ${pet.wins || 0}`,
    `Losses: ${pet.losses || 0}`
  ]

  await sendQuotedWithFooter(sock, remoteJid, lines.join("\n"), message)
}
