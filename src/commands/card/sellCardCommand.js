import { sendQuotedWithFooter } from "../../utils/messageHelper.js"
import { loadPlayerByPhone } from "../../database/playerRepo.js"
import { getPlayerCardsWithDetails, getPlayerCards, removeCardFromPlayer, getCardMarketListing, buyMarketCard, getMarketListings, listCardForSale, getCollectionStats } from "../../services/card/CardService.js"

export async function handleSellCard(sock, message) {
  const remoteJid = message.key.remoteJid
  const sender = message.key.participant || remoteJid
  const phoneNumber = sender.split("@")[0]

  const player = await loadPlayerByPhone(phoneNumber)
  if (!player) {
    await sendQuotedWithFooter(sock, remoteJid, "You need to register first.\n\nUse /start to begin.", message)
    return
  }

  const text = (message.message?.conversation || message.message?.extendedTextMessage?.text || "").trim()
  const parts = text.split(/\s+/)
  const action = parts[1]?.toLowerCase()

  if (action === "list") {
    const listings = getMarketListings(10)
    if (listings.length === 0) {
      await sendQuotedWithFooter(sock, remoteJid, "📋 Card Market\n\nNo cards currently for sale.", message)
      return
    }

    const lines = [
      "📋 CARD MARKET",
      "",
      ...listings.map((l, i) => {
        const card = getCardMarketListing(l.id) || l
        const owner = card.sellerId || "Unknown"
        return `${i + 1}. ${card.instanceId || card.id} - ¥${(card.price || 0).toLocaleString()}\n   Seller: @${owner}\n   Card: ${card.name || "Unknown Card"}`
      }),
      "",
      "To buy: /sellcard buy <listing_id>"
    ].join("\n")

    await sendQuotedWithFooter(sock, remoteJid, lines, message)
    return
  }

  if (action === "buy") {
    const listingId = parts[2]
    if (!listingId) {
      await sendQuotedWithFooter(sock, remoteJid, "Usage: /sellcard buy <listing_id>\nOr view listings: /sellcard list", message)
      return
    }

    const result = buyMarketCard(listingId, phoneNumber)
    if (!result.success) {
      await sendQuotedWithFooter(sock, remoteJid, `❌ ${result.error}`, message)
      return
    }

    await sendQuotedWithFooter(sock, remoteJid, `✅ Card purchased!\n\nCard: ${result.card.name || "Unknown"}\nPrice: ¥${(result.price || 0).toLocaleString()}\n\nUse /deck to view your cards.`, message)
    return
  }

  if (action === "my") {
    const playerCards = getPlayerCardsWithDetails(phoneNumber)
    if (playerCards.length === 0) {
      await sendQuotedWithFooter(sock, remoteJid, "You have no cards to sell.", message)
      return
    }

    const lines = [
      "📋 Your Cards for Sale",
      "",
      ...playerCards.map((c, i) => {
        const worth = calculateWorth(c)
        return `${i + 1}. ${c.name} - ¥${worth.toLocaleString()}\n   ATK: ${c.atv || 1000} | DEF: ${c.def || 500} | Rarity: ${c.rarity}`
      }),
      "",
      "To sell: /sellcard <card_number>\nExample: /sellcard 1"
    ].join("\n")

    await sendQuotedWithFooter(sock, remoteJid, lines, message)
    return
  }

  if (action === "cancel") {
    await sendQuotedWithFooter(sock, remoteJid, "Listing cancelled.", message)
    return
  }

  const cardNum = parseInt(action, 10)
  if (!cardNum || cardNum < 1) {
    await sendQuotedWithFooter(sock, remoteJid, "Usage:\n/sellcard list - View market\n/sellcard my - Your cards\n/sellcard <number> - Sell a card\n/sellcard cancel - Cancel listing", message)
    return
  }

  const playerCards = getPlayerCardsWithDetails(phoneNumber)
  const card = playerCards[cardNum - 1]
  if (!card) {
    await sendQuotedWithFooter(sock, remoteJid, "Card not found.\nUse /sellcard my to see your cards.", message)
    return
  }

  const price = calculateWorth(card)
  listCardForSale(phoneNumber, card.id, price, sender)

  await sendQuotedWithFooter(sock, remoteJid, `📋 Card listed for sale!\n\n${card.name}\nPrice: ¥${price.toLocaleString()}\n\nUse /sellcard list to view market.`, message)
}

function calculateWorth(card) {
  const base = card.worth || 1000
  const rarityMultiplier = {
    "Common": 0.5,
    "Rare": 1,
    "Super Rare": 1.5,
    "Ultra Rare": 2,
    "Secret Rare": 3,
    "Ultimate Rare": 4
  }
  const mult = rarityMultiplier[card.rarity] || 1
  return Math.floor(base * mult)
}

export async function handleTradeCard(sock, message) {
  const remoteJid = message.key.remoteJid
  const sender = message.key.participant || remoteJid
  const phoneNumber = sender.split("@")[0]

  const player = await loadPlayerByPhone(phoneNumber)
  if (!player) {
    await sendQuotedWithFooter(sock, remoteJid, "You need to register first.\n\nUse /start to begin.", message)
    return
  }

  const text = (message.message?.conversation || message.message?.extendedTextMessage?.text || "").trim()
  const parts = text.split(/\s+/)

  if (parts.length < 4) {
    await sendQuotedWithFooter(sock, remoteJid, "Trade a card with another player.\n\nUsage: /tradecard <opponent_phone> <card_number>\n\nExample: /tradecard 1234567890 1\n\nYour cards:\nUse /collection to see your cards.", message)
    return
  }

  const targetPhone = parts[1]?.replace("@s.whatsapp.net", "")
  const cardNum = parseInt(parts[2], 10)

  if (!targetPhone || !cardNum) {
    await sendQuotedWithFooter(sock, remoteJid, "Invalid format.\nUse: /tradecard <phone> <card_number>", message)
    return
  }

  const targetPlayer = await loadPlayerByPhone(targetPhone)
  if (!targetPlayer) {
    await sendQuotedWithFooter(sock, remoteJid, `Target player ${targetPhone} not found.`, message)
    return
  }

  const yourCards = getPlayerCardsWithDetails(phoneNumber)
  const targetCards = getPlayerCardsWithDetails(targetPhone)

  const card = yourCards[cardNum - 1]
  if (!card) {
    await sendQuotedWithFooter(sock, remoteJid, "Card not found in your collection.\nUse /collection to view.", message)
    return
  }

  removeCardFromPlayer(phoneNumber, card.id)
  addCardToPlayer(targetPhone, card.id)

  await sendQuotedWithFooter(sock, remoteJid, `🤝 Card traded!\n\nYou sent ${card.name} to ${targetPlayer.name} (@${targetPhone}).\n\nUse /collection to check your cards.`, message)
}

export async function handleCollection(sock, message) {
  const remoteJid = message.key.remoteJid
  const sender = message.key.participant || remoteJid
  const phoneNumber = sender.split("@")[0]

  const player = await loadPlayerByPhone(phoneNumber)
  if (!player) {
    await sendQuotedWithFooter(sock, remoteJid, "You need to register first.\n\nUse /start to begin.", message)
    return
  }

  const stats = getCollectionStats(phoneNumber)

  const lines = [
    "📊 CARD COLLECTION",
    "",
    `Total Cards: ${stats.total}`,
    `Unique Cards: ${stats.unique}`,
    `Total Worth: ¥${stats.totalWorth.toLocaleString()}`,
    "",
    "By Rarity:",
    ...Object.entries(stats.byRarity).map(([r, c]) => `  ${r}: ${c}`),
    "",
    "By Type:",
    ...Object.entries(stats.byCategory).map(([cat, c]) => `  ${cat}: ${c}`),
    "",
    "By Series:",
    ...Object.entries(stats.bySeries).map(([s, c]) => `  ${s}: ${c}`),
    "",
    "Commands:",
    "  /collection - View this",
    "  /sellcard my - Sell cards",
    "  /sellcard list - Market",
    "  /tradecard <phone> <num> - Trade"
  ].join("\n")

  await sendQuotedWithFooter(sock, remoteJid, lines, message)
}