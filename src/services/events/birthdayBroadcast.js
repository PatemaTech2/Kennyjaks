import { loadPlayerByPhone, savePlayer } from "../../database/playerRepo.js"
import { BirthdayService } from "./BirthdayService.js"

export async function giveBirthdayBonusToAll() {
  const { getAllPlayerPhones } = await import("../../database/playerRepo.js")
  const phones = await getAllPlayerPhones()

  for (const phone of phones) {
    try {
      const player = await loadPlayerByPhone(phone)
      if (!player) continue

      const bonus = await BirthdayService.giveBirthdayBonus(player)
      await savePlayer(player)

      console.log(`[Birthday Bonus] ${player.name}: +${bonus.totalCake} cake points`)
    } catch (error) {
      console.error(`[Birthday Bonus] Error for ${phone}:`, error.message)
    }
  }
}

export async function sendBirthdayBroadcast(sock) {
  const message = BirthdayService.getBroadcastMessage()
  const { getAllPlayerPhones } = await import("../../database/playerRepo.js")
  const phones = await getAllPlayerPhones()

  for (const phone of phones) {
    try {
      const jid = `${phone}@s.whatsapp.net`
      await sock.sendMessage(jid, { text: message })
      await new Promise(resolve => setTimeout(resolve, 500))
    } catch (error) {
      console.error(`[Birthday Broadcast] Error sending to ${phone}:`, error.message)
    }
  }

  console.log(`[Birthday Broadcast] Sent to ${phones.length} users`)
}
