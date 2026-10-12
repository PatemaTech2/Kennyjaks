import { sendQuotedWithFooter } from "../../utils/messageHelper.js"
import { loadPlayerByPhone } from "../../database/playerRepo.js"
import { PetService } from "../../services/pet/PetService.js"

export async function handlePet(sock, message) {
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
    await sendQuotedWithFooter(sock, remoteJid, "You don't have an active pet.\nHatch an egg first!", message)
    return
  }

  const displayName = pet.nickname || pet.name || "Unknown"
  const lines = [
    "╔════════════════════════╗",
    "       SHIKIGAMI",
    "╚════════════════════════╝",
    "",
    "Name:",
    displayName,
    "",
    "Species:",
    pet.species || "Unknown",
    "",
    "Rank:",
    pet.rank || "Unknown",
    "",
    "Level:",
    pet.level || 1,
    "",
    "HP",
    `${pet.hp || 0}/${pet.maxHp || 0}`,
    "",
    "Loyalty",
    `${pet.loyalty || 0}%`,
    "",
    "Hunger",
    `${pet.hunger || 0}%`,
    "",
    "Mood",
    pet.mood || "Neutral",
    "",
    "Attack",
    pet.attack || 0,
    "",
    "Defense",
    pet.defense || 0,
    "",
    "Speed",
    pet.speed || 0,
    "",
    "Technique",
    pet.activeTechniques?.[0] || "None",
    "",
    "Owner",
    `@${player.name || "Unknown"}`
  ]

  await sendQuotedWithFooter(sock, remoteJid, lines.join("\n"), message)
}
