import { sendQuotedWithFooter } from "../../utils/messageHelper.js"
import { loadPlayerByPhone, savePlayer } from "../../database/playerRepo.js"
import { SimpleBattleService } from "../../services/battle/SimpleBattleService.js"
import { KlootService } from "../../services/kloot/KlootService.js"
import { BattleManager } from "../../services/battle/BattleManager.js"
import { getActiveCurse } from "../../services/battle/CurseService.js"

function ensureBattleForSeal(player) {
  const battle = SimpleBattleService.getByPlayer(player.playerId)
  if (!battle) return null
  const opponent = battle.opponent
  if (!opponent) return null
  return { battle, opponent }
}

export async function handleSeal(sock, message) {
  const remoteJid = message.key.remoteJid
  const sender = message.key.participant || remoteJid
  const phoneNumber = sender.split("@")[0]

  const player = await loadPlayerByPhone(phoneNumber)
  if (!player) {
    await sendQuotedWithFooter(sock, remoteJid, "You need to register first.\n\nUse /start to begin.", message)
    return
  }

  if (!KlootService.hasKloot(player, "curse_binding_scroll")) {
    await sendQuotedWithFooter(sock, remoteJid, "You don't have a Curse Binding Scroll.\nDefeat curses to find one!", message)
    return
  }

  const context = ensureBattleForSeal(player)
  if (!context) {
    await sendQuotedWithFooter(sock, remoteJid, "You must be in battle with a curse to seal it.\nUse /fight first.", message)
    return
  }

  const { battle, opponent } = context
  const sealedCurse = {
    id: Date.now(),
    templateId: opponent.templateId || opponent.id,
    name: opponent.name,
    element: null,
    customName: null,
    customBio: null,
    baseStrength: opponent.strength,
    baseDefense: opponent.defense,
    baseHp: opponent.maxHp,
    baseCe: opponent.maxCursedEnergy,
    sealedAt: Date.now(),
    evolutionLevel: 0
  }

  KlootService.addSealedCurse(player, sealedCurse)
  player.sealedCurseIndex = player.sealedCurses.length - 1

  const lines = [
    "📜 CURSE SEALED!",
    "",
    `You sealed ${opponent.name} into a Curse Binding Scroll!`,
    "",
    "Stats (will grow with you):",
    `STR: ${sealedCurse.baseStrength}`,
    `DEF: ${sealedCurse.baseDefense}`,
    `HP: ${sealedCurse.baseHp}`,
    `CE: ${sealedCurse.baseCe}`,
    "",
    "Use these commands to customize:",
    "/curse-element <fire/lightning/wood/water/air/earth/metal>",
    "/set-cursename <name>",
    "/set-cursebio <bio>",
    "",
    "Summon with /scroll-curse-release"
  ]

  await sendQuotedWithFooter(sock, remoteJid, lines.join("\n"), message)

  battle.finished = true
  battle.winner = { id: String(player.playerId), name: player.name }
  SimpleBattleService.end(battle.id)
  await savePlayer(player)
}

export async function handleScrollRelease(sock, message) {
  const remoteJid = message.key.remoteJid
  const sender = message.key.participant || remoteJid
  const phoneNumber = sender.split("@")[0]

  const player = await loadPlayerByPhone(phoneNumber)
  if (!player) {
    await sendQuotedWithFooter(sock, remoteJid, "You need to register first.\n\nUse /start to begin.", message)
    return
  }

  if (!KlootService.hasKloot(player, "curse_binding_scroll")) {
    await sendQuotedWithFooter(sock, remoteJid, "You don't have a Curse Binding Scroll.", message)
    return
  }

  const sealed = KlootService.getActiveSealedCurse(player)
  if (!sealed) {
    await sendQuotedWithFooter(sock, remoteJid, "No sealed curse selected.\nUse /seal first.", message)
    return
  }

  const multiplier = 5.0
  const cursedTechnique = sealed.element ? `Cursed Technique: ${sealed.element}` : "No element set"

  const lines = [
    "📜 SCROLL RELEASED",
    "",
    `Curse: ${sealed.customName || sealed.name}`,
    `Element: ${cursedTechnique}`,
    "",
    "Bio:",
    sealed.customBio || "No bio set",
    "",
    "Current Stats:",
    `STR: ${Math.floor(sealed.baseStrength * multiplier)}`,
    `DEF: ${Math.floor(sealed.baseDefense * multiplier)}`,
    `HP: ${Math.floor(sealed.baseHp * multiplier)}`,
    `CE: ${Math.floor(sealed.baseCe * multiplier)}`,
    "",
    "Your sealed curse has been summoned!"
  ]

  await sendQuotedWithFooter(sock, remoteJid, lines.join("\n"), message)
}

export async function handleCurseElement(sock, message) {
  const remoteJid = message.key.remoteJid
  const sender = message.key.participant || remoteJid
  const phoneNumber = sender.split("@")[0]
  const text = (message.message?.conversation || message.message?.extendedTextMessage?.text || "").trim()

  const player = await loadPlayerByPhone(phoneNumber)
  if (!player) {
    await sendQuotedWithFooter(sock, remoteJid, "You need to register first.\n\nUse /start to begin.", message)
    return
  }

  if (!KlootService.hasKloot(player, "curse_binding_scroll")) {
    await sendQuotedWithFooter(sock, remoteJid, "You don't have a Curse Binding Scroll.", message)
    return
  }

  const args = text.split(" ")
  if (args.length < 2) {
    await sendQuotedWithFooter(sock, remoteJid, "Usage: /curse-element <fire/lightning/wood/water/air/earth/metal>", message)
    return
  }

  const element = args[1].toLowerCase()
  const validElements = ["fire", "lightning", "wood", "water", "air", "earth", "metal"]
  if (!validElements.includes(element)) {
    await sendQuotedWithFooter(sock, remoteJid, "Invalid element. Choose from: fire, lightning, wood, water, air, earth, metal", message)
    return
  }

  const sealed = KlootService.getActiveSealedCurse(player)
  if (!sealed) {
    await sendQuotedWithFooter(sock, remoteJid, "No sealed curse selected.", message)
    return
  }

  sealed.element = element
  await savePlayer(player)
  await sendQuotedWithFooter(sock, remoteJid, `✅ Sealed curse element set to ${element}!`, message)
}

export async function handleSetCurseName(sock, message) {
  const remoteJid = message.key.remoteJid
  const sender = message.key.participant || remoteJid
  const phoneNumber = sender.split("@")[0]
  const text = (message.message?.conversation || message.message?.extendedTextMessage?.text || "").trim()

  const player = await loadPlayerByPhone(phoneNumber)
  if (!player) {
    await sendQuotedWithFooter(sock, remoteJid, "You need to register first.\n\nUse /start to begin.", message)
    return
  }

  if (!KlootService.hasKloot(player, "curse_binding_scroll")) {
    await sendQuotedWithFooter(sock, remoteJid, "You don't have a Curse Binding Scroll.", message)
    return
  }

  const args = text.split(" ")
  if (args.length < 2) {
    await sendQuotedWithFooter(sock, remoteJid, "Usage: /set-cursename <name>", message)
    return
  }

  const name = args.slice(1).join(" ")
  const wordCount = name.split(" ").length
  if (wordCount > 50) {
    await sendQuotedWithFooter(sock, remoteJid, "Name must be 50 words or less.", message)
    return
  }

  const sealed = KlootService.getActiveSealedCurse(player)
  if (!sealed) {
    await sendQuotedWithFooter(sock, remoteJid, "No sealed curse selected.", message)
    return
  }

  sealed.customName = name
  await savePlayer(player)
  await sendQuotedWithFooter(sock, remoteJid, `✅ Sealed curse name set to: ${name}`, message)
}

export async function handleSetCurseBio(sock, message) {
  const remoteJid = message.key.remoteJid
  const sender = message.key.participant || remoteJid
  const phoneNumber = sender.split("@")[0]
  const text = (message.message?.conversation || message.message?.extendedTextMessage?.text || "").trim()

  const player = await loadPlayerByPhone(phoneNumber)
  if (!player) {
    await sendQuotedWithFooter(sock, remoteJid, "You need to register first.\n\nUse /start to begin.", message)
    return
  }

  if (!KlootService.hasKloot(player, "curse_binding_scroll")) {
    await sendQuotedWithFooter(sock, remoteJid, "You don't have a Curse Binding Scroll.", message)
    return
  }

  const args = text.split(" ")
  if (args.length < 2) {
    await sendQuotedWithFooter(sock, remoteJid, "Usage: /set-cursebio <bio>", message)
    return
  }

  const bio = args.slice(1).join(" ")
  const wordCount = bio.split(" ").length
  if (wordCount > 5000) {
    await sendQuotedWithFooter(sock, remoteJid, "Bio must be 5000 words or less.", message)
    return
  }

  const sealed = KlootService.getActiveSealedCurse(player)
  if (!sealed) {
    await sendQuotedWithFooter(sock, remoteJid, "No sealed curse selected.", message)
    return
  }

  sealed.customBio = bio
  await savePlayer(player)
  await sendQuotedWithFooter(sock, remoteJid, "✅ Sealed curse bio updated!", message)
}
