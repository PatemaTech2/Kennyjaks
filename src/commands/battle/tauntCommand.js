import { sendQuotedWithFooter } from "../../utils/messageHelper.js"
import { loadPlayerByPhone, savePlayer } from "../../database/playerRepo.js"
import { SimpleBattleService } from "../../services/battle/SimpleBattleService.js"
import { formatRoundDisplay } from "../../utils/battle/battleDisplay.js"

export async function handleTaunt(sock, message) {
  const remoteJid = message.key.remoteJid
  const sender = message.key.participant || remoteJid
  const phoneNumber = sender.split("@")[0]

  const player = await loadPlayerByPhone(phoneNumber)
  if (!player) {
    await sendQuotedWithFooter(sock, remoteJid, "You need to register first.\n\nUse /start to begin.", message)
    return
  }

  const battle = SimpleBattleService.getByPlayer(player.playerId)
  if (!battle) {
    await sendQuotedWithFooter(sock, remoteJid, "No active battle. Use /fight to engage a curse!", message)
    return
  }

  if (battle.finished) {
    await sendQuotedWithFooter(sock, remoteJid, "Battle already ended.", message)
    return
  }

  const result = await SimpleBattleService.processRound(battle, "defend")
  if (result.finished) {
    await sendQuotedWithFooter(sock, remoteJid, "Battle ended.", message)
    SimpleBattleService.end(battle.id)
    return
  }

  const roundText = formatRoundDisplay(result.battle.round, result.battle.player, result.battle.opponent, result.battle.battleLog, "player")
  await sendQuotedWithFooter(sock, remoteJid, roundText, message)
}
