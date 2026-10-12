import { sendQuotedWithFooter } from "../utils/messageHelper.js"
import { generatePlayer } from "../utils/generator.js"
import { getNextPlayerId } from "../utils/playerId.js"
import { getSavePath } from "../database/playerRepo.js"
import { ensureDbDir, savePlayer, loadPlayerByPhone, loadPlayerById } from "../database/playerRepo.js"
import { MAX_INVENTORY_SLOTS } from "../config/constants.js"
import { normalizePhoneNumber } from "../services/PermissionService.js"
import chalk from "chalk"
import { registrationUI } from "../utils/ui.js"

export async function handleStart(sock, message) {
  const remoteJid = message.key.remoteJid
  const sender = message.key.participant || remoteJid
  const phoneNumber = normalizePhoneNumber(sender.split("@")[0])
  const command = (message.parsedCommand?.command || "/start").toLowerCase()

  const existingPlayer = await loadPlayerByPhone(phoneNumber)
  if (existingPlayer) {
    await sendQuotedWithFooter(sock, remoteJid, "You're already registered.\n\nUse /menu.", message)
    return
  }

  if (command === "/start-curse") {
    await registerPlayer(sock, message, "curse")
    return
  }

  if (command === "/start-sorcerer") {
    await registerPlayer(sock, message, "sorcerer")
    return
  }

  await sendQuotedWithFooter(sock, remoteJid, "Choose your path:\n\nType /start-curse to become a Curse\nType /start-sorcerer to become a Sorcerer", message)
}

export async function handleStartCurse(sock, message) {
  await registerPlayer(sock, message, "curse")
}

export async function handleStartSorcerer(sock, message) {
  await registerPlayer(sock, message, "sorcerer")
}

async function registerPlayer(sock, message, faction) {
  const remoteJid = message.key.remoteJid
  const sender = message.key.participant || remoteJid
  const phoneNumber = normalizePhoneNumber(sender.split("@")[0])

  console.log("[REGISTRATION] Request received")
  console.log(`[REGISTRATION] User: ${phoneNumber}`)
  console.log(`[REGISTRATION] Path: ${faction}`)

  const existingPlayer = await loadPlayerByPhone(phoneNumber)
  if (existingPlayer) {
    console.log(`[REGISTRATION] Existing player found: ${existingPlayer.playerId}`)
    await sendQuotedWithFooter(sock, remoteJid, "You're already registered.\n\nUse /menu.", message)
    return
  }

  console.log("[REGISTRATION] Existing player: false")
  console.log("[REGISTRATION] Creating player")

  const name = message.pushName || (faction === "curse" ? "Curse" : "Sorcerer")
  const savePath = getSavePath()
  const playerId = getNextPlayerId(savePath)

  const playerData = generatePlayer(phoneNumber, name, playerId, faction)

  try {
    await ensureDbDir()
    await savePlayer(playerData)
    console.log(`[REGISTRATION] Database write successful for ${playerId}`)
  } catch (err) {
    console.error("[REGISTRATION ERROR]", err)
    await sendQuotedWithFooter(sock, remoteJid, "❌ Registration failed.\n\nYour character could not be saved. Please try /start-curse again.", message)
    return
  }

  console.log("[REGISTRATION] Verifying persistence")
  const savedPlayer = await loadPlayerById(playerId)
  if (!savedPlayer) {
    console.error(`[REGISTRATION ERROR] Verification failed for ${playerId}`)
    await sendQuotedWithFooter(sock, remoteJid, "❌ Registration failed.\n\nYour character could not be verified. Please try /start-curse again.", message)
    return
  }

  console.log(`[REGISTRATION] Verification successful`)
  console.log(`[REGISTRATION] Name: ${savedPlayer.name}`)
  console.log(`[REGISTRATION] Player ID: ${savedPlayer.playerId}`)
  console.log(`[REGISTRATION] Technique: ${savedPlayer.technique?.name || "None"}`)
  console.log("[REGISTRATION] Registration completed")
  console.log("")
  console.log(chalk.gray("─".repeat(50)))

  const ui = registrationUI(savedPlayer)
  await sendQuotedWithFooter(sock, remoteJid, ui, message)
}
