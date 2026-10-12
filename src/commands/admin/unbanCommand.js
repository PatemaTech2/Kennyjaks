import { sendQuotedWithFooter } from "../../utils/messageHelper.js"
import { isOwnerOrModerator, normalizePhoneNumber } from "../../services/PermissionService.js"
import { resolveTargetPlayer } from "../../utils/targetResolver.js"
import { unbanUser } from "../../services/BanService.js"

export async function handleUnban(sock, message) {
  const remoteJid = message.key.remoteJid
  const sender = message.key.participant || remoteJid
  const senderPhone = normalizePhoneNumber(sender.split("@")[0])

  if (!isOwnerOrModerator(senderPhone)) {
    await sendQuotedWithFooter(sock, remoteJid, "⛔ This command is restricted to the Bot Owner and Bot Moderators.", message)
    return
  }

  const text = (message.message?.conversation || message.message?.extendedTextMessage?.text || "").trim()
  const args = text.split(" ").slice(1)

  const resolved = resolveTargetPlayer(message, senderPhone)
  let targetPhone = resolved ? resolved.phone : ""

  if (!targetPhone && args.length > 0) {
    targetPhone = normalizePhoneNumber(args[0].replace(/\D/g, ""))
  }

  if (!targetPhone) {
    await sendQuotedWithFooter(sock, remoteJid, "Usage: /unban <@user>\nOr quote a message then /unban\n\nExample: /unban @2349035952633", message)
    return
  }

  const unbanned = await unbanUser(targetPhone)
  if (!unbanned) {
    await sendQuotedWithFooter(sock, remoteJid, "❌ This user is not banned.", message)
    return
  }

  await sendQuotedWithFooter(sock, remoteJid,
    `✅ UNBANNED\n\n` +
    `User ${targetPhone} can now use the bot again.`, message)
}
