import { sendQuotedWithFooter } from "../utils/messageHelper.js"
import { loadPlayerByPhone } from "../database/playerRepo.js"
import { getPotentialInfo } from "../services/technique/PotentialService.js"

export async function handlePotential(sock, message) {
  const remoteJid = message.key.remoteJid
  const sender = message.key.participant || remoteJid
  const phoneNumber = sender.split("@")[0]

  const player = await loadPlayerByPhone(phoneNumber)
  if (!player) {
    await sendQuotedWithFooter(sock, remoteJid, "You need to register first.\n\nUse /start to begin.", message)
    return
  }

  const grade = player.potential || "F"
  const info = getPotentialInfo(grade)

  const lines = [
    "═".repeat(30),
    "POTENTIAL",
    "═".repeat(30),
    "",
    `Potential: ${grade}`,
    info.label,
    "",
    "━━━━━━━━━━━━━━━━━━",
    "",
    "EFFECTS",
    ""
  ]

  const multipliers = info.multipliers
  if (!multipliers || Object.keys(multipliers).length === 0) {
    lines.push("Base stats only.")
    lines.push("No potential bonuses.")
  } else {
    for (const [stat, mult] of Object.entries(multipliers)) {
      const statLabel = {
        hp: "HP",
        ce: "CE",
        strength: "Strength",
        defense: "Defense",
        speed: "Speed",
        intelligence: "Intelligence"
      }[stat] || stat
      const multStr = mult === 2 ? "×2" : mult === 1.5 ? "×1.5" : mult === 1.3 ? "×1.3" : mult === 1.2 ? "×1.2" : `×${mult}`
      lines.push(`✔ ${statLabel} ${multStr}`)
    }
  }

  lines.push("")
  lines.push("━━━━━━━━━━━━━━━━━━")
  lines.push("")
  lines.push(info.description)
  lines.push("")
  lines.push("═".repeat(30))

  await sendQuotedWithFooter(sock, remoteJid, lines.join("\n"), message)
}
