import { getPlayerCardsWithDetails, getCardById } from "./CardService.js"

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export class CardBattleService {
  constructor() {
    this.battles = new Map()
  }

  createBattle(battleId, player1Id, player2Id, player1Cards, player2Cards, isNpc = false) {
    const hp = 4000
    this.battles.set(battleId, {
      id: battleId,
      player1Id,
      player2Id,
      isNpc,
      p1Hp: hp,
      p2Hp: hp,
      p1Cards: player1Cards.slice(0, 5),
      p2Cards: player2Cards.slice(0, 5),
      p1UsedCards: [],
      p2UsedCards: [],
      turn: 1,
      currentPlayer: 1,
      finished: false,
      winner: null,
      log: [],
      createdAt: Date.now()
    })
    return this.battles.get(battleId)
  }

  getBattle(battleId) {
    return this.battles.get(battleId)
  }

  getPlayerCards(battleId, playerNum) {
    const battle = this.battles.get(battleId)
    if (!battle) return []
    if (playerNum === 1) return battle.p1Cards.filter((_, i) => !battle.p1UsedCards.includes(i))
    return battle.p2Cards.filter((_, i) => !battle.p2UsedCards.includes(i))
  }

  attackWithCard(battleId, playerNum, cardIndex) {
    const battle = this.battles.get(battleId)
    if (!battle || battle.finished) return null

    const attackerCards = playerNum === 1 ? battle.p1Cards : battle.p2Cards
    const defenderCards = playerNum === 1 ? battle.p2Cards : battle.p1Cards
    const attackerUsed = playerNum === 1 ? battle.p1UsedCards : battle.p2UsedCards

    if (attackerUsed.includes(cardIndex)) return null

    const card = attackerCards[cardIndex]
    if (!card) return null

    attackerUsed.push(cardIndex)

    const atk = card.atv || 1000
    const def = card.def || 500
    const cardName = card.name || "Unknown"
    const isYugioh = card.isYugioh

    let defenderIndex = -1
    let bestDef = Infinity
    for (let i = 0; i < defenderCards.length; i++) {
      if (playerNum === 1 ? battle.p2UsedCards.includes(i) : battle.p1UsedCards.includes(i)) continue
      const dDef = defenderCards[i].def || 500
      if (dDef < bestDef) {
        bestDef = dDef
        defenderIndex = i
      }
    }

    let result = {
      attacker: cardName,
      atk,
      def,
      isYugioh,
      defenderIndex,
      damageDealt: 0,
      defenderKilled: false
    }

    if (defenderIndex >= 0) {
      const defender = defenderCards[defenderIndex]
      const defenderDef = defender.def || 500
      const netDamage = Math.max(1, atk - defenderDef)

      if (playerNum === 1) {
        battle.p2UsedCards.push(defenderIndex)
      } else {
        battle.p1UsedCards.push(defenderIndex)
      }

      result.defenderName = defender.name || "Unknown"
      result.damageDealt = netDamage
      result.defenderKilled = true

      const defenderPlayerHp = playerNum === 1 ? () => { battle.p2Hp = Math.max(0, battle.p2Hp - netDamage) } : () => { battle.p1Hp = Math.max(0, battle.p1Hp - netDamage) }

      if (playerNum === 1) {
        battle.p2Hp = Math.max(0, battle.p2Hp - netDamage)
        if (battle.p2Hp <= 0) {
          battle.finished = true
          battle.winner = 1
        }
      } else {
        battle.p1Hp = Math.max(0, battle.p1Hp - netDamage)
        if (battle.p1Hp <= 0) {
          battle.finished = true
          battle.winner = 2
        }
      }
    } else {
      result.directAttack = true
      if (playerNum === 1) {
        battle.p2Hp = Math.max(0, battle.p2Hp - atk)
        if (battle.p2Hp <= 0) {
          battle.finished = true
          battle.winner = 1
        }
      } else {
        battle.p1Hp = Math.max(0, battle.p1Hp - atk)
        if (battle.p1Hp <= 0) {
          battle.finished = true
          battle.winner = 2
        }
      }
      result.damageDealt = atk
    }

    const turn = playerNum === 1 ? "Player 1" : "Player 2"
    const defenderLabel = result.defenderName || "directly"
    if (result.directAttack) {
      battle.log.push(`${turn} attacks ${defenderLabel} with ${cardName} (${atk} ATK)! Direct attack for ${atk} damage!`)
    } else {
      battle.log.push(`${turn} attacks ${defenderLabel} with ${cardName} (${atk} ATK)! ${result.defenderName} destroyed! ${result.damageDealt} damage!`)
    }

    return result
  }

  getWinner(battleId) {
    const battle = this.battles.get(battleId)
    return battle ? battle.winner : null
  }

  getHp(battleId, playerNum) {
    const battle = this.battles.get(battleId)
    if (!battle) return 0
    return playerNum === 1 ? battle.p1Hp : battle.p2Hp
  }

  getLog(battleId) {
    const battle = this.battles.get(battleId)
    return battle ? battle.log : []
  }

  removeBattle(battleId) {
    this.battles.delete(battleId)
  }
}

export const globalCardBattle = new CardBattleService()