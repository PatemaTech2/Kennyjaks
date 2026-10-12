import { sendQuotedWithFooter } from "../utils/messageHelper.js"

export async function handleComments(sock, message) {
  const remoteJid = message.key.remoteJid
  const text = [
    "💬 KennyJaks Community Comments",
    "",
    "Leave feedback, suggestions, bug reports, or reviews here:",
    "",
    "https://kennyjakscomments.vercel.app/"
  ].join("\n")
  await sendQuotedWithFooter(sock, remoteJid, text, message)
}
