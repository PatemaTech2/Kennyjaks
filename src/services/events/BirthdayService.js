export class BirthdayService {
  static BONUS = {
    baseCakeCurrency: 50,
    levelBonus: 5,
    streakBonus: 10,
    loyaltyBonus: 2
  }

  static GIFTS = [
    { item: "🎂 Birthday Cake", value: 100, rare: false },
    { item: "🎈 Party Balloon Pack", value: 50, rare: false },
    { item: "🎁 Mystery Gift Box", value: 75, rare: true },
    { item: "✨ Birthday Wish Token", value: 200, rare: true },
    { item: "👑 Birthday Crown", value: 150, rare: false },
    { item: "🎊 Confetti Blast", value: 50, rare: false }
  ]

  static isEventActive(date = new Date()) {
    const month = date.getMonth() + 1
    const day = date.getDate()
    return month === 9 && (day === 15 || day === 16)
  }

  static calculateBonus(player) {
    const base = this.BONUS.baseCakeCurrency
    const levelBonus = (player.level || 1) * this.BONUS.levelBonus
    const streakBonus = (player.dailyCheckInStreak || 0) * this.BONUS.streakBonus
    
    const registrationDate = player.registrationDate ? new Date(player.registrationDate) : new Date()
    const accountAgeDays = Math.floor((Date.now() - registrationDate.getTime()) / (1000 * 60 * 60 * 24))
    const loyaltyBonus = Math.floor(accountAgeDays / 30) * this.BONUS.loyaltyBonus

    const totalCake = base + levelBonus + streakBonus + loyaltyBonus
    const randomGift = this.GIFTS[Math.floor(Math.random() * this.GIFTS.length)]

    return {
      totalCake,
      base,
      levelBonus,
      streakBonus,
      loyaltyBonus,
      randomGift,
      accountAgeDays
    }
  }

  static async giveBirthdayBonus(player) {
    const bonus = this.calculateBonus(player)
    
    player.birthdayCakeCurrency = (player.birthdayCakeCurrency || 0) + bonus.totalCake
    player.totalBirthdayBonuses = (player.totalBirthdayBonuses || 0) + 1
    player.lastBirthdayBonusDate = new Date().toISOString()
    player.isBirthdayEventActive = true
    player.birthdayGifts = player.birthdayGifts || []
    player.birthdayGifts.push(bonus.randomGift)

    return bonus
  }

  static getBroadcastMessage() {
    return `🎉🎉🎉 BIRTHDAY BROADCAST 🎉🎉🎉

🎂 Happy Birthday Benimaru! 🎂

Many more years and beautiful projects like this one to come!
I hope you have a good day!

The entire kennyjaks society wishes you a great day!

May your code be bug-free 🐛❌
May your servers stay up 🟢
May your projects be legendary 🔥

From everyone in the kennyjaks family to you!

🎉🎉🎉`
  }
}
