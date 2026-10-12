import { sendQuotedWithFooter } from "../../utils/messageHelper.js"
import { loadPlayerByPhone, savePlayer } from "../../database/playerRepo.js"
import { KlootService } from "../../services/kloot/KlootService.js"

export async function handleBurn(sock, message) {
  const remoteJid = message.key.remoteJid
  const sender = message.key.participant || remoteJid
  const phoneNumber = sender.split("@")[0]

  const player = await loadPlayerByPhone(phoneNumber)
  if (!player) {
    await sendQuotedWithFooter(sock, remoteJid, "You need to register first.\n\nUse /start to begin.", message)
    return
  }

  if (!KlootService.hasKloot(player, "benimaru")) {
    await sendQuotedWithFooter(sock, remoteJid, "You don't have the Benimaru kloot.", message)
    return
  }

  if (KlootService.isOnCooldown(player, "benimaru_burn")) {
    const remaining = KlootService.getCooldownRemaining(player, "benimaru_burn")
    await sendQuotedWithFooter(sock, remoteJid, `Burn is on cooldown for ${Math.ceil(remaining / 1000)}s.`, message)
    return
  }

  KlootService.setCooldown(player, "benimaru_burn", 300000)

  await sendQuotedWithFooter(sock, remoteJid, "🔥 BENIMARU'S FLAME\n\nYou summoned divine flames strong enough to burn the server!\nThe enemy has been incinerated!", message)
}

export async function handleFlaura(sock, message) {
  const remoteJid = message.key.remoteJid
  const sender = message.key.participant || remoteJid
  const phoneNumber = sender.split("@")[0]

  const player = await loadPlayerByPhone(phoneNumber)
  if (!player) {
    await sendQuotedWithFooter(sock, remoteJid, "You need to register first.\n\nUse /start to begin.", message)
    return
  }

  if (!KlootService.hasKloot(player, "benimaru")) {
    await sendQuotedWithFooter(sock, remoteJid, "You don't have the Benimaru kloot.", message)
    return
  }

  await sendQuotedWithFooter(sock, remoteJid, "🔥 FLAURA ACTIVATED\n\nAn environment of flames surrounds you and the enemy!\nThe enemy will take 1 HP per second.", message)
}

export async function handleEverburn(sock, message) {
  const remoteJid = message.key.remoteJid
  const sender = message.key.participant || remoteJid
  const phoneNumber = sender.split("@")[0]

  const player = await loadPlayerByPhone(phoneNumber)
  if (!player) {
    await sendQuotedWithFooter(sock, remoteJid, "You need to register first.\n\nUse /start to begin.", message)
    return
  }

  if (!KlootService.hasKloot(player, "benimaru")) {
    await sendQuotedWithFooter(sock, remoteJid, "You don't have the Benimaru kloot.", message)
    return
  }

  if (KlootService.isOnCooldown(player, "benimaru_everburn")) {
    const remaining = KlootService.getCooldownRemaining(player, "benimaru_everburn")
    await sendQuotedWithFooter(sock, remoteJid, `Everburn is on cooldown for ${Math.ceil(remaining / 1000)}s.`, message)
    return
  }

  player.health = 0
  KlootService.setCooldown(player, "benimaru_everburn", 86400000)

  await savePlayer(player)
  await sendQuotedWithFooter(sock, remoteJid, "🔥🔥🔥 EVERBURN ACTIVATED 🔥🔥🔥\n\nYou sacrificed 100% HP for 60 seconds of ultimate power!\nYour stats are maxed!\n\nStatus Effect: I AM BENIMARU\nYou will survive for 60 seconds no matter what.", message)
}
