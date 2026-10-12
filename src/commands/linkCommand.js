import { sendQuotedWithFooter } from "../utils/messageHelper.js"
import { BALANCE } from "../config/balance.js"

export async function handleLink(sock, message) {
  const remoteJid = message.key.remoteJid
  const text = [
    "🔗 KennyJaks WhatsApp Group",
    "",
    BALANCE.groupLink || "Group link not configured."
  ].join("\n")
  await sendQuotedWithFooter(sock, remoteJid, text, message)
}
