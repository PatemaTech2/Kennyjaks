import { sendQuotedWithFooter } from "../../utils/messageHelper.js"
import { loadPlayerByPhone, savePlayer } from "../../database/playerRepo.js"
import { BattleManager } from "../../services/battle/BattleManager.js"
import { TechniqueMasteryService } from "../../services/technique/TechniqueMasteryService.js"
import { ShikigamiCombatService } from "../../services/technique/ShikigamiCombatService.js"
import { MahoragaRitualService } from "../../services/technique/MahoragaRitualService.js"
import { MahoragaService } from "../../services/technique/MahoragaService.js"
import { isOwner } from "../../services/PermissionService.js"
import { setActiveCurse, clearActiveCurse } from "../../services/battle/CurseService.js"

export async function handleSummonShikigami(sock, message) {
  const remoteJid = message.key.remoteJid
  const sender = message.key.participant || remoteJid
  const phoneNumber = sender.split("@")[0]

  const text = (message.message?.conversation || message.message?.extendedTextMessage?.text || "").trim().toLowerCase()
  const args = text.split(" ")

  const player = await loadPlayerByPhone(phoneNumber)
  if (!player) {
    await sendQuotedWithFooter(sock, remoteJid, "You need to register first.\n\nUse /start to begin.", message)
    return
  }

  const inBattle = BattleManager.isInBattle(player.playerId)
  const isMahoraga = args[1] === "mahoraga"

  if (isMahoraga && !inBattle) {
    if (isOwner(phoneNumber)) {
      const testCurse = MahoragaService.createOwnerTestOpponent()
      setActiveCurse(player.playerId, testCurse)
      await savePlayer(player)
      await sendQuotedWithFooter(sock, remoteJid, `🐉 MAHORAGA TEST\n\nOwner test mode activated.\n\nMahoraga fights at 100% power.\n\nThis is a temporary test battle.\nVictory will NOT tame Mahoraga.\n\nUse /bflee to exit test mode.`, message)
      return
    }

    const canSummon = MahoragaService.canSummon(player)
    if (!canSummon.canSummon) {
      await sendQuotedWithFooter(sock, remoteJid, `❌ ${canSummon.reason}`, message)
      return
    }

    if (MahoragaService.isTamed(player)) {
      player.activeShikigami = "mahoraga"
      await savePlayer(player)
      await sendQuotedWithFooter(sock, remoteJid, "🐉 Mahoraga\n\nMahoraga has been equipped.\nUse /summon mahoraga in battle to summon him.", message)
      return
    }

    const subjugation = MahoragaRitualService.startRitual(player)
    if (!subjugation.success) {
      await sendQuotedWithFooter(sock, remoteJid, `❌ ${subjugation.reason || "Could not start subjugation."}`, message)
      return
    }

    await savePlayer(player)
    await sendQuotedWithFooter(sock, remoteJid, `🐉 MAHORAGA SUBJUGATION\n\n⚠️ You have summoned Mahoraga.\n\nThere is no enemy for him to fight.\nThe Divine General turns toward you.\n\nYou are the target.\n\n⚔️ SUBJUGATION BATTLE BEGINNING...\n\nMahoraga fights at 10% power.\nWin to tame him permanently.`, message)
    return
  }

  if (!inBattle) {
    await sendQuotedWithFooter(sock, remoteJid, "You can only summon shikigami during battle.\n\nUse /battlecurse or /ch to start a battle first.", message)
    return
  }

  const techniqueName = player.technique?.name
  if (techniqueName !== "Ten Shadows Technique" && techniqueName !== "Ten Shadows") {
    await sendQuotedWithFooter(sock, remoteJid, "Use /pet-equip to equip a pet.", message)
    return
  }

  if (args.length < 2) {
    const summonable = TechniqueMasteryService.getSummonableShikigami(player)
    if (summonable.length === 0) {
      await sendQuotedWithFooter(sock, remoteJid, "You have not conquered any shikigami yet.\n\nUse /train-divine-dogs to begin.", message)
      return
    }

    const lines = []
    lines.push("")
    lines.push("🐉 Your Conquered Shikigami")
    lines.push("━".repeat(30))
    lines.push("")
    lines.push(`Active Limit: ${ShikigamiCombatService.getActiveLimit(player)}`)
    lines.push("")
    summonable.forEach(s => {
      lines.push(`${s.emoji} ${s.name} — /summon ${s.id}`)
    })
    lines.push("")
    lines.push("Use /summon <name> to summon during battle.")

    await sendQuotedWithFooter(sock, remoteJid, lines.join("\n"), message)
    return
  }

  const shikigamiArg = args.slice(1).join("-").toLowerCase()
  const shikigami = TechniqueMasteryService.getShikigamiById(shikigamiArg) || TechniqueMasteryService.getShikigamiByName(shikigamiArg)

  if (!shikigami) {
    const allShikigami = TechniqueMasteryService.getShikigamiList()
    let available = ""
    for (const s of allShikigami) {
      const isConquered = TechniqueMasteryService.isShikigamiConquered(player, s.id)
      const status = isConquered ? "✅" : "🔒"
      available += `${status} ${s.emoji} ${s.name} — /summon ${s.id}\n`
    }
    await sendQuotedWithFooter(sock, remoteJid, `Unknown shikigami: ${shikigamiArg}\n\n${available}`, message)
    return
  }

  if (shikigami.id === "mahoraga") {
    const canSummon = MahoragaService.canSummon(player)
    if (!canSummon.canSummon) {
      await sendQuotedWithFooter(sock, remoteJid, `❌ ${canSummon.reason}`, message)
      return
    }
  } else {
    if (!TechniqueMasteryService.isShikigamiConquered(player, shikigami.id)) {
      await sendQuotedWithFooter(sock, remoteJid, `You have not conquered ${shikigami.emoji} ${shikigami.name} yet.\n\nUse /train-${shikigami.id} to challenge it.`, message)
      return
    }
  }

  const limitCheck = ShikigamiCombatService.canSummon(player, shikigami.id)
  if (!limitCheck.canSummon) {
    await sendQuotedWithFooter(sock, remoteJid, `❌ ${limitCheck.reason}`, message)
    return
  }

  player.activeShikigami = shikigami.id
  await savePlayer(player)

  const combatStats = ShikigamiCombatService.getScaledCombatStats(player, shikigami.id)
  const lines = []
  lines.push("")
  lines.push(`${shikigami.emoji} ${shikigami.name} SUMMONED`)
  lines.push("━".repeat(30))
  lines.push("")
  lines.push(shikigami.description)
  lines.push("")
  lines.push("Combat Stats:")
  lines.push(`  HP: ${combatStats?.hp || 0}`)
  lines.push(`  ATK: ${combatStats?.attack || 0}`)
  lines.push(`  DEF: ${combatStats?.defense || 0}`)
  lines.push(`  SPD: ${combatStats?.speed || 0}`)
  lines.push("")
  lines.push("Abilities:")
  shikigami.abilities?.forEach(a => {
    lines.push("  • " + a)
  })
  lines.push("")
  lines.push(`CE Cost: ${shikigami.ceCost || 50} | Cooldown: ${shikigami.cooldown || 1} turn(s)`)
  lines.push("")
  lines.push(`${shikigami.name} will now fight alongside you!`)

  await sendQuotedWithFooter(sock, remoteJid, lines.join("\n"), message)
}
