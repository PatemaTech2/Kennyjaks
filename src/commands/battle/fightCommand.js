import { sendQuotedWithFooter } from "../../utils/messageHelper.js"
import { loadPlayerByPhone } from "../../database/playerRepo.js"
import { getActiveGroupCurse } from "../../services/battle/GroupCurseService.js"
import { getActiveCurse } from "../../services/battle/CurseService.js"
import { SimpleBattleService } from "../../services/battle/SimpleBattleService.js"
import { formatBattleStart, formatActionMenu } from "../../utils/battle/battleDisplay.js"
import { generateFairCurse } from "../../services/battle/curseGenerator.js"
import { CombinedBattleCanvas } from "../../canvas/CombinedBattleCanvas.js"

export async function handleFight(sock, message) {
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

  let opponent = null
  let battleType = "CURSE"

  const groupCurse = getActiveGroupCurse(remoteJid)
  if (groupCurse && !groupCurse.defeated) {
    opponent = groupCurse.curse
    battleType = "GROUP_CURSE"
  } else {
    const personalCurse = getActiveCurse(player.playerId)
    if (personalCurse) {
      opponent = personalCurse
    }
  }

  if (!opponent) {
    opponent = SimpleBattleService.getPendingEnemy(player.playerId)
    if (opponent) {
      SimpleBattleService.clearPendingEnemy(player.playerId)
    } else {
      opponent = generateFairCurse(player.level, player.grade)
    }
  }

  const battle = SimpleBattleService.start(player, opponent, battleType)

  // Generate combined battle canvas with both characters
  const combinedCanvas = new CombinedBattleCanvas()
  const battleImage = await combinedCanvas.render(
    battle.player,
    battle.opponent,
    battle.round,
    battle.battleLog
  )

  const startText = formatBattleStart(battle.player, battle.opponent)
  const menuText = formatActionMenu()

  await sock.sendMessage(remoteJid, {
    image: battleImage,
    caption: startText + "\n\n" + menuText
  }, { quoted: message })
}