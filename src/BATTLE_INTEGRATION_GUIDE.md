# Battle System Integration Guide

## Quick Start: How to Add Better Battles to KennyJaks

This guide shows exactly where to put the new code and what to change.

---

## ✅ Step 1: Add Enhanced Damage Calculation (30 min)

### Copy the new file:
```bash
cp EnhancedDamageCalculationEngine.js src/services/battle/
```

### Update: `src/services/battle/BattleEngine.js`

**Replace the old damage calculation with the new one.**

**OLD CODE (Lines ~400-450)**:
```javascript
function calculateBaseDamage(actor, defender, state) {
  const attack = actor.rawStrength || 10
  const defense = defender.rawDefense || 10
  const defenseFactor = Math.min(0.8, defense / (attack + 5))
  let damage = attack * (1 - defenseFactor)
  return Math.floor(damage)
}
```

**NEW CODE**:
```javascript
import { EnhancedDamageCalculationEngine } from "./DamageCalculationEngine.js"

// Keep old function for backwards compatibility, but new attacks use this:
function calculateBaseDamage(actor, defender, state, options = {}) {
  return EnhancedDamageCalculationEngine.calculateBaseDamage(
    actor,
    defender,
    state,
    {
      actionType: options.actionType || "basic",
      baseMultiplier: options.multiplier || 1.0,
      momentum: state.momentum || 50,
      ...options
    }
  )
}
```

### Update: `resolveAttackAction()` (Line 744)

**BEFORE**:
```javascript
function resolveAttackAction(actor, defender, actorAction, defenderAction, state, events, logs) {
  const damage = calculateBaseDamage(actor, defender, state)
  events.push(`${actor.name} attacks!`)
  
  if (defenderAction.type === "block") {
    const reduced = Math.floor(damage * 0.4)
    defender.currentHp = Math.max(0, defender.currentHp - reduced)
    // ... rest of code
  }
}
```

**AFTER**:
```javascript
function resolveAttackAction(actor, defender, actorAction, defenderAction, state, events, logs) {
  const isCrit = rollCritical(actor)
  const damage = calculateBaseDamage(actor, defender, state, {
    baseMultiplier: 1.0,
    isCrit: isCrit,
    isBlackFlash: false
  })
  
  events.push(`${actor.name} attacks!`)
  
  if (defenderAction.type === "block") {
    const reduced = Math.floor(damage * 0.4)
    defender.currentHp = Math.max(0, defender.currentHp - reduced)
    events.push(`${defender.name} blocks. -${reduced} HP`)
    // ... rest
  }
  // Add more scaling at the hit (see resolveHeavyAttackAction for pattern)
}
```

### Test it:
```bash
# Start a battle and check that damage scales with level
/battlecurse
/battack
# Verify: Level difference should cause ~5% damage difference per level
```

---

## ✅ Step 2: Add Combo System (45 min)

### Copy the new file:
```bash
cp ComboTrackerService.js src/services/battle/
```

### Update: `src/services/battle/BattleEngine.js` (top of file)

```javascript
import { globalComboTracker } from "./ComboTrackerService.js"
```

### Update: `resolveAttackAction()` in BattleEngine.js

**Add after damage is calculated but before applying to defender**:

```javascript
function resolveAttackAction(actor, defender, actorAction, defenderAction, state, events, logs) {
  let momentumDelta = 0
  let blackFlash = false
  let peakMoment = null

  const damage = calculateBaseDamage(actor, defender, state)
  events.push(`${actor.name} attacks!`)

  // ===== NEW: RECORD COMBO HIT =====
  const comboData = globalComboTracker.recordHit(actor.id, damage, "attack")
  let finalDamage = damage

  if (comboData.isCombo) {
    events.push(`COMBO ×${comboData.comboCount}! (${(comboData.damageMultiplier * 100).toFixed(0)}% damage)`)
    finalDamage = Math.floor(damage * comboData.damageMultiplier)
    
    if (comboData.milestone) {
      events.push(`🔥 ${comboData.milestone.text} - ${comboData.milestone.description}`)
      // Milestone bonus damage
      finalDamage = Math.floor(finalDamage * comboData.milestone.bonus)
    }
  }
  // ===== END NEW CODE =====

  if (defenderAction.type === "block") {
    const reduced = Math.floor(finalDamage * 0.4)  // Use finalDamage instead of damage
    defender.currentHp = Math.max(0, defender.currentHp - reduced)
    events.push(`${defender.name} blocks. -${reduced} HP`)
    momentumDelta += 2
    logs.push({ type: "attack_blocked", actor: actor.id, defender: defender.id, damage: reduced })
    
    // Break combo on successful defense
    globalComboTracker.breakCombo(actor.id)
    
    return { events, logs, momentumDelta, blackFlash, peakMoment }
  }

  if (defenderAction.type === "dodge") {
    const dodgeChance = calculateDodgeChance(defender, actor, state)
    if (randomInt(1, 100) <= dodgeChance) {
      events.push(`${defender.name} dodges smoothly!`)
      momentumDelta -= 4
      
      // Break combo on successful dodge
      globalComboTracker.breakCombo(actor.id)
      
      logs.push({ type: "dodge", defender: defender.id })
      return { events, logs, momentumDelta, blackFlash, peakMoment }
    }
    defender.currentHp = Math.max(0, defender.currentHp - finalDamage)  // Use finalDamage
    events.push(`${defender.name} takes ${finalDamage} damage!`)
  } else {
    const crit = rollCritical(actor)
    let hitDamage = finalDamage
    if (crit) {
      hitDamage = Math.floor(finalDamage * 2)
      events.push(`CRITICAL HIT!`)
      momentumDelta += 8
    }
    hitDamage = applyDefense(hitDamage, actor, defender)
    hitDamage = Math.max(1, hitDamage)
    defender.currentHp = Math.max(0, defender.currentHp - hitDamage)
    events.push(`${defender.name} takes ${hitDamage} damage!`)
    logs.push({ type: "attack_hit", actor: actor.id, defender: defender.id, damage: hitDamage, crit, combo: comboData.comboCount })
  }
  momentumDelta += 4
  return { events, logs, momentumDelta, blackFlash, peakMoment }
}
```

### Reset combos at end of battle

**In BattleEngine.js `resolveRound()`, after battle ends**:
```javascript
if (finished) {
  state.status = "finished"
  
  // Reset combo trackers
  globalComboTracker.resetCombo(actor.id)
  globalComboTracker.resetCombo(defender.id)
  
  if (winnerId) {
    LegendaryBattlesService.recordIfLegendary(state, winnerId, loserId)
  }
}
```

### Test it:
```bash
/battlecurse
/battack
/battack
/battack  # Should see "COMBO ×3" on third hit
/battack
/battack  # Should see "COMBO ×5 - DOUBLE DAMAGE BONUS"
/bblock   # Should break combo
```

---

## ✅ Step 3: Add Energy Management (30 min)

### Create: `src/services/battle/EnergyManagementService.js`

```javascript
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
      "taunt": 0,
      "meditation": 0
    }

    let cost = baseMap[actionType] || 0

    // Scale by low CE (desperation factor)
    const maxCE = actor.maxCursedEnergy || 100
    const currentCE = actor.cursedEnergy || 0
    const cePercent = currentCE / maxCE

    if (cePercent < 0.2) {
      cost = Math.floor(cost * 1.3) // 30% more when desperate
    } else if (cePercent < 0.4) {
      cost = Math.floor(cost * 1.15) // 15% more when low
    }

    return Math.max(1, cost)
  }

  static canAffordAction(actor, actionType, params = {}) {
    const cost = this.getActionCost(actionType, actor, params)
    return {
      canAfford: actor.cursedEnergy >= cost,
      cost,
      shortBy: Math.max(0, cost - actor.cursedEnergy)
    }
  }

  static regenerateCE(actor, roundNumber) {
    const intellBase = (actor.rawTechnique || 10) * 0.3
    const progressionBonus = actor.level * 0.5
    const regenerationAmount = Math.floor(intellBase + progressionBonus)

    return Math.min(
      actor.maxCursedEnergy,
      actor.cursedEnergy + regenerationAmount
    )
  }
}

export const energyManager = new EnergyManagementService()
```

### Update action submission in BattleEngine.js

**In `submitAction()` method**:
```javascript
import { EnergyManagementService } from "./EnergyManagementService.js"

submitAction(participantId, actionType, params = {}) {
  const id = String(participantId)
  const state = this.state
  const participant = state.participants.get(id)
  
  // Check energy cost
  const energyCheck = EnergyManagementService.canAffordAction(participant, actionType, params)
  if (!energyCheck.canAfford) {
    return {
      success: false,
      error: `Insufficient cursed energy. Need ${energyCheck.cost}, have ${participant.cursedEnergy}.`
    }
  }

  const action = {
    participantId: id,
    type: actionType,
    params,
    timestamp: Date.now(),
    energyCost: energyCheck.cost
  }

  state.pendingActions.set(id, action)
  state.actions.push(action)

  return { success: true }
}
```

### Deduct energy and regenerate each round

**In `resolveRound()`**:
```javascript
async resolveRound() {
  const state = this.state
  state.round++

  const actions = Array.from(state.pendingActions.values())
  
  // AFTER resolving all actions:
  
  // Deduct CE costs
  for (const action of actions) {
    const participant = state.participants.get(String(action.participantId))
    if (participant && action.energyCost) {
      participant.cursedEnergy = Math.max(0, participant.cursedEnergy - action.energyCost)
    }
  }

  // Regenerate CE for next round
  for (const participant of state.participants.values()) {
    participant.cursedEnergy = EnergyManagementService.regenerateCE(participant, state.round)
  }

  state.pendingActions.clear()
  
  // ... rest of resolution ...
}
```

### Test it:
```bash
/battlecurse
# Keep using skills until you have low CE
# Next skill should cost 30% more (desperation factor)
```

---

## 🎯 Summary of Changes

| Component | File | Change | Time |
|-----------|------|--------|------|
| Damage Calc | `BattleEngine.js` | Replace calculateBaseDamage() | 10 min |
| Damage Calc | New file | Copy `EnhancedDamageCalculationEngine.js` | 5 min |
| Combos | `BattleEngine.js` | Update resolveAttackAction() | 20 min |
| Combos | New file | Copy `ComboTrackerService.js` | 5 min |
| Energy | `BattleEngine.js` | Update submitAction() & resolveRound() | 15 min |
| Energy | New file | Create `EnergyManagementService.js` | 10 min |
| **TOTAL** | | | **65 minutes** |

---

## 📊 What Gets Better

### Before:
- Every player does similar damage regardless of level
- Attacks are random, no strategy
- CE costs flat, no resource management
- Battle is identical from start to finish

### After:
- Level scaling: +5% damage per level advantage
- Combo system: Up to 60% damage bonus for consistent offense
- Energy scarcity: Forces decisions (spend CE or play safe?)
- Dynamic difficulty: Phase multipliers change tactics
- Satisfaction: Reaching combo milestones feels GOOD

---

## 🔧 Troubleshooting

### Problem: "EnhancedDamageCalculationEngine is not defined"
**Solution**: Make sure import is at top of BattleEngine.js:
```javascript
import { EnhancedDamageCalculationEngine } from "./DamageCalculationEngine.js"
```

### Problem: Combos not resetting between battles
**Solution**: Add this before battle ends:
```javascript
globalComboTracker.resetAll()
```

### Problem: Damage seems too high/low
**Solution**: Check the calculation order in `calculateFinalDamage()`. All multipliers stack:
- Base damage × Level × Equipment × Technique × Defense
- Result × Combo × Phase × Effectiveness

Adjust the multiplier values if too extreme.

### Problem: CE regeneration not working
**Solution**: Make sure `regenerateCE()` is called in `resolveRound()` AFTER deducting costs:
```javascript
// Deduct first
participant.cursedEnergy -= cost
// Then regenerate
participant.cursedEnergy = energyManager.regenerateCE(participant, round)
```

---

## 🚀 Next Steps

1. **Test thoroughly** - Play multiple battles, check damage scaling
2. **Tune multipliers** - Adjust if battles feel too easy/hard
3. **Add visual feedback** - Integrate with battle card UI
4. **Balance late-game** - Ensure high-level players don't one-shot

See `BATTLE_SYSTEM_IMPROVEMENTS.md` for more features you can add later.
