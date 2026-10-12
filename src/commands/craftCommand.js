import { sendQuotedWithFooter } from "../utils/messageHelper.js"
import { loadPlayerByPhone, savePlayer } from "../database/playerRepo.js"
import { weapons, weaponSkills } from "../data/items/weapons.js"
import { materials, findMaterialByName, findMaterialById } from "../data/items/materials.js"
import { parseItemName } from "../utils/itemNameParser.js"

const CRAFT_QUALITY_COSTS = {
  low: 60000,
  normal: 130000,
  high: 700000,
  perfect: 4000000
}

const CRAFT_QUALITY_NAMES = {
  low: "Low",
  normal: "Normal",
  high: "High",
  perfect: "Perfect"
}

const CRAFT_QUALITY_STATS = {
  low: 0.7,
  normal: 1.0,
  high: 1.3,
  perfect: 1.6
}

const CRAFT_QUALITY_SUCCESS = {
  low: 0.5,
  normal: 0.75,
  high: 0.9,
  perfect: 1.0
}

const WEAPON_CRAFT_TEMPLATES = [
  { id: "katana", name: "Katana", baseStats: { attack: 20, speed: 5 }, category: "Swords" },
  { id: "nodachi", name: "Nodachi", baseStats: { attack: 35, speed: -2 }, category: "Swords" },
  { id: "tanto", name: "Tanto", baseStats: { attack: 22, speed: 12, critRate: 8 }, category: "Knives" },
  { id: "hammer", name: "Cursed Hammer", baseStats: { attack: 65, speed: -5 }, category: "Special Grade Weapons" },
  { id: "scythe", name: "Scythe", baseStats: { attack: 60, speed: 10 }, category: "Special Grade Weapons" },
  { id: "spear", name: "Spear", baseStats: { attack: 40, speed: 8 }, category: "Polearms" },
  { id: "bo_staff", name: "Bo Staff", baseStats: { attack: 35, speed: 15 }, category: "Special Grade Weapons" },
  { id: "chain", name: "Chain", baseStats: { attack: 45, speed: 20 }, category: "Special Grade Weapons" },
  { id: "dagger", name: "Dagger", baseStats: { attack: 25, speed: 15, critRate: 15 }, category: "Knives" },
  { id: "axe", name: "Axe", baseStats: { attack: 55, speed: -3 }, category: "Special Grade Weapons" }
]

const MATERIAL_COSTS = {
  iron: { iron: 5, wood: 3, leather: 2 },
  black_iron: { iron: 3, black_iron: 3, leather: 1 },
  curse_essence: { curse_essence: 1, black_iron: 2, curse_flesh: 3 },
  death_painting: { death_painting: 1, curse_essence: 2, iron: 5 },
  legendary: { legendary_fragment: 2, special_grade_core: 1, curse_essence: 5 }
}

const RARITY_TIERS = ["Poor", "Common", "Rare", "Epic", "Legendary", "Special Grade"]

const MATERIAL_RARITY_MAP = {
  "Iron": 1,
  "Black Iron": 2,
  "Curse Flesh": 1,
  "Curse Essence": 3,
  "Death Painting": 5,
  "Legendary Finger Fragment": 6,
  "Special Grade Core": 7
}

function materialToIds(input) {
  return input.split(",").map(s => s.trim().toLowerCase()).filter(s => s.length > 0)
}

function detectCraftType(materialIds) {
  let isCursed = false
  let isLiving = false
  let isLegendary = false
  let highestMaterialTier = 0

  for (const mid of materialIds) {
    const fullId = mid.startsWith("material_") ? mid : `material_${mid}`
    const mat = findMaterialById(fullId) || findMaterialByName(mid)
    if (mat) {
      const tier = MATERIAL_RARITY_MAP[mat.name] || 0
      if (tier > highestMaterialTier) highestMaterialTier = tier
      if (mat.name === "Curse Essence") isCursed = true
      if (mat.name === "Death Painting") { isLiving = true; isCursed = true }
      if (mat.name === "Legendary Finger Fragment") { isLegendary = true }
    }
  }

  return { isCursed, isLiving, isLegendary, highestMaterialTier }
}

const WEAPON_BASE_DURABILITY = 100
const WEAPON_BASE_WEIGHT = 5

export async function handleCraft(sock, message) {
  const remoteJid = message.key.remoteJid
  const sender = message.key.participant || remoteJid
  const phoneNumber = sender.split("@")[0]

  const player = await loadPlayerByPhone(phoneNumber)
  if (!player) {
    await sendQuotedWithFooter(sock, remoteJid, "You need to register first.\n\nUse /start to begin.", message)
    return
  }

  const text = (message.message?.conversation || message.message?.extendedTextMessage?.text || "").trim().toLowerCase()
  const args = text.split(" ")

  if (args.length < 2) {
    const response = [
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "🔨 CRAFTING WORKSHOP",
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "",
      "Select materials first, then choose quality.",
      "",
      "Example:",
      "/craft iron,black-iron",
      "/craft iron,black-iron,curse-essence",
      "/craft death_painting,curse-essence",
      "",
      "Available materials: iron, black-iron, wood, leather,",
      "  curse-flesh, curse-essence, death-painting,",
      "  legendary-fragment, special-grade-core",
      "",
      "After selecting materials, choose quality:",
      "  /craft low | /craft normal | /craft high | /craft perfect",
      "",
      "Then name your weapon:",
      "  /craft-name Shadow Fang",
      "",
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    ].join("\n")
    await sendQuotedWithFooter(sock, remoteJid, response, message)
    return
  }

  const hasComma = args[1].includes(",")
  const validQualities = Object.keys(CRAFT_QUALITY_COSTS)

  if (hasComma) {
    const materialIds = materialToIds(args.slice(1).join(" "))
    const { isCursed, isLiving, isLegendary, highestMaterialTier } = detectCraftType(materialIds)

    player.inventory = player.inventory || []
    const bagMaterials = player.bagInventory ? player.bagInventory.filter(i => i.type === "material" || (i.type === "consumable" && i.category === "Materials")) : []
    const materialsInInv = player.inventory.filter(i => i.type === "material" || (i.type === "consumable" && i.category === "Materials"))

    const allMaterials = [...materialsInInv, ...bagMaterials]
    const consumedMaterials = []
    let canCraft = true

    for (const mid of materialIds) {
      const fullId = mid.startsWith("material_") ? mid : `material_${mid}`
      const fromInv = materialsInInv.find(i => i.id === fullId || i.id === mid)
      const fromBag = bagMaterials.find(i => i.id === fullId || i.id === mid)
      const target = fromInv || fromBag
      if (!target || (target.quantity || 1) < 1) {
        canCraft = false
        break
      }
      target.quantity = (target.quantity || 1) - 1
      if (target.quantity <= 0) {
        const arr = fromInv ? materialsInInv : bagMaterials
        const idx = arr.indexOf(target)
        if (idx !== -1) arr.splice(idx, 1)
      }
      consumedMaterials.push({ id: target.id, name: target.name || mid, icon: target.icon || "🪨" })
    }

    if (!canCraft) {
      await sendQuotedWithFooter(sock, remoteJid, "❌ Not enough materials in your inventory.\nGather materials from battles and try again.", message)
      return
    }

    await savePlayer(player)

    const craftTypeDesc = isLiving ? "Living Weapon" : isCursed ? "Cursed Weapon" : isLegendary ? "Legendary Weapon" : "Standard Weapon"

    const response = [
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "🔨 CRAFTING WORKSHOP",
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "",
      "Materials Detected:",
      consumedMaterials.map(m => `${m.icon || "🪨"} ${m.name || "Unknown Material"}`).join("\n"),
      "",
      `Craft Type: ${craftTypeDesc}`,
      "",
      "Choose Craft Quality:",
      "",
      `1. Low      - ¥${CRAFT_QUALITY_COSTS.low.toLocaleString()}  (50% success)`,
      `2. Normal   - ¥${CRAFT_QUALITY_COSTS.normal.toLocaleString()}  (75% success)`,
      `3. High     - ¥${CRAFT_QUALITY_COSTS.high.toLocaleString()}  (90% success)`,
      `4. Perfect  - ¥${CRAFT_QUALITY_COSTS.perfect.toLocaleString()}  (100% success)`,
      "",
      "Usage: /craft <quality>",
      "Example: /craft normal",
      "",
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    ].join("\n")

    player.craftState = {
      quality: null,
      qualityLabel: null,
      cost: null,
      statMultiplier: 1,
      successRate: 0.75,
      pending: true,
      materials: consumedMaterials,
      craftType: isLiving ? "living" : isCursed ? "cursed" : isLegendary ? "legendary" : "standard",
      highestMaterialTier
    }
    await savePlayer(player)
    await sendQuotedWithFooter(sock, remoteJid, response, message)
    return
  }

  const qualityKey = args[1]
  if (!validQualities.includes(qualityKey)) {
    const response = [
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "🔨 CRAFTING WORKSHOP",
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "",
      "Select materials first:",
      "/craft iron,black-iron,curse-essence",
      "",
      "Or choose quality from: low, normal, high, perfect",
      "",
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    ].join("\n")
    await sendQuotedWithFooter(sock, remoteJid, response, message)
    return
  }

  const cost = CRAFT_QUALITY_COSTS[qualityKey]
  if (player.wallet < cost) {
    await sendQuotedWithFooter(sock, remoteJid, `Insufficient funds. Need ¥${cost.toLocaleString()}.`, message)
    return
  }

  player.wallet -= cost
  player.lifetimeSpent += cost

  const existingState = player.craftState || {}
  const statMult = CRAFT_QUALITY_STATS[qualityKey]
  const successRate = CRAFT_QUALITY_SUCCESS[qualityKey]

  const craftState = {
    ...existingState,
    quality: qualityKey,
    qualityLabel: CRAFT_QUALITY_NAMES[qualityKey],
    cost: cost,
    statMultiplier: statMult,
    successRate: successRate,
    pending: true,
    materials: existingState.materials || [],
    craftType: existingState.craftType || null,
    highestMaterialTier: existingState.highestMaterialTier || 0
  }
  player.craftState = craftState
  await savePlayer(player)

  const weaponTypes = craftState.craftType === "living" ? ["katana", "nodachi", "scythe", "hammer"] :
                      craftState.craftType === "cursed" ? WEAPON_CRAFT_TEMPLATES.map(w => w.id) :
                      craftState.craftType === "legendary" ? ["katana", "scythe", "hammer", "nodachi"] :
                      WEAPON_CRAFT_TEMPLATES.map(w => w.id)

  const response = [
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    "🔨 CRAFTING WORKSHOP",
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    "",
    `Quality: ${craftState.qualityLabel || "Unknown"}`,
    `Cost: ¥${(cost || 0).toLocaleString()}`,
    `Success Rate: ${Math.round((craftState.successRate || 0) * 100)}%`,
    `Stat Multiplier: ${(craftState.statMultiplier || 1)}x`,
  ]

  if (craftState.materials && craftState.materials.length > 0) {
    response.push("", "Materials Consumed:")
    response.push(...craftState.materials.map(m => `${m.icon || "🪨"} ${m.name || "Unknown Material"}`))
    response.push("", `Type: ${craftState.craftType === "living" ? "Living Weapon" : craftState.craftType === "cursed" ? "Cursed Weapon" : craftState.craftType === "legendary" ? "Legendary Weapon" : "Standard Weapon"}`)
  }

  response.push(
    "",
    "Now choose a weapon type and provide a custom name:",
    "Available weapons:",
    WEAPON_CRAFT_TEMPLATES.map(w => `  ${w.icon || "⚔️"} ${w.name}`).join("\n"),
    "",
    "Usage: /craft-name <weapon-type> <custom-name>",
    "Example: /craft-name katana Shadow Fang",
    "",
    "Weapon Types: katana, nodachi, tanto, hammer, scythe, spear, bo_staff, chain, dagger, axe",
    "",
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  )

  await sendQuotedWithFooter(sock, remoteJid, response, message)
}

export async function handleCraftName(sock, message) {
  const remoteJid = message.key.remoteJid
  const sender = message.key.participant || remoteJid
  const phoneNumber = sender.split("@")[0]

  const player = await loadPlayerByPhone(phoneNumber)
  if (!player) {
    await sendQuotedWithFooter(sock, remoteJid, "You need to register first.\n\nUse /start to begin.", message)
    return
  }

  const text = (message.message?.conversation || message.message?.extendedTextMessage?.text || "").trim()
  const args = text.split(" ")
  const craftState = player.craftState
  if (!craftState || !craftState.pending) {
    await sendQuotedWithFooter(sock, remoteJid, "No active crafting session. Use /craft first to choose a quality.", message)
    return
  }

  const hasMaterials = craftState.materials && craftState.materials.length > 0

  let weaponType, customName
  if (args.length >= 3) {
    weaponType = args[1].toLowerCase()
    customName = args.slice(2).join(" ")
  } else if (args.length === 2) {
    customName = args[1]
    const autoWeapons = {
      living: ["scythe", "hammer", "katana", "nodachi"],
      cursed: ["katana", "scythe", "dagger", "axe", "tanto", "nodachi", "hammer", "chain"],
      legendary: ["katana", "nodachi", "scythe", "hammer"],
      standard: ["katana", "nodachi", "tanto", "spear", "dagger", "hammer", "scythe", "chain", "axe", "bo_staff"]
    }
    const pool = autoWeapons[craftState.craftType] || autoWeapons.standard
    weaponType = pool[Math.floor(Math.random() * pool.length)]
  } else {
    await sendQuotedWithFooter(sock, remoteJid, "Usage: /craft-name <custom-name>\nOr: /craft-name <weapon-type> <custom-name>\nExample: /craft-name Shadow Fang", message)
    return
  }

  const template = WEAPON_CRAFT_TEMPLATES.find(w => w.id === weaponType)
  if (!template) {
    await sendQuotedWithFooter(sock, remoteJid, `Unknown weapon type. Available: ${WEAPON_CRAFT_TEMPLATES.map(w => w.id).join(", ")}`, message)
    return
  }

  let requiredMaterials = { ...MATERIAL_COSTS.iron }
  if (weaponType === "katana" || weaponType === "nodachi" || weaponType === "spear" || weaponType === "tanto") {
    requiredMaterials = { ...MATERIAL_COSTS.iron }
  }

  let isCursed = craftState.craftType === "cursed" || craftState.craftType === "living" || craftState.craftType === "legendary"
  let isLiving = craftState.craftType === "living"
  let isLegendary = craftState.craftType === "legendary"

  player.inventory = player.inventory || []
  const materialsInInv = player.inventory.filter(i => i.type === "material" || (i.type === "consumable" && i.category === "Materials"))
  const bagMaterials = player.bagInventory ? player.bagInventory.filter(i => i.type === "material" || (i.type === "consumable" && i.category === "Materials")) : []

  let consumeMaterials = []
  let canCraft = true

  if (craftState.materials && craftState.materials.length > 0) {
    consumeMaterials = craftState.materials
  } else {
    const hasCe = materialsInInv.some(i => i.id === "material_curse_essence" || i.id === "curse_essence") ||
      bagMaterials.some(i => i.id === "material_curse_essence" || i.id === "curse_essence")
    const hasDeathPainting = materialsInInv.some(i => i.id === "material_death_painting" || i.id === "death_painting") ||
      bagMaterials.some(i => i.id === "material_death_painting" || i.id === "death_painting")
    const hasLegendary = materialsInInv.some(i => i.id === "material_legendary_fragment" || i.id === "legendary_fragment") ||
      bagMaterials.some(i => i.id === "material_legendary_fragment" || i.id === "legendary_fragment")

    if (hasCe) {
      isCursed = true
      requiredMaterials = { ...MATERIAL_COSTS.curse_essence }
    }
    if (hasDeathPainting) {
      isLiving = true
      isCursed = true
      requiredMaterials = { ...MATERIAL_COSTS.death_painting }
    }
    if (hasLegendary) {
      isLegendary = true
      isCursed = true
      requiredMaterials = { ...MATERIAL_COSTS.legendary }
    }
  }

  if (!craftState.materials || craftState.materials.length === 0) {
    const consumeMatList = []
    for (const [matId, requiredQty] of Object.entries(requiredMaterials)) {
      const fullId = matId.startsWith("material_") ? matId : `material_${matId}`
      let available = 0
      let consumed = false
      for (const matType of [materialsInInv, bagMaterials]) {
        if (consumed) break
        const matching = matType.filter(i => i.id === fullId || i.id === matId)
        for (const m of matching) {
          if (available >= requiredQty) break
          const take = Math.min(m.quantity || 1, requiredQty - available)
          available += take
          m.quantity = (m.quantity || 1) - take
          consumeMatList.push({ id: m.id, name: m.name, quantity: take, icon: m.icon || "🪨" })
          if (m.quantity <= 0) {
            const idx = matType.indexOf(m)
            if (idx !== -1) matType.splice(idx, 1)
          }
          if (available >= requiredQty) {
            consumed = true
            break
          }
        }
      }
      if (available < requiredQty) canCraft = false
    }
    consumeMaterials = consumeMatList
  }

  if (!canCraft) {
    player.craftState = null
    await savePlayer(player)
    await sendQuotedWithFooter(sock, remoteJid, "🔨 Crafting failed!\n\nNot enough materials. Gather more from battles.\nUse /craft to try again.", message)
    return
  }

  const successRoll = Math.random()
  if (successRoll > craftState.successRate && craftState.quality !== "perfect") {
    player.craftState = null
    await savePlayer(player)
    const response = [
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "🔨 CRAFTING RESULT",
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
      "",
      `Quality: ${craftState.qualityLabel || "Unknown"}`,
      "❌ FAILED! Materials were consumed.",
      "",
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    ].join("\n")
    await sendQuotedWithFooter(sock, remoteJid, response, message)
    return
  }

  const statMult = craftState.statMultiplier
  const baseStats = {}
  for (const [stat, value] of Object.entries(template.baseStats)) {
    baseStats[stat] = Math.round(value * statMult)
  }

  const playerLuck = player.luck || player.stats?.luck || 10

  const rarity = determineRarity(statMult, craftState.highestMaterialTier || 0, playerLuck, isLiving, isLegendary, isCursed)

  const weaponSkillsForTemplate = selectWeaponSkills(template.id, isCursed, isLiving)

  let passive = "None"
  if (isLiving) passive = "Sentient: Gains EXP and evolves in battle"
  else if (isCursed) passive = "Cursed: Deals bonus CE damage"
  else if (rarity === "Special Grade") passive = "Special: Powerful unique passive"

  const craftedWeapon = {
    id: `crafted_${template.id}_${Date.now()}`,
    name: customName,
    customName: customName,
    displayName: customName,
    rarity,
    price: 0,
    icon: "⚔️",
    description: `Crafted ${craftState.qualityLabel} quality ${template.name}`,
    stats: baseStats,
    durability: WEAPON_BASE_DURABILITY,
    maxDurability: WEAPON_BASE_DURABILITY,
    weight: WEAPON_BASE_WEIGHT,
    category: template.category,
    type: "weapon",
    usable: false,
    crafted: true,
    isCursed,
    isLiving,
    skills: weaponSkillsForTemplate,
    passive,
    quality: craftState.quality,
    craftedAt: new Date().toISOString()
  }

  player.inventory = player.inventory || []
  const availableSlots = player.inventoryCapacity - player.inventory.reduce((sum, i) => sum + (i.quantity || 1), 0)
  if (availableSlots < 1) {
    player.bagInventory = player.bagInventory || []
    player.bagInventory.push(craftedWeapon)
  } else {
    player.inventory.push(craftedWeapon)
  }

  player.craftState = null
  await savePlayer(player)

  const consumedText = consumeMaterials.map(m => `${m.icon || "🪨"} ${m.name}${m.quantity > 1 ? ` x${m.quantity}` : ""}`).join("\n")
  const statsText = Object.entries(baseStats).map(([k, v]) => `${k.toUpperCase()}: +${v}`).join(", ")

  const response = [
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    "🔨 CRAFTING COMPLETE!",
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    "",
    `Weapon: ${craftedWeapon.icon} ${customName}`,
    `Base Type: ${template.name || "Unknown"}`,
    `Quality: ${craftState.qualityLabel || "Unknown"}`,
    `Rarity: ${rarity || "Common"}`,
    `Skills: ${weaponSkillsForTemplate.length ? weaponSkillsForTemplate.join(", ") : "None"}`,
    `Passive: ${passive}`,
    "",
    "Materials Consumed:",
    consumedText,
    "",
    "Equip with: /equip <weapon-name>",
    "Use in battle: /w, /w1, /w2, /w3",
    "",
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  ].join("\n")

  await sendQuotedWithFooter(sock, remoteJid, response, message)
}

function determineRarity(statMult, materialTier, playerLuck, isLiving, isLegendary, isCursed) {
  if (isLiving || isLegendary) return "Living"

  let baseTier = 1
  if (statMult >= 1.6) baseTier = 5
  else if (statMult >= 1.3) baseTier = 4
  else if (statMult >= 1.0) baseTier = 3

  const effectiveTier = Math.max(baseTier, materialTier)

  let luckBonus = 0
  if (playerLuck >= 90) luckBonus = 1
  else if (playerLuck >= 70) luckBonus = 0
  else if (playerLuck <= 30 && Math.random() < 0.1) luckBonus = 0

  let finalTier = effectiveTier + luckBonus
  if (finalTier < 1) finalTier = 1
  if (finalTier > 5) finalTier = 5

  if (isCursed && finalTier >= 5) return "Cursed Special Grade"
  if (isCursed) return ["Poor", "Common", "Rare", "Epic", "Legendary"][finalTier - 1] || "Common"

  return RARITY_TIERS[finalTier - 1] || "Common"
}

function selectWeaponSkills(templateId, isCursed, isLiving) {
  const skillPool = Object.keys(weaponSkills)

  if (isLiving) {
    return ["Soul Resonance", "Evolve", "Living Blade", "Adaptive Strike", "Ascension"]
  }

  const weaponSkillKeys = {
    katana: ["Swift Cut", "Piercing Thrust", "Iai Strike", "Cursed Slash", "Heaven's Slash"],
    nodachi: ["Wide Slash", "Leaping Strike", "Decisive Blow", "Master's Cut", "Domain Cleave"],
    tanto: ["Quick Stab", "Precise Thrust", "Fatal Pin", "Shadow Pierce", "Nightmare Stab"],
    hammer: ["Ground Slam", "Crushing Blow", "Earthquake", "Heavy Impact", "Cleave"],
    scythe: ["Soul Harvest", "Reap", "Death's Scythe", "Harvest Moon", "Soul Rend"],
    spear: ["Precise Jab", "Wide Sweep", "Pinpoint Strike", "Heaven's Lance", "Divine Reversal"],
    bo_staff: ["Triple Strike", "Whirling Defense", "Cloud Step", "Rapid Punch", "Charging Uppercut"],
    chain: ["Chain Sweep", "Flanking Strike", "Entangle", "Chain Grab", "Binding Strike"],
    dagger: ["Quick Stab", "Precise Thrust", "Fatal Pin", "Shadow Pierce", "Poison Blade"],
    axe: ["Axe Throw", "Spinning Lunge", "Dragon's Roar", "Crushing Blow", "Execute"]
  }

  const pool = weaponSkillKeys[templateId] || skillPool.slice(0, 10)
  const selected = []
  const available = [...pool]
  while (selected.length < 3 && available.length > 0) {
    const idx = Math.floor(Math.random() * available.length)
    const skill = available.splice(idx, 1)[0]
    if (!selected.includes(skill)) {
      selected.push(skill)
    }
  }
  return selected
}
