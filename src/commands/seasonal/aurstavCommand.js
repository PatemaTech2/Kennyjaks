import { sendQuotedWithFooter } from "../../utils/messageHelper.js"
import { handleAurstavChallenge, handleAurstavRaid, handleAurstavBattleCommand } from "../../services/seasonal/AurstavBattleService.js"

export async function handleAurstavCommand(sock, message) {
  const text = (message.message?.conversation || message.message?.extendedTextMessage?.text || "").trim()
  const args = text.split(" ")
  const subCommand = (args[1] || "").toLowerCase()

  if (subCommand === "raid") {
    await handleAurstavRaid(sock, message)
    return
  }

  await handleAurstavChallenge(sock, message)
}

export async function handleAurstavBattle(sock, message) {
  const text = (message.message?.conversation || message.message?.extendedTextMessage?.text || "").trim().toLowerCase()
  await handleAurstavBattleCommand(sock, message, text)
}
