import { sendQuotedWithFooter } from "../utils/messageHelper.js"
import { loadPlayerByPhone, savePlayer } from "../database/playerRepo.js"
import { AutoRctService } from "../services/rct/AutoRctService.js"

export async function handleRtTrain(sock, message) {
  const remoteJid = message.key.remoteJid
  const sender = message.key.participant || remoteJid
  const phoneNumber = sender.split("@")[0]

  const player = await loadPlayerByPhone(phoneNumber)
  if (!player) {
    await sendQuotedWithFooter(sock, remoteJid, "You need to register first.\n\nUse /start to begin.", message)
    return
  }

  const result = await AutoRctService.train(player)
  if (result.error) {
    await sendQuotedWithFooter(sock, remoteJid, result.error, message)
    return
  }

  if (result.unlocked) {
    await sendQuotedWithFooter(sock, remoteJid, [
      "✨ Reverse Cursed Technique Evolution",
      "",
      "Your Reverse Cursed Energy now flows naturally.",
      "",
      "AUTO RCT UNLOCKED",
      "",
      "Command: /rct-auto",
      "",
      "While enabled, you automatically heal 80% of",
      "damage taken in battle — but a lethal one-shot",
      "will still end you."
    ].join("\n"), message)
    return
  }

  if (result.alreadyToday) {
    const remaining = Math.max(0, 14 - result.streak)
    await sendQuotedWithFooter(sock, remoteJid, [
      "⏳ Already trained today.",
      "",
      `Streak: ${result.streak}/14`,
      `Days remaining: ${remaining}`,
      "",
      "Return tomorrow to continue.",
      "Missing a day resets your streak!"
    ].join("\n"), message)
    return
  }

  const remaining = Math.max(0, 14 - result.streak)
  await sendQuotedWithFooter(sock, remoteJid, [
    "🔄 Auto RCT Training",
    "",
    `Streak: ${result.streak}/14`,
    `Days remaining: ${remaining}`,
    "",
    "Train once per real day.",
    "Missing a day resets the streak.",
    "",
    "Complete 14 consecutive days to unlock AUTO RCT."
  ].join("\n"), message)
}

export async function handleRctAuto(sock, message) {
  const remoteJid = message.key.remoteJid
  const sender = message.key.participant || remoteJid
  const phoneNumber = sender.split("@")[0]

  const player = await loadPlayerByPhone(phoneNumber)
  if (!player) {
    await sendQuotedWithFooter(sock, remoteJid, "You need to register first.\n\nUse /start to begin.", message)
    return
  }

  const result = AutoRctService.toggle(player)
  if (result.error) {
    await sendQuotedWithFooter(sock, remoteJid, result.error, message)
    return
  }

  await savePlayer(player)

  if (result.enabled) {
    await sendQuotedWithFooter(sock, remoteJid, [
      "✨ AUTO RCT ENABLED",
      "",
      "Reverse Cursed Energy flows passively.",
      `Heals 80% of damage taken in battle.`,
      "",
      "Tradeoff: Max CE reduced by 35% while active.",
      "A lethal one-shot still kills you.",
      "",
      "Use /rct-auto again to disable."
    ].join("\n"), message)
  } else {
    await sendQuotedWithFooter(sock, remoteJid, [
      "⏹ AUTO RCT DISABLED",
      "",
      "Reverse Cursed Energy no longer heals passively."
    ].join("\n"), message)
  }
}
