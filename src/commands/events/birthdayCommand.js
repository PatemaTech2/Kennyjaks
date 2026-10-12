import { sendQuotedWithFooter } from "../../utils/messageHelper.js"
import { loadPlayerByPhone, savePlayer } from "../../database/playerRepo.js"
import { BirthdayService } from "../../services/events/BirthdayService.js"

export async function handleBirthday(sock, message) {
  const remoteJid = message.key.remoteJid
  const sender = message.key.participant || remoteJid
  const phoneNumber = sender.split("@")[0]

  const player = await loadPlayerByPhone(phoneNumber)
  if (!player) {
    await sendQuotedWithFooter(sock, remoteJid, "You need to register first.\n\nUse /start to begin.", message)
    return
  }

  const isActive = BirthdayService.isEventActive()

  if (!isActive) {
    await sendQuotedWithFooter(sock, remoteJid, "🎂 The Birthday Event is not active right now.\nCheck back on September 15th!", message)
    return
  }

  const bonus = BirthdayService.calculateBonus(player)
  const alreadyClaimed = player.lastBirthdayBonusDate && 
    new Date(player.lastBirthdayBonusDate).toDateString() === new Date().toDateString()

  if (alreadyClaimed) {
    const lines = [
      "🎂 BIRTHDAY EVENT",
      "",
      `You already claimed your birthday bonus today!`,
      "",
      "Your Bonus:",
      `🎂 Cake Points: ${player.birthdayCakeCurrency || 0}`,
      `🎁 Gifts: ${(player.birthdayGifts || []).length}`,
      "",
      "Come back tomorrow for more!"
    ]
    await sendQuotedWithFooter(sock, remoteJid, lines.join("\n"), message)
    return
  }

  await BirthdayService.giveBirthdayBonus(player)
  await savePlayer(player)

  const lines = [
    "🎉 HAPPY BIRTHDAY BENIMARU! 🎉",
    "",
    "🎂 YOUR BIRTHDAY BONUS",
    "",
    `🎂 Cake Points: +${bonus.totalCake}`,
    `   Base: ${bonus.base}`,
    `   Level Bonus: +${bonus.levelBonus}`,
    `   Streak Bonus: +${bonus.streakBonus}`,
    `   Loyalty Bonus: +${bonus.loyaltyBonus}`,
    "",
    `🎁 Random Gift: ${bonus.randomGift.item}`,
    "",
    "Total Cake Points: " + (player.birthdayCakeCurrency || 0),
    "",
    "🎊 The entire kennyjaks society wishes you a great day!"
  ]

  await sendQuotedWithFooter(sock, remoteJid, lines.join("\n"), message)
}
