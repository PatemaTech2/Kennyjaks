import fsExtra from "fs-extra"
import path from "path"

const BRAIN_PATH = path.resolve("database/enemyBrains.json")
const PLAYER_MEMORY_PATH = path.resolve("database/playerMemories.json")

let enemyBrains = null
let playerMemories = null

export function loadEnemyBrains() {
  if (enemyBrains) return enemyBrains
  try {
    enemyBrains = fsExtra.readJsonSync(BRAIN_PATH)
  } catch {
    enemyBrains = {}
  }
  return enemyBrains
}

export function loadPlayerMemories() {
  if (playerMemories) return playerMemories
  try {
    playerMemories = fsExtra.readJsonSync(PLAYER_MEMORY_PATH)
  } catch {
    playerMemories = {}
  }
  return playerMemories
}

export function saveEnemyBrains() {
  try {
    fsExtra.ensureDirSync(path.dirname(BRAIN_PATH))
    fsExtra.writeJsonSync(BRAIN_PATH, enemyBrains, { spaces: 2 })
  } catch (err) {
    console.error("[ENEMY_BRAIN] Failed to save:", err.message)
  }
}

export function savePlayerMemories() {
  try {
    fsExtra.ensureDirSync(path.dirname(PLAYER_MEMORY_PATH))
    fsExtra.writeJsonSync(PLAYER_MEMORY_PATH, playerMemories, { spaces: 2 })
  } catch (err) {
    console.error("[PLAYER_MEMORY] Failed to save:", err.message)
  }
}

export class EnemyBrain {
  constructor(enemyId, enemyName, personality = "neutral", grade = 4) {
    const brains = loadEnemyBrains()
    const existing = brains[enemyId]
    
    if (existing) {
      if (existing.learnedPreferences && existing.learnedPreferences.commonCounters) {
        if (typeof existing.learnedPreferences.commonCounters === "object" && !Array.isArray(existing.learnedPreferences.commonCounters)) {
          existing.learnedPreferences.commonCounters = []
          saveEnemyBrains()
        }
      }
      this.data = existing
    } else {
      this.data = {
        enemyId: enemyId,
        name: enemyName,
        personality: personality,
        grade: grade,
        winCount: 0,
        lossCount: 0,
        totalRoundsSurvived: 0,
        totalDamageDealt: 0,
        totalDamageTaken: 0,
        actionHistory: [],
        playerPatterns: {},
        learnedPreferences: {
          preferredActions: [],
          commonCounters: [],
          timingWindows: {}
        },
        dialogueStyle: "",
        createdAt: Date.now(),
        updatedAt: Date.now()
      }
      brains[enemyId] = this.data
      saveEnemyBrains()
    }
  }

  getEnemyId() {
    return this.data.enemyId
  }

  getName() {
    return this.data.name
  }

  getPersonality() {
    return this.data.personality
  }

  getGrade() {
    return this.data.grade
  }

  updatePattern(playerAction, outcome, damage, round) {
    const patterns = this.data.playerPatterns
    
    if (!patterns[playerAction]) {
      patterns[playerAction] = { count: 0, wins: 0, damageDealt: 0, damageTaken: 0 }
    }
    
    patterns[playerAction].count += 1
    if (outcome === "win" || outcome === "partial") {
      patterns[playerAction].wins += 1
    }
    patterns[playerAction].damageDealt += damage
    patterns[playerAction].damageTaken += damage
    
    this.data.actionHistory.push({
      action: playerAction,
      outcome: outcome,
      damage: damage,
      round: round,
      timestamp: Date.now()
    })
    
    if (this.data.actionHistory.length > 100) {
      this.data.actionHistory = this.data.actionHistory.slice(-50)
    }
    
    this.data.updatedAt = Date.now()
  }

  learnFromRound(playerAction, enemyAction, result) {
    if (!this.data.learnedPreferences.commonCounters) {
      this.data.learnedPreferences.commonCounters = []
    }
    
    const actionRecord = this.data.learnedPreferences.commonCounters.find(
      a => a.playerAction === playerAction && a.enemyAction === enemyAction
    )
    
    if (actionRecord) {
      actionRecord.successRate = result.success ? 
        (actionRecord.successRate * actionRecord.times + 1) / (actionRecord.times + 1) :
        (actionRecord.successRate * actionRecord.times) / (actionRecord.times + 1)
      actionRecord.times += 1
    } else {
      this.data.learnedPreferences.commonCounters.push({
        playerAction: playerAction,
        enemyAction: enemyAction,
        successRate: result.success ? 1 : 0,
        times: 1
      })
    }
    
    const preferred = this.data.learnedPreferences.preferredActions.find(
      a => a.action === enemyAction
    ) || { action: enemyAction, count: 0, successRate: 0, totalTimes: 0 }
    
    if (result.success) {
      preferred.count += 1
    }
    preferred.totalTimes += 1
    preferred.successRate = preferred.count / preferred.totalTimes
    
    const existing = this.data.learnedPreferences.preferredActions.find(
      a => a.action === enemyAction
    )
    if (existing) {
      Object.assign(existing, preferred)
    } else {
      this.data.learnedPreferences.preferredActions.push(preferred)
    }
    
    this.data.updatedAt = Date.now()
  }

  getRecommendedActions() {
    const actions = this.data.learnedPreferences.preferredActions
      .sort((a, b) => b.successRate - a.successRate)
      .slice(0, 3)
      .map(a => a.action)
    
    const counters = (this.data.learnedPreferences.commonCounters || [])
      .filter(c => c && c.successRate > 0.6)
      .sort((a, b) => b.successRate - a.successRate)
    
    return { actions, counters }
  }

  getPatternSummary() {
    const patterns = this.data.playerPatterns
    const total = Object.values(patterns).reduce((sum, p) => sum + p.count, 0)
    const dominantPattern = Object.entries(patterns)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 3)
      .map(([action, data]) => ({
        action: action,
        frequency: data.count,
        effectiveness: data.wins / Math.max(1, data.count),
        damageDealt: data.damageDealt
      }))
    
    return {
      dominantActions: dominantPattern,
      totalObservations: total,
      winRate: this.data.winCount / Math.max(1, this.data.winCount + this.data.lossCount)
    }
  }

  recordOutcome(result, rounds, damageDealt, damageTaken, playerAction) {
    if (result === "win") {
      this.data.winCount += 1
    } else if (result === "loss") {
      this.data.lossCount += 1
    }
    this.data.totalRoundsSurvived += rounds
    this.data.totalDamageDealt += damageDealt
    this.data.totalDamageTaken += damageTaken
    
    this.updatePattern(playerAction, result, damageDealt, rounds)
    
    this.data.updatedAt = Date.now()
  }

  generatePersonalityDescription() {
    const desc = {
      aggressive: "A fierce warrior who charges headfirst into battle",
      coward: "A nervous foe who avoids direct confrontation when possible",
      sadistic: "A cruel being who enjoys inflicting pain",
      arrogant: "A confident opponent who underestimates their enemy",
      silent: "A patient hunter who strikes without warning",
      bloodthirsty: "A brutal killer who seeks to dominate completely",
      tactical: "A strategic mind who adapts to their opponent's style",
      crazy: "An unpredictable enemy with erratic behavior"
    }
    return desc[this.data.personality] || "A formidable opponent"
  }

  toSummary() {
    return {
      enemyId: this.data.enemyId,
      name: this.data.name,
      personality: this.data.personality,
      grade: this.data.grade,
      winCount: this.data.winCount,
      lossCount: this.data.lossCount,
      survivalRate: this.data.totalRoundsSurvived / Math.max(1, this.data.totalRoundsSurvived),
      avgDamageDealt: this.data.totalDamageDealt / Math.max(1, this.data.winCount + this.data.lossCount),
      patterns: this.getPatternSummary()
    }
  }
}

export class PlayerMemory {
  constructor(playerId) {
    this.memories = loadPlayerMemories()
    if (!this.memories[playerId]) {
      this.memories[playerId] = {
        playerId: playerId,
        enemyBattles: {},
        preferredStrategies: [],
        weaknesses: [],
        createdAt: Date.now(),
        updatedAt: Date.now()
      }
      savePlayerMemories()
    }
    this.data = this.memories[playerId]
  }

  recordBattle(enemyId, result, rounds, playerActions, enemyReaction) {
    if (!this.data.enemyBattles[enemyId]) {
      this.data.enemyBattles[enemyId] = []
    }
    
    this.data.enemyBattles[enemyId].push({
      result: result,
      rounds: rounds,
      playerActions: playerActions,
      enemyReaction: enemyReaction,
      timestamp: Date.now()
    })
    
    if (this.data.enemyBattles[enemyId].length > 20) {
      this.data.enemyBattles[enemyId] = this.data.enemyBattles[enemyId].slice(-10)
    }
    
    this.data.updatedAt = Date.now()
    this.save()
  }

  getEnemyHistory(enemyId) {
    return this.data.enemyBattles[enemyId] || []
  }

  getPlayerStyle() {
    const allActions = []
    for (const history of Object.values(this.data.enemyBattles)) {
      history.forEach(h => {
        allActions.push(...h.playerActions)
      })
    }
    
    const actionCounts = {}
    allActions.forEach(a => {
      actionCounts[a] = (actionCounts[a] || 0) + 1
    })
    
    return Object.entries(actionCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([action, count]) => ({ action, count }))
  }

  save() {
    savePlayerMemories()
  }
}

export function getPlayerMemory(playerId) {
  return new PlayerMemory(playerId)
}

export function resetAllBrains() {
  enemyBrains = {}
  playerMemories = {}
  fsExtra.emptyDirSync(path.dirname(BRAIN_PATH))
  saveEnemyBrains()
  savePlayerMemories()
}

export function getBrainForEnemy(enemyId, enemyName, personality, grade) {
  return new EnemyBrain(enemyId, enemyName, personality, grade)
}