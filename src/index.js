import "dotenv/config"
import chalk from "chalk"
import { startWhatsApp } from "./services/whatsappService.js"
import { migratePotentials } from "./services/migrateService.js"
import { runMigration as runProgressionMigration } from "./services/progression/migratePlayers.js"
import { runDomainEligibilityMigration } from "./services/domainEligibilityMigration.js"
import { runAttributeMigration } from "./services/progression/attributeMigration.js"
import { parseCommand } from "./services/commandParser.js"
import { buildRegistry, hasCommandPermission } from "./services/commandRegistry.js"
import { loadPlayerByPhone, savePlayer, playerExists } from "./database/playerRepo.js"
import { sendQuotedWithFooter } from "./utils/messageHelper.js"
import { getGroup, isGroupEnabled, loadAllGroups } from "./database/groupRepo.js"
import { isOwnerOrModerator } from "./services/PermissionService.js"
import { checkCooldown, setCooldown } from "./utils/commandCooldown.js"
import { checkThirst, isThirstExemptCommand } from "./commands/drinkCommand.js"
import { syncAllPlayerUnlocks } from "./services/progression/ProgressionSyncService.js"
import { WorldStateService } from "./services/world/WorldStateService.js"
import { getRandomCard, spawnGroupCard, getActiveGroupCard, claimGroupCard, clearAllPlayerCards, clearAllGroupCards } from "./services/card/CardService.js"
import { handleClaimCard, handleDeck } from "./commands/card/claimCardCommand.js"
import { handleDuel, handleCardAttack } from "./commands/card/duelCommand.js"
import { handleSellCard, handleTradeCard, handleCollection } from "./commands/card/sellCardCommand.js"
import { handleDeckCommand } from "./commands/card/deckCommand.js"
import { handleSpawnCard } from "./commands/card/spawnCardCommand.js"
import { connectMongo, isMongoConnected } from "./database/mongoService.js"
import { initBirthdayScheduler } from "./services/scheduler/birthdayScheduler.js"
import { isBanned } from "./services/BanService.js"
import { initOwnerJsonCache } from "./services/PermissionService.js"
import fsExtra from "fs-extra"
import path from "path"

// ========== IMPROVEMENTS: Moved to config ==========
const MESSAGE_HANDLER_CONFIG = {
  SESSION_TIME_MAX_MS: 3600000,  // 1 hour
  THIRST_DECREASE_CHANCE: 0.15,
  THIRST_DECREASE_MIN: 1,
  THIRST_DECREASE_MAX: 5,
  THIRST_MIN: 0,
  THIRST_MAX: 100,
  GROUP_WELCOME_MENTION_LIMIT: 10,
  THIRST_CHECK_INTERVAL: 60000  // Only check thirst once per minute
}

// ========== IMPROVEMENTS: Cached imports ==========
let groupCommandsCache = null

async function getGroupCommands() {
  if (!groupCommandsCache) {
    groupCommandsCache = await import("./commands/groupCommand.js")
  }
  return groupCommandsCache
}

// ========== IMPROVEMENTS: Structured logger ==========
class Logger {
  log(level, component, message, data = {}) {
    const log = {
      timestamp: new Date().toISOString(),
      level,
      component,
      message,
      ...data
    }
    console.log(JSON.stringify(log))
  }
  
  info(component, msg, data) { this.log("INFO", component, msg, data) }
  error(component, msg, data) { this.log("ERROR", component, msg, data) }
  debug(component, msg, data) { this.log("DEBUG", component, msg, data) }
}

const logger = new Logger()

// ========== IMPROVEMENTS: Run migrations with error handling ==========
async function runMigrations() {
  const migrations = [
    { name: "Potentials", fn: migratePotentials },
    { name: "Progression", fn: runProgressionMigration },
    { name: "Domain Eligibility", fn: runDomainEligibilityMigration },
    { name: "Attributes", fn: runAttributeMigration }
  ]
  
  for (const migration of migrations) {
    try {
      logger.info("MIGRATIONS", `Starting ${migration.name}`)
      await migration.fn()
      logger.info("MIGRATIONS", `✓ ${migration.name} completed`)
    } catch (err) {
      logger.error("MIGRATIONS", `✗ ${migration.name} failed`, {
        error: err.message,
        stack: err.stack
      })
      // Continue with other migrations, but log the error
    }
  }
  
  // Run dynamic imports
  try {
    const { migrateAllPlayersTechniqueControl } = await import("./services/AttributeService.js")
    await migrateAllPlayersTechniqueControl()
    logger.info("MIGRATIONS", "✓ Technique control migration completed")
  } catch (err) {
    logger.error("MIGRATIONS", "Technique control migration failed", { error: err.message })
  }
  
  try {
    const { runTechniqueMigration } = await import("./services/technique/techniqueMigrationRunner.js")
    await runTechniqueMigration()
    logger.info("MIGRATIONS", "✓ Technique migration completed")
  } catch (err) {
    logger.error("MIGRATIONS", "Technique migration failed", { error: err.message })
  }
}

const registry = buildRegistry()

const COMMAND_REACTION_EMOJIS = ["🃏", "✨", "🔥", "💫", "🌟", "🎴", "💥", "⚡", "🎯", "💎", "🫡", "🤙", "👊", "🤝", "💪", "🫶", "❤️‍🔥"]

async function sendCommandReaction(sock, message) {
  const emoji = COMMAND_REACTION_EMOJIS[Math.floor(Math.random() * COMMAND_REACTION_EMOJIS.length)]
  try {
    await sock.sendMessage(message.key.remoteJid, {
      reaction: {
        text: emoji,
        key: message.key
      }
    })
  } catch {
    // reactions are optional, ignore failures
  }
}

async function clearAllPlayerData() {
  if (isMongoConnected()) {
    const { getMongoDb } = await import("./database/mongoService.js")
    const db = getMongoDb()
    await db.collection("players").deleteMany({})
  } else {
    const playersDir = path.resolve("database/players")
    try {
      await fsExtra.emptyDir(playersDir)
    } catch {
      await fsExtra.ensureDir(playersDir)
    }
  }
  clearAllPlayerCards()
  clearAllGroupCards()
}

async function sendResetMessage(sock) {
  const groups = await loadAllGroups()
  const enabledGroups = groups.filter(g => g.enabled)
  for (const group of enabledGroups) {
    try {
      await sock.sendMessage(group.groupId, {
        text: "Player data reset bro, no disturb the creator before i beat you"
      })
    } catch {
      // ignore send failures
    }
  }
}

async function startCardSpawner(sock) {
  const spawnCard = async () => {
    const groups = await loadAllGroups()
    const enabledGroups = groups.filter(g => g.enabled)
    for (const group of enabledGroups) {
      try {
        const existing = getActiveGroupCard(group.groupId)
        if (existing) continue
        const card = getRandomCard()
        if (!card) continue
        spawnGroupCard(group.groupId, card)
        await sock.sendMessage(group.groupId, {
          text: `🃏 A new card has spawned!\n\n${card.name}\n⭐ Tier: ${card.tier}\n💰 Worth: ¥${(card.worth || 0).toLocaleString()}\n\nUse /claim-card to claim it before it expires!`
        })
      } catch {
        // ignore
      }
    }
  }

  await spawnCard()
  setInterval(spawnCard, 30 * 60 * 1000)
}

async function startGroupCurseSpawner(sock) {
  const { loadActiveGroupCursesFromDisk, spawnGroupCurse } = await import("./services/battle/GroupCurseService.js")
  const { CurseCanvas } = await import("./canvas/curseCanvas.js")

  loadActiveGroupCursesFromDisk()

  const spawnCurse = async () => {
    const groups = await loadAllGroups()
    const enabledGroups = groups.filter(g => g.enabled)
    for (const group of enabledGroups) {
      try {
        const existing = getActiveGroupCurse(group.groupId)
        if (existing) {
          despawnGroupCurse(group.groupId)
        }

        const entry = spawnGroupCurse(group.groupId, { playerLevel: 1, playerGrade: 4 })
        if (!entry) continue

        const canvas = new CurseCanvas()
        const buffer = await canvas.render(entry.curse, group.groupId)

        await sock.sendMessage(group.groupId, {
          image: buffer,
          caption: `👹 A curse has manifested!\n\n${entry.curse.name}\n⭐ Grade: ${entry.curse.gradeLabel || `Grade ${entry.curse.grade}`}\n\nUse /fight to engage!`
        })
      } catch {
        // ignore
      }
    }
  }

  await spawnCurse()
  setInterval(spawnCurse, 15 * 60 * 1000)
}

async function main() {
  const onMessage = async (sock, message) => {
    const remoteJid = message.key.remoteJid
    
    logger.debug("MESSAGE_HANDLER", "onMessage called", { 
      remoteJid,
      hasMessage: !!message.message 
    })
    
    if (!message.message) {
      logger.debug("MESSAGE_HANDLER", "No message.message property")
      return
    }

    const { raw, command, args, sender, senderJid, isGroup, mentionedUsers, quotedMessage } = parseCommand(message)
    
    // ========== FIX #1: REMOVED CORRUPTED BRACKETS ==========
    if (!raw || !command) {
      logger.debug("MESSAGE_HANDLER", "No command extracted", { raw: raw?.substring(0, 50) })
      return
    }

    // Block banned users
    if (await isBanned(sender)) {
      await sendQuotedWithFooter(sock, remoteJid, "⛔ You are banned from using this bot.", message)
      return
    }

    message.parsedCommand = { raw, command, args, sender, senderJid, isGroup, mentionedUsers, quotedMessage }

    logger.info("MESSAGE_HANDLER", "Command received", { command, sender })

    // ========== IMPROVEMENTS: Better player state management ==========
    const player = await loadPlayerByPhone(sender)
    if (player) {
      const now = Date.now()
      let modified = false
      
      // Track session time
      if (player.lastSeen) {
        const sessionTime = now - player.lastSeen
        if (sessionTime > 0 && sessionTime < MESSAGE_HANDLER_CONFIG.SESSION_TIME_MAX_MS) {
          player.totalPlayTime = (player.totalPlayTime || 0) + sessionTime
          modified = true
        }
      }
      
      if (player.lastSeen !== now) {
        player.lastSeen = now
        modified = true
      }

      // Check thirst with interval to avoid excessive calculations
      if (typeof player.thirst !== "undefined" && player.thirst !== null) {
        const lastThirstCheck = player._lastThirstCheck || 0
        if (now - lastThirstCheck > MESSAGE_HANDLER_CONFIG.THIRST_CHECK_INTERVAL) {
          const shouldDecrease = Math.random() < MESSAGE_HANDLER_CONFIG.THIRST_DECREASE_CHANCE
          if (shouldDecrease) {
            const decrease = Math.floor(Math.random() * MESSAGE_HANDLER_CONFIG.THIRST_DECREASE_MAX) + MESSAGE_HANDLER_CONFIG.THIRST_DECREASE_MIN
            const newThirst = Math.max(
              MESSAGE_HANDLER_CONFIG.THIRST_MIN, 
              (player.thirst || MESSAGE_HANDLER_CONFIG.THIRST_MAX) - decrease
            )
            if (newThirst !== player.thirst) {
              player.thirst = newThirst
              player._lastThirstCheck = now
              modified = true
            }
          }
        }
      }
      
      // Single save at the end
      if (modified) {
        await savePlayer(player)
      }
    }

    if (player && !isThirstExemptCommand(raw) && !checkThirst(player)) {
      await sendQuotedWithFooter(sock, remoteJid, "🥤 You're severely dehydrated.\n\nYou need to drink water before doing anything else.\nUse /drink or buy water from /shop-food", message)
      return
    }

    // ========== IMPROVEMENTS: Refactored command routing ==========
    try {
      // ========== FIX #2: REDUCED DUPLICATE CODE ==========
      const text = raw.toLowerCase()
      const groupCommands = await getGroupCommands()  // Single import
      
      // Route group commands
      const groupCommandRoutes = {
        "/enable": "handleEnable",
        "/disable": "handleDisable",
        "/help-enable": "handleHelpEnable",
        "/group-settings": "handleGroupSettings",
        "/gsettings": "handleGroupSettings"
      }
      
      for (const [cmdKey, handlerName] of Object.entries(groupCommandRoutes)) {
        if (text === cmdKey || (cmdKey !== cmdKey && text.startsWith(cmdKey + " "))) {
          logger.debug("MESSAGE_HANDLER", "Routing to group command", { handler: handlerName })
          await groupCommands[handlerName](sock, message)
          await sendCommandReaction(sock, message)
          return
        }
      }
      
      if (text.startsWith("/toggle-")) {
        logger.debug("MESSAGE_HANDLER", "Routing to toggle command")
        await groupCommands.handleToggle(sock, message)
        await sendCommandReaction(sock, message)
        return
      }

      // Check group permissions
      const isOwner = isOwnerOrModerator(sender)
      if (isGroup && !isOwner) {
        const enabled = await isGroupEnabled(remoteJid)
        if (!enabled) {
          logger.debug("MESSAGE_HANDLER", "Command blocked: group not enabled", { group: remoteJid })
          return
        }
      }

      // ========== FIX #3: MOVED COOLDOWN BEFORE PERMISSION CHECKS ==========
      const commandText = command.toLowerCase()
      const cooldownCheck = checkCooldown(sender, commandText)
      if (!cooldownCheck.allowed) {
        await sendQuotedWithFooter(sock, remoteJid, cooldownCheck.message, message)
        return
      }
      
      // Set cooldown IMMEDIATELY after checking
      setCooldown(sender, commandText)

      // Resolve command
      let entry = registry.resolveExact(commandText)
      if (!entry) {
        entry = registry.resolvePrefix(commandText)
      }
      
      if (!entry) {
        logger.debug("MESSAGE_HANDLER", "Command not found", { command: commandText })
        await sendQuotedWithFooter(sock, remoteJid, [
          "😂 Who brought this guy abeg?",
          "",
          "Oga open",
          "/menu",
          "jor."
        ].join("\n"), message)
        return
      }

      // Check permissions
      if (!hasCommandPermission(entry, sender)) {
        await sendQuotedWithFooter(sock, remoteJid, "⛔ This command is restricted to the Bot Owner and Bot Moderators.", message)
        return
      }

      // Execute handler
      logger.info("MESSAGE_HANDLER", "Executing command", { 
        command: commandText, 
        handler: entry.handlerName || entry.command 
      })
      await entry.handler(sock, message)
      await sendCommandReaction(sock, message)
      
    } catch (err) {
      // ========== IMPROVEMENTS: Better error logging ==========
      const errorContext = {
        command,
        args,
        sender,
        remoteJid,
        message: err.message,
        stack: err.stack
      }
      
      logger.error("MESSAGE_HANDLER", "Command execution failed", errorContext)
      
      try {
        await sendQuotedWithFooter(sock, remoteJid, "❌ Something went wrong while processing that command.\n\nPlease try again.", message)
      } catch (sendErr) {
        logger.error("MESSAGE_HANDLER", "Failed to send error message", { error: sendErr.message })
      }
    }
  }

  const onGroupJoin = async (sock, update) => {
    const { id: remoteJid, participants, action } = update
    if (action === "add" && participants && participants.length > 0) {
      logger.info("GROUP_JOIN", "New members joined", { 
        group: remoteJid, 
        count: participants.length 
      })
      
      // ========== IMPROVEMENTS: Better welcome message ==========
      const welcomeMsg = `
╔════════════════════════════════════════════╗
║   🔥 Welcome to KennyJaks RPG 🔥           ║
╚════════════════════════════════════════════╝

Welcome to the world of **KennyJaks** - A Jujutsu Kaisen inspired RPG!

*Get Started*:
• /start - Begin your journey
• /menu - View all commands  
• /help - Get assistance

Good luck, and remember: the path to power awaits! 💪
`.trim()
      
      // Limit mentions to avoid spam
      const mentions = participants.slice(0, MESSAGE_HANDLER_CONFIG.GROUP_WELCOME_MENTION_LIMIT)
      
      try {
        await sock.sendMessage(remoteJid, { 
          text: welcomeMsg, 
          mentions 
        }, { quoted: { key: { id: "" }, message: { conversation: "" } } })
      } catch (err) {
        logger.error("GROUP_JOIN", "Failed to send welcome message", { group: remoteJid, error: err.message })
      }
    }
  }

  const sock = await startWhatsApp(onMessage, onGroupJoin)
  
  try {
    await connectMongo()
    console.log("[KENNYJAKS] MongoDB connected")
  } catch (err) {
    console.warn("[KENNYJAKS] MongoDB not available, using file storage:", err.message)
  }

  await initOwnerJsonCache()
  setInterval(() => {
    initOwnerJsonCache().catch(err => {
      console.warn("[KENNYJAKS] Failed to refresh owner.json cache:", err.message)
    })
  }, 60_000)
  
  await sendResetMessage(sock)
  await startCardSpawner(sock)
  await startGroupCurseSpawner(sock)
  initBirthdayScheduler(sock)
  
  // Run all migrations with proper error handling
  await runMigrations()
  
  // Ensure world state and sync unlocks
  WorldStateService.ensureWorldState()
  const unlockResult = await syncAllPlayerUnlocks()
  logger.info("PROGRESSION", "Unlock migration complete", { 
    updated: unlockResult.updated,
    total: unlockResult.total
  })
  
  // Initialize Telegram bot if token is provided
  const telegramToken = process.env.TELEGRAM_BOT_TOKEN || ""
  if (telegramToken) {
    try {
      const telegramBot = await import("./services/telegram/telegramBot.js")
      await telegramBot.createTelegramBot(telegramToken, sock).catch(err => {
        console.warn("[KENNYJAKS] Telegram bot initialization failed:", err.message)
      })
    } catch (err) {
      console.warn("[KENNYJAKS] Telegram bot not available:", err.message)
    }
  }
}

main().catch(err => {
  console.error(chalk.red("Fatal error:"), err)
  process.exit(1)
})

process.on("unhandledRejection", (err) => {
  console.error(chalk.red("Unhandled rejection:"), err.message || err)
})

process.on("uncaughtException", (err) => {
  console.error(chalk.red("Uncaught exception:"), err.message || err)
})
