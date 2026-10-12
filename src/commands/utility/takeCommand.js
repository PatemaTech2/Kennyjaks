import { sendQuotedWithFooter } from "../../utils/messageHelper.js"
import { loadPlayerByPhone } from "../../database/playerRepo.js"
import { StickerService } from "../../services/sticker/StickerService.js"
import { downloadMediaMessage } from "@whiskeysockets/baileys"

export async function handleTake(sock, message) {
  const remoteJid = message.key.remoteJid
  const sender = message.key.participant || remoteJid
  const phoneNumber = sender.split("@")[0]

  const player = await loadPlayerByPhone(phoneNumber)
  if (!player) {
    await sendQuotedWithFooter(sock, remoteJid, "You need to register first.\n\nUse /start to begin.", message)
    return
  }

  const text = (message.message.conversation || message.message.extendedTextMessage?.text || "").trim()
  const args = text.split(" ")
  
  if (args.length < 2) {
    await sendQuotedWithFooter(sock, remoteJid, "❌ Usage: /take <pack>|<author>\nExample: /take KennyJaks|Benimaru", message)
    return
  }

  const quotedMsg = message.message?.extendedTextMessage?.contextInfo?.quotedMessage
  if (!quotedMsg?.stickerMessage) {
    await sendQuotedWithFooter(sock, remoteJid, "❌ Reply to a sticker to take it.", message)
    return
  }

  const [pack, author] = args.slice(1).join(" ").split("|")
  if (!pack || !author) {
    await sendQuotedWithFooter(sock, remoteJid, "❌ Format: /take <pack>|<author>\nExample: /take KennyJaks|Benimaru", message)
    return
  }

  try {
    const stickerBuffer = await downloadMediaMessage(quotedMsg.stickerMessage, "buffer", {}, sock)
    if (!stickerBuffer || stickerBuffer.length === 0) {
      await sendQuotedWithFooter(sock, remoteJid, "❌ Sticker download failed.", message)
      return
    }

    await sock.sendMessage(remoteJid, {
      sticker: stickerBuffer,
      packName: pack.trim(),
      author: author.trim()
    }, { quoted: message })
  } catch (err) {
    console.error("[KENNYJAKS ERROR] Sticker send failed:", err)
    await sendQuotedWithFooter(sock, remoteJid, `❌ Sticker creation failed.\n${err.message}`, message)
  }
}
