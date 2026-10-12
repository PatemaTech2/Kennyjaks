import { sendQuotedWithFooter } from "../../utils/messageHelper.js"
import { loadPlayerByPhone, savePlayer } from "../../database/playerRepo.js"
import { DailyService } from "../../services/daily/DailyService.js"

export async function handleDaily(sock, message) {
  const remoteJid = message.key.remoteJid
  const sender = message.key.participant || remoteJid
  const phoneNumber = sender.split("@")[0]

  const player = await loadPlayerByPhone(phoneNumber)
  if (!player) {
    await sendQuotedWithFooter(sock, remoteJid, "You need to register first.\n\nUse /start to begin.", message)
    return
  }

  const text = (message.message.conversation || message.message.extendedTextMessage?.text || "").trim().toLowerCase()
  const args = text.split(" ")

  if (args[0] === "/daily" && args[1] === "claim") {
    const result = await DailyService.claimSalary(player)
    if (result.error) {
      await sendQuotedWithFooter(sock, remoteJid, result.error, message)
      return
    }
    await sendQuotedWithFooter(sock, remoteJid, `💰 Daily Salary Claimed!\n\n+¥${result.amount.toLocaleString()}\nWallet: ¥${result.wallet.toLocaleString()}`, message)
    return
  }

  if (args[0] === "/daily" && args[1] === "exchange") {
    const amount = parseFloat(args[2])
    if (Number.isNaN(amount) || amount <= 0) {
      await sendQuotedWithFooter(sock, remoteJid, "Usage: /daily exchange <amount>\nExample: /daily exchange 5", message)
      return
    }
    const result = DailyService.exchangeKenTokens(player, amount)
    if (!result.success) {
      await sendQuotedWithFooter(sock, remoteJid, result.message, message)
      return
    }
    await sendQuotedWithFooter(sock, remoteJid, `✅ ${result.message}\nWallet: ¥${player.wallet.toLocaleString()}\nKen Tokens: ${player.kenTokens.toFixed(2)}`, message)
    return
  }

  if (args[0] === "/daily" && (args[1] === "checkin" || args.length === 1)) {
    const result = DailyService.checkIn(player)
    await sendQuotedWithFooter(sock, remoteJid, result.message, message)
    return
  }

  const progress = DailyService.getProgress(player)
  const lines = [
    "━━━━━━━━━━━━━━━━━━━━━━",
    "       🌅 DAILY TASKS",
    "━━━━━━━━━━━━━━━━━━━━━━",
    ""
  ]

  progress.tasks.forEach(task => {
    const status = task.done ? "✔" : "☐"
    const progressText = task.progress ? ` [${task.progress}]` : ""
    lines.push(`${status} ${task.emoji} ${task.label}${progressText}`)
  })

  lines.push("")
  lines.push(`Progress: ${progress.completed}/${progress.total}`)

  if (progress.allDone) {
    lines.push("")
    lines.push("🎉 ALL TASKS COMPLETED!")
    lines.push("")
    lines.push("Rewards:")
    lines.push("+15,000 Yen")
    lines.push("+3 Skill Points")
    lines.push("+2,500 XP")
  }

  lines.push("")
  lines.push("━━━━━━━━━━━━━━━━━━━━━━")
  lines.push(`🎫 Ken Tokens: ${player.kenTokens.toFixed(2)}`)
  lines.push(`🔥 Check-in Streak: ${player.dailyCheckInStreak || 0} days`)
  lines.push("")
  lines.push("Use /daily claim to get salary")
  lines.push("Use /daily exchange <amount> to convert Ken Tokens to Yen (1 Ken = 4,000 Yen)")
  lines.push("")
  lines.push("━━━━━━━━━━━━━━━━━━━━━━")
  lines.push("Use /daily checkin to check in daily")

  await sendQuotedWithFooter(sock, remoteJid, lines.join("\n"), message)
}
