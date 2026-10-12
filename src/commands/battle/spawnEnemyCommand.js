import { sendQuotedWithFooter } from "../../utils/messageHelper.js"
import { loadPlayerByPhone, savePlayer } from "../../database/playerRepo.js"
import { spawnCurse } from "../../services/battle/CurseService.js"
import { SimpleBattleService } from "../../services/battle/SimpleBattleService.js"

export async function handleRunFromCurse(sock, message) {
  const remoteJid = message.key.remoteJid
  const sender = message.key.participant || remoteJid
  const phoneNumber = sender.split("@")[0]

  const player = await loadPlayerByPhone(phoneNumber)
  if (!player) {
    await sendQuotedWithFooter(sock, remoteJid, "You need to register first.\n\nUse /start to begin.", message)
    return
  }

  const battle = SimpleBattleService.getByPlayer(player.playerId)
  if (battle) {
    SimpleBattleService.end(battle.id)
  }

  SimpleBattleService.clearPendingEnemy(player.playerId)
  await sendQuotedWithFooter(sock, remoteJid, `You fled from the cursed energy.`, message)
}

export async function handleSpawnEnemy(sock, message) {
  const remoteJid = message.key.remoteJid
  const sender = message.key.participant || remoteJid
  const phoneNumber = sender.split("@")[0]

  const player = await loadPlayerByPhone(phoneNumber)
  if (!player) {
    await sendQuotedWithFooter(sock, remoteJid, "You need to register first.\n\nUse /start to begin.", message)
    return
  }

  const existing = SimpleBattleService.getByPlayer(player.playerId)
  if (existing) {
    await sendQuotedWithFooter(sock, remoteJid, "You are already in battle!", message)
    return
  }

  const result = await spawnCurse(player.playerId, null, player.level || 1, player.grade || 4)
  if (!result || !result.curse) {
    await sendQuotedWithFooter(sock, remoteJid, "No curses available right now. Try again later.", message)
    return
  }

  SimpleBattleService.setPendingEnemy(player.playerId, result.curse)

  const curse = result.curse
  const healthPct = Math.round((curse.hp / curse.maxHp) * 100)
  const cePct = Math.round(((curse.ce || 0) / (curse.maxCe || 1)) * 100)

  const text = `👹 ${result.isReturning ? "Returning" : "A new"} ${curse.name} has appeared!\n\n` +
    `🔴 ${curse.name}\n` +
    `Grade: ${curse.gradeLabel || "Grade 4"}\n` +
    `HP: ${curse.hp}/${curse.maxHp} (${healthPct}%)\n` +
    `CE: ${curse.ce || 0}/${curse.maxCe || 1} (${cePct}%)\n` +
    `ATK: ${curse.strength}\n` +
    `DEF: ${curse.defense}\n\n` +
    `Use /fight to engage!`

  await sendQuotedWithFooter(sock, remoteJid, text, message)
}
