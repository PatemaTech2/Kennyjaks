import { savePlayer } from "../../database/playerRepo.js"
import { addXp } from "../LevelUpService.js"

const DAILY_RESET_HOURS = 20

function getTodayKey() {
  const now = new Date()
  return `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`
}

export class DailyService {
  static needsReset(player) {
    const now = Date.now()
    const lastReset = new Date(player.lastDailyReset)
    const hoursSinceReset = (now - lastReset) / (1000 * 60 * 60)
    return hoursSinceReset >= DAILY_RESET_HOURS
  }

  static resetDaily(player) {
    player.dailyChecklist = {
      salaryClaimed: false,
      dailyMissionCompleted: false,
      cursesDefeated: 0,
      petFed: false,
      techniqueTrained: false,
      blackMarketVisited: false,
      investigationCompleted: false,
      allCompleted: false
    }
    player.lastDailyReset = Date.now()
    player.dailySalaryClaimed = false
  }

  static ensureDailyReset(player) {
    if (this.needsReset(player)) {
      this.resetDaily(player)
    }
  }

  static async claimSalary(player) {
    this.ensureDailyReset(player)
    if (player.dailyChecklist.salaryClaimed) {
      return { error: "Daily salary already claimed." }
    }

    player.wallet += 5000
    player.dailyChecklist.salaryClaimed = true
    await this.checkAllCompleted(player)
    await savePlayer(player)
    return { success: true, amount: 5000, wallet: player.wallet }
  }

  static async completeDailyMission(player) {
    this.ensureDailyReset(player)
    if (player.dailyChecklist.dailyMissionCompleted) {
      return { error: "Daily mission already completed." }
    }

    player.dailyChecklist.dailyMissionCompleted = true
    await this.checkAllCompleted(player)
    await savePlayer(player)
    return { success: true }
  }

  static async defeatCurse(player) {
    this.ensureDailyReset(player)
    if (player.dailyChecklist.cursesDefeated >= 3) {
      return { error: "Daily curse limit reached." }
    }

    player.dailyChecklist.cursesDefeated += 1
    await this.checkAllCompleted(player)
    await savePlayer(player)
    return { success: true, count: player.dailyChecklist.cursesDefeated }
  }

  static async feedPet(player) {
    this.ensureDailyReset(player)
    if (player.dailyChecklist.petFed) {
      return { error: "Pet already fed today." }
    }

    player.dailyChecklist.petFed = true
    await this.checkAllCompleted(player)
    await savePlayer(player)
    return { success: true }
  }

  static async trainTechnique(player) {
    this.ensureDailyReset(player)
    if (player.dailyChecklist.techniqueTrained) {
      return { error: "Technique already trained today." }
    }

    player.dailyChecklist.techniqueTrained = true
    await this.checkAllCompleted(player)
    await savePlayer(player)
    return { success: true }
  }

  static async visitBlackMarket(player) {
    this.ensureDailyReset(player)
    if (player.dailyChecklist.blackMarketVisited) {
      return { error: "Black market already visited today." }
    }

    player.dailyChecklist.blackMarketVisited = true
    await this.checkAllCompleted(player)
    await savePlayer(player)
    return { success: true }
  }

  static async completeInvestigation(player) {
    this.ensureDailyReset(player)
    if (player.dailyChecklist.investigationCompleted) {
      return { error: "Investigation already completed today." }
    }

    player.dailyChecklist.investigationCompleted = true
    await this.checkAllCompleted(player)
    await savePlayer(player)
    return { success: true }
  }

  static async checkAllCompleted(player) {
    const checklist = player.dailyChecklist
    if (
      checklist.salaryClaimed &&
      checklist.dailyMissionCompleted &&
      checklist.cursesDefeated >= 3 &&
      checklist.petFed &&
      checklist.techniqueTrained &&
      checklist.blackMarketVisited &&
      checklist.investigationCompleted &&
      !checklist.allCompleted
    ) {
      checklist.allCompleted = true
      player.wallet += 15000
      player.skillPoints += 3
      addXp(player, 2500)
      await savePlayer(player)
      return true
    }
    return false
  }

  static getProgress(player) {
    this.ensureDailyReset(player)
    const checklist = player.dailyChecklist
    const tasks = [
      { key: "salaryClaimed", label: "Claim Daily Salary", emoji: "💰", done: checklist.salaryClaimed },
      { key: "dailyMissionCompleted", label: "Complete Daily Mission", emoji: "📜", done: checklist.dailyMissionCompleted },
      { key: "cursesDefeated", label: "Defeat 3 Curses", emoji: "⚔️", done: checklist.cursesDefeated >= 3, progress: `${checklist.cursesDefeated}/3` },
      { key: "petFed", label: "Feed Shikigami", emoji: "🐾", done: checklist.petFed },
      { key: "techniqueTrained", label: "Train Technique", emoji: "🎯", done: checklist.techniqueTrained },
      { key: "blackMarketVisited", label: "Visit Black Market", emoji: "🏪", done: checklist.blackMarketVisited },
      { key: "investigationCompleted", label: "Complete Investigation", emoji: "🔍", done: checklist.investigationCompleted }
    ]

    const completed = tasks.filter(t => t.done).length
    const allDone = checklist.allCompleted

    return { tasks, completed, total: tasks.length, allDone }
  }

  static checkIn(player) {
    const now = new Date()
    const today = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`
    const lastCheckIn = player.lastDailyCheckIn

    if (lastCheckIn === today) {
      return { success: false, message: "You have already checked in today." }
    }

    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayKey = `${yesterday.getFullYear()}-${yesterday.getMonth() + 1}-${yesterday.getDate()}`

    if (lastCheckIn === yesterdayKey) {
      player.dailyCheckInStreak = (player.dailyCheckInStreak || 0) + 1
    } else if (lastCheckIn !== today) {
      player.dailyCheckInStreak = 1
    }

    player.lastDailyCheckIn = today
    player.kenTokens = (player.kenTokens || 0) + 0.05

    if (player.dailyCheckInStreak >= 7) {
      player.kenTokens += 50
      player.dailyCheckInStreak = 0
      savePlayer(player)
      return { success: true, message: "Daily check-in completed! +0.05 Ken Tokens\n🔥 7-day streak bonus! +50 Ken Tokens", streak: 0, kenTokens: player.kenTokens }
    }

    savePlayer(player)
    return { success: true, message: `Daily check-in completed! +0.05 Ken Tokens\nStreak: ${player.dailyCheckInStreak} days`, streak: player.dailyCheckInStreak, kenTokens: player.kenTokens }
  }

  static exchangeKenTokens(player, amount) {
    if (!player.kenTokens || player.kenTokens < amount) {
      return { success: false, message: "Not enough Ken Tokens." }
    }

    const yenValue = amount * 4000
    player.kenTokens -= amount
    player.wallet += yenValue
    savePlayer(player)
    return { success: true, message: `Exchanged ${amount} Ken Tokens for ¥${yenValue.toLocaleString()}`, yenValue, kenTokens: player.kenTokens }
  }
}
