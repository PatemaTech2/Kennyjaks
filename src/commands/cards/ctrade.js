import { sendQuotedWithFooter } from "../../utils/messageHelper.js"
import { loadPlayerByPhone } from "../../database/playerRepo.js"
import { getPlayerCardsWithDetails, addCardToPlayer, removeCardFromPlayer } from "../../services/card/CardService.js"

export async function handleCtrade(sock, message) {
  const { chatId, sender, quoted } = message
  const cardName = (message.text || "").trim().split(/\s+/).slice(1).join(" ")

  if (!cardName) {
    return sock.sendMessage(chatId, {
      text: '❌ Usage: /ctrade <card name> (while quoting user)',
      mentions: [sender]
    })
  }

  if (!quoted) {
    return sock.sendMessage(chatId, {
      text: '❌ Quote a message from the user you want to trade with',
      mentions: [sender]
    })
  }

  const targetUserJid = quoted.key.participant || quoted.key.remoteJid
  const targetPhone = targetUserJid.split('@')[0]

  try {
    const trader = await loadPlayerByPhone(sender.split('@')[0])
    const receiver = await loadPlayerByPhone(targetPhone)

    if (!trader || !receiver) {
      return sock.sendMessage(chatId, {
        text: '❌ User not found in database',
        mentions: [sender]
      })
    }

    const traderCards = getPlayerCardsWithDetails(sender.split('@')[0])
    const cardToTrade = traderCards.find(c => c.name.toLowerCase() === cardName.toLowerCase())

    if (!cardToTrade) {
      return sock.sendMessage(chatId, {
        text: `❌ You don't have "${cardName}"!\n\nUse */deck* to see your cards`,
        mentions: [sender]
      })
    }

    const traderCardEntry = getPlayerCards(sender.split('@')[0]).find(c => c.cardId === cardToTrade.id)
    if (!traderCardEntry) {
      return sock.sendMessage(chatId, {
        text: '❌ Card entry not found in your deck.',
        mentions: [sender]
      })
    }

    if (!removeCardFromPlayer(sender.split('@')[0], traderCardEntry.id)) {
      return sock.sendMessage(chatId, {
        text: '❌ Failed to remove card from your deck.',
        mentions: [sender]
      })
    }

    addCardToPlayer(targetPhone, cardToTrade.id)

    await sock.sendMessage(chatId, {
      text: `✅ *TRADE COMPLETE!*\n\n${trader.name} sent "${cardToTrade.name}" to ${receiver.name}`,
      mentions: [sender, targetUserJid]
    })

    await sock.sendMessage(targetUserJid, {
      text: `🎴 You received "${cardToTrade.name}" from ${trader.name}!`,
      mentions: [targetUserJid]
    })

  } catch (error) {
    console.error('[Trade Error]:', error.message)
    sock.sendMessage(chatId, {
      text: `❌ Trade failed: ${error.message}`,
      mentions: [sender]
    })
  }
}
