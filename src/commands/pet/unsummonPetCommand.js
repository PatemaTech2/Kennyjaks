import { sendQuotedWithFooter } from "../../utils/messageHelper.js"
import { loadPlayerByPhone, savePlayer } from "../../database/playerRepo.js"
import { PetService } from "../../services/pet/PetService.js"

export async function handleUnsummonPet(sock, message) {
  const remoteJid = message.key.remoteJid
  const sender = message.key.participant || remoteJid
  const phoneNumber = sender.split("@")[0]

  const player = await loadPlayerByPhone(phoneNumber)
  if (!player) {
    await sendQuotedWithFooter(sock, remoteJid, "You need to register first.\n\nUse /start to begin.", message)
    return
  }

  const result = await PetService.unsummonPet(player)
  if (result.success) {
    let msg = "Pet has been unsummoned and stored."

    if (player.activeShikigami) {
      const { TechniqueMasteryService } = await import("../../services/technique/TechniqueMasteryService.js")
      const shiki = TechniqueMasteryService.getShikigamiById(player.activeShikigami)
      if (shiki) {
        msg += `\n\n${shiki.emoji} ${shiki.name} is still summoned for battle.`
      }
    }

    await savePlayer(player)
    await sendQuotedWithFooter(sock, remoteJid, msg, message)
  }
}
