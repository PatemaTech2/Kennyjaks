import { sendQuotedWithFooter } from "../../utils/messageHelper.js"
import { loadPlayerByPhone } from "../../database/playerRepo.js"
import { TechniqueMasteryService } from "../../services/technique/TechniqueMasteryService.js"

export async function handleTrainShikigami(sock, message) {
  const remoteJid = message.key.remoteJid
  const sender = message.key.participant || remoteJid
  const phoneNumber = sender.split("@")[0]

  const player = await loadPlayerByPhone(phoneNumber)
  if (!player) {
    await sendQuotedWithFooter(sock, remoteJid, "You need to register first.\n\nUse /start to begin.", message)
    return
  }

  const techniqueName = player.technique?.name
  if (techniqueName !== "Ten Shadows Technique" && techniqueName !== "Ten Shadows") {
    await sendQuotedWithFooter(sock, remoteJid, "You do not wield the Ten Shadows Technique.\n\nOnly Ten Shadows users can conquer shikigami.", message)
    return
  }

  const result = TechniqueMasteryService.getTenShadowsDisplay(player)
  if (result.error) {
    await sendQuotedWithFooter(sock, remoteJid, result.error, message)
    return
  }

  await sendQuotedWithFooter(sock, remoteJid, result.display, message)
}

export async function handleTrainShikigamiForId(sock, message, shikigamiArg) {
  const remoteJid = message.key.remoteJid
  const sender = message.key.participant || remoteJid
  const phoneNumber = sender.split("@")[0]

  const player = await loadPlayerByPhone(phoneNumber)
  if (!player) {
    await sendQuotedWithFooter(sock, remoteJid, "You need to register first.\n\nUse /start to begin.", message)
    return
  }

  const techniqueName = player.technique?.name
  if (techniqueName !== "Ten Shadows Technique" && techniqueName !== "Ten Shadows") {
    await sendQuotedWithFooter(sock, remoteJid, "You do not wield the Ten Shadows Technique.\n\nOnly Ten Shadows users can conquer shikigami.", message)
    return
  }

  const shikigami = TechniqueMasteryService.getShikigamiById(shikigamiArg) || TechniqueMasteryService.getShikigamiByName(shikigamiArg)

  if (!shikigami) {
    let available = ""
    const allShikigami = TechniqueMasteryService.getShikigamiList()
    for (const s of allShikigami) {
      const canConquer = TechniqueMasteryService.canConquerShikigami(player, s.id)
      const isConquered = TechniqueMasteryService.isShikigamiConquered(player, s.id)
      const status = isConquered ? "✅" : (canConquer.canConquer ? "🔸" : "🔒")
      available += `${status} ${s.emoji} ${s.name} — /train-${s.id}\n`
    }
    await sendQuotedWithFooter(sock, remoteJid, `Unknown shikigami: ${shikigamiArg}\n\nAvailable shikigami:\n${available}`, message)
    return
  }

  const canConquer = TechniqueMasteryService.canConquerShikigami(player, shikigami.id)
  if (!canConquer.canConquer) {
    await sendQuotedWithFooter(sock, remoteJid, `${shikigami.emoji} ${shikigami.name}\n\n${canConquer.reason}`, message)
    return
  }

  const { setShikigamiRitual } = await import("../../services/battle/ShikigamiRitualService.js")
  const result = setShikigamiRitual(player, shikigami.id)

  if (result.error) {
    await sendQuotedWithFooter(sock, remoteJid, result.error, message)
    return
  }

  const lines = []
  lines.push("")
  lines.push("━━━ SHIKIGAMI RITUAL ━━━")
  lines.push("")
  lines.push(`${shikigami.emoji} ${shikigami.name}`)
  lines.push("")
  lines.push(`"${result.dialogue}"`)
  lines.push("")
  lines.push(`${shikigami.name} have accepted your challenge!`)
  lines.push("The shikigami fights at 10% of its true power.")
  lines.push("")
  lines.push("Use /spawnenemy to encounter a curse and battle it.")
  lines.push("Defeat it to earn its submission.")
  lines.push("")
  lines.push("━━━ BATTLE INFO ━━━")
  lines.push(`HP: ${result.opponentHp}`)
  lines.push(`Attack: ${result.opponentAttack}`)
  lines.push(`CE Cost: ${shikigami.ceCost || 50} CE`)
  lines.push("")

  await sendQuotedWithFooter(sock, remoteJid, lines.join("\n"), message)
}
