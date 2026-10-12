import { sendQuotedWithFooter } from "../../utils/messageHelper.js"
import { loadPlayerByPhone, savePlayer } from "../../database/playerRepo.js"
import { getPlayerCardsWithDetails, getCardMarketListing, buyMarketCard, listCardForSale, getPlayerCards, removeCardFromPlayer } from "../../services/card/CardService.js"
import { globalCardBattle } from "../../services/card/CardBattleService.js"
import fs from "fs-extra"
import path from "path"

const TEMP_DIR = path.join(process.cwd(), "data", "temp")
const PENDING_DUELS = new Map()
const DUEL_TIMEOUT_MS = 30000

export async function handleDuel(sock, message) {
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
  const targetPhone = parts[1]?.replace("@s.whatsapp.net", "") || null

  if (!targetPhone) {
    await sendQuotedWithFooter(sock, remoteJid, "🤖 Card Duel\n\nSelect your 3 cards to duel!\n\nFormat: /duel <opponent_phone>\nExample: /duel 1234567890\n\nOr use: /duel npc (to duel the system)", message)
    return
  }

  if (targetPhone === "npc" || targetPhone === "bot") {
    await startNpcDuel(sock, message, phoneNumber, player)
    return
  }

  const targetPlayer = await loadPlayerByPhone(targetPhone)
  if (!targetPlayer) {
    await sendQuotedWithFooter(sock, remoteJid, `Target player not found.\nMake sure \`${targetPhone}\` is valid.`, message)
    return
  }

  const opponentCards = getPlayerCardsWithDetails(targetPhone)
  if (opponentCards.length < 3) {
    await sendQuotedWithFooter(sock, remoteJid, `${targetPlayer.name} needs more cards to duel.\nCurrent: ${opponentCards.length}/3 cards required`, message)
    return
  }

  const yourCards = getPlayerCardsWithDetails(phoneNumber)
  if (yourCards.length < 3) {
    await sendQuotedWithFooter(sock, remoteJid, "You need at least 3 cards to duel.\nCollect more cards with /spawnpack", message)
    return
  }

  await startDuel(sock, message, phoneNumber, targetPhone, targetPlayer.name, yourCards, opponentCards)
}

async function startNpcDuel(sock, message, playerId, player) {
  const yourCards = getPlayerCardsWithDetails(playerId)
  if (yourCards.length < 3) {
    await sendQuotedWithFooter(sock, message.key.remoteJid, "You need at least 3 cards to duel.\nCollect more cards with /spawnpack", message)
    return
  }

  const npcCards = generateNpcDeck(yourCards.length)
  const battleId = `duel_npc_${playerId}_${Date.now()}`

  globalCardBattle.createBattle(battleId, playerId, "npc", yourCards, npcCards, true)

  const msg = [
    "🤖 NPC DUEL STARTED",
    "",
    "You: " + player.name,
    `HP: 4000`,
    "",
    "Opponent: Shadow Sorcerer",
    "HP: 4000",
    "",
    "Your Cards:",
    ...yourCards.slice(0, 5).map((c, i) => `${i + 1}. ${c.name} (${c.atv || 1000} ATK / ${c.def || 500} DEF)`),
    "",
    "Select a card by number:",
    `Reply with: /attack <card_number>`
  ].join("\n")

  const duelKey = `${playerId}:npc`
  PENDING_DUELS.set(duelKey, { playerId, battleId, isNpc: true })
  setTimeout(() => PENDING_DUELS.delete(duelKey), DUEL_TIMEOUT_MS)

  await sendQuotedWithFooter(sock, message.key.remoteJid, msg, message)
}

async function startDuel(sock, message, playerId, targetId, targetName, playerCards, opponentCards) {
  const battleId = `duel_${playerId}_${targetId}_${Date.now()}`
  globalCardBattle.createBattle(battleId, playerId, targetId, playerCards, opponentCards)

  const duelKey = `${playerId}:${targetId}`
  PENDING_DUELS.set(duelKey, { playerId, targetId, battleId, isNpc: false })

  const player = await loadPlayerByPhone(playerId)
  const opponent = await loadPlayerByPhone(targetId)

  const msg = [
    "⚔️ CARD DUEL ACTIVE",
    "",
    player.name + " (You) vs " + targetName,
    "",
    "HP: 4000 vs 4000",
    "",
    "Your Cards:",
    ...playerCards.slice(0, 5).map((c, i) => `${i + 1}. ${c.name} (${c.atv || 1000} ATK / ${c.def || 500} DEF)`),
    "",
    "Select your card: `/attack <number>`"
  ].join("\n")

  await sendQuotedWithFooter(sock, message.key.remoteJid, msg, message)
}

export async function handleCardAttack(sock, message) {
  const remoteJid = message.key.remoteJid
  const sender = message.key.participant || remoteJid
  const phoneNumber = sender.split("@")[0]

  const player = await loadPlayerByPhone(phoneNumber)
  if (!player) return

  const text = (message.message?.conversation || message.message?.extendedTextMessage?.text || "").trim()
  const match = text.match(/\/attack\s+(\d+)/)
  if (!match) {
    await sendQuotedWithFooter(sock, message.key.remoteJid, "Usage: /attack <card_number>", message)
    return
  }
  const cardNum = parseInt(match[1], 10) - 1

  let duelKey = null
  for (const [key, value] of PENDING_DUELS.entries()) {
    if (value.playerId === phoneNumber) {
      duelKey = key
      break
    }
  }

  if (!duelKey) {
    await sendQuotedWithFooter(sock, message.key.remoteJid, "No active duel found.", message)
    return
  }

  const duel = PENDING_DUELS.get(duelKey)
  if (!duel || !duel.battleId) {
    PENDING_DUELS.delete(duelKey)
    await sendQuotedWithFooter(sock, message.key.remoteJid, "Duel expired.", message)
    return
  }

  const battle = globalCardBattle.getBattle(duel.battleId)
  if (!battle || battle.finished) {
    PENDING_DUELS.delete(duelKey)
    await sendQuotedWithFooter(sock, message.key.remoteJid, "Duel already finished.", message)
    return
  }

  const availableCards = globalCardBattle.getPlayerCards(duel.battleId, duel.isNpc ? 1 : 1)
  if (cardNum < 0 || cardNum >= availableCards.length) {
    await sendQuotedWithFooter(sock, message.key.remoteJid, `Invalid card number. Use 1-${availableCards.length}`, message)
    return
  }

  const result = globalCardBattle.attackWithCard(duel.battleId, duel.isNpc ? 1 : 1, cardNum)

  if (!result) {
    await sendQuotedWithFooter(sock, message.key.remoteJid, "Cannot use that card - already used this turn.", message)
    return
  }

  const log = globalCardBattle.getLog(duel.battleId)
  const p1Hp = globalCardBattle.getHp(duel.battleId, 1)
  const p2Hp = globalCardBattle.getHp(duel.battleId, duel.isNpc ? 2 : 2)

  let turnsRemaining = 5 - Math.max(duel.isNpc ? battle.p1UsedCards.length : battle.p1UsedCards.length, duel.isNpc ? battle.p2UsedCards.length : battle.p2UsedCards.length)
  if (turnsRemaining <= 0 || globalCardBattle.getWinner(duel.battleId)) {
    const winner = globalCardBattle.getWinner(duel.battleId)
    if (winner) {
      PENDING_DUELS.delete(duelKey)
      await endDuel(sock, message, duel, winner)
    } else {
      await sendQuotedWithFooter(sock, message.key.remoteJid, "🔄 Battle ends in a draw.\n" + log.join("\n"), message)
      PENDING_DUELS.delete(duelKey)
    }
    return
  }

  const msg = [
    "⚔️ CARD DUEL - ONGOING",
    "",
    "📜 Battle Log:",
    ...log.slice(-5),
    "",
    "🏆 HP: " + player.name + " " + p1Hp + "/" + (duel.isNpc ? 4000 : 4000),
    "   Opponent: " + p2Hp + "/4000",
    "",
    "🎯 Turns remaining: ~" + turnsRemaining,
    "\nUse /attack <number> to play again"
  ].join("\n")

  await sendQuotedWithFooter(sock, remoteJid, msg, message)
}

async function endDuel(sock, message, duel, winner) {
  const player = await loadPlayerByPhone(duel.playerId)
  const battle = globalCardBattle.getBattle(duel.battleId)

  let msg = ["⚔️ DUEL ENDED!", ""]
  if (duel.isNpc) {
    msg.push(`🏆 ${player.name} defeats the Shadow Sorcerer!`)
    msg.push("")
    msg.push(`Winner: ${player.name}`)
    msg.push("Loot: Earned 5000 yen from victory!")
    player.wallet = (player.wallet || 0) + 5000
    player.lifetimeEarned = (player.lifetimeEarned || 0) + 5000
    await savePlayer(player)
  } else {
    const opponent = await loadPlayerByPhone(duel.targetId)
    if (winner === 1) {
      msg.push(`🏆 ${player.name} wins!`)
      msg.push("")
      player.wallet = (player.wallet || 0) + 10000
      player.lifetimeEarned = (player.lifetimeEarned || 0) + 10000
      await savePlayer(player)
    } else {
      msg.push(`🏆 ${opponent.name} wins!`)
      msg.push("")
      msg.push("Better luck next time!")
    }
  }

  await sendQuotedWithFooter(sock, message.key.remoteJid, msg.join("\n"), message)
  globalCardBattle.removeBattle(duel.battleId)
}

function generateNpcDeck(minCount = 5) {
  const npcCardPool = [
    { name: "Curse of Despair", atk: 1500, def: 1000, category: "curse" },
    { name: "Shadow Blade", atk: 1800, def: 800, category: "curse" },
    { name: "Dark Mist", atk: 1200, def: 1500, category: "curse" },
    { name: "Soul Drain", atk: 2000, def: 1200, category: "curse" },
    { name: "Miasma Worm", atk: 900, def: 1800, category: "curse" },
    { name: "Cursed Echo", atk: 1600, def: 900, category: "curse" },
    { name: "Void Blast", atk: 2200, def: 600, category: "curse" },
    { name: "Dark Vortex", atk: 1400, def: 1400, category: "curse" }
  ]
  const count = Math.max(minCount, 5)
  const deck = []
  for (let i = 0; i < count; i++) {
    const card = { ...npcCardPool[i % npcCardPool.length] }
    card.id = `npc_${i}`
    card.rarity = "Rare"
    card.tier = "3"
    card.tierLabel = "S"
    card.worth = 10000
    card.series = "Curses"
    deck.push(card)
  }
  return deck
}