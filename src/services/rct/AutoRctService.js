import { savePlayer } from "../../database/playerRepo.js"

const AUTO_RCT_STREAK_DAYS = 14
const AUTO_RCT_HEAL_PCT = 0.8
// Tradeoff (balance recommendation): Auto RCT reduces max CE while active.
const AUTO_RCT_CE_PENALTY_PCT = 0.35

function startOfDay(ts) {
  const d = new Date(ts)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

function dayDiff(a, b) {
  const ms = startOfDay(b) - startOfDay(a)
  return Math.floor(ms / (1000 * 60 * 60 * 24))
}

export class AutoRctService {
  // /rt-train — once per real day, for 14 consecutive days. Missing a day resets streak.
  static async train(player) {
    if (!player.hasRCT) {
      return { error: "You must awaken Reverse Cursed Technique first. Use /rt to check your status." }
    }
    if (player.autoRct?.unlocked) {
      return { error: "Auto RCT is already unlocked. Use /rct-auto to toggle it." }
    }

    const today = startOfDay(Date.now())
    const ar = player.autoRct || { unlocked: false, enabled: false, streak: 0, lastTrainDate: null, completed: false, startedAt: null }

    if (!ar.startedAt) ar.startedAt = today
    if (ar.lastTrainDate === null) ar.lastTrainDate = null

    // Already trained today
    if (ar.lastTrainDate !== null && dayDiff(ar.lastTrainDate, today) === 0) {
      return {
        alreadyToday: true,
        streak: ar.streak,
        needed: AUTO_RCT_STREAK_DAYS,
        lastTrainDate: ar.lastTrainDate
      }
    }

    // Streak continuity check: if more than 1 day passed, reset.
    if (ar.lastTrainDate !== null) {
      const gap = dayDiff(ar.lastTrainDate, today)
      if (gap > 1) {
        ar.streak = 0
        ar.startedAt = today
      }
    }

    ar.streak += 1
    ar.lastTrainDate = today

    let unlockedNow = false
    if (ar.streak >= AUTO_RCT_STREAK_DAYS) {
      ar.unlocked = true
      ar.completed = true
      ar.enabled = true
      unlockedNow = true
    }

    player.autoRct = ar
    await savePlayer(player)

    if (unlockedNow) {
      return { unlocked: true, streak: ar.streak }
    }
    return { trained: true, streak: ar.streak, needed: AUTO_RCT_STREAK_DAYS }
  }

  static toggle(player) {
    if (!player.autoRct?.unlocked) {
      return { error: "Auto RCT is not unlocked yet. Train for 14 consecutive days with /rt-train." }
    }
    player.autoRct.enabled = !player.autoRct.enabled
    return { enabled: player.autoRct.enabled }
  }

  static isEnabled(player) {
    return !!(player.autoRct && player.autoRct.unlocked && player.autoRct.enabled)
  }

  // Apply Auto RCT healing when player takes damage.
  // Heals 80% of damage taken, but CANNOT save from a lethal one-shot.
  // Returns the amount actually healed (0 if not applicable).
  static applyAutoHeal(player, damageTaken, oldHp) {
    if (!this.isEnabled(player)) return 0
    // One-shot protection: if this hit alone would kill, Auto RCT cannot activate.
    if (oldHp - damageTaken <= 0) return 0
    const heal = Math.floor(damageTaken * AUTO_RCT_HEAL_PCT)
    const newHp = Math.min(player.maxHealth, oldHp - damageTaken + heal)
    const actualHeal = Math.max(0, newHp - (oldHp - damageTaken))
    return actualHeal
  }

  static cePenaltyPct() {
    return AUTO_RCT_CE_PENALTY_PCT
  }

  static healPct() {
    return AUTO_RCT_HEAL_PCT
  }
}
