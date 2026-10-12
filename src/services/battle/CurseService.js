import { readFileSync } from "fs"
import fsExtra from "fs-extra"
import { fileURLToPath } from "url"
import path from "path"
import { randomInt } from "../../utils/generator.js"
import { BALANCE } from "../../config/balance.js"
import { gradeFromLevel } from "../GradeService.js"

const activeCurses = new Map()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const CURSES_PATH = path.join(__dirname, "..", "..", "data", "curses.json")
const SPAWN_RATES_PATH = path.join(__dirname, "..", "..", "data", "curseSpawnRates.json")

let CURSE_DATABASE = null
let SPAWN_RATES = null

function loadSpawnRates() {
  if (SPAWN_RATES) return SPAWN_RATES
  try {
    const raw = readFileSync(SPAWN_RATES_PATH, "utf-8")
    SPAWN_RATES = JSON.parse(raw)
  } catch (err) {
    console.error("[KENNYJAKS ERROR] Failed to load curseSpawnRates.json:", err.message)
    SPAWN_RATES = {
      baseline: { specialGrade: 8, grade1: 15, grade2: 20, grade3: 25, grade4: 30 },
      playerScaled: {},
      minimumChance: {}
    }
  }
  return SPAWN_RATES
}

export function loadCurseDatabase() {
  if (CURSE_DATABASE) return CURSE_DATABASE
  try {
    const raw = readFileSync(CURSES_PATH, "utf-8")
    CURSE_DATABASE = JSON.parse(raw)
  } catch (err) {
    console.error("[KENNYJAKS ERROR] Failed to load curses database:", err.message)
    CURSE_DATABASE = []
  }
  return CURSE_DATABASE
}

export function getCursesByGrade(grade) {
  const db = loadCurseDatabase()
  return db.filter(c => c.grade === grade)
}

export function getCursesByGradeAndPersonality(grade, personality) {
  const db = loadCurseDatabase()
  return db.filter(c => c.grade === grade && c.personality === personality)
}

export function getCurseById(id) {
  const db = loadCurseDatabase()
  return db.find(c => c.id === id) || null
}

export function getActiveCurse(playerId) {
  return activeCurses.get(playerId) || null
}

export function setActiveCurse(playerId, curse) {
  activeCurses.set(playerId, curse)
}

export function clearActiveCurse(playerId) {
  activeCurses.delete(playerId)
}

export function hasActiveCurse(playerId) {
  return activeCurses.has(playerId)
}

export async function spawnCurse(playerId, grade = null, playerLevel = 1, playerGrade = 4) {
  if (hasActiveCurse(playerId)) {
    return null
  }

  const memory = await findReturningCurse(playerId)
  if (memory) {
    const weightedGrade = grade !== null ? grade : getWeightedGrade(playerLevel)
    const curseId = memory.curseId || getWeightedCurse(weightedGrade)
    if (!curseId) {
      return null
    }
    const curse = createCurseFromDB(curseId, playerLevel, playerGrade)
    await evolveCurse(curse, memory)
    setActiveCurse(playerId, curse)
    return { curse, isReturning: true, memory, grade: weightedGrade }
  }

  const weightedGrade = grade !== null ? grade : getWeightedGrade(playerLevel)
  const curseId = getWeightedCurse(weightedGrade)
  if (!curseId) {
    return null
  }
  const curse = createCurseFromDB(curseId, playerLevel, playerGrade)
  setActiveCurse(playerId, curse)
  return { curse, isReturning: false, grade: weightedGrade }
}

// V3 Grade Spawn System — weighted random distribution from configurable rates.
// Supports player-scaled variety: higher-level players encounter stronger curses more often.
// Weights are adjusted per player tier while preserving a minimum chance for every grade.
export function getWeightedGrade(playerLevel = 1) {
  const rates = loadSpawnRates()
  const baseline = rates.baseline || {}
  const scaled = rates.playerScaled || {}
  const minChance = rates.minimumChance || {}

  let weights = {
    0: baseline.specialGrade || 8,
    1: baseline.grade1 || 15,
    2: baseline.grade2 || 20,
    3: baseline.grade3 || 25,
    4: baseline.grade4 || 30
  }

  const tier = playerLevel <= 14 ? "beginner" : playerLevel <= 39 ? "midGame" : "highLevel"
  const adjustments = scaled[tier]?.adjustments || {}

  for (const grade of [0, 1, 2, 3, 4]) {
    const key = grade === 0 ? "specialGrade" : `grade${grade}`
    const adj = adjustments[key] || 0
    const min = minChance[key] || 0
    weights[grade] = Math.max(min, (weights[grade] || 0) + adj)
  }

  const total = Object.values(weights).reduce((a, b) => a + b, 0)
  if (total <= 0) return 4

  let roll = Math.random() * total
  for (const grade of [4, 3, 2, 1, 0]) {
    roll -= weights[grade] || 0
    if (roll <= 0) return grade
  }
  return 4
}

export function getWeightedCurse(grade) {
  const db = loadCurseDatabase()
  const curses = db.filter(c => c.grade === grade)
  if (curses.length === 0) {
    const fallbackCurses = db.filter(c => c.grade > 0)
    if (fallbackCurses.length === 0) return db.length > 0 ? db[0].id : null
    return fallbackCurses[Math.floor(Math.random() * fallbackCurses.length)].id
  }
  return curses[Math.floor(Math.random() * curses.length)].id
}

export function createCurseFromDB(curseId, playerLevel = 1, playerGrade = 4) {
  if (!curseId) {
    throw new Error(`Curse not found in database: ${curseId}`)
  }
  const db = loadCurseDatabase()
  const template = db.find(c => c.id === curseId)
  if (!template) {
    throw new Error(`Curse not found in database: ${curseId}`)
  }

  const scaled = scaleCurseStats(template, playerLevel, playerGrade)

  const id = crypto.randomUUID()
  const curse = {
    ...template,
    id,
    templateId: template.id,
    name: template.name || "Unknown Curse",
    grade: template.grade !== undefined ? template.grade : 4,
    hp: scaled.hp,
    maxHp: scaled.maxHp,
    ce: scaled.ce,
    maxCe: scaled.maxCe,
    strength: scaled.strength,
    defense: scaled.defense,
    speed: scaled.speed,
    skills: template.skills || [template.skill || "Cursed Strike"],
    weakness: template.weakness || [],
    rewards: scaled.rewards,
    threatLevel: "★★★★★",
    personality: template.personality || generatePersonality(),
    baseAttack: scaled.baseAttack,
    timesFought: 0,
    timesEscaped: 0,
    damageDealt: 0,
    damageTaken: 0,
    gradeLabel: BALANCE.gradeLabels[template.grade] || "Grade 4",
    evolved: false,
    techniqueDamage: scaled.techniqueDamage,
    blackFlashChance: template.blackFlashChance || 0.05,
    blackFlashDamageMultiplier: template.blackFlashDamageMultiplier || 2,
    domainExpansion: template.domainExpansion || null,
    domainActivationChance: template.domainActivationChance || 0,
    drops: template.drops || [],
    aiProfile: template.aiProfile || null,
    dialogue: template.dialogue || null,
    statusEffects: template.statusEffects || [],
    title: template.title || null,
    skillEffect: template.skillEffect || null,
    blockCounter: template.blockCounter || 0
  }

  return curse
}

export async function saveCurseResult(curse, playerId, result, damageDealt, damageTaken) {
  const curseId = curse.templateId || curse.id
  if (result === "victory") {
    await recordKill(curseId, playerId)
  } else {
    await recordBattle(curse, playerId, result, damageDealt, damageTaken)
  }
}

export function getAvailableGrades() {
  return [
    { grade: 4, label: "Grade 4", minLevel: 1 },
    { grade: 3, label: "Grade 3", minLevel: 5 },
    { grade: 2, label: "Grade 2", minLevel: 15 },
    { grade: 1, label: "Grade 1", minLevel: 30 },
    { grade: 0, label: "Special Grade", minLevel: 50 }
  ]
}

const GRADE_SCALE = {
   0: { hp: 0.54, attack: 0.42, defense: 0.36, ce: 0.54, speed: 0.36, xp: 0.75, yen: 0.75 },
   1: { hp: 0.42, attack: 0.36, defense: 0.33, ce: 0.42, speed: 0.33, xp: 0.45, yen: 0.45 },
   2: { hp: 0.36, attack: 0.33, defense: 0.30, ce: 0.36, speed: 0.30, xp: 0.36, yen: 0.36 },
   3: { hp: 0.30, attack: 0.30, defense: 0.30, ce: 0.30, speed: 0.30, xp: 0.30, yen: 0.30 },
   4: { hp: 0.30, attack: 0.30, defense: 0.30, ce: 0.30, speed: 0.30, xp: 0.30, yen: 0.30 }
}

export function scaleCurseStats(template, playerLevel, playerGrade) {
  const curseGrade = template.grade !== undefined ? template.grade : 4
  const gradeDiff = playerGrade - curseGrade
  const scale = GRADE_SCALE[curseGrade] || GRADE_SCALE[4]
  const levelFactor = Math.max(0.6, Math.min(2.5, 1 + (playerLevel - 1) * 0.008))
  const gradeFactor = gradeDiff >= 0 ? 1 + gradeDiff * 0.15 : Math.max(0.5, 1 + gradeDiff * 0.2)
  const finalScale = levelFactor * gradeFactor
  return {
    hp: Math.floor((template.hp || 100) * scale.hp * finalScale),
    maxHp: Math.floor((template.hp || 100) * scale.hp * finalScale),
    ce: Math.floor((template.ce || 0) * scale.ce * finalScale),
    maxCe: Math.floor((template.ce || 0) * scale.ce * finalScale),
    strength: Math.floor((template.attack || 10) * scale.attack * finalScale),
    defense: Math.floor((template.defense || 5) * scale.defense * finalScale),
    speed: Math.floor((template.speed || 10) * scale.speed * finalScale),
    baseAttack: Math.floor((template.normalAttackDamage || template.baseAttack || 15) * scale.attack * finalScale),
    techniqueDamage: Math.floor((template.techniqueDamage || 0) * scale.attack * finalScale),
    rewards: {
      xp: Math.floor((template.xpReward || 100) * scale.xp * finalScale),
      yen: Math.floor((template.yenReward || 500) * scale.yen * finalScale),
      sp: template.sp || 1
    }
  }
}

const MEMORY_PATH = path.resolve("database/curseMemory.json")

export function generatePersonality() {
  const personalities = ["aggressive", "coward", "sadistic", "arrogant", "silent", "bloodthirsty", "tactical", "crazy"]
  return personalities[Math.floor(Math.random() * personalities.length)]
}

function createMemory(curse, playerId, result, rounds = 0) {
  const fledAfterFive = result === "escaped" && rounds >= 5
  return {
    curseId: curse.templateId || curse.id,
    playerId,
    name: curse.name,
    grade: curse.grade,
    personality: curse.personality,
    timesFought: (curse.timesFought || 0) + 1,
    timesEscaped: result === "escaped" ? 1 : 0,
    damageDealt: curse.damageDealt || 0,
    damageTaken: curse.damageTaken || 0,
    kills: 0,
    scarred: fledAfterFive,
    evolutionLevel: fledAfterFive ? 1 : 0,
    createdAt: Date.now()
  }
}

export async function recordBattle(curse, playerId, result, damageDealt, damageTaken, rounds = 0) {
  const curseId = curse.templateId || curse.id
  const memories = await loadAllMemories()
  const existing = memories.find(m => m.curseId === curseId && m.playerId === playerId)
  if (!existing) {
    const memory = createMemory(curse, playerId, result, rounds)
    memory.damageDealt = damageDealt
    memory.damageTaken = damageTaken
    if (result === "escaped") memory.timesEscaped = 1
    memories.push(memory)
    await persistMemories(memories)
    return memory
  }

  existing.timesFought += 1
  if (result === "escaped") {
    existing.timesEscaped += 1
    if (rounds >= 5) {
      existing.scarred = true
      existing.evolutionLevel = (existing.evolutionLevel || 0) + 1
    }
  }
  existing.damageDealt += damageDealt
  existing.damageTaken += damageTaken
  existing.createdAt = Date.now()
  await persistMemories(memories)
  return existing
}

export async function recordKill(curseId, playerId) {
  const memories = await loadAllMemories()
  const existing = memories.find(m => m.curseId === curseId && m.playerId === playerId)
  if (!existing) return
  existing.kills += 1
  await persistMemories(memories)
}

export async function findReturningCurse(playerId) {
  const memories = await loadAllMemories()
  const escaped = memories.filter(m => m.playerId === playerId && m.timesEscaped > 0 && m.timesFought < 4)
  if (escaped.length === 0) return null
  const memory = escaped[Math.floor(Math.random() * escaped.length)]
  memory.timesFought += 1
  await persistMemories(memories)
  return memory
}

export async function evolveCurse(curse, memory) {
  const tier = Math.min(3, Math.floor(memory.timesFought / 2))
  const evolutionLevel = memory.evolutionLevel || 0
  if (tier > 0 || evolutionLevel > 0) {
    const hpBonus = 1 + tier * 0.15 + evolutionLevel * 0.25
    const atkBonus = 1 + tier * 0.1 + evolutionLevel * 0.2
    const defBonus = 1 + tier * 0.08 + evolutionLevel * 0.15
    const spdBonus = 1 + tier * 0.05 + evolutionLevel * 0.1
    curse.maxHp = Math.floor(curse.maxHp * hpBonus)
    curse.hp = curse.maxHp
    curse.strength = Math.floor(curse.strength * atkBonus)
    curse.defense = Math.floor(curse.defense * defBonus)
    curse.speed = Math.floor(curse.speed * spdBonus)
    if (curse.rewards) {
      curse.rewards.yen = Math.floor(curse.rewards.yen * (1 + tier * 0.2 + evolutionLevel * 0.3))
      curse.rewards.xp = Math.floor(curse.rewards.xp * (1 + tier * 0.2 + evolutionLevel * 0.3))
    }
    curse.evolved = true
    if (evolutionLevel > 0) {
      curse.name = `${curse.name} "Evolved ${evolutionLevel}"`
      curse.hasRCT = true
      curse.rctHeal = Math.floor(curse.maxHp * 0.05)
      if (!curse.domainExpansion) {
        curse.domainExpansion = {
          name: `${curse.name}'s Domain`,
          damageMultiplier: 1.5,
          ceCost: 50
        }
        curse.domainActivationChance = 0.3
      }
    }
    if (tier >= 2) {
      const labels = { 4: "Grade 3", 3: "Grade 2", 2: "Grade 1", 1: "Special Grade", 0: "Special Grade" }
      curse.gradeLabel = labels[curse.grade] || "Grade 4"
    }
  }
  return curse
}

async function loadAllMemories() {
  try {
    return await fsExtra.readJson(MEMORY_PATH)
  } catch {
    return []
  }
}

async function persistMemories(memories) {
  await fsExtra.ensureDir(path.dirname(MEMORY_PATH))
  await fsExtra.writeJson(MEMORY_PATH, memories, { spaces: 2 })
}
