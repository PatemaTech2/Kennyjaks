export const FOOTER = [
  "",
  "━━━━━━━━━━━━━━━━━━━━━━",
  "",
  "KENNYJAKS",
  '"The Strongest Become Legends."',
  "",
  "Use /menu anytime."
].join("\n")

export function registrationUI(player) {
  const lines = []
  lines.push("")
  lines.push("╭" + "━".repeat(32) + "╮")
  lines.push(universalHeaderCenter("JUJUTSU HIGH"))
  lines.push(universalHeaderCenter("STUDENT REGISTRATION"))
  lines.push("╰" + "━".repeat(32) + "╯")
  lines.push("")
  lines.push(universalHeaderCenter("Welcome, Sorcerer."))
  lines.push("")
  lines.push("━━━━━━━━━━━━━━━━━━━━━━")
  lines.push("  👤 Name")
  lines.push(`  ${player.name}`)
  lines.push("")
  lines.push("  🆔 Player ID")
  lines.push(`  ${player.playerId}`)
  lines.push("")
  lines.push("  🎖 Grade")
  lines.push(`  Grade ${player.grade} Sorcerer`)
  lines.push("")
  lines.push("  ⚡ Innate Technique")
  lines.push(`  ${player.technique?.name || "Unknown"}`)
  lines.push("")
  lines.push("  🌳 Branch")
  lines.push(`  ${player.technique?.branch || "None"}`)
  lines.push("")
  lines.push("  ⭐ Potential")
  lines.push(`  ${player.technique?.potential || "F"}`)
  lines.push("")
  lines.push("  ❤️ HP")
  lines.push(`  ${player.health} / ${player.maxHealth}`)
  lines.push("")
  lines.push("  ⚡ CE")
  lines.push(`  ${player.cursedEnergy} / ${player.maxCursedEnergy}`)
  lines.push("")
  lines.push("  💰 Wallet")
  lines.push(`  ¥${player.wallet.toLocaleString()}`)
  lines.push("")
  lines.push("  🎒 Inventory")
  lines.push(`  ${player.inventory.length} / ${MAX_INVENTORY_SLOTS} Slots`)
  lines.push("")
  lines.push("━━━━━━━━━━━━━━━━━━━━━━")
  lines.push("")
  lines.push(universalHeaderCenter("Your journey as a Jujutsu Sorcerer begins now."))
  lines.push("")
  lines.push(universalHeaderCenter("Type"))
  lines.push(universalHeaderCenter("/menu"))
  lines.push(universalHeaderCenter("to continue."))
  lines.push("")
  lines.push(universalHeaderCenter("══════════════════════════════════════"))

  return lines.join("\n")
}

function universalHeaderCenter(text) {
  const width = 34
  const padding = Math.max(0, Math.floor((width - text.length) / 2))
  const right = Math.max(0, width - text.length - padding)
  return " ".repeat(padding) + text + " ".repeat(right)
}

export function categoryHeader(title, emoji = "") {
  const fullTitle = emoji ? `${emoji} ${title}` : title
  return [
    "",
    `┏━━ ${fullTitle} ━━`,
    "━━━━━━━━━━━━━━━━━━━━━━━━━━"
  ].join("\n")
}

export function commandItem(emoji, cmd, description) {
  return `${emoji} /${cmd}\n   ${description}`
}

export function sectionDivider() {
  return "●●●"
}

export function categoryDivider() {
  return "━━━━━━━━━━━━━━━━━━━━━━"
}

export function getRandomHeader(text) {
  const headers = [
    `╭━━━『 ${text} 』━━━╮`,
    `┏━━━「 ${text} 」━━━┓`,
    `╭─────『 ${text} 』─────╮`,
    `┌─────「 ${text} 」─────┐`,
    `━━━━━ ${text} ━━━━━`
  ]
  return headers[Math.floor(Math.random() * headers.length)]
}

export function box(lines) {
  return lines.join("\n")
}

import { MAX_INVENTORY_SLOTS } from "../config/constants.js"

const EMOJI_MAP = {
  economy: "💴",
  combat: "⚔️",
  profile: "👤",
  shop: "🛒",
  inventory: "🎒",
  summons: "🐺",
  pvp: "🥊",
  healing: "❤️",
  skills: "✨",
  grades: "🏅",
  daily: "🌅",
  blackMarket: "🏪",
  sticker: "🖼️",
  utility: "🔧",
  admin: "👑",
  pet: "🐾",
  crafting: "🔨",
  training: "💪",
  craftingWorkshop: "🔨",
}

export const EMOJI = EMOJI_MAP

export const THEME = {
  border: "╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮",
  borderBottom: "╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯",
  divider: "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
  sectionDivider: "●●●",
  headerPrefix: "╭━━━『 ",
  headerSuffix: " 』━━━╮",
  footer: "Use /menu anytime.",
  gameName: "KENNYJAKS",
  tagline: "Jujutsu RPG Universe",
}

export function universalHeader(title, subtitle = "") {
  const lines = [
    "╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮",
    `       ⚔ ${title} ⚔`,
  ]
  if (subtitle) {
    lines.push(`    ${subtitle}`)
  }
  lines.push("╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯")
  return lines.join("\n")
}

export function sectionHeader(emoji, title) {
  const fullTitle = emoji ? `${emoji}  ${title}` : title
  return [
    "",
    `┏━━ ${fullTitle} ━━`,
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
  ].join("\n")
}

export function sectionFooter() {
  return "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
}

export function menuItem(emoji, cmd, desc) {
  return { emoji, cmd, description: desc }
}

export function premiumBox(title, lines, footer = "") {
  const result = []
  result.push(universalHeader(title))
  result.push("")
  lines.forEach(line => {
    result.push(`┃ ${line}`)
  })
  result.push("┃")
  if (footer) {
    result.push(`┃ ${footer}`)
  }
  result.push("╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯")
  return result.join("\n")
}

export function combatHeader(round) {
  return [
    "",
    "═".repeat(32),
    `ROUND ${round}`,
    "═".repeat(32),
    "",
  ].join("\n")
}

export function playerStatusBox(player) {
  const curHp = player.health || 0
  const maxHp = player.maxHealth || 0
  const curCe = player.cursedEnergy || 0
  const maxCe = player.maxCursedEnergy || 0
  const hpBar = makeBar(curHp, maxHp, "❤️", "🤍", 10)
  const ceBar = makeBar(curCe, maxCe, "🔵", "⚪", 10)
  const thirstBar = makeBar(player.thirst || 100, 100, "💧", "┈", 10)

  const effects = []
  if (player.status?.paralyzed) effects.push("⚡ PARALYZED")
  if (player.status?.missChance) effects.push("⚡ ATTACKS MISSING")

  const lines = [
    "",
    "PLAYER",
    `${hpBar}`,
    `  ${curHp}/${maxHp}`,
    "",
    `${ceBar}`,
    `  ${curCe}/${maxCe}`,
    "",
    `${thirstBar}`,
    `  ${player.thirst || 100}/100`,
    "",
    `${effects.map(e => `  ${e}`).join("\n") || ""}`,
    "",
    sectionFooter(),
  ]
  return lines.join("\n")
}

export function opponentStatusBox(opponent, isCurse = true) {
  const hpField = isCurse ? "hp" : "health"
  const maxField = isCurse ? "maxHp" : "maxHealth"

  const opponentHp = opponent ? opponent[hpField] : 0
  const opponentMaxHp = opponent ? opponent[maxField] : 0
  const opponentCe = opponent ? (opponent.cursedEnergy || opponent.ce || 0) : 0
  const opponentMaxCe = opponent ? (opponent.maxCursedEnergy || opponent.maxCe || 0) : 0
  const hpBar = makeBar(opponentHp || 0, opponentMaxHp || 0, "💀", "🩸", 10)
  const ceBar = makeBar(opponentCe || 0, opponentMaxCe || 0, "🔵", "⚪", 10)

  const lines = [
    "",
    "OPPONENT",
    `${hpBar}`,
    `  ${opponentHp || 0}/${opponentMaxHp || 0}`,
    "",
    `${ceBar}`,
    `  ${opponentCe || 0}/${opponentMaxCe || 0}`,
    "",
    sectionFooter(),
  ]
  return lines.join("\n")
}

export function makeBar(current, max, fillChar, emptyChar, segments = 10) {
  const ratio = Math.max(0, Math.min(1, current / Math.max(1, max)))
  const filled = Math.round(ratio * segments)
  const empty = segments - filled
  return `${fillChar.repeat(filled)}${emptyChar.repeat(empty)}`
}

export function battleBox(content) {
  return [
    "╭" + "─".repeat(32) + "╮",
    centerText("COMBAT NARRATION"),
    "╰" + "─".repeat(32) + "╯",
    "",
    content,
    "",
    "═".repeat(32),
  ].join("\n")
}

export function centerText(text, width = 32) {
  const padding = Math.max(0, Math.floor((width - text.length) / 2))
  return " ".repeat(padding) + text
}

export function rewardBox(title, rewards) {
  const lines = [
    "",
    "╭" + "━".repeat(32) + "╮",
    centerText("MISSION COMPLETE"),
    "╰" + "━".repeat(32) + "╯",
    "",
  ]
  if (title) lines.push(centerText(title))
  lines.push("")
  rewards.forEach(r => {
    lines.push(`  ${r.emoji} ${r.name}`)
  })
  lines.push("")
  lines.push("═".repeat(32))
  return lines.join("\n")
}

export function pvpIntroBox(challenger, target) {
  return [
    "",
    "╭" + "━".repeat(32) + "╮",
    centerText("⚔  DUEL  ⚔"),
    "╰" + "━".repeat(32) + "╯",
    "",
    centerText(challenger.name),
    centerText("VS"),
    centerText(target.name),
    "",
    "═".repeat(32),
  ].join("\n")
}

export function pvpVictoryBox(winnerName) {
  return [
    "",
    "╭" + "━".repeat(32) + "╮",
    centerText("🏆  VICTORY  🏆"),
    "╰" + "━".repeat(32) + "╯",
    "",
    centerText(winnerName),
    "",
    "═".repeat(32),
  ].join("\n")
}

export function pvpDefeatBox(loserName) {
  return [
    "",
    "╭" + "━".repeat(32) + "╮",
    centerText("💀  DEFEATED  💀"),
    "╰" + "━".repeat(32) + "╯",
    "",
    centerText(loserName),
    "",
    "═".repeat(32),
  ].join("\n")
}

export function shopBox(shopName, emoji, items, currentPage, totalPages) {
  const lines = [
    "",
    "╭" + "━".repeat(32) + "╮",
    centerText(`${emoji}  ${shopName.toUpperCase()}`),
    "╰" + "━".repeat(32) + "╯",
    "",
  ]

  items.forEach((item, idx) => {
    const num = idx + 1 + (currentPage - 1) * 5
    lines.push(`  ①  ${item.name}`)
    lines.push(`     ¥${(item.price || 0).toLocaleString()}`)
    if (item.effect?.heal) lines.push(`     ❤️ +${item.effect.heal} HP`)
    if (item.effect?.ce) lines.push(`     ⚡ +${item.effect.ce} CE`)
    if (item.stats) {
      if (item.stats.strength) lines.push(`     ⚔ Str: +${item.stats.strength}`)
      if (item.stats.defense) lines.push(`     🛡 Def: +${item.stats.defense}`)
    }
    lines.push("")
  })

  lines.push(`  Page ${currentPage}/${totalPages}`)
  lines.push("")
  lines.push("═".repeat(32))
  return lines.join("\n")
}

export function levelUpBox(newLevel, statGains) {
  const lines = [
    "",
    "╭" + "━".repeat(32) + "╮",
    centerText("✨  LEVEL UP  ✨"),
    "╰" + "━".repeat(32) + "╯",
    "",
    centerText(`Level ${newLevel}`),
    "",
  ]
  statGains.forEach(sg => {
    lines.push(`  ${sg.emoji} ${sg.name}: +${sg.value}`)
  })
  lines.push("")
  lines.push("═".repeat(32))
  return lines.join("\n")
}

export function gradePromotionBox(newGrade) {
  return [
    "",
    "╭" + "━".repeat(32) + "╮",
    centerText("🎖  GRADE PROMOTION  🎖"),
    "╰" + "━".repeat(32) + "╯",
    "",
    centerText(`Grade ${newGrade}`),
    "",
    "═".repeat(32),
  ].join("\n")
}

export function errorBox(message) {
  return [
    "",
    "╭" + "─".repeat(32) + "╮",
    centerText("⚠  ERROR  ⚠"),
    "╰" + "─".repeat(32) + "╯",
    "",
    `  ${message}`,
    "",
    "═".repeat(32),
  ].join("\n")
}

export function confirmBox(title, message) {
  return [
    "",
    "╭" + "━".repeat(32) + "╮",
    centerText(`✅  ${title.toUpperCase()}  ✅`),
    "╰" + "━".repeat(32) + "╯",
    "",
    `  ${message}`,
    "",
    "═".repeat(32),
  ].join("\n")
}

export function transactionBox(itemName, price, newBalance) {
  return [
    "",
    "╭" + "━".repeat(32) + "╮",
    centerText("🛒  PURCHASE  🛒"),
    "╰" + "━".repeat(32) + "╯",
    "",
    `  Item: ${itemName}`,
    `  Price: ¥${price.toLocaleString()}`,
    `  Balance: ¥${newBalance.toLocaleString()}`,
    "",
    "═".repeat(32),
  ].join("\n")
}

export function skillUnlockBox(skillName) {
  return [
    "",
    "╭" + "━".repeat(32) + "╮",
    centerText("✨  SKILL UNLOCKED  ✨"),
    "╰" + "━".repeat(32) + "╯",
    "",
    centerText(skillName),
    "",
    "═".repeat(32),
  ].join("\n")
}

export function petJoinBattleBox(petName) {
  return [
    "",
    "╭" + "─".repeat(32) + "╮",
    centerText("🐺  COMPANION ARRIVES  🐺"),
    "╰" + "─".repeat(32) + "╯",
    "",
    centerText(`${petName} joins the battle!`),
    "",
    "═".repeat(32),
  ].join("\n")
}

export function petHatchBox(petName) {
  return [
    "",
    "╭" + "━".repeat(32) + "╮",
    centerText("🥚  EGG HATCHING  🥚"),
    "╰" + "━".repeat(32) + "╯",
    "",
    centerText(petName),
    "",
    "  A new shikigami has been born!",
    "",
    "═".repeat(32),
  ].join("\n")
}

export const MENU_COMMANDS = {
  main: [
    menuItem(EMOJI.profile, "profile", "View your profile card"),
    menuItem(EMOJI.inventory, "inventory", "Open inventory"),
    menuItem(EMOJI.inventory, "bag", "Open bag storage"),
    menuItem("📖", "help", "Help guide")
  ],
  combat: [
    menuItem("👹", "spawnenemy", "Spawn a curse"),
    menuItem("⚔️", "fight", "Fight the active curse"),
    menuItem("🗡️", "battack1", "Uppercut (1/4)"),
    menuItem("👊", "battack2", "Jab (2/4)"),
    menuItem("🦵", "battack3", "Roundhouse Kick (3/4)"),
    menuItem("👊", "battack4", "Body Blow (4/4)"),
    menuItem("🛡️", "bblock", "Block attack"),
    menuItem(EMOJI.skills, "btq1", "Technique 1"),
    menuItem(EMOJI.skills, "btq2", "Technique 2"),
    menuItem(EMOJI.skills, "btq3", "Technique 3"),
    menuItem("🏃", "bflee", "Flee"),
    menuItem("⚫", "bf", "Black Flash info"),
    menuItem("🥊", "yuji-train", "Yuji training")
  ],
  pvp: [
    menuItem(EMOJI.pvp, "ch", "Challenge a player"),
    menuItem("✅", "ch-a", "Accept challenge"),
    menuItem("❌", "ch-d", "Decline challenge")
  ],
  economy: [
    menuItem(EMOJI.economy, "wallet", "Check wallet"),
    menuItem("🏦", "bank", "Check bank"),
    menuItem("📥", "deposit", "Deposit yen"),
    menuItem("📤", "wd", "Withdraw yen"),
    menuItem("💸", "send", "Send yen")
  ],
  daily: [
    menuItem(EMOJI.daily, "daily", "Daily tasks"),
    menuItem("💰", "daily claim", "Claim salary"),
    menuItem(EMOJI.skills, "technique", "View skill tree"),
    menuItem(EMOJI.training, "train", "Train skill"),
    menuItem(EMOJI.blackMarket, "blackmarket", "Black market")
  ],
  gambling: [
    menuItem("🔴", "gamble-red", "Red gamble"),
    menuItem("🔵", "gamble-blue", "Blue gamble"),
    menuItem("⚫", "gamble-black", "Black gamble"),
    menuItem("🟢", "gamble-green", "Green gamble")
  ],
  shops: [
    menuItem(EMOJI.shop, "shops", "All shops"),
    menuItem("🍖", "shop-food", "Food shop"),
    menuItem("🥤", "shop-drink", "Drinks shop"),
    menuItem("💊", "shop-meds", "Medicine shop"),
    menuItem("🗡️", "shop-weapon", "Weapon shop"),
    menuItem("👕", "shop-outfit", "Outfit shop"),
    menuItem("🎒", "shop-bag", "Bag shop"),
    menuItem(EMOJI.blackMarket, "blackmarket", "Black market"),
    menuItem("🛒", "buy", "Buy item"),
    menuItem(EMOJI.crafting, "craft", "Crafting workshop"),
    menuItem("🧘", "heal-ce", "Recover all CE")
  ],
  pets: [
    menuItem(EMOJI.pet, "pet", "View equipped summons"),
    menuItem(EMOJI.pet, "pets", "View all summons"),
    menuItem(EMOJI.pet, "pet-info", "View summons details"),
    menuItem("⚔️", "pet-equip", "Equip summons"),
    menuItem("📦", "pet-unequip", "Unequip summons"),
    menuItem("🍖", "pet-feed", "Feed summons"),
    menuItem("💪", "pet-train", "Train summons"),
    menuItem("💊", "pet-heal", "Heal summons"),
    menuItem("📝", "pet-rename", "Rename summons"),
    menuItem("🌟", "petevolve", "Evolve pet")
  ],
  utility: [
    menuItem(EMOJI.sticker, "sticker", "Create sticker from media"),
    menuItem("📝", "take", "Steal sticker from pack"),
    menuItem("🖼️", "toimg", "Sticker to PNG"),
    menuItem("🎬", "togif", "Sticker to GIF"),
    menuItem("📊", "sticker-info", "Sticker info"),
    menuItem("📰", "news", "Daily news"),
    menuItem("📊", "stats", "Server statistics")
  ],
  dashboard: [
    menuItem("📜", "list", "Server registry"),
    menuItem("🏆", "leaderboard", "Leaderboard"),
    menuItem("🖥️", "server", "Server status")
  ]
}

export function buildMenu(player) {
  const lines = []
  lines.push(universalHeader(THEME.gameName, THEME.tagline))
  lines.push("")

  lines.push("┏━━ PLAYER ━━", "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
  lines.push(`┃ ${player.name || "Unknown Sorcerer"}`)
  lines.push(`┃ Grade ${player.grade !== undefined ? player.grade : 4} | Lv ${player.level || 1}`)
  if (player.technique?.name) lines.push(`┃ ${player.technique.name}`)
  lines.push("┃")
  lines.push(`┃ ${EMOJI.economy} Wallet: ¥${(player.wallet || 0).toLocaleString()}`)
  lines.push(`┃ ${EMOJI.inventory} Inventory: ${(player.inventory?.length || 0)}/${player.inventoryCapacity || player.bagCapacity || 16}`)
  if (player.activePet) {
    const petNames = (player.pets || []).find(p => p.id === player.activePet)
    if (petNames) lines.push(`┃ ${EMOJI.pet} Equipped: ${petNames.nickname || petNames.name || "Unknown"}`)
  }
  lines.push("╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯")
  lines.push("")

  Object.entries(MENU_COMMANDS).forEach(([key, commands]) => {
    const emoji = EMOJI[key] || "📌"
    lines.push(sectionHeader(emoji, key.toUpperCase()))
    commands.forEach(cmd => {
      if (!cmd || !cmd.cmd) {
        console.error("[MENU] Missing command entry in category:", key, cmd)
        return
      }
      const cmdText = cmd.cmd.startsWith("/") ? cmd.cmd : `/${cmd.cmd}`
      lines.push(`┃ ${cmd.emoji || "•"} ${cmdText}`)
      lines.push(`┃   ${cmd.description || cmd.desc || ""}`)
    })
    lines.push("")
  })

  lines.push(THEME.divider)
  lines.push(`Type /help for command details`)

  return lines.join("\n")
}

export function buildHelp(sections = null) {
  const lines = []
  lines.push(universalHeader("COMMAND GUIDE"))
  lines.push("")
  lines.push("╭─── 📖 COMMAND GUIDE ───╮")
  lines.push("")
  lines.push("  Navigate your sorcerer journey with these commands.")
  lines.push("")

  const allSections = [
    {
      title: "PLAYER",
      emoji: EMOJI.profile,
      commands: [
        { emoji: "👤", cmd: "/profile", desc: "View your profile card" },
        { emoji: "🎒", cmd: "/inventory", desc: "Open your inventory" },
        { emoji: "🎒", cmd: "/bag", desc: "Open bag storage" },
        { emoji: "📖", cmd: "/help", desc: "Show this help guide" }
      ]
    },
    {
      title: "COMBAT",
      emoji: EMOJI.combat,
      commands: [
        { emoji: "👹", cmd: "/spawnenemy", desc: "Spawn a curse for battle" },
        { emoji: "⚔️", cmd: "/fight", desc: "Fight the active curse" },
        { emoji: "🗡️", cmd: "/battack1", desc: "Uppercut - Attack (1/4)" },
        { emoji: "👊", cmd: "/battack2", desc: "Jab - combo after 4 hits (2/4)" },
        { emoji: "🦵", cmd: "/battack3", desc: "Roundhouse Kick - stun chance (3/4)" },
        { emoji: "👊", cmd: "/battack4", desc: "Body Blow - drains enemy CE (4/4)" },
        { emoji: "🛡️", cmd: "/bblock", desc: "Block incoming attack" },
        { emoji: "✨", cmd: "/btq1", desc: "Use technique 1" },
        { emoji: "✨", cmd: "/btq2", desc: "Use technique 2" },
        { emoji: "✨", cmd: "/btq3", desc: "Use technique 3" },
        { emoji: "🏃", cmd: "/bflee", desc: "Attempt to flee" },
        { emoji: "⚫", cmd: "/bf", desc: "Black Flash info & manual" },
        { emoji: "🥊", cmd: "/yuji-train", desc: "Train martial arts with Yuji" }
      ]
    },
    {
      title: "PVP",
      emoji: EMOJI.pvp,
      commands: [
        { emoji: "🥊", cmd: "/ch", desc: "Challenge a player (reply to their message)" },
        { emoji: "✅", cmd: "/ch-a", desc: "Accept challenge" },
        { emoji: "❌", cmd: "/ch-d", desc: "Decline challenge" }
      ]
    },
    {
      title: "ECONOMY",
      emoji: EMOJI.economy,
      commands: [
        { emoji: "💴", cmd: "/wallet", desc: "Check your wallet" },
        { emoji: "🏦", cmd: "/bank", desc: "Check your bank" },
        { emoji: "📥", cmd: "/deposit", desc: "Deposit yen to bank" },
        { emoji: "📤", cmd: "/wd", desc: "Withdraw yen from bank" },
        { emoji: "💸", cmd: "/send", desc: "Transfer yen to another player" }
      ]
    },
    {
      title: "DAILY",
      emoji: EMOJI.daily,
      commands: [
        { emoji: "🌅", cmd: "/daily", desc: "View daily tasks" },
        { emoji: "💰", cmd: "/daily claim", desc: "Claim daily salary" },
        { emoji: "🎯", cmd: "/technique", desc: "View technique skill tree" },
        { emoji: "💪", cmd: "/train <skill>", desc: "Start technique training" }
      ]
    },
    {
      title: "SHOPS",
      emoji: EMOJI.shop,
      commands: [
        { emoji: "🏪", cmd: "/shops", desc: "View all shops" },
        { emoji: "🍖", cmd: "/shop-food", desc: "Food shop" },
        { emoji: "🥤", cmd: "/shop-drink", desc: "Drinks shop" },
        { emoji: "💊", cmd: "/shop-meds", desc: "Medicine shop" },
        { emoji: "🗡️", cmd: "/shop-weapon", desc: "Weapon shop" },
        { emoji: "👕", cmd: "/shop-outfit", desc: "Outfit shop" },
        { emoji: "🎒", cmd: "/shop-bag", desc: "Bag shop" },
        { emoji: "🏪", cmd: "/blackmarket", desc: "Black market" },
        { emoji: "🛒", cmd: "/buy", desc: "Buy an item" },
        { emoji: "🔨", cmd: "/craft", desc: "Crafting workshop" },
        { emoji: "🧘", cmd: "/heal-ce", desc: "Recover all Cursed Energy" }
      ]
    },
    {
      title: "SUMMONS",
      emoji: EMOJI.summons,
      commands: [
        { emoji: "🐺", cmd: "/pet", desc: "View your equipped summons" },
        { emoji: "📋", cmd: "/pets", desc: "View all summons" },
        { emoji: "ℹ️", cmd: "/pet-info", desc: "View summons details" },
        { emoji: "⚔️", cmd: "/pet-equip", desc: "Equip a summons" },
        { emoji: "📦", cmd: "/pet-unequip", desc: "Unequip summons" },
        { emoji: "🍖", cmd: "/pet-feed", desc: "Feed your summons" },
        { emoji: "💪", cmd: "/pet-train", desc: "Train your summons" },
        { emoji: "💊", cmd: "/pet-heal", desc: "Heal your summons" },
        { emoji: "📝", cmd: "/pet-rename", desc: "Rename your summons" }
      ]
    },
    {
      title: "CARDS",
      emoji: "🃏",
      commands: [
        { emoji: "🃏", cmd: "/spawncard", desc: "Spawn a group card" },
        { emoji: "📥", cmd: "/claim-card", desc: "Claim spawned card" },
        { emoji: "🎴", cmd: "/deck", desc: "View your card deck" },
        { emoji: "🎁", cmd: "/spawnpack", desc: "Open card pack (¥10,000, 30s cooldown)" },
        { emoji: "✅", cmd: "/claim-pack", desc: "Claim pending card pack" }
      ]
    },
    {
      title: "UTILITY",
      emoji: EMOJI.utility,
      commands: [
        { emoji: "🖼️", cmd: "/sticker", desc: "Create sticker from media" },
        { emoji: "📝", cmd: "/take", desc: "Create sticker from existing pack" },
        { emoji: "🖼️", cmd: "/toimg", desc: "Convert sticker to PNG" },
        { emoji: "🎬", cmd: "/togif", desc: "Convert sticker to GIF" },
        { emoji: "📊", cmd: "/sticker-info", desc: "Sticker info" },
        { emoji: "📰", cmd: "/news", desc: "Daily news" },
        { emoji: "📊", cmd: "/stats", desc: "Server statistics" },
        { emoji: "🎵", cmd: "/yt", desc: "Search YouTube Music" },
        { emoji: "🎧", cmd: "/ytset", desc: "Set song to your profile" }
      ]
    },
    {
      title: "DASHBOARD",
      emoji: "📜",
      commands: [
        { emoji: "📜", cmd: "/list", desc: "Server registry" },
        { emoji: "🏆", cmd: "/leaderboard", desc: "Leaderboards" },
        { emoji: "🖥️", cmd: "/server", desc: "Server status" }
      ]
    },
    {
      title: "GROUP",
      emoji: "👥",
      commands: [
        { emoji: "🖼️", cmd: "/setgrouppfp", desc: "Set group curse image" }
      ]
    }
  ]

  const sectionsToShow = sections ? allSections.filter(s => sections.includes(s.title)) : allSections

  sectionsToShow.forEach(section => {
    lines.push(sectionHeader(section.emoji, section.title))
    section.commands.forEach(cmd => {
      if (!cmd || !cmd.cmd) {
        console.error("[MENU] Missing command entry in help section:", section.title, cmd)
        return
      }
      const cmdText = cmd.cmd.startsWith("/") ? cmd.cmd : `/${cmd.cmd}`
      lines.push(`┃ ${cmd.emoji || "•"} ${cmdText}`)
      lines.push(`┃   ${cmd.desc || cmd.description || ""}`)
    })
    lines.push("")
  })

  lines.push(THEME.divider)
  lines.push("Tip: Use /help <category> for detailed info")

  return lines.join("\n")
}

export function getFooter() {
  return [
    "",
    THEME.divider,
    "",
    THEME.gameName,
    `"The Strongest Become Legends."`,
    "",
    THEME.footer
  ].join("\n")
}

export function randomHeader(text) {
  const headers = [
    `╭━━━『 ${text} 』━━━╮`,
    `┏━━━「 ${text} 」━━━┓`,
    `╭─────『 ${text} 』─────╮`,
    `┌─────「 ${text} 」─────┐`,
    `━━━━━ ${text} ━━━━━`
  ]
  return headers[Math.floor(Math.random() * headers.length)]
}
