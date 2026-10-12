import { KlootService } from "../kloot/KlootService.js"
import { decideEnemyAction } from "../ai/AIBattleIntegration.js"

const battles = new Map()
const pendingEnemies = new Map()

export const SKILL_MAP = {
  attack: { name: "Attack" },
  skill: { name: "Cursed Skill" },
  ultimate: { name: "ULTIMATE" },
  defend: { name: "Defend" },
  heal: { name: "Heal" },
  flee: { name: "Flee" },
  block: { name: "Block" },
  dodge: { name: "Dodge" },
  counter: { name: "Counter" },
  heavy_attack: { name: "Heavy Attack" },
  taunt: { name: "Taunt" },
  rct: { name: "Reverse Cursed Technique" },
  domain: { name: "Domain Expansion" },
  reverse: { name: "Reverse" },
  execute: { name: "Execute" },
  absorb: { name: "Absorb" }
}

export class SimpleBattleService {
  static start(player, opponent, type = "CURSE") {
    const battleId = `${type.toLowerCase()}:${player.playerId}:${Date.now()}`
    const battle = {
      id: battleId,
      type,
      player: {
        id: String(player.playerId),
        name: player.name || "Player",
        hp: player.health || player.maxHealth || 100,
        maxHp: player.maxHealth || 100,
        cursedEnergy: player.cursedEnergy || 0,
        maxCursedEnergy: player.maxCursedEnergy || 150,
        strength: player.strength || 10,
        defense: player.defense || 10,
        combo: 0,
        currentSprite: player.currentSprite || null,
        profilePic: player.profilePic || null,
        avatar: player.avatar || null,
        sprite: player.currentSprite || null
      },
      opponent: {
        id: String(opponent.id || opponent.playerId || `curse_${opponent.id || Date.now()}`),
        name: opponent.name || "Curse",
        hp: opponent.hp || opponent.maxHp || 100,
        maxHp: opponent.maxHp || opponent.hp || 100,
        cursedEnergy: opponent.ce || opponent.cursedEnergy || 0,
        maxCursedEnergy: opponent.maxCe || opponent.maxCursedEnergy || 150,
        strength: opponent.strength || 10,
        defense: opponent.defense || 10,
        combo: 0,
        sprite: opponent.sprite || opponent.currentSprite || "barney.png"
      },
      round: 0,
      finished: false,
      winner: null,
      battleLog: [],
      startedAt: Date.now(),
      themeSongTriggered: false
    }

    battles.set(battleId, battle)
    return battle
  }

  static get(battleId) {
    return battles.get(battleId) || null
  }

  static getByPlayer(playerId) {
    for (const battle of battles.values()) {
      if (!battle.finished && (battle.player.id === String(playerId) || battle.opponent.id === String(playerId))) {
        return battle
      }
    }
    return null
  }

  static end(battleId) {
    battles.delete(battleId)
  }

  static setPendingEnemy(playerId, curse) {
    pendingEnemies.set(playerId, curse)
  }

  static getPendingEnemy(playerId) {
    return pendingEnemies.get(playerId) || null
  }

  static clearPendingEnemy(playerId) {
    pendingEnemies.delete(playerId)
  }

  static resolveAction(attacker, defender, actionType) {
    const log = []

    if (actionType === "flee") {
      const success = Math.random() < 0.4
      log.push(`${attacker.name} tried to flee... ${success ? "Escaped!" : "Failed!"}`)
      return { playerDamage: 0, opponentDamage: 0, log, fled: success }
    }

    if (actionType === "defend" || actionType === "block") {
      log.push(`${attacker.name} took a defensive stance.`)
      return { playerDamage: 0, opponentDamage: 0, log, defended: true }
    }

    if (actionType === "dodge") {
      const dodged = Math.random() < 0.5
      if (dodged) {
        log.push(`${attacker.name} dodged!`)
        return { playerDamage: 0, opponentDamage: 0, log, dodged: true }
      }
      log.push(`${attacker.name} failed to dodge!`)
    }

    if (actionType === "heal") {
      const healAmount = Math.floor(attacker.maxHp * 0.2)
      attacker.hp = Math.min(attacker.maxHp, attacker.hp + healAmount)
      log.push(`${attacker.name} healed for ${healAmount} HP.`)
      return { playerDamage: 0, opponentDamage: 0, log }
    }

    if (actionType === "rct") {
      const healAmount = Math.floor(attacker.maxHp * 0.3)
      attacker.hp = Math.min(attacker.maxHp, attacker.hp + healAmount)
      log.push(`${attacker.name} used Reverse Cursed Technique! Healed for ${healAmount} HP.`)
      return { playerDamage: 0, opponentDamage: 0, log }
    }

    if (actionType === "domain") {
      const multiplier = 3.0
      const baseDamage = Math.max(1, Math.floor((attacker.strength + Math.floor(Math.random() * 10)) * multiplier - defender.defense * 0.3))
      const damage = Math.max(1, baseDamage)
      defender.hp = Math.max(0, defender.hp - damage)
      log.push(`『${attacker.name}』 activated DOMAIN EXPANSION!`)
      log.push(`💥 DAMAGE: ${damage}`)
      log.push(`『${defender.name}』 ❤️ ${defender.hp + damage} → ${defender.hp}`)
      return { playerDamage: damage, opponentDamage: 0, log }
    }

    if (actionType === "heavy_attack") {
      const multiplier = 2.0
      const baseDamage = Math.max(1, Math.floor((attacker.strength + Math.floor(Math.random() * 8)) * multiplier - defender.defense * 0.4))
      const damage = Math.max(1, baseDamage)
      defender.hp = Math.max(0, defender.hp - damage)
      const skillName = SKILL_MAP[actionType]?.name || "Heavy Attack"
      log.push(`『${attacker.name}』 used ${skillName}!`)
      log.push(`💥 DAMAGE: ${damage}`)
      log.push(`『${defender.name}』 ❤️ ${defender.hp + damage} → ${defender.hp}`)
      return { playerDamage: damage, opponentDamage: 0, log }
    }

    if (actionType === "execute") {
      const multiplier = 3.5
      const baseDamage = Math.max(1, Math.floor((attacker.strength + Math.floor(Math.random() * 10)) * multiplier - defender.defense * 0.2))
      const damage = Math.max(1, baseDamage)
      defender.hp = Math.max(0, defender.hp - damage)
      log.push(`『${attacker.name}』 used EXECUTE!`)
      log.push(`💥 DAMAGE: ${damage}`)
      log.push(`『${defender.name}』 ❤️ ${defender.hp + damage} → ${defender.hp}`)
      return { playerDamage: damage, opponentDamage: 0, log }
    }

    if (actionType === "absorb") {
      const absorbAmount = Math.floor((attacker.maxCe - (attacker.cursedEnergy || 0)) * 0.3)
      attacker.cursedEnergy = Math.min(attacker.maxCursedEnergy || attacker.maxCe || 150, (attacker.cursedEnergy || 0) + absorbAmount)
      log.push(`${attacker.name} absorbed ${absorbAmount} cursed energy!`)
      return { playerDamage: 0, opponentDamage: 0, log }
    }

    if (actionType === "counter") {
      const counterDamage = Math.max(1, Math.floor(attacker.strength * 1.3 - defender.defense * 0.6))
      defender.hp = Math.max(0, defender.hp - counterDamage)
      log.push(`${attacker.name} COUNTERED!`)
      log.push(`💥 DAMAGE: ${counterDamage}`)
      log.push(`『${defender.name}』 ❤️ ${defender.hp + counterDamage} → ${defender.hp}`)
      return { playerDamage: counterDamage, opponentDamage: 0, log }
    }

    if (actionType === "taunt") {
      const ceDrain = 20
      if (defender.cursedEnergy !== undefined) {
        defender.cursedEnergy = Math.max(0, (defender.cursedEnergy || 0) - ceDrain)
      }
      log.push(`${attacker.name} taunted ${defender.name}, draining ${ceDrain} CE!`)
      return { playerDamage: 0, opponentDamage: 0, log }
    }

    if (actionType === "reverse") {
      const healAmount = Math.floor(attacker.maxHp * 0.15)
      attacker.hp = Math.min(attacker.maxHp, attacker.hp + healAmount)
      log.push(`${attacker.name} used Reverse! Healed for ${healAmount} HP.`)
      return { playerDamage: 0, opponentDamage: 0, log }
    }

    const multiplier = actionType === "ultimate" ? 2.0 : actionType === "skill" ? 1.5 : 1.0
    const baseDamage = Math.max(1, Math.floor((attacker.strength + Math.floor(Math.random() * 5)) * multiplier - defender.defense * 0.5))
    const damage = Math.max(1, baseDamage)

    defender.hp = Math.max(0, defender.hp - damage)
    attacker.combo += 1

    const skillName = SKILL_MAP[actionType]?.name || "Attack"
    log.push(`『${attacker.name}』 used ${skillName}!`)
    log.push(`💥 DAMAGE: ${damage}`)
    log.push(`『${defender.name}』 ❤️ ${defender.hp + damage} → ${defender.hp}`)

    return {
      playerDamage: damage,
      opponentDamage: 0,
      log
    }
  }

  static async processRound(battle, playerAction) {
    if (battle.finished) return { finished: true, battle }

    battle.round += 1

    const player = battle.player
    const opponent = battle.opponent
    const battleLog = []

    const playerResult = this.resolveAction(player, opponent, playerAction)
    battleLog.push(...playerResult.log)

    if (playerResult.fled) {
      battle.finished = true
      battle.winner = opponent
      battle.battleLog = [...battleLog]
      battle.fledByPlayer = true
      battle.fledAfterRound = battle.round
      return { finished: true, battle, battleLog: [...battleLog] }
    }

    if (opponent.hp <= 0) {
      battle.finished = true
      battle.winner = player
      battle.battleLog = [...battleLog]
      return { finished: true, battle, battleLog: [...battleLog] }
    }

    const context = {
      battleRound: battle.round,
      playerAction: playerAction,
      lastPlayerAction: playerAction,
      repeatedPlayerAction: false,
      playerActions: battle.battleLog || [],
      opponentName: opponent.name,
      opponentPersonality: opponent.personality || "neutral"
    }

    let aiAction
    try {
      const aiDecision = await decideEnemyAction(battle, player, opponent, context)
      if (aiDecision && aiDecision.type) {
        aiAction = aiDecision.type
        if (aiDecision.dialogue) {
          battle.aiDialogue = aiDecision.dialogue
          battle.aiEmotion = aiDecision.emotion
          battle.aiSource = aiDecision.source
        }
      }
    } catch (error) {
      console.error("[SIMPLE_BATTLE_AI] AI decision failed:", error.message)
    }

    if (!aiAction) {
      aiAction = this.getAiAction(opponent, player)
    }

    const opponentResult = this.resolveAction(opponent, player, aiAction)
    battleLog.push(...opponentResult.log)

    if (opponentResult.fled) {
      battle.finished = true
      battle.winner = player
      battle.battleLog = [...battleLog]
      battle.fledByOpponent = true
      battle.fledAfterRound = battle.round
      return { finished: true, battle, battleLog: [...battleLog] }
    }

    if (player.hp <= 0) {
      battle.finished = true
      battle.winner = opponent
      battle.battleLog = [...battleLog]
      return { finished: true, battle, battleLog: [...battleLog] }
    }

    battle.battleLog = [...battleLog]
    return { finished: false, battle, battleLog: [...battleLog] }
  }

  static getAiAction(ai, player) {
    const hpPercent = ai.hp / ai.maxHp
    const ce = ai.cursedEnergy || 0
    const maxCe = ai.maxCursedEnergy || ai.maxCe || 150

    if (hpPercent < 0.2 && Math.random() < 0.4) {
      return Math.random() < 0.5 ? "defend" : "heal"
    }

    if (hpPercent < 0.4 && Math.random() < 0.3) {
      return "defend"
    }

    if (ce >= 50 && Math.random() < 0.3) {
      return "ultimate"
    }

    if (ce >= 20 && Math.random() < 0.3) {
      return "skill"
    }

    if (hpPercent < 0.15 && Math.random() < 0.3) {
      return "execute"
    }

    const actions = [
      { type: "attack", weight: 45 },
      { type: "skill", weight: 20 },
      { type: "defend", weight: 15 },
      { type: "heal", weight: 10 },
      { type: "counter", weight: 5 },
      { type: "heavy_attack", weight: 5 }
    ]

    const total = actions.reduce((sum, a) => sum + a.weight, 0)
    let roll = Math.random() * total
    for (const action of actions) {
      roll -= action.weight
      if (roll <= 0) return action.type
    }
    return "attack"
  }

  static async calculateRewards(battle, isVictory, player) {
    const baseYen = isVictory ? 150 : 30
    const baseKen = isVictory ? 0.2 : 0.05
    const yen = Math.floor(baseYen + Math.random() * 50)
    const ken = parseFloat((baseKen + Math.random() * 0.1).toFixed(2))

    let cards = []
    let kloots = []

    if (isVictory) {
      const cardChance = Math.random()
      if (cardChance < 0.3) {
        cards.push(KlootService.rollCardReward())
      }

      const klootRewards = KlootService.rollBattleKloots(player)
      kloots.push(...klootRewards)
    } else {
      // Participation rewards on defeat - small chance for cards and kloots
      const cardChance = Math.random()
      if (cardChance < 0.1) {
        cards.push(KlootService.rollCardReward())
      }

      const klootChance = Math.random()
      if (klootChance < 0.15) {
        kloots.push(...KlootService.rollBattleKloots(player))
      }
    }

    return { yen, ken, cards, kloots }
  }

  static async applyRewards(player, rewards) {
    player.wallet = (player.wallet || 0) + rewards.yen
    player.kenTokens = (player.kenTokens || 0) + rewards.ken

    for (const klootId of rewards.kloots) {
      KlootService.addKloot(player, klootId)
    }

    return rewards
  }
}

