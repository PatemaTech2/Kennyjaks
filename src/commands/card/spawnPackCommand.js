import { sendQuotedWithFooter } from "../../utils/messageHelper.js"
import { loadPlayerByPhone, savePlayer } from "../../database/playerRepo.js"
import { getRandomCard, getCardsByTier, addCardToPlayer } from "../../services/card/CardService.js"
import { CardCanvas } from "../../canvas/cardCanvas.js"

const SPAWN_PACK_COOLDOWN_MS = 30 * 1000
const SPAWN_PACK_COST = 10000
const packCooldowns = new Map()
const pendingPacks = new Map()

export async function handleSpawnPack(sock, message) {
  const remoteJid = message.key.remoteJid
  const sender = message.key.participant || remoteJid
  const phoneNumber = sender.split("@")[0]

  const player = await loadPlayerByPhone(phoneNumber)
  if (!player) {
    await sendQuotedWithFooter(sock, remoteJid, "You need to register first.\n\nUse /start to begin.", message)
    return
  }

  const now = Date.now()
  const lastUsed = packCooldowns.get(phoneNumber) || 0
  if (now - lastUsed < SPAWN_PACK_COOLDOWN_MS) {
    const remaining = Math.ceil((SPAWN_PACK_COOLDOWN_MS - (now - lastUsed)) / 1000)
    await sendQuotedWithFooter(sock, remoteJid, `⏳ Spawn pack is on cooldown.\n\nWait ${remaining}s before opening another pack.`, message)
    return
  }

  if ((player.wallet || 0) < SPAWN_PACK_COST) {
    await sendQuotedWithFooter(sock, remoteJid, `Insufficient funds.\n\nCost: ¥${SPAWN_PACK_COST.toLocaleString()}\nYour wallet: ¥${(player.wallet || 0).toLocaleString()}`, message)
    return
  }

  const count = Math.floor(Math.random() * 7) + 6
  const rareTierCards = [
    ...getCardsByTier("3"),
    ...getCardsByTier("4"),
    ...getCardsByTier("5")
  ]

  const cards = []
  const guaranteedRares = []
  for (let i = 0; i < 2; i++) {
    if (rareTierCards.length > 0) {
      const card = rareTierCards[Math.floor(Math.random() * rareTierCards.length)]
      const normalized = {
        ...card,
        tier: String(card.tier || "3"),
        tierLabel: card.tierLabel || "S",
        worth: card.worth || 30000,
        rarity: card.rarity || "Rare",
        series: card.series || "",
        image_url: card.image_url || ""
      }
      guaranteedRares.push(normalized)
    }
  }

  const rest = []
  for (let i = guaranteedRares.length; i < count; i++) {
    const card = getRandomCard()
    if (card) rest.push(card)
  }

  const pack = [...guaranteedRares, ...rest]
  pendingPacks.set(phoneNumber, pack)

  player.wallet = (player.wallet || 0) - SPAWN_PACK_COST
  await savePlayer(player)

  packCooldowns.set(phoneNumber, now)

  const canvas = new CardCanvas()
  const buffer = await canvas.renderDeck(pack, player.name || "Sorcerer")
  await sock.sendMessage(remoteJid, { image: buffer, caption: `🎴 Card Pack Ready!\n\nCards: ${pack.length}\nGuaranteed Rares: ${guaranteedRares.length}\nCost: ¥${SPAWN_PACK_COST.toLocaleString()}\n\nUse /claim-pack to add these cards to your deck!` }, { quoted: message })
}

export async function handleClaimPack(sock, message) {
  const remoteJid = message.key.remoteJid
  const sender = message.key.participant || remoteJid
  const phoneNumber = sender.split("@")[0]

  const player = await loadPlayerByPhone(phoneNumber)
  if (!player) {
    await sendQuotedWithFooter(sock, remoteJid, "You need to register first.\n\nUse /start to begin.", message)
    return
  }

  const pack = pendingPacks.get(phoneNumber)
  if (!pack || pack.length === 0) {
    await sendQuotedWithFooter(sock, remoteJid, "No pending pack to claim.\n\nUse /spawnpack to open a pack first!", message)
    return
  }

  for (const card of pack) {
    addCardToPlayer(phoneNumber, card.id)
  }

  pendingPacks.delete(phoneNumber)

  await sendQuotedWithFooter(sock, remoteJid, `✅ Pack claimed!\n\nAdded ${pack.length} cards to your deck.\nUse /deck to view them!`, message)
}
