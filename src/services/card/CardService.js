import fsExtra from "fs-extra"
import path from "path"
import { randomInt } from "../../utils/generator.js"

const CARDS_PATH = path.resolve("cards.json")
const YUGIOH_CARDS_PATH = path.resolve("src/data/yugiohCards.json")
const PLAYER_CARDS_PATH = path.resolve("database/playerCards.json")
const GROUP_CARDS_PATH = path.resolve("database/groupCards.json")
const MARKET_PATH = path.resolve("database/cardMarket.json")

const TIER_WORTH = {
  "1": 5000,
  "2": 15000,
  "3": 30000,
  "4": 60000,
  "5": 120000
}

const TIER_RARITY = {
  "1": "Common",
  "2": "Uncommon",
  "3": "Rare",
  "4": "Epic",
  "5": "Legendary"
}

const TIER_LABEL = {
  "1": "B",
  "2": "A",
  "3": "S",
  "4": "SS",
  "5": "SSS"
}

const DEFAULT_TIER_WEIGHTS = { "1": 45, "2": 30, "3": 15, "4": 7, "5": 3 }

let cardDatabase = null
let yugiohDatabase = null

function loadCardDatabase() {
  if (cardDatabase) return cardDatabase
  try {
    const raw = fsExtra.readJsonSync(CARDS_PATH)
    cardDatabase = raw
  } catch {
    cardDatabase = []
  }
  return cardDatabase
}

function loadYugiohDatabase() {
  if (yugiohDatabase) return yugiohDatabase
  try {
    const raw = fsExtra.readJsonSync(YUGIOH_CARDS_PATH)
    yugiohDatabase = raw
  } catch {
    yugiohDatabase = []
  }
  return yugiohDatabase
}

export function getCardsByTier(tier) {
  const db = loadCardDatabase()
  return db.filter(c => c.tier === tier)
}

export function getCardById(id) {
  const db = loadCardDatabase()
  const found = db.find(c => c.id === id)
  if (found) return normalizeCard(found)
  const ydb = loadYugiohDatabase()
  const yFound = ydb.find(c => c.id === id)
  if (yFound) return normalizeYugiohCard(yFound)
  return null
}

function normalizeCard(card) {
  if (!card) return null
  const tier = String(card.tier || "1")
  return {
    ...card,
    tier,
    tierLabel: TIER_LABEL[tier] || tier,
    worth: TIER_WORTH[tier] || 5000,
    rarity: TIER_RARITY[tier] || "Common",
    series: card.series || "",
    image_url: card.image_url || ""
  }
}

function normalizeYugiohCard(card) {
  if (!card) return null
  const rarityMap = {
    "Common": 1,
    "Rare": 2,
    "Super Rare": 3,
    "Ultra Rare": 4,
    "Secret Rare": 5,
    "Ultimate Rare": 6
  }
  const tier = rarityMap[card.rarity] || 3
  return {
    ...card,
    tier: String(tier),
    tierLabel: TIER_LABEL[String(tier)] || card.rarity || "Rare",
    worth: calculateYugiohWorth(card.rarity, card.atv),
    rarity: card.rarity || "Rare",
    series: card.series || "YuGiOh",
    image_url: card.image || "",
    category: card.category || "monster",
    atv: card.atv || 0,
    def: card.def || 0,
    level: card.level || 0,
    type: card.type || "Unknown",
    attribute: card.attribute || "N/A",
    isYugioh: true
  }
}

function calculateYugiohWorth(rarity, atv) {
  const baseWorth = {
    "Common": 500,
    "Rare": 2000,
    "Super Rare": 8000,
    "Ultra Rare": 25000,
    "Secret Rare": 80000,
    "Ultimate Rare": 200000
  }
  const base = baseWorth[rarity] || 1000
  const atvBonus = Math.floor(atv * 10)
  return base + atvBonus
}

export function getRandomCard(tierWeights = DEFAULT_TIER_WEIGHTS) {
  const db = loadCardDatabase()
  if (db.length === 0) return null

  const tiers = Object.keys(tierWeights)
  const totalWeight = tiers.reduce((sum, t) => sum + (tierWeights[t] || 0), 0)
  let roll = randomInt(1, totalWeight)

  let selectedTier = "1"
  for (const tier of tiers) {
    roll -= tierWeights[tier] || 0
    if (roll <= 0) {
      selectedTier = tier
      break
    }
  }

  const tierCards = db.filter(c => String(c.tier) === selectedTier)
  if (tierCards.length === 0) {
    return normalizeCard(db[Math.floor(Math.random() * db.length)])
  }
  return normalizeCard(tierCards[Math.floor(Math.random() * tierCards.length)])
}

export function getRandomYugiohCard(rarities = ["Common", "Rare", "Super Rare", "Ultra Rare", "Secret Rare"]) {
  const db = loadYugiohDatabase()
  if (db.length === 0) return null
  const pool = db.filter(c => rarities.includes(c.rarity))
  if (pool.length === 0) return db[Math.floor(Math.random() * db.length)]
  return normalizeYugiohCard(pool[Math.floor(Math.random() * pool.length)])
}

export function getRandomYuGiOhPack(type = "standard") {
  const db = loadYugiohDatabase()
  if (db.length === 0) return []

  const rarities = {
    "standard": ["Common", "Rare", "Super Rare"],
    "premium": ["Rare", "Super Rare", "Ultra Rare", "Secret Rare"],
    "legendary": ["Ultra Rare", "Secret Rare", "Ultimate Rare"]
  }[type] || ["Common", "Rare", "Super Rare"]

  const pool = db.filter(c => rarities.includes(c.rarity))
  if (pool.length === 0) return [getRandomYugiohCard()]

  const count = randomInt(5, 10)
  const cards = []
  for (let i = 0; i < count; i++) {
    const card = pool[Math.floor(Math.random() * pool.length)]
    cards.push(normalizeYugiohCard(card))
  }
  return cards
}

function loadPlayerCards() {
  try {
    return fsExtra.readJsonSync(PLAYER_CARDS_PATH) || {}
  } catch {
    return {}
  }
}

function savePlayerCards(data) {
  fsExtra.ensureDirSync(path.dirname(PLAYER_CARDS_PATH))
  fsExtra.writeJsonSync(PLAYER_CARDS_PATH, data, { spaces: 2 })
}

function loadMarket() {
  try {
    return fsExtra.readJsonSync(MARKET_PATH) || {}
  } catch {
    return {}
  }
}

function saveMarket(data) {
  fsExtra.ensureDirSync(path.dirname(MARKET_PATH))
  fsExtra.writeJsonSync(MARKET_PATH, data, { spaces: 2 })
}

export function getPlayerCards(playerId) {
  const data = loadPlayerCards()
  return data[String(playerId)] || []
}

export function addCardToPlayer(playerId, cardId) {
  const data = loadPlayerCards()
  const key = String(playerId)
  if (!data[key]) data[key] = []
  data[key].push({
    cardId,
    claimedAt: Date.now(),
    id: `pc_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
  })
  savePlayerCards(data)
  return data[key]
}

export function removeCardFromPlayer(playerId, cardInstanceId) {
  const data = loadPlayerCards()
  const key = String(playerId)
  if (!data[key]) return false
  const idx = data[key].findIndex(c => c.id === cardInstanceId)
  if (idx === -1) return false
  data[key].splice(idx, 1)
  savePlayerCards(data)
  return true
}

export function playerHasCard(playerId, cardId) {
  const cards = getPlayerCards(playerId)
  return cards.some(c => c.cardId === cardId)
}

export function getCardMarketListing(listingId) {
  const market = loadMarket()
  return market[String(listingId)] || null
}

export function listCardForSale(playerId, instanceId, price, sellerJid) {
  const market = loadMarket()
  const listingId = `mkt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
  market[listingId] = {
    id: listingId,
    sellerId: String(playerId),
    sellerJid,
    instanceId,
    price: Math.max(100, price),
    listedAt: Date.now(),
    claimed: false
  }
  saveMarket(market)
  return market[listingId]
}

export function buyMarketCard(listingId, buyerId) {
  const market = loadMarket()
  const listing = market[String(listingId)]
  if (!listing) return { success: false, error: "Listing not found." }
  if (listing.claimed) return { success: false, error: "Card already sold." }
  if (listing.sellerId === String(buyerId)) return { success: false, error: "You can't buy your own card." }

  const playerCards = getPlayerCards(String(buyerId))
  const sellerCards = getPlayerCards(String(listing.sellerId))
  if (!sellerCards || sellerCards.length === 0) {
    delete market[listingId]
    saveMarket(market)
    return { success: false, error: "Seller no longer has this card." }
  }

  listing.claimed = true
  saveMarket(market)

  addCardToPlayer(String(buyerId), listing.instanceId)

  return { success: true, card: listing, price: listing.price }
}

export function getMarketListings(limit = 20) {
  const market = loadMarket()
  return Object.values(market)
    .filter(l => !l.claimed)
    .sort((a, b) => b.listedAt - a.listedAt)
    .slice(0, limit)
}

export function getPlayerCardsWithDetails(playerId) {
  const cards = getPlayerCards(playerId)
  return cards.map(c => getCardById(c.cardId)).filter(Boolean)
}

export function getCollectionStats(playerId) {
  const cards = getPlayerCardsWithDetails(playerId)
  const total = cards.length
  const bySeries = {}
  const byRarity = {}
  const byCategory = {}
  let totalWorth = 0
  let uniqueCards = new Set()

  for (const card of cards) {
    const series = card.series || "Unknown"
    bySeries[series] = (bySeries[series] || 0) + 1
    byRarity[card.rarity] = (byRarity[card.rarity] || 0) + 1
    byCategory[card.category || "monster"] = (byCategory[card.category || "monster"] || 0) + 1
    totalWorth += card.worth || 0
    uniqueCards.add(card.id)
  }

  return {
    total,
    unique: uniqueCards.size,
    totalWorth,
    bySeries,
    byRarity,
    byCategory
  }
}

export function getGroupCard(groupId) {
  const data = loadPlayerCards()
  const entry = data[`group_${groupId}`]
  if (!entry) return null
  const now = Date.now()
  if (entry.expiresAt && entry.expiresAt < now) {
    delete data[`group_${groupId}`]
    savePlayerCards(data)
    return null
  }
  return entry
}

export function getActiveGroupCard(groupId) {
  return getGroupCard(groupId)
}

export function spawnGroupCard(groupId, card) {
  const data = loadPlayerCards()
  data[`group_${groupId}`] = {
    card,
    spawnedAt: Date.now(),
    expiresAt: Date.now() + (30 * 60 * 1000),
    claimedBy: []
  }
  savePlayerCards(data)
  return data[`group_${groupId}`]
}

export function claimGroupCard(groupId, playerId) {
  const data = loadPlayerCards()
  const entry = data[`group_${groupId}`]
  if (!entry) return { success: false, error: "No active card spawn." }
  if (entry.expiresAt && entry.expiresAt < Date.now()) {
    delete data[`group_${groupId}`]
    savePlayerCards(data)
    return { success: false, error: "The card spawn has expired." }
  }
  if (entry.claimedBy && entry.claimedBy.includes(String(playerId))) {
    return { success: false, error: "You already claimed this card." }
  }
  if (!entry.claimedBy) entry.claimedBy = []
  entry.claimedBy.push(String(playerId))
  savePlayerCards(data)
  return { success: true, card: entry.card }
}

export function clearAllPlayerCards() {
  savePlayerCards({})
}

export function clearAllGroupCards() {
  savePlayerCards({})
}