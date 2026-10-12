export class StatusEngine {
  constructor() {
    this.statuses = new Map()
  }

  addStatus(playerId, status) {
    const existing = this.statuses.get(playerId) || []
    const already = existing.find(s => s.type === status.type && !s.unique)
    if (already) {
      already.stacks = Math.min(5, (already.stacks || 1) + (status.stacks || 1))
      already.duration = status.duration
      return existing
    }
    existing.push({ ...status, stacks: status.stacks || 1 })
    this.statuses.set(playerId, existing)
    return existing
  }

  removeStatus(playerId, type) {
    const existing = this.statuses.get(playerId) || []
    const next = existing.filter(s => s.type !== type)
    this.statuses.set(playerId, next)
    return next
  }

  tickTurn(playerId) {
    const existing = this.statuses.get(playerId) || []
    const next = []
    for (const s of existing) {
      if (s.durationTurns) {
        s.durationTurns -= 1
        if (s.durationTurns > 0) next.push(s)
      } else {
        next.push(s)
      }
    }
    this.statuses.set(playerId, next)
    return next
  }

  tickTime(playerId) {
    const existing = this.statuses.get(playerId) || []
    const next = []
    for (const s of existing) {
      if (s.durationMinutes) {
        s.durationMinutes -= 1
        if (s.durationMinutes > 0) next.push(s)
      } else {
        next.push(s)
      }
    }
    this.statuses.set(playerId, next)
    return next
  }

  getStatuses(playerId) {
    return this.statuses.get(playerId) || []
  }

  hasStatus(playerId, type) {
    return (this.statuses.get(playerId) || []).some(s => s.type === type)
  }

  clearBattleStatuses(playerId) {
    const existing = this.statuses.get(playerId) || []
    const next = existing.filter(s => !s.clearedOnBattleEnd)
    this.statuses.set(playerId, next)
    return next
  }

  clearAll(playerId) {
    this.statuses.delete(playerId)
  }
}

export const STATUSES = {
  bleed: {
    type: "bleed",
    label: "Bleeding",
    emoji: "🩸",
    durationMinutes: 15,
    stacks: 5,
    clearedOnBattleEnd: false,
    effect: (target) => {
      target.health = Math.max(0, target.health - 5)
    }
  },
  poison: {
    type: "poison",
    label: "Poison",
    emoji: "☠️",
    durationTurns: 6,
    stacks: 1,
    clearedOnBattleEnd: true,
    effect: (target) => {
      const loss = Math.floor(target.maxHealth * 0.02)
      target.health = Math.max(0, target.health - loss)
    }
  },
  burn: {
    type: "burn",
    label: "Burn",
    emoji: "🔥",
    durationTurns: 5,
    stacks: 1,
    clearedOnBattleEnd: true,
    effect: (target) => {
      target.health = Math.max(0, Math.floor(target.health * 0.97))
    }
  },
  freeze: {
    type: "freeze",
    label: "Freeze",
    emoji: "❄️",
    durationTurns: 1,
    stacks: 1,
    clearedOnBattleEnd: true
  },
  stun: {
    type: "stun",
    label: "Stun",
    emoji: "💥",
    durationTurns: 1,
    stacks: 1,
    clearedOnBattleEnd: true
  },
  paralysis: {
    type: "paralysis",
    label: "Paralysis",
    emoji: "⚡",
    durationTurns: 4,
    stacks: 1,
    clearedOnBattleEnd: true
  },
  fear: {
    type: "fear",
    label: "Fear",
    emoji: "😨",
    durationTurns: 3,
    stacks: 1,
    clearedOnBattleEnd: true
  },
  curseSeal: {
    type: "curseSeal",
    label: "Curse Seal",
    emoji: "⛓️",
    durationTurns: 5,
    stacks: 1,
    clearedOnBattleEnd: true
  }
}

export const globalStatusEngine = new StatusEngine()
