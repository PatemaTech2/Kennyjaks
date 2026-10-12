import { sendQuotedWithFooter } from "../../utils/messageHelper.js"
import { loadPlayerByPhone } from "../../database/playerRepo.js"
import { WorldStateService } from "../../services/world/WorldStateService.js"

const PAGE_SIZE = 5

export async function handleLegends(sock, message) {
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
  const page = Math.max(1, parseInt(args[0], 10) || 1)

  const state = WorldStateService.ensureWorldState()
  const all = state.legendaryBattles || []

  if (all.length === 0) {
    await sendQuotedWithFooter(sock, remoteJid, "📜 LEGENDS\n\nNo legendary battles recorded yet.", message)
    return
  }

  const totalPages = Math.max(1, Math.ceil(all.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const start = (safePage - 1) * PAGE_SIZE
  const items = all.slice(start, start + PAGE_SIZE)

  const lines = [
    "━━━━━━━━━━━━━━━━━━━━━━━━━━",
    "        📜 LEGENDS",
    "━━━━━━━━━━━━━━━━━━━━━━━━━━",
    "",
    `Page ${safePage}/${totalPages}`,
    ""
  ]

  items.forEach((battle, idx) => {
    const globalIdx = start + idx + 1
    const title = battle.title || `Legend #${globalIdx}`
    const location = battle.location || "Unknown"
    const winner = battle.winner || "Unknown"
    const rounds = battle.roundCount || battle.rounds || "?"
    lines.push(`${globalIdx}. ${title}`)
    lines.push(`   Location: ${location}`)
    lines.push(`   Winner: ${winner}`)
    lines.push(`   Rounds: ${rounds}`)
    lines.push("")
  })

  if (totalPages > 1) {
    lines.push(`Use /legends ${safePage + 1} for next page.`)
  }

  await sendQuotedWithFooter(sock, remoteJid, lines.join("\n"), message)
}
