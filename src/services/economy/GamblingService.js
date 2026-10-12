import { GAMBLE } from "../../config/gambleConfig.js"
import { globalEconomy } from "./EconomyService.js"

function weightedRandom(weights) {
  const total = weights.reduce((a, b) => a + b, 0)
  let r = Math.random() * total
  for (let i = 0; i < weights.length; i++) {
    r -= weights[i]
    if (r <= 0) return i
  }
  return weights.length - 1
}

export class GamblingService {
  roll(color, bet) {
    const config = GAMBLE.colors[color]
    if (!config) return null
    const index = weightedRandom(config.weights)
    const multiplier = config.multipliers[index]
    return { multiplier, index }
  }

  applyEvent(player, bet) {
    if (!GAMBLE.events.enabled || Math.random() > GAMBLE.events.chance) return null
    const event = GAMBLE.events.types[Math.floor(Math.random() * GAMBLE.events.types.length)]
    return event
  }

  async processGamble(player, color, bet) {
    if (!globalEconomy.canGamble(player.playerId)) {
      return { error: "Cooldown active. Wait 5 seconds." }
    }

    if (!Number.isFinite(bet) || bet <= 0) {
      return { error: "Invalid bet amount." }
    }
    if (bet < GAMBLE.minBet) {
      return { error: `Minimum bet is ¥${GAMBLE.minBet}.` }
    }
    if (bet > GAMBLE.maxBet) {
      return { error: `Maximum bet is ¥${GAMBLE.maxBet.toLocaleString()}.` }
    }
    if (bet > player.wallet) {
      return { error: "Insufficient wallet balance." }
    }

    player.wallet -= bet
    globalEconomy.recordGamble(player.playerId)
    player.gamblingGamesPlayed += 1
    player.lifetimeSpent += bet

    const roll = this.roll(color, bet)
    const event = this.applyEvent(player, bet)

    let finalMultiplier = roll.multiplier
    let payout = Math.floor(bet * finalMultiplier)
    let message = ""

    if (event) {
      finalMultiplier = event.multiplier
      payout = Math.floor(bet * finalMultiplier)
      message = event.message
      if (event.name === "sukuna_laugh") payout = 0
    }

    player.wallet += payout

    if (payout > 0) {
      player.lifetimeEarned += payout
      player.gamblingProfit += payout
      player.currentWinStreak += 1
      player.currentLoseStreak = 0
      if (payout > player.largestWin) player.largestWin = payout
      if (finalMultiplier > player.biggestMultiplier) player.biggestMultiplier = finalMultiplier
    } else {
      player.gamblingLosses += bet
      player.currentLoseStreak += 1
      player.currentWinStreak = 0
      if (bet > player.largestLoss) player.largestLoss = bet
    }

    return {
      success: true,
      multiplier: finalMultiplier,
      payout,
      bet,
      color,
      message,
      newWallet: player.wallet
    }
  }
}

export const globalGambling = new GamblingService()
