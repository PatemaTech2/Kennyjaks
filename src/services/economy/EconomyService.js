export class EconomyService {
  constructor() {
    this.lastGamble = new Map()
  }

  canGamble(playerId) {
    const last = this.lastGamble.get(playerId) || 0
    return Date.now() - last >= 5000
  }

  recordGamble(playerId) {
    this.lastGamble.set(playerId, Date.now())
  }

  deposit(player, amount) {
    if (amount <= 0 || amount > player.wallet) return false
    player.wallet -= amount
    player.bank += amount
    player.lifetimeEarned += amount
    return true
  }

  withdraw(player, amount) {
    if (amount <= 0 || amount > player.bank) return false
    player.bank -= amount
    player.wallet += amount
    player.lifetimeSpent += amount
    return true
  }

  updateLifetimeSpend(player, amount) {
    player.lifetimeSpent += amount
  }

  updateLifetimeEarned(player, amount) {
    player.lifetimeEarned += amount
  }
}

export const globalEconomy = new EconomyService()
