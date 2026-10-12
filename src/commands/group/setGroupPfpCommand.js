import { sendQuotedWithFooter } from "../../utils/messageHelper.js"
import fsExtra from "fs-extra"
import path from "path"

const GROUP_PFP_DIR = path.resolve("database/groupPfps")
const MAX_SIZE = 2 * 1024 * 1024

async function ensureGroupPfpDir() {
  await fsExtra.ensureDir(GROUP_PFP_DIR)
}

export async function handleSetGroupPfp(sock, message) {
  const remoteJid = message.key.remoteJid
  const sender = message.key.participant || remoteJid
  const phoneNumber = sender.split("@")[0]

  const isGroup = remoteJid.endsWith("@g.us")
  if (!isGroup) {
    await sendQuotedWithFooter(sock, remoteJid, "This command can only be used in groups.", message)
    return
  }

  const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage
  const imageMsg = quoted?.imageMessage || quoted?.videoMessage || message.message?.imageMessage || message.message?.videoMessage

  if (!imageMsg) {
    await sendQuotedWithFooter(sock, remoteJid, "Reply to an image/video with /setgrouppfp to set the group's curse image.", message)
    return
  }

  await ensureGroupPfpDir()

  let buffer
  try {
    buffer = await sock.downloadMediaMessage(imageMsg)
  } catch (error) {
    console.error("[KENNYJAKS ERROR] Failed to download group pfp media:", error.message)
    await sendQuotedWithFooter(sock, remoteJid, "Failed to download image. Try replying to the image again.", message)
    return
  }

  if (!buffer || buffer.length === 0) {
    await sendQuotedWithFooter(sock, remoteJid, "Downloaded media is empty. Try another image.", message)
    return
  }

  if (buffer.length > MAX_SIZE) {
    await sendQuotedWithFooter(sock, remoteJid, `Image too large. Max size is ${MAX_SIZE / 1024 / 1024}MB.`, message)
    return
  }

  const ext = imageMsg.mimetype?.includes("png") ? "png" : "jpg"
  const safeId = remoteJid.replace(/[@.]/g, "_")
  const fileName = `${safeId}.${ext}`
  const filePath = path.join(GROUP_PFP_DIR, fileName)

  try {
    await fsExtra.ensureDir(path.dirname(filePath))
    await fsExtra.writeFile(filePath, buffer)
    await sendQuotedWithFooter(sock, remoteJid, "✅ Group curse image updated! This will appear when a curse spawns.", message)
  } catch (error) {
    console.error("[KENNYJAKS ERROR] Failed to save group pfp:", error.message)
    await sendQuotedWithFooter(sock, remoteJid, "Failed to save image. Try again.", message)
  }
}
