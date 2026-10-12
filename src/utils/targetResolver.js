import { loadPlayerByPhone } from "../database/playerRepo.js"

export function resolveTargetPlayer(message, senderPhone) {
  const mentionedJid = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || []
  const quotedParticipant = message.message?.extendedTextMessage?.contextInfo?.participant || null

  if (mentionedJid.length > 0) {
    const mentionJid = mentionedJid[0]
    const phone = mentionJid.split("@")[0]
    return { source: "mention", phone, jid: mentionJid }
  }

  if (quotedParticipant) {
    const phone = quotedParticipant.split("@")[0]
    return { source: "quote", phone, jid: quotedParticipant }
  }

  return null
}

export async function resolveTarget(message, senderPhone) {
  const target = resolveTargetPlayer(message, senderPhone)
  if (!target) return null
  const player = await loadPlayerByPhone(target.phone)
  if (!player) return null
  return { ...target, player }
}
