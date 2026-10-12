import { sendQuotedWithFooter } from "../../utils/messageHelper.js"
import { downloadMediaMessage } from "@whiskeysockets/baileys"
import fs from "fs-extra"
import path from "path"
import { StickerService } from "../../services/sticker/StickerService.js"

const TEMP_DIR = path.join(process.cwd(), "data", "temp")

const USAGE = `❌ Usage:\n/sticker [text] → Text to sticker\n/sticker (quote image) → Image to sticker\n/sticker (quote video) → Video to sticker\n/sticker (quote sticker) → Sticker to image`

export async function handleSticker(sock, message) {
  const remoteJid = message.key.remoteJid
  const sender = message.key.participant || remoteJid
  const phoneNumber = sender.split("@")[0]

  const quotedMsg = message.message?.extendedTextMessage?.contextInfo?.quotedMessage
  const args = (message.text || "").trim().split(/\s+/).filter(Boolean)

  // Handle text-to-sticker
  if (!quotedMsg && args.length > 0) {
    const text = args.join(" ")
    try {
      const stickerBuffer = await StickerService.textToSticker(text)
      await sock.sendMessage(remoteJid, {
        sticker: stickerBuffer,
        packName: "KENNYJAKS",
        author: "Benimaru"
      }, { quoted: message })
      return
    } catch (err) {
      console.error("[KENNYJAKS ERROR] Text-to-sticker failed:", err)
      await sendQuotedWithFooter(sock, remoteJid, `❌ Sticker creation failed.\n${err.message}`, message)
      return
    }
  }

  // Handle quoted media
  if (quotedMsg) {
    try {
      await fs.ensureDir(TEMP_DIR)

      if (quotedMsg.imageMessage) {
        const mediaBuffer = await downloadMediaMessage(quotedMsg.imageMessage, "buffer", {}, sock)
        if (!mediaBuffer || mediaBuffer.length === 0) {
          await sendQuotedWithFooter(sock, remoteJid, "❌ Failed to download image.", message)
          return
        }
        const stickerBuffer = await StickerService.imageToSticker(mediaBuffer)
        await sock.sendMessage(remoteJid, {
          sticker: stickerBuffer,
          packName: "KENNYJAKS",
          author: "Benimaru"
        }, { quoted: message })
        return
      }

      if (quotedMsg.videoMessage) {
        if (quotedMsg.videoMessage.seconds > 10) {
          await sendQuotedWithFooter(sock, remoteJid, "❌ Video must be 10 seconds or less.", message)
          return
        }
        const mediaBuffer = await downloadMediaMessage(quotedMsg.videoMessage, "buffer", {}, sock)
        if (!mediaBuffer || mediaBuffer.length === 0) {
          await sendQuotedWithFooter(sock, remoteJid, "❌ Failed to download video.", message)
          return
        }
        const stickerBuffer = await StickerService.videoToSticker(mediaBuffer)
        await sock.sendMessage(remoteJid, {
          sticker: stickerBuffer,
          packName: "KENNYJAKS",
          author: "Benimaru"
        }, { quoted: message })
        return
      }

      if (quotedMsg.stickerMessage) {
        const stickerBuffer = await downloadMediaMessage(quotedMsg.stickerMessage, "buffer", {}, sock)
        if (!stickerBuffer || stickerBuffer.length === 0) {
          await sendQuotedWithFooter(sock, remoteJid, "❌ Failed to download sticker.", message)
          return
        }
        const imageBuffer = await StickerService.stickerToImage(stickerBuffer)
        await sock.sendMessage(remoteJid, {
          image: imageBuffer,
          caption: "✅ Converted to image!"
        }, { quoted: message })
        return
      }

      await sendQuotedWithFooter(sock, remoteJid, USAGE, message)
      return
    } catch (err) {
      console.error("[KENNYJAKS ERROR] Sticker creation failed:", err)
      await sendQuotedWithFooter(sock, remoteJid, `❌ Sticker creation failed.\n${err.message}`, message)
    }
  }

  // Show help if no args and no quoted message
  await sendQuotedWithFooter(sock, remoteJid, USAGE, message)
}
