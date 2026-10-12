import { sendQuotedWithFooter } from "../../utils/messageHelper.js"
import { loadPlayerByPhone } from "../../database/playerRepo.js"
import { StickerService } from "../../services/sticker/StickerService.js"
import { downloadMediaMessage } from "@whiskeysockets/baileys"

export async function handleTogif(sock, message) {
  const remoteJid = message.key.remoteJid
  const sender = message.key.participant || remoteJid
  const phoneNumber = sender.split("@")[0]

  const player = await loadPlayerByPhone(phoneNumber)
  if (!player) {
    await sendQuotedWithFooter(sock, remoteJid, "You need to register first.\n\nUse /start to begin.", message)
    return
  }

  const quotedMsg = message.message?.extendedTextMessage?.contextInfo?.quotedMessage
  if (!quotedMsg?.stickerMessage) {
    await sendQuotedWithFooter(sock, remoteJid, "❌ Reply to an animated sticker to convert to GIF.", message)
    return
  }

  try {
    const stickerBuffer = await downloadMediaMessage(quotedMsg.stickerMessage, "buffer", {}, sock)
    if (!stickerBuffer || stickerBuffer.length === 0) {
      await sendQuotedWithFooter(sock, remoteJid, "❌ Failed to download sticker.", message)
      return
    }

    const gifBuffer = await StickerService.animatedStickerToGif(stickerBuffer)
    await sock.sendMessage(remoteJid, {
      video: gifBuffer,
      caption: "Converted from animated sticker",
      mimetype: "image/gif"
    }, { quoted: message })
  } catch (err) {
    console.error("[KENNYJAKS ERROR] Sticker to GIF failed:", err)
    await sendQuotedWithFooter(sock, remoteJid, `❌ GIF conversion failed.\n${err.message}`, message)
  }
}
