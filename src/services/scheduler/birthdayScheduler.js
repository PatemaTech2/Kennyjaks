import { giveBirthdayBonusToAll, sendBirthdayBroadcast } from "../events/birthdayBroadcast.js"
import { BirthdayService } from "../events/BirthdayService.js"

let birthdayActive = false
let broadcastInterval = null
let endTimeout = null

export function initBirthdayScheduler(sock) {
  console.log("[Birthday Scheduler] Initialized - checking every 60s")

  setInterval(async () => {
    const now = new Date()
    const isActive = BirthdayService.isEventActive(now)

    if (isActive && !birthdayActive) {
      await startBirthdayEvent(sock)
    } else if (!isActive && birthdayActive) {
      await endBirthdayEvent(sock)
    }
  }, 60000)
}

async function startBirthdayEvent(sock) {
  birthdayActive = true
  console.log("[Birthday Scheduler] 🎉 Starting Birthday Event!")

  await giveBirthdayBonusToAll()
  await sendBirthdayBroadcast(sock)

  broadcastInterval = setInterval(async () => {
    if (!birthdayActive) return
    await sendBirthdayBroadcast(sock)
  }, 2 * 60 * 60 * 1000)

  const now = new Date()
  const endTime = new Date(now.getFullYear(), 8, 16, 23, 59, 59)
  const msUntilEnd = endTime.getTime() - now.getTime()

  if (msUntilEnd > 0) {
    endTimeout = setTimeout(async () => {
      await endBirthdayEvent(sock)
    }, msUntilEnd)
  }
}

async function endBirthdayEvent(sock) {
  birthdayActive = false

  if (broadcastInterval) {
    clearInterval(broadcastInterval)
    broadcastInterval = null
  }

  if (endTimeout) {
    clearTimeout(endTimeout)
    endTimeout = null
  }

  console.log("[Birthday Scheduler] Birthday event ended!")
}

export function isBirthdayActive() {
  return birthdayActive
}
