export const GAMBLE = {
  cooldownMs: 5000,
  minBet: 50,
  maxBet: 100000,
  colors: {
    blue: {
      label: "Blue",
      multipliers: [0, 0.5, 1, 1.2, 1.5, 2, 3, 5],
      weights: [15, 20, 20, 15, 12, 10, 5, 3]
    },
    red: {
      label: "Red",
      multipliers: [0, 0.2, 2, 3, 5, 8, 15, 30],
      weights: [20, 20, 18, 12, 10, 8, 7, 5]
    },
    green: {
      label: "Green",
      multipliers: [0, 0.1, 1, 2, 10, 50, 100, 500],
      weights: [30, 20, 15, 12, 10, 6, 4, 3]
    },
    black: {
      label: "Black",
      multipliers: [0, 0.2, 1, 2, 3, 5, 10, 20, 50, 100, 500, 1000],
      weights: [35, 20, 15, 8, 6, 5, 4, 3, 2, 1, 0.5, 0.05]
    }
  },
  events: {
    enabled: true,
    chance: 0.01,
    types: [
      { name: "dealer_smile", multiplier: 2, message: "🎭 The Dealer smiled... Double payout." },
      { name: "sukuna_laugh", multiplier: 0, message: "👹 Sukuna laughed. You lost everything." },
      { name: "fortune", multiplier: 1.5, message: "🍀 Fortune favored you. Your next gamble has guaranteed profit." }
    ]
  }
}
