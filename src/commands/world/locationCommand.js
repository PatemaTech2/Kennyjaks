import { sendQuotedWithFooter } from "../../utils/messageHelper.js"
import { loadPlayerByPhone } from "../../database/playerRepo.js"
import { LOCATIONS } from "../../data/world/locations.js"
import { WorldStateService } from "../../services/world/WorldStateService.js"

export async function handleLocation(sock, message) {
  const remoteJid = message.key.remoteJid
  const sender = message.key.participant || remoteJid
  const phoneNumber = sender.split("@")[0]

  const player = await loadPlayerByPhone(phoneNumber)
  if (!player) {
    await sendQuotedWithFooter(sock, remoteJid, "You need to register first.\n\nUse /start to begin.", message)
    return
  }

  const locationId = player.currentLocation || "tokyo"
  const location = LOCATIONS[locationId]

  if (!location) {
    await sendQuotedWithFooter(sock, remoteJid, "Location data error. Please travel to a valid location.", message)
    return
  }

  const lines = [
    `📍 ${location.name.toUpperCase()}`,
    ``,
    location.description,
    ``,
    `━━━━━━━━━━━━━━━━━━━━━━━━━━`,
    ``,
    `Danger Level: ${"⚠️".repeat(location.dangerLevel)}${"☆".repeat(Math.max(0, 10 - location.dangerLevel))}`,
    ``,
    `Use /spawnenemy to encounter curses in this area.`
  ]

  const history = WorldStateService.getLocationHistory(locationId)
  if (history.length > 0) {
    lines.push(``)
    lines.push(`━━━━━━━━━━━━━━━━━━━━━━━━━━`)
    lines.push(``)
    lines.push(`Known Showdowns: ${history.length}`)
    lines.push(``)

    const recentBattles = history.slice(-3).reverse()
    recentBattles.forEach((battle, index) => {
      lines.push(`${location.name.toUpperCase()} SHOWDOWN #${history.length - index}`)
      lines.push(``)
      lines.push(`${battle.winner || "Unknown"} VS ${battle.loser || "Unknown"}`)
      lines.push(``)
      if (battle.rounds) lines.push(`Rounds: ${battle.rounds}`)
      if (battle.blackFlashes) lines.push(`Black Flashes: ${battle.blackFlashes}`)
      lines.push(``)
    })
  }

  await sendQuotedWithFooter(sock, remoteJid, lines.join("\n"), message)
}
