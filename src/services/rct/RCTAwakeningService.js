import fs from "fs-extra"
import path from "path"
import { savePlayer } from "../../database/playerRepo.js"

const NEAR_DEATH_AWAKENING_CHANCE = 0.09

export class RCTAwakeningService {
  static async attemptNearDeathAwakening(player, opponent) {
    if (!player) return { attempt: false, awakened: false }
    if (player.hasRCT) return { attempt: false, awakened: false }

    if (!opponent || opponent.type !== "curse") return { attempt: false, awakened: false }

    if (!this.isOpponentSignificantlyStronger(player, opponent)) {
      return { attempt: false, awakened: false }
    }

    const awakened = Math.random() < NEAR_DEATH_AWAKENING_CHANCE

    if (awakened) {
      await this.awakenRCT(player, "near_death")
      return { attempt: true, awakened: true }
    }

    return { attempt: true, awakened: false }
  }

  static isOpponentSignificantlyStronger(player, opponent) {
    const playerGrade = player.grade !== undefined ? player.grade : 4
    const opponentGrade = opponent.grade !== undefined ? opponent.grade : 4
    return opponentGrade < playerGrade
  }

  static async awakenRCT(player, method) {
    player.hasRCT = true
    player.rct = { unlocked: true, trained: false }
    player.rctMethod = method
    player.rctAwakenedAt = player.rctAwakenedAt || Date.now()
    player.reverseTechniqueUnlocked = true

    const reversedTechnique = this.assignReversedTechnique(player)

    player.health = Math.floor(player.maxHealth * 0.5)
    player.cursedEnergy = Math.floor(player.maxCursedEnergy * 0.4)

    await savePlayer(player)
    return reversedTechnique
  }

  static assignReversedTechnique(player) {
    if (!player.technique || !player.technique.name) return null
    const techniqueName = player.technique.name
    const reversed = this.getReversedTechniqueData(techniqueName)
    if (!reversed) return null

    if (!player.reversedTechnique) {
      player.reversedTechnique = {
        name: reversed.reverseTechnique,
        damage: reversed.damage,
        ceCost: reversed.ceCost,
        cooldown: reversed.cooldown,
        cooldownUnit: reversed.cooldownUnit,
        effects: reversed.effects,
        battleDialogue: reversed.battleDialogue,
        statusEffect: reversed.statusEffect
      }
    }
    return player.reversedTechnique
  }

  static getReversedTechnique(player) {
    if (!player || !player.hasRCT) return null
    if (!player.reversedTechnique) {
      this.assignReversedTechnique(player)
    }
    return player.reversedTechnique || null
  }

  static _reversedTechniquesCache = null

  static getReversedTechniqueData(techniqueName) {
    if (!techniqueName) return null
    if (this._reversedTechniquesCache) {
      return this._reversedTechniquesCache.techniques[techniqueName] || null
    }
    try {
      const jsonPath = path.resolve(process.cwd(), "src", "data", "reversedTechniques.json")
      const raw = fs.readJsonSync(jsonPath)
      this._reversedTechniquesCache = raw
      return raw.techniques[techniqueName] || null
    } catch (err) {
      console.error("[RCT] Failed to load reversedTechniques.json:", err.message)
      return null
    }
  }

  static getRctTrainingRequirements() {
    return [
      {
        id: "grade1_curses",
        desc: "Defeat 20 Grade 1 curses",
        label: "Grade 1 Curse Kills",
        target: 20,
        track: (player) => player.curseKillsByGrade?.["1"] || 0
      },
      {
        id: "special_grade_survival",
        desc: "Survive 10 Special Grade technique attacks",
        label: "Special Grade Survivals",
        target: 10,
        track: (player) => (player.rctTrainProgress && player.rctTrainProgress.challenges.special_grade_survival) || 0
      },
      {
        id: "ally_healing",
        desc: "Heal allies 100 times",
        label: "Ally Heals Performed",
        target: 100,
        track: (player) => (player.rctTrainProgress && player.rctTrainProgress.challenges.ally_healing) || 0
      },
      {
        id: "pvp_wins_no_death",
        desc: "Win 15 PvP battles without dying",
        label: "PvP Wins (No Death)",
        target: 15,
        track: (player) => (player.rctTrainProgress && player.rctTrainProgress.challenges.pvp_wins_no_death) || 0
      }
    ]
  }

  static canStartRctTraining(player) {
    if (player.hasRCT) return { canTrain: false, reason: "You have already awakened Reverse Cursed Technique." }
    const playerGrade = player.grade !== undefined ? player.grade : 4
    if (playerGrade > 2) return { canTrain: false, reason: "You must be Grade 2 or higher to begin RCT mastery training." }
    return { canTrain: true }
  }

  static getRctTrainingProgress(player) {
    const requirements = this.getRctTrainingRequirements()
    const progress = player.rctTrainProgress || { stage: 0, progress: 0, completed: 0, challenges: {} }

    const stages = []
    let allComplete = true

    for (let i = 0; i < requirements.length; i++) {
      const req = requirements[i]
      const current = req.track(player)
      const completed = current >= req.target
      if (!completed) allComplete = false

      stages.push({
        id: req.id,
        desc: req.desc,
        label: req.label,
        current,
        target: req.target,
        completed
      })
    }

    return {
      stages,
      allComplete,
      stage: progress.stage,
      completed: progress.completed,
      canAwaken: allComplete && !player.hasRCT
    }
  }

  static async checkRctMasteryUnlock(player) {
    if (player.hasRCT) return { unlocked: false }
    if (player.grade > 2) return { unlocked: false }

    const progress = this.getRctTrainingProgress(player)
    if (progress.allComplete) {
      await this.awakenRCT(player, "mastery")
      return { unlocked: true, method: "mastery", reversedTechnique: player.reversedTechnique }
    }

    return { unlocked: false }
  }

  static async recordRctTrainingEvent(player, eventType, amount = 1) {
    if (!player.rctTrainProgress) {
      player.rctTrainProgress = { stage: 0, progress: 0, completed: 0, challenges: {} }
    }
    if (!player.rctTrainProgress.challenges) {
      player.rctTrainProgress.challenges = {}
    }

    const challengeMap = {
      "special_grade_survival": "special_grade_survival",
      "ally_healing": "ally_healing",
      "pvp_wins_no_death": "pvp_wins_no_death"
    }

    const key = challengeMap[eventType] || eventType
    player.rctTrainProgress.challenges[key] = (player.rctTrainProgress.challenges[key] || 0) + amount

    await savePlayer(player)
  }

  static getNearDeathAwakeningChance() {
    return NEAR_DEATH_AWAKENING_CHANCE
  }
}
