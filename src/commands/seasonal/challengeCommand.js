import { sendQuotedWithFooter } from "../../utils/messageHelper.js"
import { loadPlayerByPhone } from "../../database/playerRepo.js"
import { getKnightDefinition, isKnightAlive } from "../../services/seasonal/DragonKnightService.js"
import { getEventState, isEventActive } from "../../services/seasonal/SeasonalEventService.js"
import { BattleManager } from "../../services/battle/BattleManager.js"
import { handleAurstavChallenge } from "../../services/seasonal/AurstavBattleService.js"

export async function handleDragonChallenge(sock, message) {
  const remoteJid = message.key.remoteJid
  const sender = message.key.participant || remoteJid
  const phoneNumber = sender.split("@")[0]

  const player = await loadPlayerByPhone(phoneNumber)
  if (!player) {
    await sendQuotedWithFooter(sock, remoteJid, "You need to register first.\n\nUse /start to begin.", message)
    return
  }

  if (!(await isEventActive())) {
    await sendQuotedWithFooter(sock, remoteJid, "THE DRAGON CURSE KING event has ended.", message)
    return
  }

  const targetName = args[1].toLowerCase()

  if (targetName === "aurstav") {
    await handleAurstavChallenge(sock, message)
    return
  }

  await sendQuotedWithFooter(sock, remoteJid, "Dragon Knight battles are not available.", message)
}
