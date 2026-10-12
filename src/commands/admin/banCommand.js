import { sendQuotedWithFooter } from "../../utils/messageHelper.js"
import { isOwnerOrModerator, normalizePhoneNumber } from "../../services/PermissionService.js"
import { resolveTargetPlayer } from "../../utils/targetResolver.js"
import { banUser, isBanned } from "../../services/BanService.js"

export async function handleBan(sock, message) {
  const remoteJid = message.key.remoteJid
  const sender = message.key.participant || remoteJid
  const phoneNumber = normalizePhoneNumber(sender.split("@")[0])

  if (!isOwnerOrModerator(phoneNumber)) {
    await sendQuotedWithFooter(sock, remoteJid, "⛔ This command is restricted to the Bot Owner and Bot Moderators.", message)
    return
  }

  const text = (message.message?.conversation || message.message?.extendedTextMessage?.text || "").trim()
  const args = text.split(" ").slice(1)

  const resolved = resolveTargetPlayer(message, phoneNumber)
  let targetPhone = resolved ? resolved.phone : ""

  if (!targetPhone && args.length > 0) {
    targetPhone = normalizePhoneNumber(args[0].replace(/\D/g, ""))
  }

  if (!targetPhone) {
    await sendQuotedWithFooter(sock, remoteJid, "Usage: /ban <@user>\nOr quote a message then /ban\n\nExample: /ban @2349035952633", message)
    return
  }

  if (await isBanned(targetPhone)) {
    await sendQuotedWithFooter(sock, remoteJid, `⚠️ This user is already banned.`, message)
    return
  }

  const reason = args.slice(1).join(" ").trim() || "No reason given"
  await banUser(targetPhone, reason)

  await sendQuotedWithFooter(sock, remoteJid,
    `🚫 BANNED\n\n` +
    `User ${targetPhone} has been banned from using the bot.\n` +
    `Reason: ${reason}`, message)
}