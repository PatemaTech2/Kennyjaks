import { TECHNIQUES, RARITIES, RARITY_WEIGHTS } from "../config/constants.js"
import { assignPotential, applyPotentialToStats } from "../services/technique/PotentialService.js"
import { BlackFlashService } from "../services/battle/BlackFlashService.js"
import { globalTechniqueEngine } from "../services/technique/TechniqueEngine.js"

function pickTechnique() {
  const technique = TECHNIQUES[Math.floor(Math.random() * TECHNIQUES.length)]
  const branch = technique.branches[Math.floor(Math.random() * technique.branches.length)]
  const rarityIndex = weightedRandom(RARITY_WEIGHTS)
  const grade = RARITIES[rarityIndex]
  const potential = ["E", "D", "C", "B", "A", "S"][Math.floor(Math.random() * 6)]

  const allBranches = technique.branches.map(b => ({
    name: b.name,
    mastery: b.mastery,
    skillTree: [...b.skillTree],
    passive: b.passive,
    unlockedSkills: [...b.unlockedSkills]
  }))

  const techniqueId = technique.name.toLowerCase().replace(/[^a-z0-9]/g, "")
  const definition = globalTechniqueEngine.getDefinition(techniqueId)
  const allSkillIds = definition
    ? Object.keys(definition.skills).filter(id => {
        const skill = definition.skills[id]
        return skill && skill.type !== "PASSIVE"
      })
    : []

  return {
    name: technique.name,
    branch: branch.name,
    rarity: grade,
    potential,
    mastery: branch.mastery,
    branches: allBranches,
    skillTree: [...branch.skillTree],
    passive: branch.passive,
    unlockedSkills: allSkillIds
  }
}

function weightedRandom(weights) {
  const total = weights.reduce((a, b) => a + b, 0)
  let r = Math.random() * total
  for (let i = 0; i < weights.length; i++) {
    r -= weights[i]
    if (r <= 0) return i
  }
  return weights.length - 1
}

export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function generatePlayer(phoneNumber, name, playerId, faction) {
  const id = crypto.randomUUID()
  const technique = pickTechnique()

  let stats
  if (faction === "curse") {
    stats = {
      health: randomInt(180, 250),
      maxHealth: randomInt(180, 250),
      cursedEnergy: randomInt(260, 380),
      maxCursedEnergy: randomInt(260, 380),
      strength: randomInt(14, 22),
      defense: randomInt(12, 18),
      speed: randomInt(12, 18),
      intelligence: randomInt(10, 16),
      luck: randomInt(3, 12),
      reputation: 0
    }
  } else {
    stats = {
      health: randomInt(100, 140),
      maxHealth: randomInt(100, 140),
      cursedEnergy: randomInt(150, 220),
      maxCursedEnergy: randomInt(150, 220),
      strength: randomInt(10, 18),
      defense: randomInt(10, 16),
      speed: randomInt(10, 16),
      intelligence: randomInt(10, 16),
      luck: randomInt(5, 15),
      reputation: 0
    }
  }

  const inventory = [
    { id: "item_student_uniform", name: "Student Uniform", rarity: "Common", quantity: 1, type: "armor", usable: false, effect: null },
    { id: "item_wooden_sword", name: "Wooden Practice Sword", rarity: "Common", quantity: 1, type: "weapon", usable: false, effect: null },
    { id: "item_bandage", name: "Bandage", rarity: "Common", quantity: 5, type: "consumable", usable: true, effect: { heal: 20 } },
    { id: "item_bread", name: "Bread", rarity: "Common", quantity: 5, type: "consumable", usable: true, effect: { heal: 15 } },
    { id: "item_water", name: "Water", rarity: "Common", quantity: 5, type: "consumable", usable: true, effect: { restoreCE: 10 } }
  ]

  const now = new Date().toISOString()

  const playerData = {
    id,
    playerId,
    phoneNumber,
    name,
    faction,
    registrationDate: now,
    wallet: 5000,
    bank: 0,
    level: 1,
     xp: 0,
     lifetimeXp: 0,
     grade: 4,
     sorcererGrade: "Grade 4",
     ...stats,
     baseStats: {
       hp: stats.maxHealth,
       ce: stats.maxCursedEnergy,
       strength: stats.strength,
       defense: stats.defense,
       speed: stats.speed,
       intelligence: stats.intelligence
     },
     inventory,
    equippedWeapon: null,
    equippedArmor: null,
    equippedAccessory: null,
    equippedItems: {},
    inventoryCapacity: 30,
    bagCapacity: 0,
    bagInventory: [],
    equippedBag: null,
    activeMissions: [],
    completedMissions: [],
    friends: [],
    titles: [],
    achievements: [],
    domainExpansion: { locked: true, name: null },
    reverseCursedTechnique: { locked: true, name: null },
     technique,
     skillPoints: 0,
     blackFlashes: 0,
     blackFlashAffinity: new BlackFlashService().generateAffinity(),
     highestChain: 0,
     totalBlackFlashDamage: 0,
     lifetimeEarned: 0,
     lifetimeSpent: 0,
     gamblingProfit: 0,
     gamblingLosses: 0,
     gamblingGamesPlayed: 0,
     largestWin: 0,
     largestLoss: 0,
     biggestMultiplier: 0,
     currentWinStreak: 0,
     currentLoseStreak: 0,
     pvpWins: 0,
     pvpLosses: 0,
     eggs: [],
     shikigami: null,
     pets: [],
     activePet: null,
     bags: [],
     dailyChecklist: {
       salaryClaimed: false,
       dailyMissionCompleted: false,
       cursesDefeated: 0,
       petFed: false,
       techniqueTrained: false,
       blackMarketVisited: false,
       investigationCompleted: false,
       allCompleted: false
     },
     lastDailyReset: Date.now(),
     dailySalaryClaimed: false,
     thirst: 100,
     lastSeen: Date.now(),
     totalPlayTime: 0,
     potential: null,
     potentialBonuses: {},
     curseKills: 0,
     curseKillsByGrade: {},
     completedMissionDifficulties: [],
     specialGradeKills: 0,
     criticalHits: 0,
     hasRCT: false,
     rct: { unlocked: false, trained: false },
     reversedTechnique: null,
     reverseTechniqueUnlocked: false,
     rctMethod: null,
      rctAwakenedAt: null,
      rctTrainProgress: { stage: 0, progress: 0, completed: 0, challenges: {} },
      autoRct: { unlocked: false, enabled: false, streak: 0, lastTrainDate: null, completed: false, startedAt: null },
      techniqueChallenges: {},
      domains: { infernalPurgatory: false, name: null },
      rctCooldowns: {},
      techniqueMastery: {},
      shikigamiMastery: { conquered: [], currentTraining: null, trainingStartTime: null }
    }

  assignPotential(playerData)
  applyPotentialToStats(playerData)

  return playerData
}
