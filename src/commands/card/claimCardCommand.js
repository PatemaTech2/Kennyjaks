import { sendQuotedWithFooter } from "../../utils/messageHelper.js"
import { loadPlayerByPhone, savePlayer } from "../../database/playerRepo.js"
import { getCardsByTier, getCardById, getRandomCard, getPlayerCards, addCardToPlayer, getActiveGroupCard, claimGroupCard, spawnGroupCard } from "../../services/card/CardService.js"
import { CardCanvas } from "../../canvas/cardCanvas.js"

export async function handleClaimCard(sock, message) {
  const remoteJid = message.key.remoteJid
  const sender = message.key.participant || remoteJid
  const phoneNumber = sender.split("@")[0]
  const groupId = remoteJid

  const player = await loadPlayerByPhone(phoneNumber)
  if (!player) {
    await sendQuotedWithFooter(sock, remoteJid, "You need to register first.\n\nUse /start to begin.", message)
    return
  }

  const activeCard = getActiveGroupCard(groupId)
  if (!activeCard) {
    await sendQuotedWithFooter(sock, remoteJid, "No card is currently spawned in this chat.\nWait for the next spawn!", message)
    return
  }

  const claimResult = claimGroupCard(groupId, phoneNumber)
  if (!claimResult.success) {
    await sendQuotedWithFooter(sock, remoteJid, claimResult.error, message)
    return
  }

  const card = claimResult.card
  const cards = addCardToPlayer(phoneNumber, card.id)

  await sendQuotedWithFooter(sock, remoteJid, `✅ Card claimed!\n\n🃏 ${card.name}\n⭐ Tier: ${card.tier}\n💰 Worth: ¥${(card.worth || 0).toLocaleString()}\n📦 Total cards: ${cards.length}`, message)

  const canvas = new CardCanvas()
  const buffer = await canvas.renderCard(card, player.name || "Sorcerer")
  await sock.sendMessage(remoteJid, { image: buffer, caption: `🃏 ${card.name}` }, { quoted: message })
}

export async function handleDeck(sock, message, specificCardName = null, page = 1) {
  const remoteJid = message.key.remoteJid
  const sender = message.key.participant || remoteJid
  const phoneNumber = sender.split("@")[0]

  const player = await loadPlayerByPhone(phoneNumber)
  if (!player) {
    await sendQuotedWithFooter(sock, remoteJid, "You need to register first.\n\nUse /start to begin.", message)
    return
  }

  const playerCards = getPlayerCards(phoneNumber)
  if (playerCards.length === 0) {
    await sendQuotedWithFooter(sock, remoteJid, "You have no cards yet.\nUse /claim-card when a card spawns!", message)
    return
  }

  if (specificCardName) {
    const matched = playerCards.find(c => {
      const card = getCardById(c.cardId)
      return card && card.name.toLowerCase().includes(specificCardName.toLowerCase())
    })
    if (!matched) {
      await sendQuotedWithFooter(sock, remoteJid, "Card not found in your deck.", message)
      return
    }
    const card = getCardById(matched.cardId)
    const canvas = new CardCanvas()
    const buffer = await canvas.renderCard(card, player.name || "Sorcerer")
    await sock.sendMessage(remoteJid, { image: buffer, caption: `🃏 ${card.name}` }, { quoted: message })
    return
  }

  const CARDS_PER_PAGE = 10
  const cards = playerCards.map(c => getCardById(c.cardId)).filter(Boolean)
  const totalPages = Math.ceil(cards.length / CARDS_PER_PAGE)
  const currentPage = Math.max(1, Math.min(page, totalPages))
  
  const startIdx = (currentPage - 1) * CARDS_PER_PAGE
  const pageCards = cards.slice(startIdx, startIdx + CARDS_PER_PAGE)
  
  const canvas = new CardCanvas()
  const buffer = await canvas.renderDeck(pageCards, player.name || "Sorcerer")
  
  let caption = `🃏 ${player.name}'s Deck (${cards.length} cards)\nPage ${currentPage}/${totalPages}`
  if (totalPages > 1) {
    caption += `\n\nUse /deck <page> to navigate (e.g. /deck 2)`
  }
  
  await sock.sendMessage(remoteJid, { image: buffer, caption }, { quoted: message })
}
