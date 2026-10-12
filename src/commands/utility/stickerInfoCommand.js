import { sendQuotedWithFooter } from "../../utils/messageHelper.js"
import { loadPlayerByPhone } from "../../database/playerRepo.js"
import { StickerService } from "../../services/sticker/StickerService.js"
import { downloadMediaMessage } from "@whiskeysockets/baileys"

export async function handleStickerInfo(sock, message) {
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
    await sendQuotedWithFooter(sock, remoteJid, "❌ Reply to a sticker to view its info.", message)
    return
  }

  try {
    const stickerBuffer = await downloadMediaMessage(quotedMsg.stickerMessage, "buffer", {}, sock)
    if (!stickerBuffer || stickerBuffer.length === 0) {
      await sendQuotedWithFooter(sock, remoteJid, "❌ Failed to download sticker.", message)
      return
    }

    const info = await StickerService.getStickerInfo(stickerBuffer)
    const lines = [
      "📊 STICKER INFO",
      "",
      `Format: ${info.format}`,
      `Resolution: ${info.width}x${info.height}`,
      `Size: ${(info.size / 1024).toFixed(1)} KB`,
      `Animated: ${info.animated ? "Yes" : "No"}`,
      `Pages: ${info.pages}`,
      `Channels: ${info.channels}`,
      `Depth: ${info.depth} bit`
    ]
    await sendQuotedWithFooter(sock, remoteJid, lines.join("\n"), message)
  } catch (err) {
    console.error("[KENNYJAKS ERROR] Sticker info failed:", err)
    await sendQuotedWithFooter(sock, remoteJid, `❌ Sticker info failed.\n${err.message}`, message)
  }
}
