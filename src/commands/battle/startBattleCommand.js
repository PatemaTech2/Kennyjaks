import { sendQuotedWithFooter } from "../../utils/messageHelper.js"
import { loadPlayerByPhone, savePlayer } from "../../database/playerRepo.js"
import { BattleManager } from "../../services/battle/BattleManager.js"
import { SimpleBattleService } from "../../services/battle/SimpleBattleService.js"
import { formatBattleStart, formatActionMenu, formatRoundDisplay } from "../../utils/battle/battleDisplay.js"

export async function handleStartBattle(sock, message) {
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

  const text = formatBattleStart(battle.player, battle.opponent) + "\n\n" + formatActionMenu()
  await sendQuotedWithFooter(sock, remoteJid, text, message)
}
