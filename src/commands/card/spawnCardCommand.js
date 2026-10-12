import { sendQuotedWithFooter } from "../../utils/messageHelper.js"
import { loadPlayerByPhone } from "../../database/playerRepo.js"
import { getRandomCard, spawnGroupCard, getActiveGroupCard, claimGroupCard } from "../../services/card/CardService.js"

const CARD_REACTION_EMOJIS = ["🃏", "✨", "🔥", "💫", "🌟", "🎴", "💥", "⚡"]

export async function handleSpawnCard(sock, message) {
  const remoteJid = message.key.remoteJid
  const sender = message.key.participant || remoteJid
  const phoneNumber = sender.split("@")[0]

  const player = await loadPlayerByPhone(phoneNumber)
  if (!player) {
    await sendQuotedWithFooter(sock, remoteJid, "You need to register first.\n\nUse /start to begin.", message)
    return
  }

  const activeCard = getActiveGroupCard(remoteJid)
  if (activeCard) {
    await sendQuotedWithFooter(sock, remoteJid, `A card is already spawned!\n\n${activeCard.card.name}\nUse /claim-card to claim it!`, message)
    return
  }

  const card = getRandomCard()
  if (!card) {
    await sendQuotedWithFooter(sock, remoteJid, "No cards available right now.", message)
    return
  }

  spawnGroupCard(remoteJid, card)

  await sendQuotedWithFooter(sock, remoteJid, `🃏 A card has spawned!\n\n${card.name}\n⭐ Tier: ${card.tierLabel || card.tier}\n💰 Worth: ¥${(card.worth || 0).toLocaleString()}\n\nUse /claim-card to claim it!`, message)
}
