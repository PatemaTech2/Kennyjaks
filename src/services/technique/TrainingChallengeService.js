import fs from "fs-extra"
import path from "path"
import { savePlayer } from "../../database/playerRepo.js"

const CHALLENGE_STATE_DIR = path.join(process.cwd(), "database", "challenges")

const CHALLENGE_TYPES = [
  { type: "curses", param: 17, timeLimit: 1800, desc: "Defeat 17 curses in 30 minutes" },
  { type: "blackflashes", param: 7, desc: "Land 7 Black Flashes" },
  { type: "blocks", param: 25, desc: "Block 25 attacks" },
  { type: "pvp_wins", param: 6, desc: "Win 6 PvP battles" },
  { type: "damage", param: 3000, desc: "Deal 3000 damage" },
  { type: "special_grade", param: 1, desc: "Defeat 1 Special Grade curse" },
  { type: "survive_low_hp", param: 10, desc: "Survive 10 battles with under 10 HP" },
  { type: "miles", param: 50, desc: "Deal 50 total critical hits" }
]

const MASTERY_THRESHOLDS = [
  { mastery: 10, skill: 1, name: "Skill I" },
  { mastery: 30, skill: 2, name: "Skill II" },
  { mastery: 60, skill: 3, name: "Skill III" },
  { mastery: 100, skill: 4, name: "Skill IV" }
]

const SKILL_NAMES = {
  "Blood Manipulation": ["Flowing Red Scale", "Blood Edge", "Crimson Binding", "Red Sun"],
  "Limitless": ["Blue", "Red", "Hollow Purple", "Unlimited Void"],
  "Ten Shadows": ["Divine Dog", "Nue", "Gama", "Mahoraga"],
  "Idle Transfiguration": ["Awakening", "Transfigure", "Domain Expansion", "Perfection"],
  "Cursed Speech": ["Silence", "Command", "Forbidden Word", "Absolute Silence"],
  "Projection Sorcery": ["Double", "Triple", "Quaternary", "Infinity"],
  "Ratio": ["3:3:3", "6:6:6", "9:9:9", "Perfect Ratio"],
  "Magma": ["Volcanic Rock", "Lava Burst", "Magma Armor", "Eruption"],
  "Sky Manipulation": ["Wind Cutter", "Pressure Against the Skies", "Storm", "Heavenly Wind"],
  "Straw Doll": ["Pinned Butterfly", "Thread", "Binding", "Doll Master"],
  "Construction": ["Simple Domain", "Construct Shield", "Construct Weapon", "Absolute Territory"],
  "Clairvoyance": ["Future Sight", "Temporal Vision", "Eternal Future", "God's Eye"],
  "Copy": ["Steal", "Inherit", "Perfection", "Domain Copy"]
}

function getChallengeStatePath(playerId) {
  return path.join(CHALLENGE_STATE_DIR, `${playerId}.json`)
}

async function ensureDir() {
  await fs.ensureDir(CHALLENGE_STATE_DIR)
}

export async function loadChallengeState(playerId) {
  try {
    await ensureDir()
    const filePath = getChallengeStatePath(playerId)
    if (await fs.pathExists(filePath)) {
      return await fs.readJson(filePath)
    }
  } catch (err) {
    console.error("[KENNYJAKS ERROR] Failed to load challenge state:", err.message)
  }
  return { challenges: {}, techniqueProgress: {} }
}

export async function saveChallengeState(playerId, state) {
  await ensureDir()
  await fs.writeJson(getChallengeStatePath(playerId), state, { spaces: 2 })
}

function getChallengeType() {
  const copy = [...CHALLENGE_TYPES]
  return { ...copy[Math.floor(Math.random() * copy.length)] }
}

export async function startTechniqueTraining(player, techniqueName) {
  if (!player.technique || !player.technique.name) {
    return { error: "You have no cursed technique." }
  }

  if (player.technique.name.toLowerCase() !== techniqueName.toLowerCase()) {
    return { error: `Your technique is ${player.technique.name}, not ${techniqueName}.` }
  }

  if (!player.playerId) {
    return { error: "Player data error. Please re-register." }
  }

  const state = await loadChallengeState(player.playerId)

  if (!state.techniqueProgress) state.techniqueProgress = {}
  if (!state.techniqueProgress[player.technique.name]) {
    state.techniqueProgress[player.technique.name] = {
      mastery: 0,
      currentChallenge: null,
      challengeProgress: 0,
      challengeGoal: 0,
      completedChallenges: 0,
      unlockedSkills: []
    }
  }

  const progress = state.techniqueProgress[player.technique.name]

  if (progress.currentChallenge) {
    return {
      error: "You already have an active training challenge. Complete it first.",
      challenge: progress.currentChallenge,
      progress: formatProgress(progress, player)
    }
  }

  if (progress.mastery >= 100 && (!progress.unlockedSkills || progress.unlockedSkills.length < 4)) {
    return {
      error: `All skills already unlocked for ${player.technique.name}!`,
      progress: formatProgress(progress, player)
    }
  }

  const challenge = getChallengeType()
  challenge.id = `chall_${Date.now()}`
  challenge.startTime = Date.now()
  challenge.completed = false
  challenge.progress = 0

  progress.currentChallenge = challenge
  progress.challengeProgress = 0
  progress.challengeGoal = challenge.param

  await saveChallengeState(player.playerId, state)
  await syncPlayerProgress(player)

  return {
    success: true,
    challenge,
    progress: formatProgress(progress, player)
  }
}

async function syncPlayerProgress(player) {
  const state = await loadChallengeState(player.playerId)
  const techniqueName = player.technique?.name

  if (!techniqueName) return

  const challengeProgress = state.techniqueProgress?.[techniqueName] || {
    mastery: 0,
    currentChallenge: null,
    challengeProgress: 0,
    challengeGoal: 0,
    completedChallenges: 0,
    unlockedSkills: []
  }

  player.techniqueChallenges = player.techniqueChallenges || {}
  player.techniqueChallenges[techniqueName] = {
    mastery: challengeProgress.mastery || 0,
    currentChallenge: challengeProgress.currentChallenge || null,
    challengeProgress: challengeProgress.challengeProgress || 0,
    challengeGoal: challengeProgress.challengeGoal || 0,
    completedChallenges: challengeProgress.completedChallenges || 0,
    unlockedSkills: challengeProgress.unlockedSkills || []
  }

  await savePlayer(player)
}

export async function updatePlayerProgress(player) {
  if (!player.playerId) return
  await syncPlayerProgress(player)
}

export async function checkChallengeCompletion(player, action) {
  if (!player.playerId || !player.technique?.name) return null

  const state = await loadChallengeState(player.playerId)
  const progress = state.techniqueProgress?.[player.technique.name]

  if (!progress || !progress.currentChallenge) return null

  const challenge = progress.currentChallenge
  if (challenge.completed) return null

  let progressIncremented = false
  const challengeAction = action?.type || action

  if (challengeAction === "curses" || challengeAction === "kill_cursole" || challengeAction === "kill") {
    if (challenge.type === "curses" || challenge.type === "curse_kills") {
      challenge.progress = (challenge.progress || 0) + 1
      progress.challengeProgress = challenge.progress
      progressIncremented = true
    }
    if (challenge.type === "special_grade") {
      challenge.progress = (challenge.progress || 0) + 1
      progress.challengeProgress = challenge.progress
      progressIncremented = true
    }
  }

  if (challengeAction === "blackflash" || challengeAction === "blackflashes") {
    if (challenge.type === "blackflashes") {
      challenge.progress = (challenge.progress || 0) + 1
      progress.challengeProgress = challenge.progress
      progressIncremented = true
    }
  }

  if (challengeAction === "block" || challengeAction === "blocks") {
    if (challenge.type === "blocks") {
      challenge.progress = (challenge.progress || 0) + 1
      progress.challengeProgress = challenge.progress
      progressIncremented = true
    }
  }

  if (challengeAction === "pvp_win" || challengeAction === "pvp_wins") {
    if (challenge.type === "pvp_wins") {
      challenge.progress = (challenge.progress || 0) + 1
      progress.challengeProgress = challenge.progress
      progressIncremented = true
    }
  }

  if (challengeAction === "damage") {
    if (challenge.type === "damage") {
      challenge.progress = (challenge.progress || 0) + (action.amount || 1)
      progress.challengeProgress = challenge.progress
      progressIncremented = true
    }
  }

  if (challengeAction === "survive_low_hp") {
    if (challenge.type === "survive_low_hp") {
      challenge.progress = (challenge.progress || 0) + 1
      progress.challengeProgress = challenge.progress
      progressIncremented = true
    }
  }

  if (challengeAction === "critical_hit" || challengeAction === "miles") {
    if (challenge.type === "miles") {
      challenge.progress = (challenge.progress || 0) + 1
      progress.challengeProgress = challenge.progress
      progressIncremented = true
    }
  }

  if (challenge.timeLimit && Date.now() - challenge.startTime > challenge.timeLimit * 1000) {
    challenge.expired = true
    await saveChallengeState(player.playerId, state)
    await syncPlayerProgress(player)
    return {
      expired: true,
      challenge: challenge,
      progress: formatProgress(progress, player)
    }
  }

  let completed = challenge.progress >= challenge.param

  if (completed) {
    challenge.completed = true
    progress.mastery = (progress.mastery || 0) + 10
    progress.completedChallenges = (progress.completedChallenges || 0) + 1
    const prevMastery = progress.mastery - 10
    const newMastery = progress.mastery

    let unlockedSkill = null
    const techniqueName = player.technique?.name || "Blood Manipulation"
    const techniqueSkills = SKILL_NAMES[techniqueName] || SKILL_NAMES["Blood Manipulation"]

    for (const threshold of MASTERY_THRESHOLDS) {
      if (prevMastery < threshold.mastery && newMastery >= threshold.mastery) {
        const skillIndex = threshold.skill - 1
        const skillName = techniqueSkills[skillIndex] || threshold.name

        if (!progress.unlockedSkills) progress.unlockedSkills = []
        if (!progress.unlockedSkills.includes(threshold.skill)) {
          progress.unlockedSkills.push(threshold.skill)
          unlockedSkill = {
            id: threshold.skill,
            name: skillName,
            displayName: threshold.name
          }
        }
      }
    }

    delete progress.currentChallenge
    progress.challengeProgress = 0
    progress.challengeGoal = 0

    player.techniqueChallenges = player.techniqueChallenges || {}
    player.techniqueChallenges[techniqueName] = {
      mastery: progress.mastery,
      currentChallenge: null,
      challengeProgress: 0,
      challengeGoal: 0,
      completedChallenges: progress.completedChallenges,
      unlockedSkills: progress.unlockedSkills || []
    }

    await saveChallengeState(player.playerId, state)
    await savePlayer(player)

    const result = {
      completed: true,
      mastery: progress.mastery,
      unlockedSkill,
      challengesCompleted: progress.completedChallenges,
      prevMastery
    }

    if (progress.mastery < 100) {
      const nextChallenge = getChallengeType()
      nextChallenge.id = `chall_${Date.now()}`
      nextChallenge.startTime = Date.now()
      nextChallenge.completed = false
      nextChallenge.progress = 0

      progress.currentChallenge = nextChallenge
      progress.challengeProgress = 0
      progress.challengeGoal = nextChallenge.param

      player.techniqueChallenges[techniqueName].currentChallenge = nextChallenge
      player.techniqueChallenges[techniqueName].challengeProgress = 0
      player.techniqueChallenges[techniqueName].challengeGoal = nextChallenge.param

      await saveChallengeState(player.playerId, state)
      await savePlayer(player)

      result.nextChallenge = nextChallenge
    }

    return result
  }

  if (progressIncremented) {
    await saveChallengeState(player.playerId, state)
    await syncPlayerProgress(player)
  }

  return {
    completed: false,
    progress: challenge.progress,
    param: challenge.param,
    desc: challenge.desc,
    pct: Math.round((challenge.progress / challenge.param) * 100)
  }
}

function formatProgress(progress, player) {
  const mastery = progress.mastery || 0
  let nextSkill = "No more skills"

  for (const threshold of MASTERY_THRESHOLDS) {
    if (mastery < threshold.mastery) {
      const skillIndex = threshold.skill - 1
      const techniqueName = player.technique?.name || "Blood Manipulation"
      const techniqueSkills = SKILL_NAMES[techniqueName] || SKILL_NAMES["Blood Manipulation"]
      nextSkill = `${techniqueSkills[skillIndex] || threshold.name} (${threshold.mastery} mastery)`
      break
    }
  }

  return `Mastery: ${mastery}/100\nNext: ${nextSkill}\nChallenges completed: ${progress.challengesCompleted || 0}`
}

export function formatChallengeProgress(challenge) {
  if (!challenge) return ""

  let status = ""
  if (challenge.completed) status = "COMPLETE"
  else if (challenge.expired) status = "EXPIRED"
  else {
    const progress = challenge.progress || 0
    status = `Progress: ${progress}/${challenge.param}`
  }

  return `${challenge.desc}\n${status}`
}

export async function syncAllPlayerProgress(player) {
  await syncPlayerProgress(player)
}
