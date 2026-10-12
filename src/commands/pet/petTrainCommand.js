import { sendQuotedWithFooter } from "../../utils/messageHelper.js"
import { loadPlayerByPhone, savePlayer } from "../../database/playerRepo.js"
import { PetService } from "../../services/pet/PetService.js"

export async function handlePetTrain(sock, message) {
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
  const petName = args.slice(1).join(" ").toLowerCase()

  let pet
  if (petName) {
    pet = (player.pets || []).find(p =>
      ((p.nickname || p.name || "")).toLowerCase() === petName ||
      (p.name || "").toLowerCase() === petName
    )
  } else {
    pet = PetService.getPetById(player, player.activePet)
  }

  if (!pet) {
    await sendQuotedWithFooter(sock, remoteJid, "No pet found. Use /pet-train <name> or equip a pet with /pet-equip first.", message)
    return
  }

  if (pet.status === "Unconscious") {
    await sendQuotedWithFooter(sock, remoteJid, `${pet.nickname || pet.name || "Your pet"} is unconscious. Revive with /pet-heal first.`, message)
    return
  }

  const xpGain = Math.floor(50 + Math.random() * 50)
  pet.xp = (pet.xp || 0) + xpGain

  const prevLevel = pet.level || 1
  await PetService.checkLevelUp(player, pet)

  let msg = ["━━━━━━━━━━━━━━━━━━━━━━", "🏋️ PET TRAINING", "━━━━━━━━━━━━━━━━━━━━━━", ""]
  msg.push(`${pet.nickname || pet.name || "Unknown"} gained ${xpGain} XP!`)

  if (pet.level > prevLevel) {
    msg.push("")
    msg.push(`✨ LEVEL UP! ${prevLevel} → ${(pet.level || 1)}`)
    msg.push(`HP: ${pet.maxHp || 0}`)
    msg.push(`Atk: ${pet.attack || 0}`)
    msg.push(`Def: ${pet.defense || 0}`)
    msg.push(`Spd: ${pet.speed || 0}`)

    if (pet.level % 10 === 0 && pet.evolutionPath) {
      const req = pet.evolutionPath.requirements
      if (pet.level >= req.level) {
        msg.push("")
        msg.push(`Potential evolution available at Lv${req.level}!`)
        msg.push("Use /pet-evolve to evolve!")
      }
    }
  }

  await savePlayer(player)
  msg.push("")
  msg.push(`Total XP: ${pet.xp || 0}`)
  msg.push(`Next level: ${((pet.level || 1) * 100)} XP`)
  await sendQuotedWithFooter(sock, remoteJid, msg.join("\n"), message)
}
