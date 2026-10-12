import { sendQuotedWithFooter } from "../../utils/messageHelper.js"
import { loadPlayerByPhone, savePlayer } from "../../database/playerRepo.js"
import { getAvailableSprites, getSpriteBuffer, getSpriteName } from "../../services/sprite/SpriteService.js"

export async function handleSprites(sock, message) {
  const remoteJid = message.key.remoteJid
  const sender = message.key.participant || remoteJid
  const phoneNumber = sender.split("@")[0]

  const player = await loadPlayerByPhone(phoneNumber)
  if (!player) {
    await sendQuotedWithFooter(sock, remoteJid, "You need to register first.\n\nUse /start to begin.", message)
    return
  }

  const sprites = getAvailableSprites()
  if (sprites.length === 0) {
    await sendQuotedWithFooter(sock, remoteJid, "❌ No sprites found in Kennyjaksskins folder", message)
    return
  }

  let text = `🎮 *AVAILABLE SPRITES* (${sprites.length} total)\n\n`
  sprites.forEach((file, index) => {
    const num = index + 1
    const name = getSpriteName(file)
    text += `${num}️⃣ ${name}\n`
    text += `   */sprite-v ${num}* - View\n`
    text += `   */set-sprite ${num}* - Set as your sprite\n\n`
  })

  await sendQuotedWithFooter(sock, remoteJid, text, message)
}

export async function handleSpriteView(sock, message) {
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
  const num = parseInt(args[0])

  if (isNaN(num) || num < 1) {
    await sendQuotedWithFooter(sock, remoteJid, "❌ Usage: /sprite-v <number>", message)
    return
  }

  const sprites = getAvailableSprites()
  if (num > sprites.length) {
    await sendQuotedWithFooter(sock, remoteJid, `❌ Sprite #${num} not found (max: ${sprites.length})`, message)
    return
  }

  const file = sprites[num - 1]
  const buffer = getSpriteBuffer(file)
  const name = getSpriteName(file)

  if (!buffer) {
    await sendQuotedWithFooter(sock, remoteJid, "❌ Failed to load sprite", message)
    return
  }

  await sock.sendMessage(remoteJid, {
    image: buffer,
    caption: `🎮 Sprite #${num}: ${name}\n\nSet this sprite: */set-sprite ${num}*`,
    mentions: [sender]
  })
}

export async function handleSetSprite(sock, message) {
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
  const num = parseInt(args[0])

  if (isNaN(num) || num < 1) {
    await sendQuotedWithFooter(sock, remoteJid, "❌ Usage: /set-sprite <number>", message)
    return
  }

  const sprites = getAvailableSprites()
  if (num > sprites.length) {
    await sendQuotedWithFooter(sock, remoteJid, `❌ Sprite #${num} not found (max: ${sprites.length})`, message)
    return
  }

  const file = sprites[num - 1]
  const name = getSpriteName(file)

  player.currentSprite = file
  player.currentSpriteName = name
  await savePlayer(player)

  await sendQuotedWithFooter(sock, remoteJid, `✅ Sprite set to: ${name}!`, message)
}