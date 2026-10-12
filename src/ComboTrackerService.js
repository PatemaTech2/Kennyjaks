/**
 * Combo Tracker Service for KennyJaks Battle System
 * 
 * Tracks consecutive hits and provides:
 * - Combo count multipliers (1.15x → 1.6x damage)
 * - Milestone celebrations (×3, ×5, ×7, ×10)
 * - Combo breaking on defense
 * - Damage bonuses at breakpoints
 * 
 * Integrates with BattleEngine.resolveAttackAction()
 */

export class ComboTrackerService {
  constructor() {
    // Map of playerId -> combo state
    this.combos = new Map()
    
    // Global milestones for narrative
    this.milestones = [3, 5, 7, 10, 15, 20]
  }

  /**
   * Record a successful hit
   * @param {string} playerId
   * @param {number} damage
   * @param {string} hitType - "basic", "heavy", "skill", "weapon"
   * @returns {Object} Combo info
   */
  recordHit(playerId, damage, hitType = "basic") {
    const now = Date.now()
    const COMBO_TIMEOUT = 8000 // 8 seconds to continue combo

    let combo = this.combos.get(playerId)

    if (!combo || (now - combo.lastHitTime > COMBO_TIMEOUT)) {
      // Start new combo
      combo = {
        playerId,
        count: 1,
        lastHitTime: now,
        totalDamage: damage,
        hits: [hitType],
        startTime: now,
        currentMultiplier: 1.0,
        damageBonus: 0,
        isActive: true,
        milestoneReached: null
      }
    } else {
      // Continue combo
      combo.count += 1
      combo.hits.push(hitType)
      combo.totalDamage += damage
      combo.lastHitTime = now

      // Calculate multiplier: +15% per hit, cap at 2.5x
      const newMultiplier = Math.min(2.5, 1 + combo.count * 0.15)
      combo.currentMultiplier = newMultiplier

      // Check for milestones
      const milestone = this.getMilestoneInfo(combo.count)
      if (milestone) {
        combo.milestoneReached = milestone
        combo.damageBonus = milestone.bonus
      }
    }

    this.combos.set(playerId, combo)

    return {
      isNewCombo: combo.count === 1,
      isCombo: combo.count > 1,
      comboCount: combo.count,
      damageMultiplier: combo.currentMultiplier,
      totalDamage: combo.totalDamage,
      milestone: combo.milestoneReached,
      narrative: this.buildNarrative(combo)
    }
  }

  /**
   * Get milestone information at certain combo counts
   * @param {number} count
   * @returns {Object|null}
   */
  getMilestoneInfo(count) {
    const milestoneData = {
      3: {
        text: "COMBO ×3",
        description: "You're building momentum!",
        bonus: 1.2, // 20% damage bonus
        emoji: "🔥"
      },
      5: {
        text: "COMBO ×5",
        description: "DOUBLE DAMAGE BONUS!",
        bonus: 1.5, // 50% damage bonus
        emoji: "⚡"
      },
      7: {
        text: "COMBO ×7",
        description: "INCREDIBLE RUSH!",
        bonus: 1.8, // 80% damage bonus
        emoji: "💥"
      },
      10: {
        text: "COMBO ×10",
        description: "LEGENDARY ONSLAUGHT!",
        bonus: 2.2, // 120% damage bonus
        emoji: "✨"
      },
      15: {
        text: "COMBO ×15",
        description: "GODLIKE PERFORMANCE!",
        bonus: 2.5, // 150% damage bonus
        emoji: "👑"
      },
      20: {
        text: "COMBO ×20",
        description: "UNBEATABLE WARRIOR!",
        bonus: 3.0, // 200% damage bonus (cap)
        emoji: "🌟"
      }
    }

    return milestoneData[count] || null
  }

  /**
   * Break the combo (when defending, dodging, or taking damage)
   * @param {string} playerId
   * @returns {Object} Broken combo info
   */
  breakCombo(playerId) {
    const combo = this.combos.get(playerId)
    
    if (!combo || combo.count <= 1) {
      return { wasBroken: false, comboCount: 0 }
    }

    const comboCount = combo.count
    const totalDamage = combo.totalDamage

    // Remove combo
    this.combos.delete(playerId)

    return {
      wasBroken: true,
      comboCount,
      totalDamage,
      narrative: `Combo broken after ${comboCount} consecutive hits (${totalDamage} total damage)!`
    }
  }

  /**
   * Get current combo state
   * @param {string} playerId
   * @returns {Object|null}
   */
  getCombo(playerId) {
    return this.combos.get(playerId) || null
  }

  /**
   * Reset combo (for end of battle)
   * @param {string} playerId
   */
  resetCombo(playerId) {
    this.combos.delete(playerId)
  }

  /**
   * Reset all combos
   */
  resetAll() {
    this.combos.clear()
  }

  /**
   * Apply combo multiplier to damage
   * @param {number} baseDamage
   * @param {string} playerId
   * @returns {Object} {finalDamage, multiplier}
   */
  applyComboMultiplier(baseDamage, playerId) {
    const combo = this.combos.get(playerId)
    
    if (!combo || combo.count <= 1) {
      return {
        finalDamage: baseDamage,
        multiplier: 1.0,
        comboCount: 0
      }
    }

    const multiplier = combo.currentMultiplier
    const bonusFromMilestone = combo.damageBonus > 0
    const finalDamage = Math.floor(baseDamage * multiplier)

    return {
      finalDamage,
      multiplier,
      comboCount: combo.count,
      milestone: combo.milestoneReached,
      milestoneBonus: bonusFromMilestone
    }
  }

  /**
   * Get time remaining for combo
   * @param {string} playerId
   * @returns {number} Milliseconds remaining (0 if no combo or expired)
   */
  getComboTimeRemaining(playerId) {
    const combo = this.combos.get(playerId)
    if (!combo) return 0

    const elapsed = Date.now() - combo.lastHitTime
    const remaining = Math.max(0, 8000 - elapsed)

    return remaining
  }

  /**
   * Build narrative text for combo event
   * @param {Object} combo
   * @returns {string}
   */
  buildNarrative(combo) {
    if (combo.count === 1) {
      return "" // First hit, no narrative
    }

    const hitSequence = combo.hits.slice(-3).join(" → ")
    const damage = `Total: ${combo.totalDamage} damage`
    const multiplier = `(${(combo.currentMultiplier * 100).toFixed(0)}% damage)`

    let narrative = `COMBO ×${combo.count}! ${multiplier} ${damage}\n${hitSequence}`

    if (combo.milestoneReached) {
      const milestone = combo.milestoneReached
      narrative = `\n${milestone.emoji} ${milestone.text}\n${milestone.description}\n${multiplier}`
    }

    return narrative
  }

  /**
   * Get combo statistics
   * @param {string} playerId
   * @returns {Object} Stats object
   */
  getComboStats(playerId) {
    const combo = this.combos.get(playerId)
    
    if (!combo) {
      return {
        active: false,
        count: 0,
        damage: 0,
        multiplier: 1.0
      }
    }

    const timeRemaining = this.getComboTimeRemaining(playerId)
    const isExpiring = timeRemaining < 2000 // Less than 2 seconds

    return {
      active: true,
      count: combo.count,
      totalDamage: combo.totalDamage,
      multiplier: combo.currentMultiplier,
      timeRemaining,
      isExpiring,
      lastHitType: combo.hits[combo.hits.length - 1],
      milestone: combo.milestoneReached
    }
  }

  /**
   * Generate verbose combo display for battle UI
   * @param {Object} combo
   * @returns {string} Formatted combo display
   */
  generateComboDisplay(combo) {
    if (!combo || combo.count <= 1) return ""

    // Build a simple progress indicator
    const maxLength = 20
    const filled = Math.min(combo.count, maxLength)
    const progressBar = "█".repeat(filled) + "░".repeat(maxLength - filled)

    let display = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔥 COMBO COUNTER 🔥
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Count: ×${combo.count}
Multiplier: ${(combo.currentMultiplier * 100).toFixed(0)}%
Total Damage: ${combo.totalDamage}
Progress: ${progressBar}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`

    if (combo.milestoneReached) {
      display += `

${combo.milestoneReached.emoji} ${combo.milestoneReached.text}
${combo.milestoneReached.description}`
    }

    return display
  }

  /**
   * Check if combo should auto-expire
   * Used during battle to check combos between actions
   * @param {string} playerId
   * @returns {boolean}
   */
  hasComboExpired(playerId) {
    const combo = this.combos.get(playerId)
    if (!combo) return false

    const elapsed = Date.now() - combo.lastHitTime
    return elapsed > 8000
  }

  /**
   * Maintenance: Clean up expired combos
   */
  cleanupExpiredCombos() {
    const now = Date.now()
    const expired = []

    for (const [playerId, combo] of this.combos.entries()) {
      if (now - combo.lastHitTime > 8000) {
        expired.push(playerId)
      }
    }

    expired.forEach(playerId => this.combos.delete(playerId))
    return expired.length
  }
}

// Export singleton instance
export const globalComboTracker = new ComboTrackerService()

/**
 * Integration Example for BattleEngine.js:
 * 
 * In resolveAttackAction():
 * 
 *   const comboInfo = globalComboTracker.recordHit(actor.id, damage, "attack")
 *   const finalDamage = comboInfo.finalDamage || damage
 *   
 *   if (comboInfo.isCombo) {
 *     events.push(`COMBO ×${comboInfo.comboCount}!`)
 *     if (comboInfo.milestone) {
 *       events.push(`🔥 ${comboInfo.milestone.text}`)
 *     }
 *   }
 *   
 *   if (defenderAction.type === "block" || defenderAction.type === "dodge") {
 *     globalComboTracker.breakCombo(actor.id)
 *     events.push(`Combo broken!`)
 *   }
 * 
 * At end of battle:
 *   globalComboTracker.resetAll()
 */
