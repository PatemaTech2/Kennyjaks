import { sendQuotedWithFooter } from "../utils/messageHelper.js"
import { buildRegistry, buildHelpDispatch } from "../services/commandRegistry.js"

export async function handleHelp(sock, message) {
  const remoteJid = message.key.remoteJid
  const sender = message.key.participant || remoteJid
  const phoneNumber = sender.split("@")[0]

  const registry = buildRegistry()
  const args = message.parsedCommand?.args || message.args || []
  const query = args.join(" ").trim()

  const helpText = buildHelpDispatch(registry, query, phoneNumber)
  await sendQuotedWithFooter(sock, remoteJid, helpText, message)
}
