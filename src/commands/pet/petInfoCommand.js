import { sendQuotedWithFooter } from "../../utils/messageHelper.js"
import { loadPlayerByPhone } from "../../database/playerRepo.js"
import { PetService } from "../../services/pet/PetService.js"

export async function handlePetInfo(sock, message) {
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

  let petName
  if (args.length > 1) {
    petName = args.slice(1).join(" ").toLowerCase()
  }

  let pet = null
  if (petName) {
    pet = (player.pets || []).find(p =>
      ((p.nickname || p.name || "")).toLowerCase() === petName ||
      (p.name || "").toLowerCase() === petName
    )
  } else {
    pet = PetService.getPetById(player, player.activePet)
  }

  if (!pet) {
    await sendQuotedWithFooter(sock, remoteJid, "Pet not found. Use /pets to see your shikigami.", message)
    return
  }

  const displayName = pet.nickname || pet.name || "Unknown"
  const isEquipped = pet.id === player.activePet

  const lines = [
    "━━━━━━━━━━━━━━━━━━━━━━",
    "🐉 SHIKIGAMI PROFILE",
    "━━━━━━━━━━━━━━━━━━━━━━",
    "",
    `Name: ${displayName}`,
    `Species: ${pet.species || pet.name || "Unknown"}`,
    `Level: ${pet.level || 1}`,
    `HP: ${pet.hp || 0} / ${pet.maxHp || 0}`,
    `CE: ${pet.cursedEnergy || pet.ce || 0} / ${pet.maxCursedEnergy || pet.maxCe || 0}`,
    `Skills: ${(pet.activeTechniques || pet.skills || []).join(", ") || "None"}`,
    `Affinity: ${pet.rarity || "Unknown"}`,
    `Mood: ${pet.mood || "Neutral"}`,
    `Bond: ${pet.loyalty || pet.bond || 0}%`,
    `Evolution Stage: ${pet.evolutionStage || 0}`,
  ]

  if (isEquipped) {
    lines.push("")
    lines.push("★ Currently equipped")
  }

  lines.push("")
  lines.push("━━━━━━━━━━━━━━━━━━━━━━")

  await sendQuotedWithFooter(sock, remoteJid, lines.join("\n"), message)
}
