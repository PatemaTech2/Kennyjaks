import { sendQuotedWithFooter } from "../utils/messageHelper.js"
import { loadAllPlayers } from "../database/playerRepo.js"
import { LeaderboardCanvas } from "../canvas/leaderboardCard.js"

export async function handleLeaderboardStrong(sock, message) {
  const remoteJid = message.key.remoteJid

  let players
  try {
    players = await loadAllPlayers()
  } catch (e) {
    await sendQuotedWithFooter(sock, remoteJid, "Failed to load leaderboard.", message)
    return
  }

  if (!players || players.length === 0) {
    await sendQuotedWithFooter(sock, remoteJid, "No players found.", message)
    return
  }

  const sorted = players
    .slice()
    .sort((a, b) => {
      if ((b.grade || 4) !== (a.grade || 4)) {
        return (a.grade || 4) - (b.grade || 4)
      }
      if ((b.level || 1) !== (a.level || 1)) {
        return (b.level || 1) - (a.level || 1)
      }
      return (b.xp || 0) - (a.xp || 0)
    })
    .slice(0, 10)

  const renderer = new LeaderboardCanvas()
  let imageBuffer
  try {
    imageBuffer = await renderer.render(sorted)
  } catch (err) {
    console.error("LeaderboardCanvas render failed:", err)
    await sendQuotedWithFooter(sock, remoteJid, `❌ Leaderboard card failed.\n${err.message}`, message)
    return
  }

  await sock.sendMessage(remoteJid, { image: imageBuffer }, { quoted: message })
}
