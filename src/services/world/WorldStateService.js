import fs from "fs-extra"
import path from "path"
import { LOCATIONS, ROAMING_BOSSES, BOSS_DEFINITIONS } from "../../data/world/locations.js"
import { loadCurseDatabase, getCurseById } from "../battle/CurseService.js"

const WORLD_STATE_PATH = path.resolve(process.cwd(), "data", "worldState.json")
let cache = null

const DEFAULT_LOCATION_IDS = [
  "shinjuku",
  "shibuya",
  "tokyo",
  "kyoto",
  "sendai",
  "abuja",
  "anambra"
]

function createDefaultWorldState() {
  const activeEncounters = {}
  for (const locationId of DEFAULT_LOCATION_IDS) {
    activeEncounters[locationId] = []
  }

  return {
    discoveredCurses: {},
    legendaryBattles: [],
    locationHistories: {},
    roamingBosses: {},
    activeEncounters,
    lastUpdated: Date.now()
  }
}

function ensureWorldState(state) {
  if (!state || typeof state !== "object") {
    return createDefaultWorldState()
  }

  const next = { ...state }

  if (!next.discoveredCurses || typeof next.discoveredCurses !== "object") {
    next.discoveredCurses = {}
  }
  if (!Array.isArray(next.legendaryBattles)) {
    next.legendaryBattles = []
  }
  if (!next.locationHistories || typeof next.locationHistories !== "object") {
    next.locationHistories = {}
  }
  if (!next.roamingBosses || typeof next.roamingBosses !== "object") {
    next.roamingBosses = {}
  }
  if (!next.activeEncounters || typeof next.activeEncounters !== "object") {
    next.activeEncounters = {}
  }

  for (const locationId of DEFAULT_LOCATION_IDS) {
    if (!Array.isArray(next.activeEncounters[locationId])) {
      next.activeEncounters[locationId] = []
    }
  }

  next.lastUpdated = Date.now()
  return next
}

function loadWorldState() {
  if (cache) return cache
  try {
    if (fs.existsSync(WORLD_STATE_PATH)) {
      const raw = fs.readJsonSync(WORLD_STATE_PATH)
      cache = ensureWorldState(raw)
    } else {
      cache = createDefaultWorldState()
    }
  } catch (err) {
    cache = createDefaultWorldState()
  }
  return cache
}

function saveWorldState(state) {
  const next = ensureWorldState(state)
  cache = next
  try {
    fs.ensureDirSync(path.dirname(WORLD_STATE_PATH))
    fs.writeJsonSync(WORLD_STATE_PATH, next, { spaces: 2 })
  } catch (err) {
    console.error("[WORLD] Failed to save world state:", err.message)
  }
}

export const WorldStateService = {
  getState() {
    return loadWorldState()
  },

  ensureWorldState() {
    const state = loadWorldState()
    const next = ensureWorldState(state)
    if (next !== state) {
      cache = next
      saveWorldState(next)
    }
    return next
  },

  persist(state) {
    saveWorldState(state)
  },

  discoverCurse(playerId, locationId, curseId) {
    const state = loadWorldState()
    const key = `${playerId}:${locationId}:${curseId}`
    if (!state.discoveredCurses[key]) {
      state.discoveredCurses[key] = {
        playerId,
        locationId,
        curseId,
        discoveredAt: Date.now(),
        encounters: 0
      }
    }
    state.discoveredCurses[key].encounters = (state.discoveredCurses[key].encounters || 0) + 1
    saveWorldState(state)
    return state.discoveredCurses[key]
  },

  isDiscovered(playerId, locationId, curseId) {
    const state = loadWorldState()
    const key = `${playerId}:${locationId}:${curseId}`
    return !!state.discoveredCurses[key]
  },

  getDiscoveredCurses(playerId, locationId) {
    const state = loadWorldState()
    return Object.values(state.discoveredCurses)
      .filter(d => d.playerId === playerId && d.locationId === locationId)
      .map(d => d.curseId)
  },

  getActiveEncounters(locationId) {
    const state = ensureWorldState(loadWorldState())
    const encounters = state.activeEncounters[locationId] || []
    const now = Date.now()
    return encounters.filter(e => !e.defeatedAt && (!e.expiresAt || e.expiresAt > now))
  },

  spawnEncounter(locationId, curseId, difficulty = 1.0) {
    const state = loadWorldState()
    const db = loadCurseDatabase()
    const curseTemplate = getCurseById(curseId) || db.find(c => c.id === curseId)
    if (!curseTemplate) return null

    if (!state.activeEncounters[locationId]) {
      state.activeEncounters[locationId] = []
    }

    const encounter = {
      id: `enc:${locationId}:${curseId}:${Date.now()}`,
      curseId,
      name: curseTemplate.name,
      grade: curseTemplate.grade,
      locationId,
      spawnedAt: Date.now(),
      expiresAt: Date.now() + (30 * 60 * 1000),
      defeatedAt: null,
      difficulty: Math.max(0.5, Math.min(2.0, difficulty)),
      stats: {
        hp: Math.floor((curseTemplate.hp || 100) * difficulty),
        maxHp: Math.floor((curseTemplate.hp || 100) * difficulty),
        ce: Math.floor((curseTemplate.ce || 50) * difficulty),
        maxCe: Math.floor((curseTemplate.ce || 50) * difficulty),
        attack: Math.floor((curseTemplate.attack || 10) * difficulty),
        defense: Math.floor((curseTemplate.defense || 5) * difficulty),
        speed: Math.floor((curseTemplate.speed || 5) * difficulty)
      },
      technique: curseTemplate.cursedTechnique || curseTemplate.technique || null,
      domain: curseTemplate.domainExpansion || curseTemplate.domain || null,
      personality: curseTemplate.personality || "neutral",
      statusEffects: curseTemplate.statusEffects || [],
      blackFlashChance: curseTemplate.blackFlashChance || 5,
      blackFlashDamageMultiplier: curseTemplate.blackFlashDamageMultiplier || 1.5,
      xpReward: Math.floor((curseTemplate.xpReward || 100) * difficulty),
      yenReward: Math.floor((curseTemplate.yenReward || 100) * difficulty),
      drops: curseTemplate.drops || [],
      dialogue: curseTemplate.dialogue || {}
    }

    state.activeEncounters[locationId].push(encounter)
    saveWorldState(state)
    return encounter
  },

  defeatEncounter(encounterId, locationId) {
    const state = loadWorldState()
    const encounters = state.activeEncounters[locationId] || []
    const encounter = encounters.find(e => e.id === encounterId)
    if (encounter) {
      encounter.defeatedAt = Date.now()
      saveWorldState(state)
    }
    return encounter
  },

  getEncounterById(encounterId, locationId) {
    const state = loadWorldState()
    const encounters = state.activeEncounters[locationId] || []
    return encounters.find(e => e.id === encounterId) || null
  },

  recordLegendaryBattle(battleData) {
    const state = loadWorldState()
    state.legendaryBattles.push({
      ...battleData,
      id: `legend_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      timestamp: Date.now()
    })
    saveWorldState(state)
    return state.legendaryBattles[state.legendaryBattles.length - 1]
  },

  getLocationHistory(locationId) {
    const state = loadWorldState()
    return state.locationHistories[locationId] || []
  },

  recordLocationBattle(locationId, battleRecord) {
    const state = loadWorldState()
    if (!state.locationHistories[locationId]) {
      state.locationHistories[locationId] = []
    }
    state.locationHistories[locationId].push({
      ...battleRecord,
      timestamp: Date.now()
    })
    saveWorldState(state)
  },

  getRoamingBoss(bossId) {
    const state = loadWorldState()
    return state.roamingBosses[bossId] || null
  },

  setRoamingBoss(bossId, data) {
    const state = loadWorldState()
    state.roamingBosses[bossId] = {
      ...data,
      id: bossId,
      spawnedAt: Date.now(),
      expiresAt: Date.now() + (data.duration || 3600000)
    }
    saveWorldState(state)
    return state.roamingBosses[bossId]
  },

  clearExpiredRoamingBosses() {
    const state = loadWorldState()
    const now = Date.now()
    for (const [bossId, boss] of Object.entries(state.roamingBosses)) {
      if (boss.expiresAt && boss.expiresAt < now) {
        delete state.roamingBosses[bossId]
      }
    }
    saveWorldState(state)
  },

  getActiveRoamingBosses() {
    const state = loadWorldState()
    const now = Date.now()
    return Object.values(state.roamingBosses).filter(b => !b.expiresAt || b.expiresAt > now)
  },

  spawnLocationEncounters(locationId, count = 3) {
    const state = loadWorldState()
    const location = LOCATIONS[locationId]
    if (!location) return []

    const db = loadCurseDatabase()
    const validPool = location.cursePool.filter(id => db.find(c => c.id === id))
    if (validPool.length === 0) return []

    const now = Date.now()
    const encounters = []

    for (let i = 0; i < count; i++) {
      const randomId = validPool[Math.floor(Math.random() * validPool.length)]
      const template = db.find(c => c.id === randomId)
      if (!template) continue

      const difficulty = 0.8 + Math.random() * 0.8
      const encounter = {
        id: `enc:${locationId}:${template.id}:${now}:${i}`,
        curseId: template.id,
        name: template.name,
        grade: template.grade,
        locationId,
        spawnedAt: now,
        expiresAt: now + (30 * 60 * 1000),
        defeatedAt: null,
        difficulty,
        stats: {
          hp: Math.floor((template.hp || 100) * difficulty),
          maxHp: Math.floor((template.hp || 100) * difficulty),
          ce: Math.floor((template.ce || 50) * difficulty),
          maxCe: Math.floor((template.ce || 50) * difficulty),
          attack: Math.floor((template.attack || 10) * difficulty),
          defense: Math.floor((template.defense || 5) * difficulty),
          speed: Math.floor((template.speed || 5) * difficulty)
        },
        technique: template.cursedTechnique || template.technique || null,
        domain: template.domainExpansion || template.domain || null,
        personality: template.personality || "neutral",
        statusEffects: template.statusEffects || [],
        blackFlashChance: template.blackFlashChance || 5,
        blackFlashDamageMultiplier: template.blackFlashDamageMultiplier || 1.5,
        xpReward: Math.floor((template.xpReward || 100) * difficulty),
        yenReward: Math.floor((template.yenReward || 100) * difficulty),
        drops: template.drops || [],
        dialogue: template.dialogue || {}
      }

      encounters.push(encounter)
    }

    if (location.specialBosses && location.specialBosses.length > 0) {
      const bossId = location.specialBosses[Math.floor(Math.random() * location.specialBosses.length)]
      const bossDef = BOSS_DEFINITIONS[bossId]
      if (bossDef) {
        const bossEncounter = {
          id: `boss:${locationId}:${bossId}:${now}`,
          curseId: bossId,
          name: bossDef.name,
          grade: bossDef.grade,
          locationId,
          spawnedAt: now,
          expiresAt: now + (60 * 60 * 1000),
          defeatedAt: null,
          difficulty: 1.0,
          isBoss: true,
          stats: {
            hp: bossDef.hp,
            maxHp: bossDef.hp,
            ce: bossDef.ce,
            maxCe: bossDef.ce,
            attack: bossDef.attack,
            defense: bossDef.defense,
            speed: bossDef.speed
          },
          technique: bossDef.technique,
          domain: bossDef.domain,
          personality: bossDef.personality || "stoic",
          statusEffects: bossDef.statusEffects || [],
          blackFlashChance: 15,
          blackFlashDamageMultiplier: 2.0,
          xpReward: bossDef.xpReward,
          yenReward: bossDef.yenReward,
          drops: bossDef.drops || [],
          dialogue: {},
          bossAbilities: bossId === "mami_wata" ? {
            water_pressure: { id: "water_pressure", name: "Water Pressure Manipulation" },
            serpentine_binding: { id: "serpentine_binding", name: "Serpentine Binding" },
            mesmerizing_reflection: { id: "mesmerizing_reflection", name: "Mesmerizing Reflection" }
          } : bossId === "ogun" ? {
            slag_fusion: { id: "slag_fusion", name: "Slag Fusion" },
            overheat_kinetic_strike: { id: "overheat_kinetic_strike", name: "Overheat Kinetic Strike" },
            ferrous_magnetism: { id: "ferrous_magnetism", name: "Ferrous Magnetism" }
          } : {}
        }
        encounters.push(bossEncounter)
      }
    }

    state.activeEncounters[locationId] = [...(state.activeEncounters[locationId] || []), ...encounters]
    saveWorldState(state)
    return encounters
  }
}
