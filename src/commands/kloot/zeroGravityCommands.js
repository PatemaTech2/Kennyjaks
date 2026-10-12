import { sendQuotedWithFooter } from "../../utils/messageHelper.js"
import { loadPlayerByPhone, savePlayer } from "../../database/playerRepo.js"
import { KlootService } from "../../services/kloot/KlootService.js"

export async function handleZeroGravityUse(sock, message) {
  const remoteJid = message.key.remoteJid
  const sender = message.key.participant || remoteJid
  const phoneNumber = sender.split("@")[0]

  const player = await loadPlayerByPhone(phoneNumber)
  if (!player) {
    await sendQuotedWithFooter(sock, remoteJid, "You need to register first.\n\nUse /start to begin.", message)
    return
  }

  if (!KlootService.hasKloot(player, "zero_gravity")) {
    await sendQuotedWithFooter(sock, remoteJid, "You don't have the Zero Gravity kloot.", message)
    return
  }

  if (KlootService.isOnCooldown(player, "zero_gravity")) {
    const remaining = KlootService.getCooldownRemaining(player, "zero_gravity")
    await sendQuotedWithFooter(sock, remoteJid, `Zero Gravity is on cooldown for ${Math.ceil(remaining / 1000)}s.`, message)
    return
  }

  KlootService.setCooldown(player, "zero_gravity", 60000)

  await sendQuotedWithFooter(sock, remoteJid, "🌀 ZERO GRAVITY ACTIVATED\n\nYour opponent's gravity has been reduced!\n70% miss rate applied for this battle.", message)
}

export async function handleNova(sock, message) {
  const remoteJid = message.key.remoteJid
  const sender = message.key.participant || remoteJid
  const phoneNumber = sender.split("@")[0]

  const player = await loadPlayerByPhone(phoneNumber)
  if (!player) {
    await sendQuotedWithFooter(sock, remoteJid, "You need to register first.\n\nUse /start to begin.", message)
    return
  }

  if (!KlootService.hasKloot(player, "zero_gravity")) {
    await sendQuotedWithFooter(sock, remoteJid, "You don't have the Zero Gravity kloot.", message)
    return
  }

  if (KlootService.isOnCooldown(player, "zero_gravity_nova")) {
    const remaining = KlootService.getCooldownRemaining(player, "zero_gravity_nova")
    await sendQuotedWithFooter(sock, remoteJid, `Nova is on cooldown for ${Math.ceil(remaining / 1000)}s.`, message)
    return
  }

  const hpCost = Math.floor(player.health * 0.9)
  if (player.health <= hpCost) {
    await sendQuotedWithFooter(sock, remoteJid, "Not enough HP to use Nova (need 90%).", message)
    return
  }

  player.health = player.health - hpCost
  KlootService.setCooldown(player, "zero_gravity_nova", 300000)

  await savePlayer(player)
  await sendQuotedWithFooter(sock, remoteJid, "💥 NOVA ACTIVATED\n\nYou sacrificed 90% HP to mix domains and create a Nova Ball!\nAll online players affected by Heavy for 20 seconds.", message)
}
