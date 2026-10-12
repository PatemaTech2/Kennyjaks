/**
 * Enhanced Damage Calculation Engine for KennyJaks Battle System
 * 
 * Features:
 * - Level scaling (+5% damage per level advantage)
 * - Equipment scaling (+15% per weapon stat)
 * - Technique control scaling (up to +50%)
 * - Momentum-based multipliers
 * - Defense resistance calculation
 * - Status effect bonuses
 * - Domain expansion boost
 * 
 * Replaces the basic damage calculation in BattleEngine.js
 */

export class EnhancedDamageCalculationEngine {
  /**
   * Calculate base damage with multiple scaling factors
   * @param {Object} attacker - Attacking player/curse
   * @param {Object} defender - Defending player/curse
   * @param {Object} state - Battle state
   * @param {Object} options - Action options
   * @returns {number} Final calculated damage
   */
  static calculateBaseDamage(attacker, defender, state = {}, options = {}) {
    const {
      actionType = "basic",
      baseMultiplier = 1.0,
      isCrit = false,
      isBlackFlash = false,
      momentum = 50,
      isHeavyAttack = false
    } = options

    // ===== BASE POWER FROM STATS =====
    const attackPower = attacker.rawStrength || 10

    // ===== LEVEL SCALING =====
    // +5% damage per level advantage, -5% per level disadvantage
    const attackerLevel = attacker.level || 1
    const defenderLevel = defender.level || 1
    const levelDifference = Math.max(-20, Math.min(20, attackerLevel - defenderLevel))
    const levelMultiplier = 1 + (levelDifference * 0.05)

    // ===== EQUIPMENT SCALING =====
    const weaponBonus = this.getEquipmentBonus(attacker, 'weapon')
    const equipMultiplier = 1 + (weaponBonus * 0.15) // +15% per stat point from weapon
    
    // Armor durability affects damage (worn out weapons do less damage)
    const durabilityPenalty = this.getDurabilityPenalty(attacker)

    // ===== TECHNIQUE CONTROL SCALING =====
    // Technique control 0-100: adds 0% to 50% damage
    const techniqueControl = Math.min(100, attacker.techniqueControl || 0)
    const techniqueMultiplier = 1 + (techniqueControl * 0.005)

    // ===== DEFENSE REDUCTION =====
    // Defense reduces damage, but can't reduce below 0.2x
    const defenseValue = defender.rawDefense || 10
    const defensePower = Math.min(0.8, defenseValue / (attackPower + 5))

    // ===== COMPOSE BASE DAMAGE =====
    let baseDamage = attackPower * baseMultiplier
    baseDamage = baseDamage * levelMultiplier
    baseDamage = baseDamage * equipMultiplier
    baseDamage = baseDamage * durabilityPenalty
    baseDamage = baseDamage * techniqueMultiplier
    baseDamage = baseDamage * (1 - defensePower)

    // ===== CRITICAL HIT SCALING =====
    if (isCrit) {
      // Crit damage: base 1.8x + luck scaling (1% per luck point)
      const critMultiplier = 1.8 + ((attacker.luck || 10) * 0.01)
      baseDamage = baseDamage * critMultiplier
    }

    // ===== MOMENTUM SCALING =====
    const momentumDamageBonus = this.getMomentumDamageBonus(momentum)
    baseDamage = baseDamage * momentumDamageBonus

    // ===== BLACK FLASH AMPLIFICATION =====
    if (isBlackFlash) {
      baseDamage = baseDamage * 2.5
    }

    // ===== HEAVY ATTACK BONUS =====
    if (isHeavyAttack) {
      baseDamage = baseDamage * 1.6
    }

    // ===== STATUS EFFECT BONUSES =====
    baseDamage = baseDamage * this.getStatusEffectMultiplier(attacker)

    // ===== DOMAIN EXPANSION BOOST =====
    if (attacker.domainActive) {
      baseDamage = baseDamage * 1.25
    }

    // ===== MINIMUM DAMAGE =====
    return Math.max(1, Math.floor(baseDamage))
  }

  /**
   * Get equipment bonus from weapon/armor
   * @param {Object} player
   * @param {string} slot - 'weapon', 'armor', 'accessory'
   * @returns {number} Total equipment bonus
   */
  static getEquipmentBonus(player, slot) {
    const equipped = player.equippedItems?.[slot]
    if (!equipped) return 0

    const baseBonus = equipped.attack || equipped.stats?.attack || 0
    const durability = equipped.durability || 100
    const durabilityStat = Math.max(0.3, durability / 100) // Min 30% effective

    return baseBonus * durabilityStat
  }

  /**
   * Calculate durability penalty for worn equipment
   * @param {Object} player
   * @returns {number} Durability penalty multiplier
   */
  static getDurabilityPenalty(player) {
    const weapon = player.equippedItems?.weapon
    if (!weapon) return 1.0

    const durability = weapon.durability || 100
    // Below 30% durability: significant penalty
    if (durability < 30) return 0.7
    if (durability < 50) return 0.85
    if (durability < 70) return 0.95
    return 1.0
  }

  /**
   * Calculate momentum-based damage multiplier
   * @param {number} momentum - Current momentum (0-100)
   * @returns {number} Damage multiplier
   */
  static getMomentumDamageBonus(momentum) {
    // Momentum 0 = 0.6x damage (losing badly)
    // Momentum 50 = 1.0x damage (neutral)
    // Momentum 100 = 1.4x damage (dominating)
    const normalized = (momentum - 50) / 50
    return 1 + (normalized * 0.2)
  }

  /**
   * Get multiplier from active status effects
   * @param {Object} player
   * @returns {number} Status effect multiplier
   */
  static getStatusEffectMultiplier(player) {
    let multiplier = 1.0

    for (const effect of player.statusEffects || []) {
      if (effect.type === "berserk") {
        multiplier *= 1.3 // +30% damage while berserk
      }
      if (effect.type === "power_surge") {
        multiplier *= (1 + (effect.amount || 0) * 0.01)
      }
      if (effect.type === "weak") {
        multiplier *= 0.7 // -30% damage while weak
      }
      if (effect.type === "focused") {
        multiplier *= 1.15 // +15% damage while focused
      }
    }

    return multiplier
  }

  /**
   * Apply defense calculations to damage
   * @param {number} damage
   * @param {Object} attacker
   * @param {Object} defender
   * @returns {number} Damage after defense
   */
  static applyDefense(damage, attacker, defender) {
    const defenseValue = defender.rawDefense || 10
    const attackerPower = attacker.rawStrength || 10
    
    // Defense calculation: each defense point reduces damage by 2%
    const defenseReduction = Math.min(0.7, defenseValue * 0.02)
    
    return Math.floor(damage * (1 - defenseReduction))
  }

  /**
   * Check if action can be afforded energetically
   * @param {Object} player
   * @param {string} actionType
   * @param {Object} params
   * @returns {Object} {canAfford, cost, shortBy, message}
   */
  static canAffordAction(player, actionType, params = {}) {
    const cost = this.getActionEnergyCost(player, actionType, params)
    const currentCE = player.cursedEnergy || 0

    return {
      canAfford: currentCE >= cost,
      cost,
      shortBy: Math.max(0, cost - currentCE),
      message: currentCE >= cost 
        ? `✅ Costs ${cost} CE`
        : `❌ Costs ${cost} CE (need ${cost - currentCE} more)`
    }
  }

  /**
   * Get energy cost for an action (before multipliers)
   * @param {Object} player
   * @param {string} actionType
   * @param {Object} params
   * @returns {number} Energy cost
   */
  static getActionEnergyCost(player, actionType, params = {}) {
    const baseCosts = {
      "attack": 10,
      "heavy_attack": 25,
      "skill": 40,
      "weapon": 20,
      "domain": 300,
      "rct": 50,
      "rct-burst": 200,
      "rct-slow": 100,
      "reverse": 80,
      "block": 5,
      "dodge": 15,
      "counter": 30,
      "taunt": 0,
      "meditation": 0 // Meditation costs nothing but takes a turn
    }

    let cost = baseCosts[actionType] || 0

    // ===== SCALE BY CURRENT CE (DESPERATION FACTOR) =====
    const maxCE = player.maxCursedEnergy || 100
    const currentCE = player.cursedEnergy || 0
    const cePercent = currentCE / maxCE

    // Low CE warning: costs increase when desperate
    if (cePercent < 0.2) {
      cost = Math.floor(cost * 1.3) // 30% more expensive
    } else if (cePercent < 0.4) {
      cost = Math.floor(cost * 1.15) // 15% more expensive
    }

    // ===== TRAINING REDUCES COST =====
    // Each training level reduces skill cost by 5% (max 40%)
    if (params.skillName && player.technique?.trainingProgress?.[params.skillName]) {
      const trainLevel = player.technique.trainingProgress[params.skillName]
      const costReduction = Math.min(0.4, trainLevel * 0.05)
      cost = Math.floor(cost * (1 - costReduction))
    }

    // ===== MOMENTUM AFFECTS COST =====
    // High momentum = slightly cheaper (adrenaline rush)
    const momentum = params.momentum || 50
    const momentumReduction = (momentum - 50) / 250
    cost = Math.floor(cost * (1 - momentumReduction * 0.1)) // Max 10% reduction

    return Math.max(1, cost)
  }

  /**
   * Calculate combo multiplier based on consecutive hits
   * @param {number} comboCount - Number of hits in combo
   * @returns {number} Damage multiplier
   */
  static getComboMultiplier(comboCount) {
    if (comboCount <= 1) return 1.0
    
    // Formula: 1 + (combo count * 0.15)
    // ×2 combo = 1.15x
    // ×3 combo = 1.3x
    // ×5 combo = 1.6x (milestone)
    // ×10 combo = 2.5x (cap)
    return Math.min(2.5, 1 + (comboCount * 0.15))
  }

  /**
   * Determine if this is a critical hit
   * @param {Object} attacker
   * @returns {boolean}
   */
  static shouldCrit(attacker) {
    const baseCritChance = 10 // 10% base
    const luckBonus = (attacker.luck || 10) * 0.5 // 0.5% per luck
    const totalChance = baseCritChance + luckBonus

    return Math.random() * 100 < totalChance
  }

  /**
   * Determine if Black Flash triggers (very rare, high-skill moment)
   * @param {Object} attacker
   * @param {Object} state
   * @returns {boolean}
   */
  static shouldTriggerBlackFlash(attacker, state = {}) {
    // Base 2% chance
    let chance = 2

    // Technique control adds up to 3%
    const techniqueControl = Math.min(100, attacker.techniqueControl || 0)
    chance += (techniqueControl / 100) * 3

    // Momentum advantage adds up to 2%
    const momentum = state.momentum || 50
    if (momentum > 65) {
      chance += ((momentum - 65) / 35) * 2
    }

    return Math.random() * 100 < chance
  }

  /**
   * Get battle phase based on HP percentages
   * @param {Object} actor
   * @param {Object} defender
   * @returns {string} Phase name
   */
  static determineBattlePhase(actor, defender) {
    const actorHpPercent = actor.currentHp / actor.maxHp
    const defenderHpPercent = defender.currentHp / defender.maxHp

    if (actorHpPercent < 0.2 || defenderHpPercent < 0.2) {
      return "CRITICAL"
    }
    if (actorHpPercent < 0.5 || defenderHpPercent < 0.5) {
      return "DESPERATE"
    }
    if (actorHpPercent > 0.8 && defenderHpPercent > 0.8) {
      return "OPENING"
    }
    return "NEUTRAL"
  }

  /**
   * Get phase-based damage multiplier
   * @param {string} phase - Battle phase
   * @returns {number} Damage multiplier for the phase
   */
  static getPhaseMultiplier(phase) {
    const phaseMultipliers = {
      "OPENING": 0.9,    // Early game: safer, less damage
      "NEUTRAL": 1.0,    // Balanced phase
      "DESPERATE": 1.2,  // Risky phase: higher damage
      "CRITICAL": 1.4    // Last-resort phase: maximum damage
    }
    return phaseMultipliers[phase] || 1.0
  }

  /**
   * Get effectiveness of attack type vs defense type
   * @param {string} attackType - Type of attack
   * @param {string} defenseType - Type of defense
   * @returns {number} Effectiveness multiplier
   */
  static getEffectiveness(attackType, defenseType) {
    const effectiveness = {
      "physical": {
        "physical": 1.0,
        "cursed_technique": 0.8,
        "rct": 1.2,
        "domain": 0.9
      },
      "cursed_technique": {
        "physical": 1.2,
        "cursed_technique": 1.0,
        "rct": 0.7,
        "domain": 1.1
      },
      "rct": {
        "physical": 0.8,
        "cursed_technique": 1.2,
        "rct": 1.0,
        "domain": 1.3
      },
      "domain": {
        "physical": 1.1,
        "cursed_technique": 0.9,
        "rct": 0.7,
        "domain": 1.0
      }
    }
    return effectiveness[attackType]?.[defenseType] ?? 1.0
  }

  /**
   * Calculate total damage with ALL multipliers applied
   * @param {Object} attacker
   * @param {Object} defender
   * @param {Object} state
   * @param {Object} actionOptions
   * @returns {number} Final damage
   */
  static calculateFinalDamage(attacker, defender, state, actionOptions = {}) {
    const baseDamage = this.calculateBaseDamage(attacker, defender, state, actionOptions)
    
    // Apply additional multipliers in order
    let finalDamage = baseDamage

    // Combo multiplier
    if (actionOptions.comboCount) {
      const comboMult = this.getComboMultiplier(actionOptions.comboCount)
      finalDamage = finalDamage * comboMult
    }

    // Phase multiplier
    if (actionOptions.phase) {
      const phaseMult = this.getPhaseMultiplier(actionOptions.phase)
      finalDamage = finalDamage * phaseMult
    }

    // Type effectiveness
    if (actionOptions.attackType && actionOptions.defenseType) {
      const effectiveness = this.getEffectiveness(actionOptions.attackType, actionOptions.defenseType)
      finalDamage = finalDamage * effectiveness
    }

    return Math.max(1, Math.floor(finalDamage))
  }
}

// Export singleton instance for convenience
export const damageEngine = new EnhancedDamageCalculationEngine()
