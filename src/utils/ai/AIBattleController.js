export class AIBattleController {
  constructor(personality = "BALANCED") {
    this.personality = personality
    this.memory = []
  }

  makeDecision(battleState, aiParticipant, opponent) {
    if (aiParticipant.hp < aiParticipant.maxHp * 0.25) {
      return this.getSurvivalAction(aiParticipant, battleState)
    }

    if (aiParticipant.ce < 40 && aiParticipant.ce < aiParticipant.maxCe * 0.3) {
      return { action: "defend", reason: "Restore CE" }
    }

    const predicted = this.predictOpponentMove(opponent)
    const counter = this.findCounter(predicted, aiParticipant)
    if (counter && Math.random() > 0.3) {
      return counter
    }

    const weakness = this.findWeakness(opponent, aiParticipant)
    if (weakness && weakness.score > 30) {
      return weakness
    }

    return this.findBestAttack(aiParticipant, opponent, battleState)
  }

  getSurvivalAction(participant, battleState) {
    const healSkills = participant.skills?.filter(s => s.type === "heal" && s.cooldown === 0) || []
    if (healSkills.length > 0) {
      return { action: "skill", skill: healSkills[0], reason: "CRITICAL HEALTH - HEALING" }
    }

    if (participant.ce > 300 && participant.hasDomain && !battleState.domainActive) {
      return { action: "domain", reason: "Activating domain for survival" }
    }

    return { action: "defend", reason: "Desperate defense" }
  }

  predictOpponentMove(opponent) {
    if (this.memory.length < 2) return "attack"

    const recentMoves = this.memory.slice(-3).map(m => m.action)

    if (recentMoves.length >= 2 && recentMoves[recentMoves.length - 1] === recentMoves[recentMoves.length - 2]) {
      return recentMoves[recentMoves.length - 1]
    }

    if (opponent.ce < 50) return "defend"
    if (opponent.hp < opponent.maxHp * 0.3) return "heal"

    const counts = {}
    recentMoves.forEach(m => counts[m] = (counts[m] || 0) + 1)
    return Object.keys(counts).reduce((a, b) => (counts[a] > counts[b] ? a : b), "attack")
  }

  findCounter(predictedMove, aiParticipant) {
    const counters = {
      attack: ["defend", "dodge"],
      defend: ["heavy_attack", "pierce"],
      heal: ["interrupt", "silence"],
      skill: ["counter", "absorb"]
    }

    const counterTypes = counters[predictedMove] || []
    const availableCounters = aiParticipant.skills?.filter(
      s => counterTypes.includes(s.counterType) && s.cooldown === 0 && aiParticipant.ce >= s.ceCost
    ) || []

    if (availableCounters.length === 0) return null

    const bestCounter = availableCounters.reduce((a, b) => (a.damageBonus || 0) > (b.damageBonus || 0) ? a : b)
    return { action: "skill", skill: bestCounter, reason: "Countering predicted move" }
  }

  findBestAttack(attacker, defender, battleState) {
    let bestSkill = null
    let bestScore = 0

    for (const skill of attacker.skills || []) {
      if (skill.cooldown > 0) continue
      if (attacker.ce < skill.ceCost) continue

      let score = skill.baseDamage || 10

      if (skill.element === defender.weakness) {
        score *= 2.0
      }

      if (defender.hp < defender.maxHp * 0.25 && skill.type === "finisher") {
        score *= 1.5
      }

      score = score / Math.max(skill.ceCost, 1) * 50
      score *= 0.85 + Math.random() * 0.3

      if (score > bestScore) {
        bestScore = score
        bestSkill = skill
      }
    }

    if (!bestSkill) {
      return { action: "attack", reason: "Basic attack" }
    }

    return { action: "skill", skill: bestSkill, reason: `Using ${bestSkill.name}` }
  }

  findWeakness(opponent, attacker) {
    for (const skill of attacker.skills || []) {
      if (skill.element === opponent.weakness && skill.cooldown === 0) {
        return { action: "skill", skill, reason: "Exploiting element weakness", score: 50 }
      }
    }
    return null
  }

  recordMove(action) {
    this.memory.push({ action, timestamp: Date.now() })
    if (this.memory.length > 10) this.memory.shift()
  }
}
