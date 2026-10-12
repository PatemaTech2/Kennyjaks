import { sendQuotedWithFooter } from "../../utils/messageHelper.js"
import { loadPlayerByPhone, savePlayer } from "../../database/playerRepo.js"
import { PetService } from "../../services/pet/PetService.js"

export async function handlePetEquip(sock, message) {
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
    const pets = player.pets || []
    if (pets.length === 0) {
      await sendQuotedWithFooter(sock, remoteJid, "You have no pets. Hatch eggs first!", message)
      return
    }
    const petList = pets.map(p => p.nickname || p.name).join(", ")
    await sendQuotedWithFooter(sock, remoteJid, `Usage: /pet-equip <name>\nYour pets: ${petList}`, message)
    return
  }

  const targetName = args.slice(1).join(" ").toLowerCase()
  const pet = (player.pets || []).find(p =>
    (p.nickname || p.name).toLowerCase() === targetName ||
    p.name.toLowerCase() === targetName
  )

  if (!pet) {
    await sendQuotedWithFooter(sock, remoteJid, `Pet "${targetName}" not found. Use /pets to see available pets.`, message)
    return
  }

  if (pet.status === "Unconscious") {
    await sendQuotedWithFooter(sock, remoteJid, `${pet.nickname || pet.name} is unconscious. Heal it first.`, message)
    return
  }

  player.activePet = pet.id
  await savePlayer(player)
  await sendQuotedWithFooter(sock, remoteJid, `🐺 ${pet.nickname || pet.name} has been equipped!`, message)
}
