import { AICurseBrain } from "./AICurseBrain.js"
import { AIBattleController } from "./AIBattleController.js"
import { EnemyBrain } from "./EnemyBrain.js"
import { getAIConfig } from "./AIConfig.js"

const VALID_ACTIONS = [
  "attack", "skill", "defend", "heal", "ultimate", "flee",
  "block", "dodge", "counter", "heavy_attack", "taunt", "rct",
  "domain", "reverse", "execute", "absorb"
]

const DEFAULT_FALLBACK_ACTIONS = [
  "attack", "defend", "heal", "skill", "flee"
]

export class AIBattleIntegration {
  constructor() {
    this.curseBrain = new AICurseBrain()
    this.battleController = new AIBattleController()
    this.retryCount = 2
    this.retryDelayMs = 1500
  }

  async decideEnemyAction(battle, player, opponent, context = {}) {
    const config = getAIConfig()
    
    if (!config.enabled || !config.battleEnabled) {
      return this.heuristicDecision(battle, player, opponent, context)
    }

    const brain = this.getEnemyBrain(opponent)
    const battleContext = this.buildContext(battle, player, opponent, brain, context)
    
    const decision = await this.attemptWithRetry(
      () => this.curseBrain.decideAction(battleContext),
      "decideAction"
    )

    if (decision && this.isValidDecision(decision, opponent)) {
      brain.learnFromRound(
        context.lastPlayerAction || "attack",
        decision.type,
        { success: true }
      )
      return this.enrichDecision(decision, opponent, brain)
    }

    console.warn("[AIBATTLE] AI decision invalid or failed, falling back to heuristic")
    return this.heuristicDecision(battle, player, opponent, context)
  }

  async decideActionForPlayer(battle, player, opponent, context = {}) {
    return this.decideEnemyAction(battle, player, opponent, context)
  }

  getEnemyBrain(opponent) {
    const enemyId = opponent.id || opponent.templateId || opponent.name
    return new EnemyBrain(
      enemyId,
      opponent.name || "Unknown",
      opponent.personality || "neutral",
      opponent.grade || 4
    )
  }

  buildContext(battle, player, opponent, brain, context) {
    const patternSummary = brain.getPatternSummary()
    const learnedPrefs = brain.getRecommendedActions()
    const playerStyle = context.playerMemory ? context.playerMemory.getPlayerStyle() : []
    
    const playerHealthPercent = player.hp / Math.max(1, player.maxHp)
    const opponentHealthPercent = opponent.hp / Math.max(1, opponent.maxHp)
    const roundsSoFar = battle.round || 0
    const lastAction = context.lastPlayerAction || "attack"
    const repeatedAction = context.repeatedPlayerAction || false
    const playerIsLow = playerHealthPercent < 0.25
    const opponentIsLow = opponentHealthPercent < 0.25
    
    const winRate = patternSummary.winRate
    const avgRounds = brain.data.totalRoundsSurvived / Math.max(1, brain.data.winCount + brain.data.lossCount)
    
    return {
      enemy: {
        name: opponent.name || "Unknown",
        grade: opponent.grade || 4,
        hp: opponent.hp,
        maxHp: opponent.maxHp,
        ce: opponent.cursedEnergy || opponent.currentCe || 0,
        maxCe: opponent.maxCursedEnergy || opponent.maxCe || 100,
        personality: opponent.personality || brain.getPersonality(),
        abilities: opponent.abilities || opponent.skills || [],
        healthPercent: opponentHealthPercent,
        isLow: opponentIsLow,
        brain: {
          personalityDescription: brain.generatePersonalityDescription(),
          winRate: brain.data.winCount / Math.max(1, brain.data.winCount + brain.data.lossCount),
          avgRoundsSurvived: avgRounds,
          recommendedActions: learnedPrefs.actions,
          knownCounters: learnedPrefs.counters.map(c => ({
            playerAction: c.playerAction,
            successRate: c.successRate
          }))
        }
      },
      battle: {
        round: roundsSoFar,
        isBoss: opponent.isBoss || opponent.grade <= 1,
        type: battle.type || "CURSE",
        playerHealthPercent: playerHealthPercent,
        playerIsLow: playerIsLow,
        lastAction: lastAction,
        repeatedAction: repeatedAction,
        playerActions: context.playerActions || [],
        momentum: battle.momentum || 50
      },
      player: {
        name: player.name || "Player",
        hp: player.hp,
        maxHp: player.maxHp,
        ce: player.cursedEnergy || player.currentCe || 0,
        maxCe: player.maxCursedEnergy || player.maxCe || 100,
        level: player.level || 1,
        strength: player.strength || 10,
        defense: player.defense || 10,
        style: playerStyle,
        healthPercent: playerHealthPercent,
        isLow: playerIsLow
      },
      learnedPreferences: learnedPrefs,
      patternSummary: patternSummary
    }
  }

  async attemptWithRetry(fn, operationName) {
    for (let attempt = 1; attempt <= this.retryCount; attempt++) {
      try {
        const result = await fn()
        if (result && result.ok !== false) {
          return result
        }
        console.warn(`[AIBATTLE] ${operationName} attempt ${attempt} returned invalid result`)
      } catch (error) {
        console.warn(`[AIBATTLE] ${operationName} attempt ${attempt} failed:`, error.message)
      }
      
      if (attempt < this.retryCount) {
        await this.sleep(this.retryDelayMs * attempt)
      }
    }
    return null
  }

  isValidDecision(decision, opponent) {
    if (!decision || !decision.type) return false
    const type = decision.type.toLowerCase()
    if (!VALID_ACTIONS.includes(type)) return false
    if (type === "ultimate" && opponent.cursedEnergy < 50) return false
    if (type === "skill" && opponent.cursedEnergy < 20) return false
    if (type === "heal" && opponent.cursedEnergy < 15) return false
    return true
  }

  async correctInvalidDecision(decision, battle, player, opponent) {
    console.warn(`[AIBATTLE] Correcting invalid decision: ${decision?.type}, opponent CE: ${opponent.cursedEnergy || opponent.currentCe}`)
    
    const corrected = { ...decision }
    
    if (corrected.type === "ultimate" && opponent.cursedEnergy < 50) {
      corrected.type = "attack"
      corrected.reason = "corrected: not enough CE"
    }
    if (corrected.type === "skill" && opponent.cursedEnergy < 20) {
      corrected.type = "attack"
      corrected.reason = "corrected: not enough CE for skill"
    }
    if (corrected.type === "heal" && opponent.cursedEnergy < 15) {
      corrected.type = "defend"
      corrected.reason = "corrected: not enough CE to heal"
    }
    if (corrected.type === "flee" && Math.random() < 0.3) {
      corrected.type = "attack"
      corrected.reason = "corrected: flee failed"
    }
    
    if (!VALID_ACTIONS.includes(corrected.type?.toLowerCase())) {
      corrected.type = "attack"
      corrected.reason = "corrected: invalid action"
    }
    
    corrected.source = "ai_corrected"
    return corrected
  }

  enrichDecision(decision, opponent, brain) {
    const dialogue = this.generateDialogue(decision, opponent, brain)
    
    return {
      type: decision.type,
      dialogue: dialogue,
      emotion: decision.emotion || this.inferEmotion(decision.type, opponent),
      source: decision.source || "ai",
      reason: decision.reason || null,
      brainConfidence: decision.source === "ai" ? 0.8 : 0.3,
      corrected: decision.reason ? true : false
    }
  }

  generateDialogue(decision, opponent, brain) {
    const personality = opponent.personality || brain.getPersonality()
    const templates = {
      aggressive: {
        attack: ["I'll crush you!", "Feel my power!", "Die here!"],
        skill: ["Technique time!", "Watch this!"],
        defend: ["Come at me!", "Is that all?"]
      },
      arrogant: {
        attack: ["Pathetic.", "You're weak."],
        skill: ["This is my specialty."],
        defend: ["You're not worthy."]
      },
      silent: {
        attack: ["...", "Hmph."],
        skill: ["Hah."],
        defend: ["..."]
      },
      tactical: {
        attack: ["Strike now."],
        skill: ["Read this."],
        defend: ["Watch."]
      },
      sadistic: {
        attack: ["More!", "Give me more!"],
        skill: ["Pain is beautiful."],
        defend: ["Stay there."]
      },
      bloodthirsty: {
        attack: ["Kill!", "More!"],
        skill: ["Blood for blood!"],
        defend: ["I won't let you go."]
      }
    }
    
    const style = templates[personality] || templates.aggressive
    const lines = style[decision.type] || style.attack
    return lines[Math.floor(Math.random() * lines.length)]
  }

  inferEmotion(action, opponent) {
    const emotions = {
      attack: ["furious", "confident", "ruthless"],
      skill: ["focused", "determined"],
      defend: ["cautious", "patient"],
      heal: ["desperate", "calculating"],
      flee: ["scared", "cunning"],
      counter: ["alert", "confident"],
      heavy_attack: ["aggressive", "furious"]
    }
    const options = emotions[action] || emotions.attack
    return options[Math.floor(Math.random() * options.length)]
  }

  heuristicDecision(battle, player, opponent, context = {}) {
    const hpPercent = opponent.hp / Math.max(1, opponent.maxHp)
    const ce = opponent.cursedEnergy || opponent.currentCe || 0
    const maxCe = opponent.maxCursedEnergy || opponent.maxCe || 100
    
    const actions = []
    
    if (hpPercent < 0.2 && Math.random() < 0.4) {
      return { type: Math.random() < 0.5 ? "defend" : "heal", source: "heuristic", reason: "low_hp" }
    }
    
    if (hpPercent < 0.4 && Math.random() < 0.3) {
      return { type: "defend", source: "heuristic", reason: "medium_hp" }
    }
    
    if (ce >= 50 && Math.random() < 0.4) {
      return { type: "ultimate", source: "heuristic", reason: "ce_available" }
    }
    
    if (ce >= 20 && Math.random() < 0.3) {
      return { type: "skill", source: "heuristic", reason: "ce_available" }
    }
    
    const actionWeights = [
      { type: "attack", weight: 50 },
      { type: "skill", weight: 25 },
      { type: "defend", weight: 15 },
      { type: "heal", weight: 10 }
    ]
    
    let total = actionWeights.reduce((sum, a) => sum + a.weight, 0)
    let roll = Math.random() * total
    
    for (const action of actionWeights) {
      roll -= action.weight
      if (roll <= 0) {
        return { type: action.type, source: "heuristic", reason: "random_roll" }
      }
    }
    
    return { type: "attack", source: "heuristic", reason: "default" }
  }

  async fixErrorFromInside(error, context = {}) {
    console.warn("[AIBATTLE] Internal error, self-correcting:", error.message)
    
    const correction = {
      action: "attack",
      reason: "auto_corrected",
      originalError: error.message,
      timestamp: Date.now()
    }
    
    if (context.opponent) {
      const opp = context.opponent
      if (opp.hp < opp.maxHp * 0.2) {
        correction.action = "heal"
        correction.reason = "auto_corrected_low_hp"
      } else if (opp.cursedEnergy >= 50) {
        correction.action = "ultimate"
        correction.reason = "auto_corrected_ce_available"
      }
    }
    
    return correction
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

export const aiBattleIntegration = new AIBattleIntegration()

export async function decideEnemyAction(battle, player, opponent, context) {
  return aiBattleIntegration.decideEnemyAction(battle, player, opponent, context)
}

export async function correctInvalidDecision(decision, battle, player, opponent) {
  return aiBattleIntegration.correctInvalidDecision(decision, battle, player, opponent)
}