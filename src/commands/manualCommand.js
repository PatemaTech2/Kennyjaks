import { sendQuotedWithFooter } from "../utils/messageHelper.js"
import { loadPlayerByPhone } from "../database/playerRepo.js"
import { FOOTER, categoryHeader, sectionDivider } from "../utils/ui.js"
import { TechniqueService } from "../services/technique/TechniqueService.js"
import { COMMAND_DEFINITIONS } from "../services/commandMetadata.js"

const MANUAL_PAGES = {
  1: () => [
    "━━━━━━━━━━━━━━━━━━━━━━",
    "📖 GETTING STARTED",
    "━━━━━━━━━━━━━━━━━━━━━━",
    "",
    "🧑‍🎓 REGISTERING",
    "",
    "/start",
    "",
    "This creates your player.",
    "",
    "You receive:",
    "• Potential",
    "• Cursed Technique",
    "• Starting stats",
    "• Starting inventory",
    "• Starting progression",
    "",
    "━━━━━━━━━━━━━━━━━━━━━━",
    "",
    "📊 VIEW YOUR CHARACTER",
    "",
    "/profile",
    "/att",
    "/pot",
    "/technique",
    "",
    "━━━━━━━━━━━━━━━━━━━━━━"
  ].join("\n"),

  2: () => [
    "━━━━━━━━━━━━━━━━━━━━━━",
    "📊 PLAYER PROFILE",
    "━━━━━━━━━━━━━━━━━━━━━━",
    "",
    "/profile — view your profile card",
    "/att — view attributes and Black Flash Affinity",
    "/pot — view potential tier and bonuses",
    "/technique — view technique skill tree",
    "",
    "Your profile shows:",
    "• Grade and Level",
    "• HP and CE",
    "• Equipped items",
    "• Active summons",
    "• Wallet balance",
    "",
    "━━━━━━━━━━━━━━━━━━━━━━"
  ].join("\n"),

  3: () => [
    "━━━━━━━━━━━━━━━━━━━━━━",
    "⭐ LEVELS & XP",
    "━━━━━━━━━━━━━━━━━━━━━━",
    "",
    "XP comes from battles and other activities.",
    "XP contributes to level progression.",
    "Levels unlock progression opportunities.",
    "",
    "Existing XP is always processed correctly.",
    "Players never gain XP without the level",
    "system checking for level-ups.",
    "",
    "Level-ups grant Skill Points automatically.",
    "Stats scale with level.",
    "",
    "━━━━━━━━━━━━━━━━━━━━━━"
  ].join("\n"),

  4: () => [
    "━━━━━━━━━━━━━━━━━━━━━━",
    "🏅 GRADES",
    "━━━━━━━━━━━━━━━━━━━━━━",
    "",
    "Special Grade",
    "Grade 1",
    "Grade 2",
    "Grade 3",
    "Grade 4",
    "",
    "Players progress between grades as they level up.",
    "",
    "Curse grades determine danger and rewards.",
    "Higher grade curses give more XP and yen.",
    "",
    "━━━━━━━━━━━━━━━━━━━━━━"
  ].join("\n"),

  5: () => [
    "━━━━━━━━━━━━━━━━━━━━━━",
    "🎯 POTENTIALS",
    "━━━━━━━━━━━━━━━━━━━━━━",
    "",
    "/pot — view your potential",
    "",
    "Potential tiers:",
    "A — Double ALL attributes",
    "B — Strength and Speed significantly",
    "C — Speed and CE efficiency",
    "D — Intelligence",
    "E — HP and Defense",
    "F — No bonus. Base stats only.",
    "",
    "/att — view attributes and Black Flash Affinity",
    "",
    "Every player has a unique Black Flash Affinity.",
    "",
    "━━━━━━━━━━━━━━━━━━━━━━"
  ].join("\n"),

  6: () => {
    const player = null
    const techniqueDisplay = player ? TechniqueService.getSkillTreeDisplay(player) : "View in-game with /technique"
    return [
      "━━━━━━━━━━━━━━━━━━━━━━",
      "⚡ TECHNIQUES",
      "━━━━━━━━━━━━━━━━━━━━━━",
      "",
      "/technique — view technique skill tree",
      "",
      "Technique skills unlock as you train.",
      "Skill unlocks require level and training.",
      "",
      "Technique mastery increases with use.",
      "",
      "Reversed Techniques are unlocked via RCT.",
      "",
      "━━━━━━━━━━━━━━━━━━━━━━"
    ].join("\n")
  },

  7: () => [
    "━━━━━━━━━━━━━━━━━━━━━━",
    "💪 TRAINING",
    "━━━━━━━━━━━━━━━━━━━━━━",
    "",
    "/train <technique> — start training",
    "/technique — view progression",
    "",
    "Training objectives:",
    "• Defeat curses",
    "• Land Black Flashes",
    "",
    "Progression is automatically tracked.",
    "",
    "Example:",
    "Defeat 20 curses",
    "13 / 20",
    "",
    "━━━━━━━━━━━━━━━━━━━━━━"
  ].join("\n"),

  8: () => [
    "━━━━━━━━━━━━━━━━━━━━━━",
    "⚔️ CURSE BATTLES",
    "━━━━━━━━━━━━━━━━━━━━━━",
    "",
    "/spawnenemy — encounter a random curse",
    "",
    "Battle commands:",
    "/battack — normal attack",
    "/battack1 — Uppercut",
    "/battack2 — Jab (combo)",
    "/battack3 — Roundhouse Kick (stun)",
    "/battack4 — Body Blow (drains CE)",
    "/bblock — block",
    "/bflee — flee",
    "",
    "Battles are turn-based.",
    "Speed determines which action lands first.",
    "",
    "HP = Health",
    "CE = Cursed Energy",
    "",
    "━━━━━━━━━━━━━━━━━━━━━━"
  ].join("\n"),

  9: () => [
    "━━━━━━━━━━━━━━━━━━━━━━",
    "🥊 PvP",
    "━━━━━━━━━━━━━━━━━━━━━━",
    "",
    "/ch — challenge a player",
    "/ch-a — accept challenge",
    "/ch-d — decline challenge",
    "",
    "Challenge flow:",
    "1. Reply to a player's message",
    "2. Use /ch",
    "3. They accept with /ch-a",
    "",
    "Turn-based combat with speed priority.",
    "Victory grants XP and yen.",
    "",
    "PvP leaderboard available.",
    "",
    "━━━━━━━━━━━━━━━━━━━━━━"
  ].join("\n"),

  10: () => [
    "━━━━━━━━━━━━━━━━━━━━━━",
    "⚫ BLACK FLASH",
    "━━━━━━━━━━━━━━━━━━━━━━",
    "",
    "Every player has their own Black Flash Affinity.",
    "Affinity is different for every player.",
    "/att shows it.",
    "",
    "Black Flash normally deals ×2 normal attack damage.",
    "",
    "The 0-CE special interaction can produce",
    "the Perfect Black Flash.",
    "",
    "━━━━━━━━━━━━━━━━━━━━━━"
  ].join("\n"),

  11: () => [
    "━━━━━━━━━━━━━━━━━━━━━━",
    "🔄 RCT (Reverse Cursed Technique)",
    "━━━━━━━━━━━━━━━━━━━━━━",
    "",
    "/rt — view RCT status",
    "/rct-train — view training progress",
    "/rt-train — 14-day streak training",
    "/rct-auto — toggle auto-heal",
    "/rct-slow — quick heal (battle)",
    "/rct-burst — big heal + 3-turn regen (battle)",
    "/rct-give — heal another player",
    "/rtu — use reversed technique (battle)",
    "",
    "RCT can be awakened through training",
    "or near-death experiences.",
    "",
    "━━━━━━━━━━━━━━━━━━━━━━"
  ].join("\n"),

  12: () => [
    "━━━━━━━━━━━━━━━━━━━━━━",
    "🌀 DOMAIN EXPANSION",
    "━━━━━━━━━━━━━━━━━━━━━━",
    "",
    "Become Domain-eligible by:",
    "",
    "• Having RCT unlocked",
    "OR",
    "• Defeating 100 curses",
    "",
    "Then use /train-domain to complete the challenge.",
    "",
    "Use /domain-name <name> to name your domain.",
    "Use /domain in battle to activate it.",
    "",
    "Your domain is based on your cursed technique.",
    "",
    "━━━━━━━━━━━━━━━━━━━━━━"
  ].join("\n"),

  13: () => [
    "━━━━━━━━━━━━━━━━━━━━━━",
    "💴 ECONOMY",
    "━━━━━━━━━━━━━━━━━━━━━━",
    "",
    "/wallet — view wallet",
    "/bank — view bank",
    "/deposit — deposit yen",
    "/wd — withdraw yen",
    "/send — transfer yen",
    "",
    "Wallet: spending money (always accessible)",
    "Bank: savings (safer, but less accessible)",
    "",
    "━━━━━━━━━━━━━━━━━━━━━━"
  ].join("\n"),

  14: () => [
    "━━━━━━━━━━━━━━━━━━━━━━",
    "🛒 SHOPS",
    "━━━━━━━━━━━━━━━━━━━━━━",
    "",
    "/shops — view all shops",
    "",
    "Available shops:",
    "• Outfit shop — clothing",
    "• Egg shop — summon eggs",
    "• Food shop — HP healing",
    "• Drink shop — CE recovery and water",
    "• Medicine shop — status cures",
    "• Weapon shop — weapons with skills",
    "• Bag shop — storage expansion",
    "",
    "━━━━━━━━━━━━━━━━━━━━━━"
  ].join("\n"),

  15: () => [
    "━━━━━━━━━━━━━━━━━━━━━━",
    "🎒 INVENTORY & BAGS",
    "━━━━━━━━━━━━━━━━━━━━━━",
    "",
    "/inventory — view inventory",
    "/bag — view bag storage",
    "/i2b — move item to bag",
    "/b2i — move item to inventory",
    "",
    "Inventory has limited slots.",
    "Bags provide extra storage.",
    "",
    "━━━━━━━━━━━━━━━━━━━━━━"
  ].join("\n"),

  16: () => [
    "━━━━━━━━━━━━━━━━━━━━━━",
    "🗡️ WEAPONS",
    "━━━━━━━━━━━━━━━━━━━━━━",
    "",
    "/shop-weapons — browse weapons",
    "/equip — equip a weapon",
    "/unequip — unequip weapon",
    "/w — use weapon skill",
    "/w1 — weapon skill 1",
    "/w2 — weapon skill 2",
    "/w3 — weapon skill 3",
    "",
    "Different weapons have different skills.",
    "Weapons have durability.",
    "",
    "━━━━━━━━━━━━━━━━━━━━━━"
  ].join("\n"),

  17: () => [
    "━━━━━━━━━━━━━━━━━━━━━━",
    "🔨 CRAFTING",
    "━━━━━━━━━━━━━━━━━━━━━━",
    "",
    "/craft — open crafting",
    "/craft-name — craft specific item",
    "",
    "Crafting uses:",
    "• Materials",
    "• Curse Essence",
    "• Death Painting",
    "",
    "Weapon crafting",
    "Shikigami / living weapons",
    "",
    "━━━━━━━━━━━━━━━━━━━━━━"
  ].join("\n"),

  18: () => [
    "━━━━━━━━━━━━━━━━━━━━━━",
    "🐾 SUMMONS & PETS",
    "━━━━━━━━━━━━━━━━━━━━━━",
    "",
    "Eggs hatch into powerful allies.",
    "",
    "Commands:",
    "/hatch — hatch an egg",
    "/pet — view equipped summon",
    "/pets — view all summons",
    "/pet-equip — equip a summon",
    "/pet-unequip — unequip",
    "/pet-feed — feed your summon",
    "/pet-train — train your summon",
    "/pet-heal — heal your summon",
    "/pet-rename — rename your summon",
    "/petevolve — evolve your summon",
    "",
    "Ten Shadows Technique users",
    "can train shikigami.",
    "",
    "━━━━━━━━━━━━━━━━━━━━━━"
  ].join("\n"),

  19: () => [
    "━━━━━━━━━━━━━━━━━━━━━━",
    "🍖 FOOD & THIRST",
    "━━━━━━━━━━━━━━━━━━━━━━",
    "",
    "/shop-food — buy food (HP healing)",
    "/shop-drink — buy drinks (CE + water)",
    "/shop-meds — buy medicine",
    "/eat — eat food",
    "/drink — drink water",
    "",
    "HP healing restores health.",
    "CE recovery restores cursed energy.",
    "Water reduces thirst.",
    "",
    "If thirst becomes too low,",
    "you cannot do anything until you drink.",
    "",
    "━━━━━━━━━━━━━━━━━━━━━━"
  ].join("\n"),

  20: () => {
    const categories = buildCommandDirectory()
    const lines = [
      "━━━━━━━━━━━━━━━━━━━━━━",
      "📜 COMMAND DIRECTORY",
      "━━━━━━━━━━━━━━━━━━━━━━",
      ""
    ]
    for (const [cat, cmds] of Object.entries(categories)) {
      lines.push(`[${cat.toUpperCase()}]`)
      for (const c of cmds) {
        lines.push(`  ${c}`)
      }
      lines.push("")
    }
    return lines.join("\n")
  }
}

function buildCommandDirectory() {
  const categories = {}
  for (const command of COMMAND_DEFINITIONS) {
    if (command.hidden) continue
    const category = command.category || "Other"
    categories[category] = categories[category] || []
    const displayCommand = command.command || command.prefix
    if (displayCommand) categories[category].push(displayCommand)
  }

  for (const category of Object.keys(categories)) {
    categories[category].sort((a, b) => a.localeCompare(b))
  }
  return categories
}

const TOTAL_PAGES = 20

export async function handleManual(sock, message) {
  const remoteJid = message.key.remoteJid
  const sender = message.key.participant || remoteJid
  const phoneNumber = sender.split("@")[0]

  const player = await loadPlayerByPhone(phoneNumber)
  const header = player
    ? `Welcome, ${player.name || "Sorcerer"}.`
    : "Welcome to KennyJaks."

  const lines = [
    "━━━━━━━━━━━━━━━━━━━━━━",
    "📖 KENNYJAKS MANUAL",
    "━━━━━━━━━━━━━━━━━━━━━━",
    "",
    header,
    "",
    "You are a Jujutsu Sorcerer.",
    "Your goal is to grow stronger,",
    "master your technique, survive curses,",
    "and eventually reach the highest levels",
    "of sorcery.",
    "",
    "━━━━━━━━━━━━━━━━━━━━━━",
    "",
    "📚 MANUAL SECTIONS",
    "",
    `1️⃣ Getting Started (${MANUAL_PAGES[1]().split('\n').length} lines)`,
    `2️⃣ Player Profile`,
    `3️⃣ Levels & XP`,
    `4️⃣ Grades`,
    `5️⃣ Potentials`,
    `6️⃣ Techniques`,
    `7️⃣ Training`,
    `8️⃣ Curse Battles`,
    `9️⃣ PvP`,
    `🔟 Black Flash`,
    `1️⃣1️⃣ RCT`,
    `1️⃣2️⃣ Domain Expansion`,
    `1️⃣3️⃣ Economy`,
    `1️⃣4️⃣ Shops`,
    `1️⃣5️⃣ Inventory & Bags`,
    `1️⃣6️⃣ Weapons`,
    `1️⃣7️⃣ Crafting`,
    `1️⃣8️⃣ Summons & Pets`,
    `1️⃣9️⃣ Food & Thirst`,
    `2️⃣0️⃣ Commands`,
    "",
    "━━━━━━━━━━━━━━━━━━━━━━",
    "",
    "Use:",
    "/manual-1",
    "/manual-2",
    "/manual-3",
    "",
    "etc."
  ]

  await sendQuotedWithFooter(sock, remoteJid, lines.join("\n"), message)
}

export async function handleManualPage(sock, message, page) {
  const remoteJid = message.key.remoteJid
  const sender = message.key.participant || remoteJid
  const phoneNumber = sender.split("@")[0]

  const player = await loadPlayerByPhone(phoneNumber)

  if (!MANUAL_PAGES[page]) {
    await sendQuotedWithFooter(sock, remoteJid, `Manual page ${page} not found. Use /manual to see all sections.`, message)
    return
  }

  let content = MANUAL_PAGES[page]()
  if (player && (page === 6 || page === 2)) {
    const techniqueDisplay = TechniqueService.getSkillTreeDisplay(player)
    if (techniqueDisplay) {
      content += "\n\n" + techniqueDisplay
    }
  }

  await sendQuotedWithFooter(sock, remoteJid, content, message)
}
