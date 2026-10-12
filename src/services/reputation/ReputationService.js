export const REP_TITLES = [
  { min: 0, title: "Unknown Sorcerer", color: "gray" },
  { min: 50, title: "Novice Sorcerer", color: "green" },
  { min: 150, title: "Adept Sorcerer", color: "blue" },
  { min: 300, title: "Skilled Sorcerer", color: "cyan" },
  { min: 500, title: "Elite Sorcerer", color: "yellow" },
  { min: 750, title: "Master Sorcerer", color: "orange" },
  { min: 1000, title: "Notorious Sorcerer", color: "red" },
  { min: 1500, title: "Legendary Sorcerer", color: "purple" },
  { min: 2500, title: "God-Tier Sorcerer", color: "gold" }
]

export const REP_GAIN = {
  curseKill: 5,
  grade3: 10,
  grade2: 25,
  grade1: 75,
  specialGrade: 200,
  legendaryBonus: 100
}

export class ReputationService {
  static addReputation(player, amount) {
    if (!player) return 0
    player.reputation = (player.reputation || 0) + amount
    return player.reputation
  }

  static getReputation(player) {
    if (!player) return 0
    return player.reputation || 0
  }

  static getTitle(player) {
    const rep = this.getReputation(player)
    let title = REP_TITLES[0].title
    for (const tier of REP_TITLES) {
      if (rep >= tier.min) {
        title = tier.title
      }
    }
    return title
  }

  static getCurseBehavior(player) {
    const rep = this.getReputation(player)
    if (rep >= 1000) {
      return "fear"
    }
    if (rep >= 500) {
      return "interested"
    }
    if (rep >= 250) {
      return "recognized"
    }
    return "normal"
  }

  static getAmbushChance(player) {
    const rep = this.getReputation(player)
    if (rep < 1000) return 0
    return Math.min(0.5, (rep - 1000) / 5000)
  }

  static recordKillReputation(player, curseGrade) {
    const gradeMap = {
      0: REP_GAIN.specialGrade,
      1: REP_GAIN.grade1,
      2: REP_GAIN.grade2,
      3: REP_GAIN.grade3,
      4: REP_GAIN.curseKill
    }
    const baseRep = gradeMap[curseGrade] || REP_GAIN.curseKill
    return this.addReputation(player, baseRep)
  }
}
