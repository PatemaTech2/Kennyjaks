import { sendQuotedWithFooter } from "../../utils/messageHelper.js"
import { loadPlayerByPhone } from "../../database/playerRepo.js"

export async function handlePets(sock, message) {
  const remoteJid = message.key.remoteJid
  const sender = message.key.participant || remoteJid
  const phoneNumber = sender.split("@")[0]

  const player = await loadPlayerByPhone(phoneNumber)
  if (!player) {
    await sendQuotedWithFooter(sock, remoteJid, "You need to register first.\n\nUse /start to begin.", message)
    return
  }

  const pets = player.pets || []
  if (pets.length === 0) {
    await sendQuotedWithFooter(sock, remoteJid, "You have no shikigami yet.\nHatch eggs with /hatch to get one!", message)
    return
  }

  const lines = ["━━━━━━━━━━━━━━━━━━━━━━", "🐉 YOUR SHIKIGAMI", "━━━━━━━━━━━━━━━━━━━━━━", ""]

  pets.forEach((pet, idx) => {
    const displayName = pet.nickname || pet.name || "Unknown"
    const active = pet.id === player.activePet
    const icon = active ? "🟢" : "🔵"
    lines.push(`${icon} ${displayName}`)
    lines.push(`   Species: ${pet.species || pet.name || "Unknown"}`)
    lines.push(`   Level: ${pet.level || 1} | HP: ${pet.hp || 0}/${pet.maxHp || 0}`)
    lines.push(`   Mood: ${pet.mood || "Neutral"} | Loyalty: ${(pet.loyalty || 0)}%`)
    if (active) lines.push(`   ★ ACTIVE`)
    lines.push("")
  })

  lines.push("Use: /pet to view active pet")
  lines.push("Use: /pet-equip <name> to equip")
  lines.push("━━━━━━━━━━━━━━━━━━━━━━")

  await sendQuotedWithFooter(sock, remoteJid, lines.join("\n"), message)
}
