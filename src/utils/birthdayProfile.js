import { ProfileCharacterSheet } from "../canvas/profileCharacterSheet.js"
import { BirthdayService } from "../services/events/BirthdayService.js"

export async function renderProfileCard(player, sock, remoteJid) {
  const isBirthday = BirthdayService.isEventActive()
  const renderer = new ProfileCharacterSheet()

  if (sock && remoteJid) {
    renderer.setAvatarContext(sock, remoteJid)
  }

  const buffer = await renderer.render(player)

  if (isBirthday) {
    return addBirthdayOverlay(buffer, player)
  }

  return buffer
}

function addBirthdayOverlay(buffer, player) {
  // Simple birthday overlay - in a real implementation you'd use canvas
  // For now, we'll just return the buffer as-is
  // The birthday bonus info will be shown in text form
  return buffer
}

export function getBirthdayBonusText(player) {
  if (!BirthdayService.isEventActive()) return null

  const bonus = BirthdayService.calculateBonus(player)
  return `🎂 BIRTHDAY BONUS 🎂
+${bonus.totalCake} Cake Points
${bonus.randomGift.item}`
}

export function isBirthdayEventActive() {
  return BirthdayService.isEventActive()
}
