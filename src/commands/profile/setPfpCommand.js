import { sendQuotedWithFooter } from "../../utils/messageHelper.js"
import { loadPlayerByPhone, savePlayer } from "../../database/playerRepo.js"
import { CardCanvas } from "../../canvas/cardCanvas.js"
import { getPlayerCards, getCardById } from "../../services/card/CardService.js"
import sharp from "sharp"
import fsExtra from "fs-extra"
import path from "path"

const PFP_DIR = path.resolve("database/pfp")
const MAX_SIZE = 2 * 1024 * 1024
const CARD_IMAGE_AREA = { x: 50, y: 170, width: 700, height: 480 }

async function ensurePfpDir() {
  await fsExtra.ensureDir(PFP_DIR)
}

function extractImageMessage(message) {
  const contextInfo = message.message?.extendedTextMessage?.contextInfo
  const quoted = contextInfo?.quotedMessage

  if (quoted?.imageMessage) return quoted.imageMessage
  if (quoted?.videoMessage) return quoted.videoMessage
  if (quoted?.documentMessage && quoted.documentMessage.mimetype?.startsWith("image/")) return quoted.documentMessage

  if (message.message?.imageMessage) return message.message.imageMessage
  if (message.message?.videoMessage) return message.message.videoMessage
  if (message.message?.documentMessage && message.message.documentMessage.mimetype?.startsWith("image/")) return message.message.documentMessage

  return null
}

function extractQuotedCaption(message) {
  const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage
  return quoted?.imageMessage?.caption || quoted?.videoMessage?.caption || quoted?.documentMessage?.caption || ""
}

function parseCardNameFromCaption(caption) {
  if (!caption?.startsWith("🃏 ")) return null
  return caption.slice(3).trim()
}

function findCardInDeck(playerCards, cardName) {
  const lowerName = cardName.toLowerCase()
  return playerCards.find(c => {
    const card = getCardById(c.cardId)
    return card && card.name.toLowerCase().includes(lowerName)
  })
}

async function renderCardPfp(card) {
  const canvas = new CardCanvas()
  const cardBuffer = await canvas.renderCard(card, "Sorcerer")
  const squareBuffer = await sharp(cardBuffer)
    .extract({
      left: CARD_IMAGE_AREA.x,
      top: CARD_IMAGE_AREA.y,
      width: CARD_IMAGE_AREA.width,
      height: CARD_IMAGE_AREA.height
    })
    .resize(512, 512, {
      fit: "cover",
      position: "center"
    })
    .webp({
      quality: 90,
      lossless: false,
      effort: 4
    })
    .toBuffer()

  return squareBuffer
}

export async function handleSetPfp(sock, message) {
  const remoteJid = message.key.remoteJid
  const sender = message.key.participant || remoteJid
  const phoneNumber = sender.split("@")[0]

  const player = await loadPlayerByPhone(phoneNumber)
  if (!player) {
    await sendQuotedWithFooter(sock, remoteJid, "You need to register first.\n\nUse /start to begin.", message)
    return
  }

  const text = (message.message?.conversation || message.message?.extendedTextMessage?.text || "").trim()
  const args = text.split(" ").slice(1)
  const argCardName = args.join(" ").trim()

  const imageMsg = extractImageMessage(message)
  const quotedCaption = extractQuotedCaption(message)
  const captionCardName = parseCardNameFromCaption(quotedCaption)

  const cardName = argCardName || captionCardName

  if (!cardName && !imageMsg) {
    await sendQuotedWithFooter(sock, remoteJid, "Quote a card from your deck to set it as your profile picture.\n\nUsage:\n1. /deck <card name>\n2. Quote the card image\n3. /setpfp\n\nOr: /setpfp <card name>", message)
    return
  }

  if (!cardName && imageMsg) {
    await sendQuotedWithFooter(sock, remoteJid, "Only cards from your deck can be used as your profile picture.\n\nUsage:\n1. /deck <card name>\n2. Quote the card image\n3. /setpfp\n\nOr: /setpfp <card name>", message)
    return
  }

  const playerCards = getPlayerCards(phoneNumber)
  const matched = findCardInDeck(playerCards, cardName)
  if (!matched) {
    await sendQuotedWithFooter(sock, remoteJid, "That card is not in your deck. Use /deck <card name> to view your cards and choose one.", message)
    return
  }

  const card = getCardById(matched.cardId)
  if (!card) {
    await sendQuotedWithFooter(sock, remoteJid, "Failed to load that card. Try another card.", message)
    return
  }

  await ensurePfpDir()

  let buffer
  try {
    buffer = await renderCardPfp(card)
  } catch (error) {
    console.error("[KENNYJAKS ERROR] Failed to render card PFP:", error.message)
    await sendQuotedWithFooter(sock, remoteJid, "Failed to render that card as a profile picture. Try again.", message)
    return
  }

  if (!buffer || buffer.length === 0) {
    await sendQuotedWithFooter(sock, remoteJid, "Failed to render that card as a profile picture. Try again.", message)
    return
  }

  const fileName = `${phoneNumber}.webp`
  const filePath = path.join(PFP_DIR, fileName)

  try {
    await fsExtra.ensureDir(path.dirname(filePath))
    await fsExtra.writeFile(filePath, buffer)
    player.profilePic = filePath
    await savePlayer(player)
    await sendQuotedWithFooter(sock, remoteJid, `✅ Profile picture updated!\n\nCard: ${card.name}`, message)
  } catch (error) {
    console.error("[KENNYJAKS ERROR] Failed to save pfp:", error.message)
    await sendQuotedWithFooter(sock, remoteJid, "Failed to save image. Try again.", message)
  }
}
