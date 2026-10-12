import { isOwnerOrModerator, isOwner, normalizePhoneNumber } from "../services/PermissionService.js"
import { handleStart } from "../commands/startCommand.js"
import { handleSetName } from "../commands/setNameCommand.js"
import { handleProfile } from "../commands/profileCommand.js"
import { handleSetTitle, handleSetBio, handleSetBadge, handleSetProfileStyle } from "../commands/profile/profileEditCommands.js"
import { handleSetPfp } from "../commands/profile/setPfpCommand.js"
import { handlePfpStyles } from "../commands/profile/pfpStylesCommand.js"
import { handleSetGroupPfp } from "../commands/group/setGroupPfpCommand.js"
import { handleSprites, handleSpriteView, handleSetSprite } from "../commands/profile/spriteCommands.js"
import { handleYouTubeSearch, handleYouTubeSet } from "../commands/profile/youtubeCommands.js"
import { handleFight } from "../commands/battle/fightCommand.js"
import { handleSeal, handleScrollRelease, handleCurseElement, handleSetCurseName, handleSetCurseBio } from "../commands/kloot/curseBindingCommands.js"
import { handleZeroGravityUse, handleNova } from "../commands/kloot/zeroGravityCommands.js"
import { handleBurn, handleFlaura, handleEverburn } from "../commands/kloot/benimaruCommands.js"
import { handleGiveKloot } from "../commands/admin/giveKlootCommand.js"
import { handleInventory } from "../commands/inventoryCommand.js"
import { handleTechniqueInfo } from "../commands/techniqueInfoCommand.js"
import { handleTechnique } from "../commands/technique/techniqueCommand.js"
import { handleAttributes, handleSpendPoints } from "../commands/attributeCommand.js"
import { handleReputation } from "../commands/repCommand.js"
import { handleEvent } from "../commands/seasonal/eventCommand.js"
import { handleDragonChallenge } from "../commands/seasonal/challengeCommand.js"
import { handleAurstavCommand, handleAurstavBattle } from "../commands/seasonal/aurstavCommand.js"
import { handleSpawnEnemy, handleRunFromCurse } from "../commands/battle/spawnEnemyCommand.js"
import { handleStartBattle } from "../commands/battle/startBattleCommand.js"
import { handleBattleCommand } from "../commands/battle/battleCommandRouter.js"
import { handleLegends } from "../commands/battle/legendsCommand.js"
import { handleClaimCard, handleDeck } from "../commands/card/claimCardCommand.js"
import { handleSpawnPack, handleClaimPack } from "../commands/card/spawnPackCommand.js"
import { handleDeckCommand } from "../commands/card/deckCommand.js"
import { handleSpawnCard } from "../commands/card/spawnCardCommand.js"
import { handleDuel, handleCardAttack } from "../commands/card/duelCommand.js"
import { handleSellCard, handleTradeCard, handleCollection } from "../commands/card/sellCardCommand.js"
import { handleCtrade } from "../commands/cards/ctrade.js"
import { handleBranchInfo } from "../commands/branchInfoCommand.js"
import { handleChallenge } from "../commands/pvp/challengeCommand.js"
import { handleWallet } from "../commands/economy/walletCommand.js"
import { handleBank } from "../commands/economy/bankCommand.js"
import { handleDeposit } from "../commands/economy/depositCommand.js"
import { handleWithdraw } from "../commands/economy/withdrawCommand.js"
import { handleGamble } from "../commands/economy/gambleCommand.js"
import { handleGambleGames } from "../commands/economy/gambleGamesCommand.js"
import { handleShops } from "../commands/shops/shopsCommand.js"
import { handleShopOutfit } from "../commands/shops/outfitShopCommand.js"
import { handleShopEgg } from "../commands/shops/eggShopCommand.js"
import { handleShopFood } from "../commands/shops/foodShopCommand.js"
import { handleShopDrink } from "../commands/shops/drinkShopCommand.js"
import { handleShopBag } from "../commands/shops/bagShopCommand.js"
import { handleShopMedicine } from "../commands/shops/medicineShopCommand.js"
import { handleShopWeapon } from "../commands/shops/weaponShopCommand.js"
import { handleShopArmor } from "../commands/shops/armorShopCommand.js"
import { handleShopAccessory } from "../commands/shops/accessoryShopCommand.js"
import { handleBuy } from "../commands/shops/buyCommand.js"
import { handleBlackMarket } from "../commands/shops/blackMarketCommand.js"
import { handleHatch } from "../commands/shops/hatchCommand.js"
import { handleEquip } from "../commands/equipCommand.js"
import { handleUnequip } from "../commands/unequipCommand.js"
import { handleCraft, handleCraftName } from "../commands/craftCommand.js"
import { handleTrainRct, handleTrainRctConfirm } from "../commands/rctCommand.js"
import { handleRctBurst, handleRctSlow } from "../commands/rctBattleCommand.js"
import { handleRctGive } from "../commands/rctGiveCommand.js"
import { handleRctTrain } from "../commands/rctTrainCommand.js"
import { handleRctStatus } from "../commands/rctStatusCommand.js"
import { handleRtTrain, handleRctAuto } from "../commands/rctAutoCommand.js"
import { handleGiveDomain } from "../commands/giveDomainCommand.js"
import { handleReset } from "../commands/admin/resetCommand.js"
import { handleDelete } from "../commands/admin/deleteCommand.js"
import { handleBan } from "../commands/admin/banCommand.js"
import { handleUnban } from "../commands/admin/unbanCommand.js"
import { handleGrantOwner, handleRevokeOwner, handleTempOwners } from "../commands/admin/grantOwnerCommand.js"
import { handleGiveSkillPoints } from "../commands/admin/giveSkillPointsCommand.js"
import { handleGiveReputation } from "../commands/admin/giveReputationCommand.js"
import { handleGiveLevel, handleRemoveLevel } from "../commands/admin/giveLevelCommand.js"
import { handleSetGrade } from "../commands/admin/setGradeCommand.js"
import { handleRunCombatMigration } from "../commands/admin/runMigrationCommand.js"
import { handleTrainShikigami, handleTrainShikigamiForId } from "../commands/technique/trainShikigamiCommand.js"
import { handleSummonShikigami } from "../commands/technique/summonShikigamiCommand.js"
import { handleBindingVows } from "../commands/technique/bindingVowsCommand.js"
import { handleEnable, handleDisable, handleHelpEnable, handleGroupSettings, handleToggle } from "../commands/groupCommand.js"
import { handleTrainDomain, handleDomainName, handleDomain } from "../commands/domainCommand.js"
import { handlePotential } from "../commands/potentialCommand.js"
import { handleLeaderboardStrong } from "../commands/leaderboardCommand.js"
import { handleEat } from "../commands/eatCommand.js"
import { handleTaunt } from "../commands/battle/tauntCommand.js"
import { handleDrink, checkThirst, isThirstExemptCommand } from "../commands/drinkCommand.js"
import { handleBag } from "../commands/bagCommand.js"
import { handleInventoryToBag } from "../commands/inventoryToBagCommand.js"
import { handleBagToInventory } from "../commands/bagToInventoryCommand.js"
import { handleHealCe } from "../commands/healCeCommand.js"
import { handleTrainStatus } from "../commands/trainStatusCommand.js"
import { handleMenu } from "../commands/menuCommand.js"
import { handleHelp } from "../commands/helpCommand.js"
import { handleDaily } from "../commands/daily/dailyCommand.js"
import { handleBirthday } from "../commands/events/birthdayCommand.js"
import { handleSend } from "../commands/economy/sendCommand.js"
import { handleNamePet } from "../commands/pet/namePetCommand.js"
import { handlePet } from "../commands/pet/petCommand.js"
import { handlePets } from "../commands/pet/petsCommand.js"
import { handleUnsummonPet } from "../commands/pet/unsummonPetCommand.js"
import { handleFeedPet } from "../commands/pet/feedPetCommand.js"
import { handleHealPet } from "../commands/pet/healPetCommand.js"
import { handleRevivePet } from "../commands/pet/revivePetCommand.js"
import { handlePetStats } from "../commands/pet/petStatsCommand.js"
import { handlePetSkills } from "../commands/pet/petSkillsCommand.js"
import { handlePetEvolve } from "../commands/pet/petEvolveCommand.js"
import { handlePetInfo } from "../commands/pet/petInfoCommand.js"
import { handlePetTrain } from "../commands/pet/petTrainCommand.js"
import { handlePetEquip } from "../commands/pet/petEquipCommand.js"
import { handlePetRename } from "../commands/pet/petRenameCommand.js"
import { TechniqueService } from "../services/technique/TechniqueService.js"
import { handleSticker } from "../commands/utility/stickerCommand.js"
import { handleTake } from "../commands/utility/takeCommand.js"
import { handleToimg } from "../commands/utility/toimgCommand.js"
import { handleTogif } from "../commands/utility/togifCommand.js"
import { handleStickerInfo } from "../commands/utility/stickerInfoCommand.js"
import { handleNews } from "../commands/utility/newsCommand.js"
import { handleStats } from "../commands/utility/statsCommand.js"
import { handleList } from "../commands/dashboard/listCommand.js"
import { handleLeaderboard } from "../commands/dashboard/leaderboardCommand.js"
import { handleServer } from "../commands/dashboard/serverCommand.js"
import { handleComments } from "../commands/commentsCommand.js"
import { handleLink } from "../commands/linkCommand.js"
import { handleMartialArts } from "../commands/battle/martialArtsCommand.js"
import { handleBf } from "../commands/bfCommand.js"
import { handleYujiTrain } from "../commands/yujiTrainCommand.js"
import { handleManual, handleManualPage } from "../commands/manualCommand.js"
import { handleDebugCommands } from "../commands/debugCommands.js"
import { handleLocation } from "../commands/world/locationCommand.js"
import { COMMAND_DEFINITIONS, COMMAND_CATEGORY_DEFINITIONS } from "./commandMetadata.js"

const HANDLER_MAP = {
  handleStart,
  handleSetName,
  handleProfile,
  handleInventory,
  handleTechniqueInfo,
  handleTechnique,
  handleAttributes,
  handleSpendPoints,
  handleReputation,
  handleEvent,
  handleDragonChallenge,
  handleAurstavCommand,
  handleAurstavBattle,
  handleSpawnEnemy,
  handleRunFromCurse,
  handleStartBattle,
  handleBattleCommand,
  handleLegends,
  handleBranchInfo,
  handleChallenge,
  handleWallet,
  handleBank,
  handleDeposit,
  handleWithdraw,
  handleGamble,
  handleGambleGames,
  handleShops,
  handleShopOutfit,
  handleShopEgg,
  handleShopFood,
  handleShopDrink,
  handleShopBag,
  handleShopMedicine,
  handleShopWeapon,
  handleShopArmor,
  handleShopAccessory,
  handleBuy,
  handleBlackMarket,
  handleHatch,
  handleEquip,
  handleUnequip,
  handleCraft,
  handleCraftName,
  handleTrainRct,
  handleTrainRctConfirm,
  handleRctBurst,
  handleRctSlow,
  handleRctGive,
  handleRctTrain,
  handleRctStatus,
  handleRtTrain,
  handleRctAuto,
  handleGiveDomain,
  handleGiveSkillPoints,
  handleGiveReputation,
  handleGiveLevel,
  handleRemoveLevel,
  handleSetGrade,
  handleRunCombatMigration,
  handleTrainShikigami,
  handleTrainShikigamiForId,
  handleSummonShikigami,
  handleBindingVows,
  handleTrainDomain,
  handleDomainName,
  handleDomain,
  handlePotential,
  handleLeaderboardStrong,
  handleEat,
  handleDrink,
  handleBag,
  handleInventoryToBag,
  handleBagToInventory,
  handleHealCe,
  handleTrainStatus,
  handleMenu,
  handleHelp,
  handleDaily,
  handleBirthday,
  handleSend,
  handleNamePet,
  handlePet,
  handlePets,
  handleUnsummonPet,
  handleFeedPet,
  handleHealPet,
  handleRevivePet,
  handlePetStats,
  handlePetSkills,
  handlePetEvolve,
  handlePetInfo,
  handlePetTrain,
  handlePetEquip,
  handlePetRename,
  handleSticker,
  handleTake,
  handleToimg,
  handleTogif,
  handleStickerInfo,
  handleNews,
  handleStats,
  handleList,
  handleLeaderboard,
  handleServer,
  handleComments,
  handleLink,
  handleMartialArts,
  handleBf,
  handleYujiTrain,
  handleManual,
  handleManualPage,
  handleDebugCommands,
  handleEnable,
  handleDisable,
  handleHelpEnable,
  handleGroupSettings,
  handleToggle,
  handleLocation,
  handleReset,
  handleDelete,
  handleBan,
  handleUnban,
  handleGrantOwner,
  handleRevokeOwner,
  handleTempOwners,
  handleTaunt,
  handleClaimCard,
  handleClaimPack,
  handleDeckCommand,
  handleSpawnCard,
  handleSpawnPack,
  handleDuel,
  handleCardAttack,
  handleSellCard,
  handleTradeCard,
  handleCollection,
  handleCtrade,
  handleSetTitle,
  handleSetBio,
  handleSetBadge,
  handleSetProfileStyle,
  handleSetPfp,
  handlePfpStyles,
  handleSprites,
  handleSpriteView,
  handleSetSprite,
  handleSetGroupPfp,
  handleYouTubeSearch,
  handleYouTubeSet,
  handleFight,
  handleSeal,
  handleScrollRelease,
  handleCurseElement,
  handleSetCurseName,
  handleSetCurseBio,
  handleZeroGravityUse,
  handleNova,
  handleBurn,
  handleFlaura,
  handleEverburn,
  handleGiveKloot
}

export class CommandRegistry {
  constructor() {
    this.exact = new Map()
    this.aliases = []
    this.prefixes = []
    this.permissionGate = []
  }

  register(entry) {
    const normalizedEntry = {
      ...entry,
      command: entry.command ? entry.command.toLowerCase() : undefined,
      prefix: entry.prefix ? entry.prefix.toLowerCase() : undefined,
      aliases: entry.aliases ? entry.aliases.map(a => a.toLowerCase()) : undefined
    }

    if (normalizedEntry.command) {
      this.exact.set(normalizedEntry.command, normalizedEntry)
    }
    if (normalizedEntry.aliases) {
      for (const alias of normalizedEntry.aliases) {
        this.exact.set(alias, normalizedEntry)
      }
    }
    if (normalizedEntry.permission) {
      this.permissionGate.push(normalizedEntry)
    }
    if (normalizedEntry.prefix) {
      this.prefixes.push(normalizedEntry)
    }
    return this
  }

  resolveExact(command) {
    return this.exact.get(command) || null
  }

  resolvePrefix(command) {
    for (const entry of this.prefixes) {
      if (command.startsWith(entry.prefix)) return entry
    }
    return null
  }

  getAllCommands() {
    const seen = new Set()
    const result = new Map()
    for (const [k, v] of this.exact) {
      if (seen.has(v)) continue
      seen.add(v)
      const key = v.command || k
      result.set(key, v)
    }
    for (const p of this.prefixes) {
      if (seen.has(p)) continue
      seen.add(p)
      result.set(p.prefix || p.command, p)
    }
    return result
  }
}

function getVisibleCommands(registry, phoneNumber) {
  return Array.from(registry.getAllCommands().values())
    .filter(entry => !entry.hidden)
    .filter(entry => hasCommandPermission(entry, phoneNumber))
    .filter(entry => entry.command || entry.prefix)
}

function getCategoryOrder() {
  return COMMAND_CATEGORY_DEFINITIONS.map(category => category.label)
}

export function buildHelpText() {
  const lines = []
  lines.push("╭━━━〔 KENNYJAKS HELP 〕━━━╮")
  lines.push("")
  lines.push("KennyJaks is a cursed-energy MMORPG played over chat.")
  lines.push("Below is how the game works. Use /menu to browse commands,")
  lines.push("or /help <command> (e.g. /help buy) for command specifics.")
  lines.push("")
  lines.push("⚔️ BATTLES")
   lines.push("Fight spawned curses with /spawnenemy, or challenge other")
  lines.push("sorcerers with /ch. In battle use /battack, /bblock and your")
  lines.push("techniques to win.")
  lines.push("")
  lines.push("📈 PROGRESSION")
  lines.push("Gain XP from battles to level up. Your Grade (1-5) and")
  lines.push("Potential shape how strong you become. See /profile.")
  lines.push("")
  lines.push("🎯 TRAINING")
  lines.push("Use /train to practice skills or conquer shikigami, and")
  lines.push("spend stat points with /sp.")
  lines.push("")
  lines.push("🌀 TECHNIQUES")
  lines.push("Every sorcerer wields a cursed technique. View and manage")
  lines.push("yours with /technique.")
  lines.push("")
  lines.push("🩸 RCT")
  lines.push("Reverse Cursed Technique turns CE into healing. Train it")
  lines.push("with /train-rct and use /rct-burst in battle.")
  lines.push("")
  lines.push("🏯 DOMAINS")
  lines.push("Unlock Domain Expansion by winning /train-domain, then name")
  lines.push("it with /domain-name and unleash it with /domain.")
  lines.push("")
  lines.push("💰 ECONOMY")
  lines.push("Earn Yen from battles. Keep it in /wallet or protect it in")
  lines.push("/bank. Send to friends with /send.")
  lines.push("")
  lines.push("🛒 SHOPS")
  lines.push("Browse /shops and buy items with /buy. Use hyphens for")
  lines.push("multi-word items: /buy black-iron-katana.")
  lines.push("")
  lines.push("🎒 INVENTORY")
  lines.push("Store gear in /inventory and /bag. Equip it with /equip.")
  lines.push("")
  lines.push("🐾 SUMMONS")
  lines.push("Hatch eggs with /hatch, summon shikigami with /summon, and")
  lines.push("care for them with the /pet-* commands.")
  lines.push("")
  lines.push("🛠️ CRAFTING")
  lines.push("Gather loot and forge equipment in the /craft workshop.")
  lines.push("")
  lines.push("⚔️ PvP")
  lines.push("Challenge a friend with /ch and prove who is stronger.")
  lines.push("")
  lines.push("💧 SURVIVAL")
  lines.push("Eat /drink to restore HP/CE and manage thirst. Stay")
  lines.push("hydrated or you will be locked out of actions.")
  lines.push("")
  lines.push("👤 PROFILE")
  lines.push("Track everything about your sorcerer with /profile.")
  lines.push("")
  lines.push("╰━━━━━━━━━━━━━━━━━━━━━━╯")
  return lines.join("\n")
}

function normalizeQuery(query) {
  if (!query) return ""
  return query.toLowerCase().trim().replace(/^\//, "")
}

function findCategoryDefinition(query) {
  const normalized = normalizeQuery(query)
  if (!normalized) return null
  return COMMAND_CATEGORY_DEFINITIONS.find(category =>
    category.key === normalized ||
    category.label.toLowerCase() === normalized ||
    category.displayName.toLowerCase() === normalized ||
    (category.aliases && category.aliases.includes(normalized))
  ) || null
}

function findCommandEntry(registry, query) {
  let normalized = query.toLowerCase().trim()
  if (!normalized.startsWith("/")) {
    normalized = `/${normalized}`
  }

  const exact = registry.resolveExact(normalized)
  if (exact) return exact

  const all = Array.from(registry.getAllCommands().values())
  const prefixed = all.find(entry => {
    if (!entry.prefix) return false
    return normalized.startsWith(entry.prefix)
  })
  if (prefixed) return prefixed

  return all.find(entry => {
    if (entry.command && entry.command.toLowerCase() === normalized) return true
    if (entry.aliases && entry.aliases.includes(normalized)) return true
    return false
  }) || null
}

export function buildCategoryHelpText(registry, categoryQuery, phoneNumber) {
  const categoryDef = findCategoryDefinition(categoryQuery)
  if (!categoryDef) {
    return `No help category matches '${categoryQuery}'. Use /help to see available categories.`
  }

  const entries = getVisibleCommands(registry, phoneNumber)
    .filter(entry => entry.category === categoryDef.key)
    .sort((a, b) => {
      const oa = a.order != null ? a.order : 999
      const ob = b.order != null ? b.order : 999
      if (oa !== ob) return oa - ob
      return (a.command || a.prefix || "").localeCompare(b.command || b.prefix || "")
    })

  if (!entries.length) {
    return `No visible commands found for ${categoryDef.displayName}.`
  }

  const lines = []
  lines.push(`╭━━━〔 ${categoryDef.icon} ${categoryDef.displayName} COMMANDS 〕━━━╮`)
  lines.push(`┃ ${categoryDef.description}`)
  lines.push("╰━━━━━━━━━━━━━━━━━━━━━━╯")
  lines.push("")

  for (const entry of entries) {
    const commandText = entry.command || entry.prefix
    if (!commandText) continue
    const description = entry.description || entry.usage || "No description available."
    lines.push(`┃ ${commandText}`)
    lines.push(`┃   ${description}`)
    if (entry.usage) lines.push(`┃   Usage: ${entry.usage}`)
    lines.push("")
  }

  lines.push("Use /help <command> for detailed usage of a command.")
  return lines.join("\n")
}

export function buildCommandHelpText(registry, commandQuery, phoneNumber) {
  const entry = findCommandEntry(registry, commandQuery)
  if (!entry) {
    return "❌ I don't have help information for that command.\n\nUse /menu to browse commands."
  }

  const commandText = entry.command || entry.prefix
  const aliases = (entry.aliases && entry.aliases.length)
    ? entry.aliases.filter(a => a && a !== commandText)
    : []
  const related = getVisibleCommands(registry, phoneNumber)
    .filter(e => e !== entry && e.category === entry.category)
    .map(e => e.command || e.prefix)
    .filter(Boolean)

  const lines = []
  lines.push(`╭━━〔 ${commandText.toUpperCase()} 〕━━╮`)
  lines.push("")
  lines.push("DESCRIPTION")
  lines.push(entry.description || "No description available.")
  lines.push("")
  lines.push("USAGE")
  lines.push(entry.usage || commandText)
  if (entry.examples && entry.examples.length) {
    lines.push("")
    lines.push("EXAMPLE")
    for (const example of entry.examples) {
      lines.push(example)
    }
  }
  if (aliases.length) {
    lines.push("")
    lines.push("ALIASES")
    lines.push(aliases.join(", "))
  }
  lines.push("")
  lines.push("WHAT IT DOES")
  const details = (entry.details || entry.description || "No details available.").split("\n")
  for (const d of details) lines.push(d)
  if (related.length) {
    lines.push("")
    lines.push("RELATED COMMANDS")
    for (const r of related) lines.push(r)
  }
  lines.push("")
  lines.push("╰━━━━━━━━━━━━╯")
  return lines.join("\n")
}

export function buildHelpDispatch(registry, query, phoneNumber) {
  if (!query) {
    return buildHelpText()
  }
  const commandEntry = findCommandEntry(registry, query)
  if (commandEntry) {
    return buildCommandHelpText(registry, query, phoneNumber)
  }
  const categoryDef = findCategoryDefinition(query)
  if (categoryDef) {
    return buildCategoryHelpText(registry, query, phoneNumber)
  }
  return "❌ I don't have help information for that command.\n\nUse /menu to browse commands."
}

export function buildMenuText(registry, player, args = []) {
  const phoneNumber = player && (player.phoneNumber || player.phone)
  const lines = []

  const categoryQuery = (args && args[0]) ? normalizeQuery(args[0]) : null
  const rawPage = (args && args[1]) ? parseInt(args[1], 10) : 1
  const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1

  if (!categoryQuery) {
    lines.push("╭━━━〔 KENNYJAKS MENU 〕━━━╮")
    lines.push("┃")
    const categories = sortedCategories().filter(cat => {
      const cmds = getVisibleCommands(registry, phoneNumber).filter(e => e.category === cat.key)
      return cmds.length > 0
    })
    for (const cat of categories) {
      lines.push(`┃  ${cat.icon} ${cat.displayName}`)
    }
    lines.push("┃")
    lines.push("╰━━━━━━━━━━━━━━━━━━━━━━╯")
    lines.push("")
    lines.push("Use /menu <category> to view its commands.")
    lines.push("Example: /menu battle")
    return lines.join("\n")
  }

  const categoryDef = findCategoryDefinition(categoryQuery)
  if (!categoryDef) {
    return "❌ Unknown menu category.\n\nUse /menu to see the available categories."
  }

  const commands = getVisibleCommands(registry, phoneNumber)
    .filter(e => e.category === categoryDef.key)
    .sort((a, b) => {
      const oa = a.order != null ? a.order : 999
      const ob = b.order != null ? b.order : 999
      if (oa !== ob) return oa - ob
      return (a.command || a.prefix || "").localeCompare(b.command || b.prefix || "")
    })

  const totalPages = Math.max(1, Math.ceil(commands.length / CATEGORY_PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const startIdx = (safePage - 1) * CATEGORY_PAGE_SIZE
  const pageItems = commands.slice(startIdx, startIdx + CATEGORY_PAGE_SIZE)

  lines.push(`╭━━〔 ${categoryDef.icon} ${categoryDef.displayName} COMMANDS 〕━━╮`)
  lines.push("┃")
  for (const entry of pageItems) {
    const cmd = entry.command || entry.prefix || ""
    if (!cmd) continue
    lines.push(`┃ ${cmd}`)
  }
  lines.push("┃")
  lines.push("╰━━━━━━━━━━━━━━━━━━━━━━╯")
  lines.push("")
  lines.push("Use /help <command> for details.")
  if (totalPages > 1) {
    lines.push("")
    lines.push(`Page ${safePage}/${totalPages}`)
    if (safePage < totalPages) {
      lines.push(`Next page: /menu ${categoryDef.key} ${safePage + 1}`)
    }
  }
  return lines.join("\n")
}

const CATEGORY_PAGE_SIZE = 8

function sortedCategories() {
  return [...COMMAND_CATEGORY_DEFINITIONS].sort((a, b) => (a.order || 100) - (b.order || 100))
}

export function hasCommandPermission(entry, phoneNumber) {
  if (!entry || !entry.permission) return true
  if (entry.permission === "owner") {
    return isOwner(phoneNumber)
  }
  if (entry.permission === "ownerOrModerator" || entry.permission === "moderator") {
    return isOwnerOrModerator(phoneNumber)
  }
  return true
}

export function buildRegistry() {
  if (cachedRegistry) return cachedRegistry
  const registry = new CommandRegistry()
  const errors = []
  const seenCommands = new Set()
  const seenAliases = new Set()
  const seenPrefixes = new Set()

  function registerMetadata(entry) {
    if (!entry.command && !entry.prefix) {
      errors.push(`Missing command or prefix for metadata entry: ${JSON.stringify(entry).slice(0, 140)}`)
      return
    }

    if (entry.command && seenCommands.has(entry.command.toLowerCase())) {
      errors.push(`Duplicate command metadata: ${entry.command}`)
      return
    }
    if (entry.aliases) {
      for (const alias of entry.aliases) {
        if (seenCommands.has(alias) || seenAliases.has(alias)) {
          errors.push(`Duplicate alias metadata: ${alias}`)
          return
        }
      }
    }
    if (entry.prefix && seenPrefixes.has(entry.prefix.toLowerCase())) {
      errors.push(`Duplicate prefix metadata: ${entry.prefix}`)
      return
    }

    const handler = entry.handlerName ? HANDLER_MAP[entry.handlerName] : undefined
    if (!handler) {
      errors.push(`Missing handler for command metadata: ${entry.command || entry.prefix} (${entry.handlerName})`)
      return
    }
    if (!entry.category) {
      errors.push(`Missing category for command metadata: ${entry.command || entry.prefix}`)
      return
    }
    const knownCategory = COMMAND_CATEGORY_DEFINITIONS.some(c => c.key === entry.category)
    if (!knownCategory) {
      errors.push(`Unknown category '${entry.category}' for command: ${entry.command || entry.prefix}`)
      return
    }

    registry.register({
      ...entry,
      handler,
      aliases: entry.aliases || [],
      category: entry.category,
      usage: entry.usage || entry.command || entry.prefix,
      description: entry.description || "No description available.",
      examples: entry.examples || [],
      order: typeof entry.order === "number" ? entry.order : undefined
    })

    if (entry.command) seenCommands.add(entry.command.toLowerCase())
    if (entry.aliases) entry.aliases.forEach(alias => seenAliases.add(alias.toLowerCase()))
    if (entry.prefix) seenPrefixes.add(entry.prefix.toLowerCase())
  }

  for (const entry of COMMAND_DEFINITIONS) {
    registerMetadata(entry)
  }

  const allEntries = Array.from(registry.getAllCommands().values())
  const handlersResolved = allEntries.filter(e => typeof e.handler === "function").length
  const namesValid = allEntries.filter(e => (e.command || e.prefix)).length
  const categoriesValid = allEntries.filter(e => COMMAND_CATEGORY_DEFINITIONS.some(c => c.key === (e.category || ""))).length
  const undefinedCount = allEntries.filter(e => !(e.command || e.prefix) || !e.category || !e.description || !e.usage).length
  const duplicateIds = errors.filter(e => e.startsWith("Duplicate")).length

  console.info("[COMMAND REGISTRY]")
  console.info(`✓ ${allEntries.length} commands registered`)
  console.info(`✓ ${handlersResolved} handlers resolved`)
  console.info(`✓ ${namesValid} command names valid`)
  console.info(`✓ ${categoriesValid} categories valid`)
  console.info(`✓ ${undefinedCount} undefined commands`)
  console.info(`✓ ${duplicateIds} duplicate command IDs`)

  if (errors.length) {
    console.error("[COMMAND REGISTRY] metadata validation errors:")
    for (const error of errors) console.error(` - ${error}`)
  }

  cachedRegistry = registry
  return registry
}

let cachedRegistry = null
