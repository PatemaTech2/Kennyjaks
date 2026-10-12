import { sendQuotedWithFooter } from "../../utils/messageHelper.js"
import { handleDeck } from "./claimCardCommand.js"

export async function handleDeckCommand(sock, message) {
  const text = (message.message?.conversation || message.message?.extendedTextMessage?.text || "").trim()
  const lowerText = text.toLowerCase()

  let cardName = null
  let page = 1

  if (lowerText.startsWith("/deck") && lowerText.length > 5) {
    const after = text.slice(5).trim()
    const num = parseInt(after, 10)
    if (!isNaN(num) && num > 0) {
      page = num
    } else {
      cardName = after || null
    }
  } else {
    const parts = text.split(" ").slice(1)
    const first = parts[0]
    const num = parseInt(first, 10)
    if (!isNaN(num) && num > 0 && parts.length === 1) {
      page = num
    } else {
      cardName = parts.join(" ") || null
    }
  }

  await handleDeck(sock, message, cardName, page)
}
