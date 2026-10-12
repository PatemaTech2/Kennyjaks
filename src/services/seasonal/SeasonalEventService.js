import fsExtra from "fs-extra"
import path from "path"
import { loadAllGroups } from "../../database/groupRepo.js"

const EVENT_STATE_PATH = path.join(process.cwd(), "database", "seasonalEvents.json")

export const DRAGON_CURSE_KING_EVENT_ID = "dragon-curse-king-summer-2026"
export const EVENT_START_DATE = new Date("2026-08-15T22:17:19+01:00")
export const EVENT_END_DATE = new Date("2026-08-30T23:59:59+01:00")

export async function isEventActive() {
  const state = await loadEventState()
  const es = state[DRAGON_CURSE_KING_EVENT_ID]
  if (es?.eventEnded) return false
  const now = Date.now()
  return now >= EVENT_START_DATE.getTime() && now <= EVENT_END_DATE.getTime()
}

export async function loadEventState() {
  try {
    if (await fsExtra.pathExists(EVENT_STATE_PATH)) {
      return await fsExtra.readJson(EVENT_STATE_PATH)
    }
  } catch {}
  return {}
}

export async function saveEventState(state) {
  await fsExtra.ensureDir(path.dirname(EVENT_STATE_PATH))
  await fsExtra.writeJson(EVENT_STATE_PATH, state, { spaces: 2 })
}

export async function getEventState() {
  const state = await loadEventState()
  if (!state[DRAGON_CURSE_KING_EVENT_ID]) {
    state[DRAGON_CURSE_KING_EVENT_ID] = {
      eventId: DRAGON_CURSE_KING_EVENT_ID,
      active: isEventActive(),
      knights: {},
      aurstavUnlocked: false,
      aurstav: {
        id: "aurstav",
        defeated: false,
        permanentlyDead: false,
        phase: 1,
        firstChallengerId: null,
        firstChallengerName: null,
        raidOpen: false,
        raidPlayers: [],
        raidStarted: false,
        legendaryBattles: []
      }
    }
    await saveEventState(state)
  }
  return state[DRAGON_CURSE_KING_EVENT_ID]
}

export async function setEventActive(active) {
  const state = await loadEventState()
  if (!state[DRAGON_CURSE_KING_EVENT_ID]) {
    state[DRAGON_CURSE_KING_EVENT_ID] = {
      eventId: DRAGON_CURSE_KING_EVENT_ID,
      active: await isEventActive(),
      knights: {},
      aurstavUnlocked: false,
      aurstav: {
        id: "aurstav",
        defeated: false,
        permanentlyDead: false,
        phase: 1,
        firstChallengerId: null,
        firstChallengerName: null,
        raidOpen: false,
        raidPlayers: [],
        raidStarted: false,
        legendaryBattles: []
      }
    }
  } else {
    state[DRAGON_CURSE_KING_EVENT_ID].active = active
  }
  await saveEventState(state)
}

export async function broadcastEventStart(sock) {
  const state = await loadEventState()
  const eventState = state[DRAGON_CURSE_KING_EVENT_ID]
  if (!eventState || eventState.announced) {
    return
  }

  const groups = await loadAllGroups()
  const message = `Welcome, members of kennyjaks, to the first ever seasonal event of KENNYJAKS!!!!!!!!!!. Much thanks from I, the creator, i love you all so much and do well to keep playing and win, i have hope in you all, go kick some ass boys`

  for (const group of groups) {
    if (group.enabled && group.groupId) {
      try {
        await sock.sendMessage(group.groupId, { text: message })
      } catch (err) {
        console.error("[EVENT] Failed to broadcast to group:", group.groupId, err.message)
      }
    }
  }

  eventState.announced = true
  await saveEventState(state)
}

export async function getKnightState(knightId) {
  const eventState = await getEventState()
  return eventState.knights[knightId] || { defeated: false, permanentlyDead: false }
}

export async function setKnightDefeated(knightId) {
  const state = await loadEventState()
  if (!state[DRAGON_CURSE_KING_EVENT_ID]) {
    state[DRAGON_CURSE_KING_EVENT_ID] = {
      eventId: DRAGON_CURSE_KING_EVENT_ID,
      active: isEventActive(),
      knights: {},
      aurstavUnlocked: false,
      aurstav: {
        id: "aurstav",
        defeated: false,
        permanentlyDead: false,
        phase: 1,
        firstChallengerId: null,
        firstChallengerName: null,
        raidOpen: false,
        raidPlayers: [],
        raidStarted: false,
        legendaryBattles: []
      }
    }
  }
  if (!state[DRAGON_CURSE_KING_EVENT_ID].knights) {
    state[DRAGON_CURSE_KING_EVENT_ID].knights = {}
  }
  state[DRAGON_CURSE_KING_EVENT_ID].knights[knightId] = {
    defeated: true,
    permanentlyDead: true
  }
  await saveEventState(state)
  await checkAurstavUnlock(state[DRAGON_CURSE_KING_EVENT_ID])
}

export async function checkAurstavUnlock(eventState) {
  const knights = Object.values(eventState.knights || {})
  if (knights.length === 5 && knights.every(k => k.permanentlyDead)) {
    eventState.aurstavUnlocked = true
    await saveEventState(await loadEventState())
  }
}

export async function isAurstavUnlocked() {
  const eventState = await getEventState()
  return eventState.aurstavUnlocked === true
}

export async function getDefeatedKnightCount() {
  const eventState = await getEventState()
  const knights = eventState.knights || {}
  return Object.values(knights).filter(k => k.permanentlyDead).length
}

export async function isAurstavPermanentlyDead() {
  const state = await getAurstavState()
  return state.permanentlyDead === true
}

export async function getAurstavState() {
  const eventState = await getEventState()
  return eventState.aurstav || {
    id: "aurstav",
    defeated: false,
    permanentlyDead: false,
    phase: 1,
    firstChallengerId: null,
    firstChallengerName: null,
    raidOpen: false,
    raidPlayers: [],
    raidStarted: false,
    legendaryBattles: []
  }
}

export async function setAurstavDefeated() {
  const state = await loadEventState()
  if (!state[DRAGON_CURSE_KING_EVENT_ID]) {
    await getEventState()
  }
  state[DRAGON_CURSE_KING_EVENT_ID].aurstav = state[DRAGON_CURSE_KING_EVENT_ID].aurstav || {}
  state[DRAGON_CURSE_KING_EVENT_ID].aurstav.defeated = true
  state[DRAGON_CURSE_KING_EVENT_ID].aurstav.permanentlyDead = true
  state[DRAGON_CURSE_KING_EVENT_ID].aurstav.raidOpen = false
  state[DRAGON_CURSE_KING_EVENT_ID].aurstav.raidStarted = false
  state[DRAGON_CURSE_KING_EVENT_ID].aurstav.raidPlayers = []
  await saveEventState(state)
}

export async function setAurstavFirstChallenger(playerId, playerName) {
  const state = await loadEventState()
  if (!state[DRAGON_CURSE_KING_EVENT_ID]) {
    await getEventState()
  }
  state[DRAGON_CURSE_KING_EVENT_ID].aurstav = state[DRAGON_CURSE_KING_EVENT_ID].aurstav || {}
  state[DRAGON_CURSE_KING_EVENT_ID].aurstav.firstChallengerId = playerId
  state[DRAGON_CURSE_KING_EVENT_ID].aurstav.firstChallengerName = playerName
  await saveEventState(state)
}

export async function setAurstavPhase2() {
  const state = await loadEventState()
  if (!state[DRAGON_CURSE_KING_EVENT_ID]) {
    await getEventState()
  }
  state[DRAGON_CURSE_KING_EVENT_ID].aurstav = state[DRAGON_CURSE_KING_EVENT_ID].aurstav || {}
  state[DRAGON_CURSE_KING_EVENT_ID].aurstav.phase = 2
  state[DRAGON_CURSE_KING_EVENT_ID].aurstav.raidOpen = true
  await saveEventState(state)
}

export async function addRaidPlayer(playerId, playerName) {
  const state = await loadEventState()
  if (!state[DRAGON_CURSE_KING_EVENT_ID]) {
    await getEventState()
  }
  state[DRAGON_CURSE_KING_EVENT_ID].aurstav = state[DRAGON_CURSE_KING_EVENT_ID].aurstav || {}
  const raidPlayers = state[DRAGON_CURSE_KING_EVENT_ID].aurstav.raidPlayers || []
  if (!raidPlayers.find(p => p.playerId === playerId)) {
    raidPlayers.push({ playerId, playerName, joinedAt: Date.now() })
    state[DRAGON_CURSE_KING_EVENT_ID].aurstav.raidPlayers = raidPlayers.slice(-8)
  }
  await saveEventState(state)
}

export async function startAurstavRaid() {
  const state = await loadEventState()
  if (!state[DRAGON_CURSE_KING_EVENT_ID]) {
    await getEventState()
  }
  state[DRAGON_CURSE_KING_EVENT_ID].aurstav = state[DRAGON_CURSE_KING_EVENT_ID].aurstav || {}
  state[DRAGON_CURSE_KING_EVENT_ID].aurstav.raidStarted = true
  state[DRAGON_CURSE_KING_EVENT_ID].aurstav.raidOpen = false
  await saveEventState(state)
}

export async function recordAurstavLegendaryBattle(record) {
  const state = await loadEventState()
  if (!state[DRAGON_CURSE_KING_EVENT_ID]) {
    await getEventState()
  }
  state[DRAGON_CURSE_KING_EVENT_ID].aurstav = state[DRAGON_CURSE_KING_EVENT_ID].aurstav || {}
  state[DRAGON_CURSE_KING_EVENT_ID].aurstav.legendaryBattles = state[DRAGON_CURSE_KING_EVENT_ID].aurstav.legendaryBattles || []
  state[DRAGON_CURSE_KING_EVENT_ID].aurstav.legendaryBattles.push({
    ...record,
    recordedAt: Date.now()
  })
  await saveEventState(state)
}

export async function recordLegendaryBattle(record) {
  return recordAurstavLegendaryBattle(record)
}
