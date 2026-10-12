import { sendQuotedWithFooter } from "../../utils/messageHelper.js"
import { loadPlayerByPhone, savePlayer } from "../../database/playerRepo.js"
import { PetService } from "../../services/pet/PetService.js"
import { EggRevealCard } from "../../canvas/eggReveal.js"

export async function handleHatch(sock, message) {
  const remoteJid = message.key.remoteJid
  const sender = message.key.participant || remoteJid
  const phoneNumber = sender.split("@")[0]

  const player = await loadPlayerByPhone(phoneNumber)
  if (!player) {
    await sendQuotedWithFooter(sock, remoteJid, "You need to register first.\n\nUse /start to begin.", message)
    return
  }

  const eggs = player.eggs || []
  const incubatingEggs = eggs.filter(e => e.status === "Incubating")

  if (incubatingEggs.length === 0) {
    await sendQuotedWithFooter(sock, remoteJid, "No eggs incubating.", message)
    return
  }

  const egg = incubatingEggs[0]
  const now = Date.now()
  const hatchTime = new Date(egg.hatchTime).getTime()

  if (now < hatchTime) {
    const remaining = hatchTime - now
    const hours = Math.floor(remaining / (1000 * 60 * 60))
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60))
    const lines = [
      "🥚 Egg Status",
      "",
      `Remaining: ${hours}h ${minutes}m`,
      "",
      "Your egg is shaking...",
      "Something inside is growing..."
    ]
    await sendQuotedWithFooter(sock, remoteJid, lines.join("\n"), message)
    return
  }

  const result = await PetService.hatchEgg(player, eggs.indexOf(egg))
  if (result.error) {
    await sendQuotedWithFooter(sock, remoteJid, result.error, message)
    return
  }

  const pet = result.pet
  const renderer = new EggRevealCard()
  let imageBuffer
  try {
    imageBuffer = await renderer.render(player, pet)
  } catch (err) {
    console.error("[KENNYJAKS ERROR] EggRevealCard render failed:", err)
    await sendQuotedWithFooter(sock, remoteJid, `❌ Egg reveal failed.\n${err.message}`, message)
    return
  }

  await sock.sendMessage(remoteJid, { image: imageBuffer, caption: `You obtained ${pet.name || "Unknown Shikigami"}!` }, { quoted: message })
}

