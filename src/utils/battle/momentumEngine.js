export class MomentumEngine {
  constructor() {
    this.momentum = 50
  }

  gainMomentum(reason, amount) {
    const gains = {
      attack_hit: 2,
      critical_hit: 5,
      status_removed: 3,
      block: 4,
      dodge: 8,
      first_blood: 10,
      kill_confirmed: 15
    }

    const gain = gains[reason] || amount || 2
    this.momentum = Math.min(100, this.momentum + gain)
    return this.momentum
  }

  loseMomentum(reason, amount) {
    const losses = {
      damaged: 3,
      skill_miss: 5,
      cc_applied: 7,
      critical_taken: 6,
      low_health: 10
    }

    const loss = losses[reason] || amount || 3
    this.momentum = Math.max(0, this.momentum - loss)
    return this.momentum
  }

  getBonus() {
    if (this.momentum === 50) return { damage: 1.0, crit: 0 }

    const diff = this.momentum - 50
    const damageBonus = 1.0 + (diff / 10) * 0.05
    const critBonus = (diff / 10) * 0.02

    return {
      damage: damageBonus,
      crit: Math.max(0, critBonus)
    }
  }

  getDisplay() {
    const filled = Math.round(this.momentum / 5)
    const empty = 20 - filled
    const bar = "🟥".repeat(filled) + "⬜".repeat(empty)

    let status = ""
    if (this.momentum > 70) status = "⚡ PEAK CONDITION"
    else if (this.momentum > 60) status = "💪 Strong"
    else if (this.momentum > 50) status = "😊 Confident"
    else if (this.momentum === 50) status = "😐 Neutral"
    else if (this.momentum > 40) status = "😰 Wavering"
    else if (this.momentum > 20) status = "😨 Desperate"
    else status = "💀 CRITICAL"

    return { bar, status, value: this.momentum }
  }

  reset() {
    this.momentum = 50
  }
}
