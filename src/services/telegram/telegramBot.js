// Import dependencies
import { Telegraf } from 'telegraf';
import { parseCommand } from '../commandParser.js';
import { buildRegistry } from '../commandRegistry.js';
import { loadPlayerByPhone, savePlayer, playerExists, loadPlayerById } from '../../database/playerRepo.js';
import { checkThirst, isThirstExemptCommand } from '../../commands/drinkCommand.js';
import { checkCooldown, setCooldown } from '../../utils/commandCooldown.js';
import { isBanned } from '../BanService.js';
import {
  linkTelegramToPlayer,
  unlinkTelegram,
  getPlayerIdByTelegramId as getTelegramLinkForPlayer,
  getTelegramIdByPlayerId,
  getPhoneByTelegramId
} from '../../database/telegramLink.js';

// Simple logger
class Logger {
  log(level, component, message, data = {}) {
    const log = { timestamp: new Date().toISOString(), level, component, message, ...data }
    console.log(JSON.stringify(log))
  }
  info(component, msg, data) { this.log('INFO', component, msg, data) }
  error(component, msg, data) { this.log('ERROR', component, msg, data) }
  debug(component, msg, data) { this.log('DEBUG', component, msg, data) }
}

const logger = new Logger();

// Link codes - maps WhatsApp player IDs to temporary verification codes
const pendingLinkCodes = new Map();

export class TelegramBot {
  constructor(token, whatsappSock = null) {
    if (!token) {
      throw new Error('Telegram bot token is required');
    }
    
    this.token = token;
    this.whatsappSock = whatsappSock; // Reference to WhatsApp socket for sending DMs
    this.bot = new Telegraf(token);
    this.registry = buildRegistry();
    this.isInitialized = false;
    
    this.setupCommands();
    this.setupMiddleware();
  }
  
  setWhatsAppSocket(sock) {
    this.whatsappSock = sock;
  }
  
  setupMiddleware() {
    this.bot.use(async (ctx, next) => {
      try {
        await next();
      } catch (err) {
        logger.error('TELEGRAM_BOT', 'Middleware error', { error: err.message });
      }
    });
  }
  
  setupCommands() {
    // Start command - handles both registration and welcome
    this.bot.start(async (ctx) => {
      await this.handleStart(ctx);
    });
    
    // Link command - with verification code
    this.bot.command(['link', 'verify'], async (ctx) => {
      await this.handleLink(ctx);
    });
    
    // Unlink command
    this.bot.command('unlink', async (ctx) => {
      await this.handleUnlink(ctx);
    });
    
    // Help command
    this.bot.help(async (ctx) => {
      await this.handleHelp(ctx);
    });
    
    // Menu command
    this.bot.command('menu', async (ctx) => {
      await this.handleMenu(ctx);
    });
    
    // Handle all text messages (commands that aren't handled above)
    this.bot.on('text', async (ctx) => {
      await this.handleMessage(ctx);
    });
    
    // Handle command messages (non-text)
    this.bot.on('message', async (ctx) => {
      if (!ctx.message || !ctx.message.text) {
        return;
      }
    });
    
    // Error handling
    this.bot.catch((err, ctx) => {
      logger.error('TELEGRAM_BOT', 'Telegraf error', { 
        error: err.message,
        update: ctx.update 
      });
      ctx.reply('❌ An error occurred while processing your command. Please try again.');
    });
  }
  
  async handleStart(ctx) {
    const telegramId = ctx.from.id.toString();
    const telegramUsername = ctx.from.username || 'no_username';
    const firstName = ctx.from.first_name || '';
    const lastName = ctx.from.last_name || '';
    
    // Check if user is already linked
    const existingPlayerId = getTelegramLinkForPlayer(telegramId);
    
    if (existingPlayerId) {
      const player = await loadPlayerById(existingPlayerId);
      if (player) {
        ctx.reply(
          `🎮 KennyJaks RPG - Telegram Linked\n\n` +
          `Hello ${firstName}! You are already linked to:\n` +
          `Player: ${player.name} (ID: ${player.playerId})\n` +
          `Level: ${player.level || 1} | XP: ${player.xp || 0}\n` +
          `Grade: ${this.getGradeLabel(player.grade)}\n\n` +
          'Use /menu to see available commands or /help for help.'
        );
        return;
      }
    }
    
     // New Telegram user - create player
     const playerId = this.generateTelegramPlayerId();
     const player = {
       playerId,
       name: firstName || `Tg${telegramId.substring(0, 5)}`,
       phoneNumber: telegramId, // Use Telegram ID as phone number for lookup
       level: 1,
       xp: 0,
       lifetimeXp: 0,
       wallet: 500,
       kenTokens: 10,
       health: 100,
       maxHealth: 100,
       cursedEnergy: 50,
       maxCursedEnergy: 50,
       strength: 10,
       defense: 10,
       agility: 10,
       luck: 0,
       grade: 4,
       skillPoints: 0,
       createdAt: Date.now(),
       lastSeen: Date.now(),
       telegramId,
       source: 'telegram'
     };
    
    try {
      await savePlayer(player);
      
      // Create a link for this telegram user
      linkTelegramToPlayer(telegramId, playerId);
      
      ctx.reply(
        `🎮 Welcome to KennyJaks RPG on Telegram!\n\n` +
        `Your journey begins:\n` +
        `Player ID: ${playerId}\n` +
        `Name: ${player.name}\n` +
        `Level: ${player.level} | XP: 0\n` +
        `Grade: ${this.getGradeLabel(player.grade)}\n\n` +
        `💰 Starting Wallet: ¥${player.wallet}\n` +
        `🎫 Starting Ken Tokens: ${player.kenTokens}\n\n` +
        `Commands:\n` +
        `/menu - View all commands\n` +
        `/help - Get help\n` +
        `/link <player-id> - Link your WhatsApp account\n` +
        `/unlink - Unlink from all accounts\n\n` +
        `Let the hunt begin! 🔥`
      );
    } catch (err) {
      logger.error('TELEGRAM_BOT', 'Start command failed', { error: err.message });
      ctx.reply('❌ Failed to create player. Please try again.');
    }
  }
  
  generateTelegramPlayerId() {
    // Generate a player ID in the format SJ##### but for telegram
    const prefix = 'TG';
    const nums = Math.floor(Math.random() * 900000) + 100000;
    return `${prefix}${nums}`;
  }
  
  getGradeLabel(grade) {
    const labels = { 0: 'SPECIAL GRADE', 1: 'GRADE 1', 2: 'GRADE 2', 3: 'GRADE 3', 4: 'GRADE 4' };
    return labels[grade] || 'GRADE 4';
  }
  
  async handleLink(ctx) {
    const telegramId = ctx.from.id.toString();
    const args = ctx.message.text.split(' ').slice(1);
    
    // Check if user has an existing telegram player
    const existingPlayerId = getTelegramLinkForPlayer(telegramId);
    if (!existingPlayerId) {
      ctx.reply('❌ Please start with /start first to create your Telegram player.');
      return;
    }
    
    // Check for verification code argument
    const verifyArg = args.find(a => a.match(/^verify\s+\d{6}$/) || /^\d{6}$/.test(a));
    
    if (args.length === 0 || args[0].match(/^\d{6}$/)) {
      // Either no args (show usage) or a 6-digit code (verify)
      const code = args[0];
      
      if (code && /^\d{6}$/.test(code)) {
        // Verify the code
        const pendingCode = pendingLinkCodes.get(telegramId);
        if (!pendingCode) {
          ctx.reply('❌ No pending link request. Use /link <player-id> to start linking.');
          return;
        }
        
        if (pendingCode.code !== code) {
          ctx.reply('❌ Invalid verification code. Please check and try again.');
          pendingLinkCodes.delete(telegramId);
          return;
        }
        
        // Verify the code matches
        const playerId = pendingCode.playerId;
        
        // Check if the player is a WhatsApp player (has a phone number)
        const player = await loadPlayerById(playerId);
        if (!player) {
          ctx.reply(`❌ No player found with ID ${playerId}.`);
          return;
        }
        
        // Get the Telegram player to update
        const telegramPlayer = await loadPlayerById(existingPlayerId);
        
        // Merge player data: add WhatsApp phone number to existing Telegram player
        telegramPlayer.phoneNumber = player.phoneNumber;
        telegramPlayer.whatsappPlayerId = playerId;
        telegramPlayer.linkedAccounts = telegramPlayer.linkedAccounts || [];
        telegramPlayer.linkedAccounts.push({
          type: 'whatsapp',
          playerId: playerId,
          phoneNumber: player.phoneNumber,
          linkedAt: Date.now()
        });
        
        await savePlayer(telegramPlayer);
        
        // Clear the pending code
        pendingLinkCodes.delete(telegramId);
        
        ctx.reply(
          `✅ Accounts linked successfully!\n\n` +
          `Telegram Player: ${telegramPlayer.name} (ID: ${telegramPlayer.playerId})\n` +
          `Linked to WhatsApp Player: ${player.name} (ID: ${playerId})\n\n` +
          `You can now continue your progress on both platforms!`
        );
        return;
      }
      
      // No valid argument - show usage
      ctx.reply(
        `🔗 To link your Telegram account to a WhatsApp account:\n\n` +
        `1. Use: /link <player-id>\n` +
        `   Example: /link SJ000001\n\n` +
        `2. A verification code will be sent to the WhatsApp number\n` +
        `3. Enter the code: /link <verification-code>\n\n` +
        `Note: You must have a registered WhatsApp account to link.`
      );
      return;
    }
    
    // First arg is a player ID
    const playerId = args[0].toUpperCase();
    
    // Check if it looks like a WhatsApp player ID (SJ##### format)
    if (!/^(SJ|TG)\d{5,6}$/.test(playerId)) {
      ctx.reply(
        `❌ Invalid player ID format.\n` +
        `Player ID should be like SJ000001 or TG123456.\n\n` +
        `Check your WhatsApp player ID with /me on WhatsApp.`
      );
      return;
    }
    
    try {
      const player = await loadPlayerById(playerId);
      if (!player) {
        ctx.reply(`❌ No player found with ID ${playerId}.`);
        return;
      }
      
      if (!player.phoneNumber) {
        ctx.reply(`❌ This player was not registered on WhatsApp.`);
        return;
      }
      
      // Generate verification code
      const code = this.generateVerificationCode();
      
      // Store pending link code
      pendingLinkCodes.set(telegramId, {
        playerId: playerId,
        code: code,
        createdAt: Date.now(),
        phoneNumber: player.phoneNumber
      });
      
      // Send DM to WhatsApp if socket is available
      const whatsappJid = `${normalizePhone(player.phoneNumber)}@s.whatsapp.net`;
      
      if (this.whatsappSock) {
        try {
          await this.whatsappSock.sendMessage(whatsappJid, {
            text: `🔐 KennyJaks Link Request\n\n` +
                  `Someone is trying to link their Telegram account to:\n` +
                  `Player: ${player.name} (ID: ${playerId})\n` +
                  `Phone: ${player.phoneNumber}\n\n` +
                  `Verification Code: ${code}\n\n` +
                  `If this was you, share this code with the Telegram bot.\n` +
                  `This code expires in 10 minutes.`
          });
          ctx.reply(
            `📲 Verification code sent to WhatsApp (${player.phoneNumber})\n\n` +
            `Enter the code to verify: /link ${code}`
          );
        } catch (err) {
          logger.error('TELEGRAM_BOT', 'WhatsApp DM failed', { 
            error: err.message,
            phoneNumber: player.phoneNumber
          });
          ctx.reply(
            `❌ Could not send DM to WhatsApp. The player (${player.phoneNumber}) may not have their privacy settings set to allow messages from contacts.\n\n` +
            `Verification code: ${code}\n\n` +
            `Share this code on Telegram: /link ${code}`
          );
        }
      } else {
        ctx.reply(
          `⚠️ WhatsApp connection not available.\n\n` +
          `Verification code for: ${playerId}\n` +
          `Code: ${code}\n\n` +
          `Enter the code: /link ${code}`
        );
      }
    } catch (err) {
      logger.error('TELEGRAM_BOT', 'Link command failed', { 
        error: err.message,
        telegramId,
        playerId
      });
      ctx.reply('❌ Failed to process link request. Please try again.');
    }
  }
  
  generateVerificationCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
  
  normalizePhone(phone) {
    return String(phone).replace(/\D/g, '');
  }
  
  async handleUnlink(ctx) {
    const telegramId = ctx.from.id.toString();
    const playerId = getTelegramLinkForPlayer(telegramId);
    
    if (!playerId) {
      ctx.reply('❌ Your Telegram account is not linked.');
      return;
    }
    
    const player = await loadPlayerById(playerId);
    if (!player) {
      unlinkTelegram(telegramId);
      ctx.reply('✅ Telegram link removed (player no longer exists).');
      return;
    }
    
    // Remove WhatsApp linkage from player
    if (player.linkedAccounts) {
      player.linkedAccounts = player.linkedAccounts.filter(a => a.type !== 'whatsapp');
    }
    delete player.whatsappPlayerId;
    delete player.phoneNumber; // Clear phone number
    
    await savePlayer(player);
    unlinkTelegram(telegramId);
    
    ctx.reply(
      `✅ Account unlinked!\n\n` +
      `Your Telegram player (${player.name}) is still active.\n` +
      `You can relink anytime using /link <whatsapp-player-id>`
    );
  }
  
  async handleHelp(ctx) {
    ctx.reply(
      `📚 KennyJaks Telegram Help\n\n` +
      `Getting Started:\n` +
      `/start - Create a new player or show status\n` +
      `/menu - View all available commands\n\n` +
      `Account Linking:\n` +
      `/link <player-id> - Link to WhatsApp account (requires verification)\n` +
      `/unlink - Remove WhatsApp link\n\n` +
      `Game Commands:\n` +
      `/me - View your character stats\n` +
      `/hunt - Hunt for curses\n` +
      `/spawnenemy - Spawn a test enemy\n` +
      `/fight - Fight the spawned enemy\n` +
      `/battle - View active battle\n` +
      `/shop - View shop inventory\n` +
      `/use <item> - Use an inventory item\n\n` +
      `All commands from WhatsApp work here too!`
    );
  }
  
  async handleMenu(ctx) {
    const telegramId = ctx.from.id.toString();
    const playerId = getTelegramLinkForPlayer(telegramId);
    const player = playerId ? await loadPlayerById(playerId) : null;
    
    let menuText = '📋 KennyJaks Telegram Menu\n\n';
    
    if (player) {
      menuText += 
        `👤 ${player.name} (ID: ${player.playerId})\n` +
        `Level: ${player.level || 1} | XP: ${player.xp || 0}/${((player.level || 1) * 1000)}\n` +
        `Grade: ${this.getGradeLabel(player.grade)}\n` +
        `HP: ${player.health || 0}/${player.maxHealth || 0}\n` +
        `CE: ${player.cursedEnergy || 0}/${player.maxCursedEnergy || 0}\n` +
        `💰 Yen: ${(player.wallet || 0).toLocaleString()}\n` +
        `🎫 Ken: ${player.kenTokens || 0}\n\n`;
    }
    
    menuText += 
      `📍 Game Commands:\n` +
      `/start - Create/status\n` +
      `/me - Character stats\n` +
      `/hunt - Hunt curses\n` +
      `/spawnenemy - Spawn test enemy\n` +
      `/fight - Fight enemy\n` +
      `/battle - View battle\n` +
      `/shop - Shop items\n` +
      `/inventory - View items\n` +
      `/menu - Show this menu\n` +
      `/help - Show help\n\n` +
      `🔗 Account:\n` +
      `/link <id> - Link to WhatsApp\n` +
      `/unlink - Remove link\n\n`;
    
    ctx.reply(menuText);
  }
  
  async handleMessage(ctx) {
    const telegramId = ctx.from.id.toString();
    const rawText = ctx.message.text.trim();
    
    // Get telegram player
    const playerId = getTelegramLinkForPlayer(telegramId);
    if (!playerId) {
      // Should not happen since /start creates a player, but handle it
      ctx.reply('Please use /start to create your character first.');
      return;
    }
    
    // Parse the command - use Baileys message format
    const parsed = parseCommand({
      message: {
        conversation: rawText,
        extendedTextMessage: {
          text: rawText,
          contextInfo: {}
        }
      }
    });
    
    // Adapt parsed object for Telegram
    parsed.sender = playerId;
    parsed.senderJid = `${playerId}@s.whatsapp.net`; // Use player ID as fake JID
    parsed.isGroup = false; // Telegram private chats are not groups
    
    // Check if player exists
    const player = await loadPlayerById(playerId);
    if (!player) {
      ctx.reply(`❌ Player not found. Please use /start to create a new player.`);
      return;
    }
    
    // Process command
    await this.processCommand(ctx, parsed, player);
  }
  
  async processCommand(ctx, parsed, player) {
    try {
      const commandText = parsed.command.toLowerCase();
      
      // Block banned users (check by playerId)
      if (await isBanned(parsed.sender)) {
        ctx.reply('⛔ You are banned from using this bot.');
        return;
      }
      
      // Check thirst
      if (!isThirstExemptCommand(parsed.raw) && !checkThirst(player)) {
        ctx.reply('🥤 You are severely dehydrated.\n\nYou need to drink water before doing anything else.\nUse /drink or buy water from /shop-food');
        return;
      }
      
      // Check cooldown
      const cooldownCheck = checkCooldown(parsed.sender, commandText);
      if (!cooldownCheck.allowed) {
        ctx.reply(cooldownCheck.message);
        return;
      }
      
      // Set cooldown
      setCooldown(parsed.sender, commandText);
      
      // Resolve command
      let entry = this.registry.resolveExact(commandText);
      if (!entry) {
        entry = this.registry.resolvePrefix(commandText);
      }
      
      if (!entry) {
        ctx.reply(
          '😂 Who brought this guy abeg?\n\n' +
          'Use /menu for all commands.'
        );
        return;
      }
      
      // Create fake sock and message objects for handler
      const fakeSock = this.createFakeSocket(ctx);
      const fakeMessage = this.createFakeMessage(ctx, parsed, player);
      
      // Execute handler
      logger.info('TELEGRAM_BOT', 'Executing command', { 
        command: commandText, 
        handler: entry.handlerName || entry.command,
        playerId: parsed.sender
      });
      
      await entry.handler(fakeSock, fakeMessage);
      
    } catch (err) {
      logger.error('TELEGRAM_BOT', 'Command execution failed', { 
        command: parsed.command,
        error: err.message,
        stack: err.stack 
      });
      
      ctx.reply('❌ Something went wrong while processing that command.\n\nPlease try again.');
    }
  }
  
  createFakeSocket(ctx) {
    const self = this;
    return {
      sendMessage: async (jid, messageContent, options = {}) => {
        try {
          if (!messageContent) {
            return;
          }
          
          if (typeof messageContent === 'string') {
            await ctx.reply(messageContent, { parse_mode: 'HTML' });
          } else if (Buffer.isBuffer(messageContent)) {
            await ctx.replyWithPhoto(messageContent, { parse_mode: 'HTML' });
          } else if (messageContent.text) {
            await ctx.reply(messageContent.text, { parse_mode: 'HTML' });
          } else if (messageContent.image) {
            if (Buffer.isBuffer(messageContent.image)) {
              await ctx.replyWithPhoto(messageContent.image, { caption: messageContent.caption || '', parse_mode: 'HTML' });
            } else if (messageContent.image.url) {
              const buf = Buffer.from(messageContent.image.url.split(',')[1], 'base64');
              await ctx.replyWithPhoto(buf, { caption: messageContent.caption || '', parse_mode: 'HTML' });
            }
          } else if (messageContent.document) {
            await ctx.replyWithDocument(messageContent.document, { parse_mode: 'HTML' });
          } else {
            await ctx.reply('Message received.', { parse_mode: 'HTML' });
          }
        } catch (err) {
          logger.error('TELEGRAM_BOT', 'sendMessage failed', { error: err.message, stack: err.stack });
          try {
            await ctx.reply('❌ Error sending response: ' + err.message);
          } catch {}
        }
      }
    };
  }
  
  createFakeMessage(ctx, parsed, player) {
    const phoneNumber = player.phoneNumber || ctx.from.id.toString();
    return {
      message: {
        conversation: parsed.raw,
        extendedTextMessage: {
          text: parsed.raw,
          contextInfo: {
            mentionedJid: [],
            quotedMessage: parsed.quotedMessage
          }
        }
      },
      key: {
        remoteJid: `${phoneNumber}@s.whatsapp.net`,
        participant: phoneNumber,
        id: `tg_${Date.now()}_${ctx.from.id}`,
        fromMe: false
      },
      from: {
        id: ctx.from.id,
        firstName: ctx.from.first_name || '',
        lastName: ctx.from.last_name || '',
        username: ctx.from.username || ''
      },
      parsedCommand: parsed,
      sender: phoneNumber,
      senderJid: `${phoneNumber}@s.whatsapp.net`,
      player: player
    };
  }
  
   async launch() {
     await this.bot.launch();
     this.isInitialized = true;
     logger.info('TELEGRAM_BOT', 'Bot initialized successfully');
   }
}

// Factory function
export async function createTelegramBot(token, whatsappSock = null) {
  const bot = new TelegramBot(token, whatsappSock);
  await bot.launch();
  return bot;
}