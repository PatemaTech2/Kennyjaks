# KennyJaks Battle System - Comprehensive Improvements

## Current State Analysis

Your battle system has solid foundations:
- ✅ BattleEngine with round-based resolution
- ✅ Multiple action types (attack, heavy, skill, domain, rct)
- ✅ Black Flash mechanic
- ✅ Domain expansion clashes
- ✅ Status effects (bleed, poison, burn, etc)

**But it lacks:**
- ❌ Strategic depth and resource management
- ❌ Combo/momentum reward systems
- ❌ Tactical positioning or range
- ❌ Equipment scaling in damage calculation
- ❌ Dynamic battle phases
- ❌ Complex stat interactions
- ❌ Risk/reward decision making

---

## 🎯 TIER 1: IMMEDIATE IMPROVEMENTS (High Impact, Quick Wins)

### 1. Enhanced Damage Calculation System

**Current Problem**: Damage is too uniform. A level 1 and level 100 player with same stats deal similar damage.

**Current Code**:
```javascript
const damage = calculateBaseDamage(actor, defender, state)
```

**Improved Implementation**:
```javascript
// src/services/battle/DamageCalculationEngine.js
export class DamageCalculationEngine {
  static calculateBaseDamage(attacker, defender, state, options = {}) {
    const {
      actionType = "basic",
      multiplier = 1.0,
      isCrit = false,
      isBlackFlash = false
    } = options

    // ===== STAT SCALING =====
    const attackPower = attacker.rawStrength || 10
    const defenseReducation = Math.min(
      0.8,
      (defender.rawDefense || 10) / (attacker.rawStrength + 5)
    )

    // ===== LEVEL SCALING =====
    const attackerLevel = attacker.level || 1
    const defenderLevel = defender.level || 1
    const levelDifference = Math.max(-20, Math.min(20, attackerLevel - defenderLevel))
    const levelMultiplier = 1 + (levelDifference * 0.05) // +5% per level advantage

    // ===== EQUIPMENT SCALING =====
    const weaponBonus = this.getEquipmentBonus(attacker, 'weapon')
    const equipMultiplier = 1 + (weaponBonus * 0.15) // +15% per weapon bonus point

    // ===== TECHNIQUE CONTROL SCALING =====
    const techniqueControl = Math.min(100, attacker.techniqueControl || 0)
    const techniqueMultiplier = 1 + (techniqueControl * 0.005) // Up to +50% from technique control

    // ===== COMPOSE FINAL DAMAGE =====
    let baseDamage = attackPower * multiplier
    baseDamage = baseDamage * levelMultiplier
    baseDamage = baseDamage * equipMultiplier
    baseDamage = baseDamage * techniqueMultiplier
    baseDamage = baseDamage * (1 - defenseReducation)

    // ===== CRITICAL HIT =====
    if (isCrit) {
      baseDamage = baseDamage * (1.8 + (attacker.luck || 10) * 0.01)
    }

    // ===== BLACK FLASH =====
    if (isBlackFlash) {
      baseDamage = baseDamage * 2.5
    }

    // ===== STATUS BONUSES =====
    for (const effect of attacker.statusEffects || []) {
      if (effect.type === "berserk") baseDamage *= 1.3
      if (effect.type === "power_surge") baseDamage *= (1 + effect.amount * 0.01)
    }

    // ===== DOMAIN EXPANSION BOOST =====
    if (attacker.domainActive) {
      baseDamage *= 1.25
    }

    return Math.max(1, Math.floor(baseDamage))
  }

  static getEquipmentBonus(player, slot) {
    const equipped = player.equippedItems?.[slot]
    if (!equipped) return 0
    
    const baseBonus = equipped.attack || equipped.stats?.attack || 0
    const durability = equipped.durability || 100
    const durabilityStat = Math.max(0.3, durability / 100)
    
    return baseBonus * durabilityStat
  }

  // NEW: Momentum-based damage multiplier
  static getMomentumDamageBonus(attackerMomentum, defenderMomentum) {
    const momentumDiff = (attackerMomentum - defenderMomentum) / 50
    // At +50 momentum advantage: 1.4x damage
    // At -50 momentum disadvantage: 0.7x damage
    return Math.max(0.5, 1 + (momentumDiff * 0.2))
  }
}
```

**Usage in BattleEngine**:
```javascript
import { DamageCalculationEngine } from "./DamageCalculationEngine.js"

function resolveAttackAction(actor, defender, actorAction, defenderAction, state, events, logs) {
  const isCrit = rollCritical(actor)
  const isBlackFlash = rollBlackFlash(actor, state)
  
  // Apply momentum scaling
  const momentumBonus = DamageCalculationEngine.getMomentumDamageBonus(
    state.momentum,
    100 - state.momentum
  )

  const damage = DamageCalculationEngine.calculateBaseDamage(
    actor,
    defender,
    state,
    {
      actionType: "basic",
      multiplier: momentumBonus,
      isCrit,
      isBlackFlash
    }
  )

  // ... rest of resolution ...
}
```

**Impact**: 
- Damage now scales with level (5% per level)
- Equipment matters (15% boost per stat point)
- Technique control rewards practice (50% max from control)
- Momentum creates advantage snowballing

---

### 2. Combo System (Rewarding Consecutive Hits)

**Current Problem**: No reason to chain attacks or build tactics. Each attack is isolated.

**New Implementation**:
```javascript
// src/services/battle/ComboTracker.js
export class ComboTracker {
  constructor() {
    this.combos = new Map() // playerId -> { count, lastHitTime, totalDamage, hits[] }
  }

  recordHit(playerId, damage, hitDescription) {
    const combo = this.combos.get(playerId) || {
      count: 0,
      lastHitTime: 0,
      totalDamage: 0,
      hits: [],
      currentMultiplier: 1.0
    }

    const timeSinceLastHit = Date.now() - combo.lastHitTime
    const COMBO_TIMEOUT = 8000 // 8 seconds to continue combo

    if (timeSinceLastHit > COMBO_TIMEOUT) {
      // Combo broken, reset
      combo.count = 1
      combo.hits = [hitDescription]
      combo.totalDamage = damage
      combo.currentMultiplier = 1.0
    } else {
      // Continue combo
      combo.count += 1
      combo.hits.push(hitDescription)
      combo.totalDamage += damage
      // Multiplier increases: 1x → 1.15x → 1.3x → 1.45x → 1.6x (cap at 5)
      combo.currentMultiplier = Math.min(1.6, 1 + combo.count * 0.15)
    }

    combo.lastHitTime = Date.now()
    this.combos.set(playerId, combo)

    return {
      isCombo: combo.count > 1,
      comboCount: combo.count,
      damageMultiplier: combo.currentMultiplier,
      milestone: this.getMilestone(combo.count)
    }
  }

  getMilestone(count) {
    if (count === 3) return "COMBO ×3"
    if (count === 5) return "COMBO ×5 - DOUBLE DAMAGE BONUS"
    if (count === 7) return "COMBO ×7 - INCREDIBLE!"
    if (count === 10) return "COMBO ×10 - LEGENDARY ONSLAUGHT!"
    return null
  }

  breakCombo(playerId) {
    this.combos.delete(playerId)
  }

  getCombo(playerId) {
    return this.combos.get(playerId) || null
  }
}

export const globalComboTracker = new ComboTracker()
```

**Updated resolveAttackAction**:
```javascript
function resolveAttackAction(actor, defender, actorAction, defenderAction, state, events, logs) {
  const isCrit = rollCritical(actor)
  const baseDamage = DamageCalculationEngine.calculateBaseDamage(actor, defender, state, {
    isCrit,
    isBlackFlash: false
  })

  // NEW: Apply combo multiplier
  const comboData = globalComboTracker.recordHit(actor.id, baseDamage, "attack")
  let finalDamage = Math.floor(baseDamage * comboData.damageMultiplier)

  if (comboData.isCombo) {
    events.push(`COMBO ×${comboData.comboCount}! (${(comboData.damageMultiplier * 100).toFixed(0)}% damage)`)
    if (comboData.milestone) {
      events.push(`🔥 ${comboData.milestone}`)
      if (comboData.comboCount === 5) finalDamage *= 1.5 // Bonus at milestones
    }
  } else {
    // Opponent breaks combo by defending
    if (defenderAction.type === "block" || defenderAction.type === "dodge") {
      globalComboTracker.breakCombo(actor.id)
      events.push(`Combo broken!`)
    }
  }

  defender.currentHp = Math.max(0, defender.currentHp - finalDamage)
  events.push(`${defender.name} takes ${finalDamage} damage!`)
  logs.push({ type: "attack_hit", actor: actor.id, defender: defender.id, damage: finalDamage, combo: comboData.comboCount })

  return { events, logs, momentumDelta: 4, blackFlash: false, peakMoment: null }
}
```

**Impact**:
- Reward players for consistent offense
- Up to +60% damage from combos
- Strategy: Should you risk extending combo or defend?
- Milestones give satisfying feedback at ×3, ×5, ×7, ×10

---

### 3. Energy Management System

**Current Problem**: CE costs are flat. No resource management strategy.

**Enhanced System**:
```javascript
// src/services/battle/EnergyManagementService.js
export class EnergyManagementService {
  static getActionCost(actionType, actor, params = {}) {
    const baseMap = {
      "attack": 10,
      "heavy_attack": 25,
      "skill": 40,
      "weapon": 20,
      "domain": 300,
      "rct": 50,
      "reverse": 80,
      "block": 5,
      "dodge": 15,
      "counter": 30,
      "taunt": 0
    }

    let cost = baseMap[actionType] || 0

    // ===== SCALE BY DIFFICULTY =====
    const difficultyScalar = this.getDifficultyScalar(actor)
    cost = Math.floor(cost * difficultyScalar)

    // ===== SKILL TRAINING REDUCES COST =====
    if (params.skillName) {
      const trainLevel = actor.technique?.trainingProgress?.[params.skillName] || 0
      const costReduction = Math.min(0.4, trainLevel * 0.05) // Up to 40% reduction
      cost = Math.floor(cost * (1 - costReduction))
    }

    // ===== MOMENTUM AFFECTS COST =====
    // High momentum = lower costs (adrenaline)
    const momentumReduction = (params.momentum || 50) / 250
    cost = Math.floor(cost * (1 - momentumReduction * 0.2))

    return Math.max(1, cost)
  }

  static getDifficultyScalar(actor) {
    const maxCe = actor.maxCursedEnergy || 100
    const currentCe = actor.cursedEnergy || 0
    
    // Low CE warning: costs increase as CE depletes
    if (currentCe < maxCe * 0.2) {
      return 1.3 // 30% more expensive when desperate
    }
    if (currentCe < maxCe * 0.4) {
      return 1.15 // 15% more expensive
    }
    return 1.0
  }

  static canAffordAction(actor, actionType, params) {
    const cost = this.getActionCost(actionType, actor, params)
    return {
      canAfford: actor.cursedEnergy >= cost,
      cost,
      shortBy: Math.max(0, cost - actor.cursedEnergy)
    }
  }

  // NEW: CE regeneration between rounds based on intelligence
  static regenerateCE(actor, roundNumber) {
    const intellBase = (actor.rawTechnique || 10) * 0.3
    const progressionBonus = actor.level * 0.5
    const regenerationAmount = Math.floor(intellBase + progressionBonus)

    return Math.min(
      actor.maxCursedEnergy,
      actor.cursedEnergy + regenerationAmount
    )
  }

  // NEW: Meditation action (skip turn to recover 40% CE + heal)
  static executeMeditation(actor) {
    const ceRecovery = Math.floor(actor.maxCursedEnergy * 0.4)
    const hpRecovery = Math.floor(actor.maxHp * 0.15)

    actor.cursedEnergy = Math.min(actor.maxCursedEnergy, actor.cursedEnergy + ceRecovery)
    actor.currentHp = Math.min(actor.maxHp, actor.currentHp + hpRecovery)

    return {
      ceRecovered: ceRecovery,
      hpRecovered: hpRecovery,
      narration: `${actor.name} takes a deep breath and meditates, recovering cursed energy and vitality.`
    }
  }
}
```

**Usage**:
```javascript
// Player tries to use a skill
const skillCost = EnergyManagementService.getActionCost(
  "skill",
  player,
  { skillName: "Convergence", momentum: state.momentum }
)

const affordability = EnergyManagementService.canAffordAction(
  player,
  "skill",
  { skillName: "Convergence" }
)

if (!affordability.canAfford) {
  return {
    error: `❌ Insufficient cursed energy.\n\nNeed: ${affordability.cost}\nHave: ${player.cursedEnergy}\nShort by: ${affordability.shortBy}`
  }
}

// After each round, regenerate CE based on intelligence stat
player.cursedEnergy = EnergyManagementService.regenerateCE(player, round)
```

**Impact**:
- Resource management becomes critical
- Intelligence stat becomes valuable
- Training skills reduces costs (rewards progression)
- Low CE = higher costs (risk/reward)
- Meditation action gives players recovery option

---

## 🎯 TIER 2: TACTICAL DEPTH (Medium Impact, 2-4 hours)

### 4. Battle Phases & Strategy Shifts

**Concept**: Battle changes as HP/CE deplete, forcing strategy changes.

```javascript
// src/services/battle/BattlePhaseManager.js
export class BattlePhaseManager {
  static determinePhase(actor, defender) {
    const actorHpPercent = actor.currentHp / actor.maxHp
    const defenderHpPercent = defender.currentHp / defender.maxHp

    if (actorHpPercent < 0.2 || defenderHpPercent < 0.2) {
      return "CRITICAL" // Last resort moves available
    }
    if (actorHpPercent < 0.5 || defenderHpPercent < 0.5) {
      return "DESPERATE" // Risky high-damage moves available
    }
    if (actorHpPercent > 0.8 && defenderHpPercent > 0.8) {
      return "OPENING" // More careful, feel-out phase
    }
    return "NEUTRAL"
  }

  static getPhaseModifiers(phase) {
    const modifiers = {
      "OPENING": {
        damageMultiplier: 0.9,
        defensiveBonus: 1.1,
        critChance: 0.05,
        energyCostMultiplier: 1.2 // Harder to spam expensive moves
      },
      "NEUTRAL": {
        damageMultiplier: 1.0,
        defensiveBonus: 1.0,
        critChance: 0.10,
        energyCostMultiplier: 1.0
      },
      "DESPERATE": {
        damageMultiplier: 1.2,
        defensiveBonus: 0.85,
        critChance: 0.15,
        energyCostMultiplier: 0.8 // Cheaper moves when desperate
      },
      "CRITICAL": {
        damageMultiplier: 1.4,
        defensiveBonus: 0.7,
        critChance: 0.25,
        energyCostMultiplier: 0.6 // Desperate moves are cheap
      }
    }
    return modifiers[phase] || modifiers["NEUTRAL"]
  }

  static getPhaseActions(phase) {
    const actions = {
      "OPENING": ["attack", "heavy_attack", "block", "dodge", "taunt"],
      "NEUTRAL": ["attack", "heavy_attack", "skill", "weapon", "block", "dodge", "counter", "rct"],
      "DESPERATE": ["heavy_attack", "skill", "domain", "reverse", "rct-burst"],
      "CRITICAL": ["reverse", "domain", "rct-burst", "binding-vow"] // High-risk moves
    }
    return actions[phase] || []
  }
}
```

**Effect**: 
- Early game: Safer, teaching phase
- Mid game: Open to all tactics
- Late game: High risk/high reward moves
- Creates natural battle arc

---

### 5. Advanced Guard System (Block → Parry → Counter)

**Current**: Block just reduces damage by 40%.

**Improved**:
```javascript
export class GuardSystem {
  static resolveBlock(defender, attacker, damage, state) {
    const blockTiming = this.calculateBlockTiming(defender, attacker, state)
    
    if (blockTiming === "PERFECT") {
      // Perfect parry - completely negate and gain momentum
      return {
        damageBlocked: damage,
        feedback: `${defender.name} PERFECT PARRY! ${attacker.name}'s attack is deflected!`,
        momentumGain: 15,
        counterAvailable: true
      }
    } else if (blockTiming === "GOOD") {
      // Good block - 50% reduction
      return {
        damageBlocked: Math.floor(damage * 0.5),
        feedback: `${defender.name} blocks effectively!`,
        momentumGain: 5,
        counterAvailable: true
      }
    } else {
      // Normal block - 40% reduction
      return {
        damageBlocked: Math.floor(damage * 0.4),
        feedback: `${defender.name} blocks the attack.`,
        momentumGain: 2,
        counterAvailable: false
      }
    }
  }

  static calculateBlockTiming(defender, attacker, state) {
    const defenderReflexes = (defender.rawSpeed || 10) / 10
    const attackerAttackSpeed = (attacker.rawSpeed || 10) / 10
    const speedDifference = defenderReflexes - attackerAttackSpeed

    // Add small randomness (simulation of player timing)
    const randomTiming = Math.random() * 100

    if (randomTiming < 20 + (speedDifference * 5)) {
      return "PERFECT" // 20% chance + speed bonus
    } else if (randomTiming < 60 + (speedDifference * 10)) {
      return "GOOD" // 40% chance + speed bonus
    }
    return "NORMAL"
  }
}
```

---

### 6. Weakness & Effectiveness System

**Current**: No type advantage system.

**New**:
```javascript
export const EFFECTIVENESS_CHART = {
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

export function getAttackEffectiveness(attacker, defender) {
  const attackType = attacker.techniqueType || "physical"
  const defenderType = defender.techniqueType || "physical"
  
  return EFFECTIVENESS_CHART[attackType]?.[defenderType] || 1.0
}
```

**Impact**: Players learn to switch tactics based on opponent type.

---

## 🎯 TIER 3: VISUAL & UX IMPROVEMENTS (3-5 hours)

### 7. Battle Card with Visual Health Bars & Momentum

**Current**: Text-based output only.

**Enhanced BattleScreenCard**:
```javascript
import { createCanvas } from "canvas"

export class EnhancedBattleScreenCard {
  async render(player, opponent, round, battle, narrative) {
    const canvas = createCanvas(400, 600)
    const ctx = canvas.getContext('2d')

    // Background
    ctx.fillStyle = '#1a1a2e'
    ctx.fillRect(0, 0, 400, 600)

    // Player info (top left)
    this.drawPlayerCard(ctx, player, 20, 20, "left")
    
    // Opponent info (top right)
    this.drawPlayerCard(ctx, opponent, 220, 20, "right")

    // Central battle area with momentum gauge
    this.drawBattlefield(ctx, battle.state?.momentum || 50)

    // Round counter and action log
    this.drawRoundInfo(ctx, round, narrative)

    // Action buttons (visual indication)
    this.drawActionButtons(ctx, player)

    return canvas.toBuffer('image/png')
  }

  drawPlayerCard(ctx, player, x, y, align) {
    const width = 170
    const height = 150

    // Card background
    ctx.fillStyle = '#2d2d44'
    ctx.fillRect(x, y, width, height)
    ctx.strokeStyle = '#0099ff'
    ctx.lineWidth = 2
    ctx.strokeRect(x, y, width, height)

    // Name
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 16px Arial'
    ctx.textAlign = align === "left" ? 'left' : 'right'
    ctx.fillText(player.name, x + (align === "left" ? 10 : width - 10), y + 30)

    // Level
    ctx.font = '12px Arial'
    ctx.fillStyle = '#aaaaaa'
    ctx.fillText(`Lv. ${player.level}`, x + (align === "left" ? 10 : width - 10), y + 48)

    // HP Bar
    this.drawBar(ctx, x + 10, y + 65, 150, 16, player.currentHp, player.maxHp, '#ff3333')
    ctx.fillStyle = '#ffffff'
    ctx.font = '10px Arial'
    ctx.fillText(`${player.currentHp}/${player.maxHp}`, x + 70, y + 77)

    // CE Bar
    this.drawBar(ctx, x + 10, y + 95, 150, 12, player.cursedEnergy, player.maxCursedEnergy, '#0099ff')
    ctx.fillText(`CE: ${Math.floor(player.cursedEnergy)}/${player.maxCursedEnergy}`, x + 10, y + 112)

    // Status effects
    this.drawStatusEffects(ctx, player, x + 10, y + 125)
  }

  drawBar(ctx, x, y, width, height, current, max, color) {
    // Background
    ctx.fillStyle = '#333333'
    ctx.fillRect(x, y, width, height)

    // Fill
    const percent = Math.max(0, Math.min(1, current / max))
    ctx.fillStyle = color
    ctx.fillRect(x, y, width * percent, height)

    // Border
    ctx.strokeStyle = color
    ctx.lineWidth = 1
    ctx.strokeRect(x, y, width, height)
  }

  drawBattlefield(ctx, momentum) {
    // Central area with momentum gauge
    const centerX = 200
    const centerY = 320
    
    // Momentum bar (showing who has advantage)
    ctx.fillStyle = '#444444'
    ctx.fillRect(50, centerY + 40, 300, 20)

    const momentumPercent = momentum / 100
    if (momentumPercent < 0.5) {
      // Player advantage (left)
      ctx.fillStyle = '#00ff00'
      ctx.fillRect(50, centerY + 40, 150 * (1 - momentumPercent * 2), 20)
    } else {
      // Opponent advantage (right)
      ctx.fillStyle = '#ff3333'
      ctx.fillRect(200 + 150 * ((1 - momentumPercent) * 2), centerY + 40, 300 - (200 + 150 * ((1 - momentumPercent) * 2)), 20)
    }

    // Momentum text
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 12px Arial'
    ctx.textAlign = 'center'
    ctx.fillText(`Momentum: ${momentum}`, centerX, centerY + 55)
  }

  drawStatusEffects(ctx, player, x, y) {
    const effects = (player.statusEffects || []).slice(0, 3)
    ctx.font = '9px Arial'
    ctx.fillStyle = '#ffcc00'
    
    effects.forEach((effect, i) => {
      ctx.fillText(effect.type.toUpperCase(), x + i * 40, y)
    })
  }

  drawRoundInfo(ctx, round, narrative) {
    ctx.fillStyle = '#ffffff'
    ctx.font = '14px Arial'
    ctx.textAlign = 'left'
    ctx.fillText(`Round ${round}`, 20, 500)

    // Narrative text (truncated)
    ctx.font = '12px Arial'
    ctx.fillStyle = '#cccccc'
    const lines = narrative.split('\n').slice(0, 3)
    lines.forEach((line, i) => {
      ctx.fillText(line.substring(0, 50), 20, 530 + i * 20)
    })
  }

  drawActionButtons(ctx, player) {
    const buttons = [
      { label: "/battack", x: 30, y: 560 },
      { label: "/btq1", x: 120, y: 560 },
      { label: "/bblock", x: 210, y: 560 },
      { label: "/bflee", x: 300, y: 560 }
    ]

    ctx.font = '10px Arial'
    ctx.fillStyle = '#0099ff'
    
    buttons.forEach(btn => {
      ctx.fillText(btn.label, btn.x, btn.y)
    })
  }
}
```

---

## 📊 Implementation Priority & Timeline

### Day 1 (Quick Wins - 2 hours)
1. ✅ Enhanced damage calculation (1 hour)
2. ✅ Combo system (45 min)
3. ✅ Energy management basics (15 min)

### Day 2-3 (Core Features - 4-6 hours)
4. ✅ Battle phases (1.5 hours)
5. ✅ Advanced guard system (1.5 hours)
6. ✅ Effectiveness chart (30 min)
7. ✅ Test & balance (1-2 hours)

### Week 2 (Polish - 3-5 hours)
8. ✅ Enhanced battle card visuals (2 hours)
9. ✅ Additional status effects (1 hour)
10. ✅ Bind vow system enhancements (1-2 hours)

---

## 🧪 Testing Checklist

After each implementation:

```bash
# Test damage scaling
- Level 1 vs Level 50: Should do ~2.5x more damage
- With 100 technique control: Should do +50% more damage
- Weapon equipped: Should do +15% per point

# Test combos
- 3 hits: Should see "COMBO ×3"
- 5 hits: Should see "DOUBLE DAMAGE BONUS"
- 10 hits: Should see "LEGENDARY ONSLAUGHT"
- After block: Combo should reset

# Test energy management
- Using skill at 20% CE should cost 30% more
- Meditation should recover 40% CE + 15% HP
- Heavy attack should cost 25 CE base

# Test battle phases
- Below 20% HP: Reverse and domain cost 40% less
- Above 80% HP: Block provides +10% defense
- At 50% HP: Full ability set available

# Test guard system
- Perfect parry: +15 momentum, completely negate damage
- Good block: 50% reduction
- Normal block: 40% reduction
```

---

## 🎮 Example: Full Battle Sequence with Improvements

**Round 1 Opening**:
```
Player (Lv 50, Full HP/CE) vs Curse (Lv 40, Full HP/CE)
Phase: OPENING
Damage multiplier: 0.9x (feel-out phase)

Player chooses: /battack
→ 25 damage (reduced by phase)
→ Combo ×1
→ +4 momentum (now at 54)

Curse chooses: /battack
→ 20 damage
→ +4 momentum (now at 50)
```

**Round 5 (Mid-Battle)**:
```
Player (Lv 50, 70% HP, 80% CE) vs Curse (Lv 40, 50% HP, 60% CE)
Phase: NEUTRAL
Momentum: 65 (player advantage)

Player chooses: /btq1 (Technique skill, costs 30 CE after training)
→ Base damage: 45
→ Combo ×5 bonus: 45 * 1.75 = 79 damage (MILESTONE!)
→ Momentum bonus: 79 * 1.1 = 87 damage final
→ Curse HP: 50% → 35%
→ +10 momentum (now at 75)

Curse chooses: Meditation (skip turn)
→ Recovers 60% CE + 15% HP
→ CE: 60% → 90%
→ HP: 35% → 42%
→ "Curse centers itself..."
```

**Round 8 (Late Battle)**:
```
Player (Lv 50, 30% HP, 40% CE) vs Curse (Lv 40, 25% HP, 20% CE)
Phase: DESPERATE
Damage multiplier: 1.2x
Energy costs: 0.8x multiplier

Player chooses: /domain (Domain costs 300 normally, now 240)
→ Domain expansion activated
→ +25% damage next turn
→ Player HP: 30% → 28%
→ +10 momentum (at 80+)

Curse chooses: /reverse (Reverse Cursed Technique)
→ Costs 80 * 0.8 = 64 CE (desperate phase discount)
→ Damage: 150 * 1.2 (phase) * 1.3 (desperation) = 234 damage
→ But Player domain is active! Takes 234 * 0.75 = 175.5 damage
→ Player HP: 28% → 18%
→ Battle near end, one more round decides it
```

---

## Summary

These improvements create a **skill-based, tactical battle system** where:
- ✅ **Positioning matters** (distance, phase)
- ✅ **Resource management required** (CE economy)
- ✅ **Rewarding offense** (combo system)
- ✅ **Tactical defense** (blocking tiers)
- ✅ **Dynamic difficulty** (phases, effectiveness)
- ✅ **Visual feedback** (enhanced cards, momentum)
- ✅ **High skill ceiling** (binding vows, timing)

Players will plan 3-4 moves ahead instead of spamming attack. 🎮

