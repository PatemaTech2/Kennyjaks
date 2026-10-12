import { randomInt } from "../../utils/generator.js"
import { globalStatusEngine } from "./StatusEngine.js"
import { BlackFlashService } from "./BlackFlashService.js"
import { LegendaryBattlesService } from "./LegendaryBattlesService.js"
import { BATTLE_PHASE } from "./BattleStateService.js"
import { calculateDamage } from "../../utils/battle/damageCalculator.js"

const engines = new Map()

export class BattleEngine {
  init(battleId, mode = "NORMAL") {
    const id = String(battleId)
    const existing = engines.get(id)
    if (existing && existing.status === "active") {
      this.state = existing
      return existing
    }

    const state = {
      battleId: id,
      mode,
      status: "active",
      round: 0,
      phase: BATTLE_PHASE.OPENING,
      participants: new Map(),
      pendingActions: new Map(),
      actions: [],
      log: [],
      finished: false,
      winnerId: null,
      loserId: null,
      momentum: 50,
      domainClash: null,
      blackFlashTriggered: false,
      peakMoment: null,
      lastEvents: [],
      startTime: Date.now(),
      battleRecord: null,
      combo: {},
      streaks: {}
    }

    engines.set(id, state)
    this.state = state
    return state
  }

  registerParticipant(participant) {
    if (!participant || !participant.id) return
    const id = String(participant.id)
    const existing = this.state.participants.get(id)
    const base = {
      id,
      name: participant.name || "Unknown",
      teamId: participant.teamId || "A",
      maxHp: participant.maxHp || 100,
      currentHp: participant.currentHp ?? participant.hp ?? participant.maxHp ?? 100,
      maxCe: participant.maxCe ?? participant.maxCursedEnergy ?? 150,
      currentCe: participant.currentCe ?? participant.cursedEnergy ?? 0,
      rawStrength: participant.rawStrength ?? participant.attack ?? 10,
      rawDefense: participant.rawDefense ?? participant.defense ?? 10,
      rawSpeed: participant.rawSpeed ?? participant.speed ?? 10,
      rawTechnique: participant.rawTechnique ?? participant.technique ?? 10,
      techniqueControl: participant.techniqueControl ?? 0,
      gradeValue: participant.gradeValue ?? 4,
      potential: participant.potential ?? 0,
      critRate: participant.critRate ?? 0,
      luck: participant.luck ?? 10,
      technique: participant.technique ?? null,
      hasDomain: participant.hasDomain ?? false,
      domainCeCost: participant.domainCeCost ?? 300,
      domainActive: participant.domainActive ?? false,
      domainRounds: participant.domainRounds ?? 0,
      bossAbilities: participant.bossAbilities ?? null,
      isBoss: participant.isBoss ?? false,
      isCurse: participant.isCurse ?? false,
      isPet: participant.isPet ?? false,
      statusEffects: participant.statusEffects ?? [],
      defending: participant.defending ?? false,
      cooldowns: participant.cooldowns ?? {},
      equippedItems: participant.equippedItems ?? {}
    }

    const merged = existing ? { ...existing, ...base } : base
    this.state.participants.set(id, merged)
  }

  submitAction(participantId, actionType, params = {}) {
    const id = String(participantId)
    const state = this.state
    if (state.status !== "active") {
      return { success: false, error: "Battle is not active." }
    }
    if (state.finished) {
      return { success: false, error: "Battle has ended." }
    }
    const participant = state.participants.get(id)
    if (!participant) {
      return { success: false, error: "Participant not found." }
    }

    const action = {
      participantId: id,
      type: actionType,
      params,
      timestamp: Date.now()
    }

    state.pendingActions.set(id, action)
    state.actions.push(action)

    return { success: true }
  }

  async resolveRound() {
    const state = this.state
    if (!state || state.status !== "active") {
      return { finished: false, narration: "No active battle.", events: [], participants: [] }
    }

    state.round++

    if (state.round >= 20) {
      state.momentum = Math.min(100, state.momentum + 5)
      state.lastEvents.push("🔥 The battlefield erupts with unleashed cursed energy!")
    }

    const actions = Array.from(state.pendingActions.values())
    state.pendingActions.clear()

    if (actions.length === 0) {
      return {
        finished: false,
        narration: "No actions this round.",
        events: [],
        participants: Array.from(state.participants.values()),
        winnerId: null,
        loserId: null,
        battlefield: null,
        pressure: null
      }
    }

    const participantMap = new Map()
    for (const p of state.participants.values()) {
      participantMap.set(String(p.id), p)
    }

    const actors = actions.map(a => ({
      action: a,
      participant: participantMap.get(String(a.participantId))
    })).filter(o => o.participant)

    if (actors.length < 2) {
      const solo = actors[0]
      if (solo) {
        const opponentId = Array.from(state.participants.keys()).find(id => id !== solo.participant.id)
        if (opponentId) {
          const opponent = state.participants.get(opponentId)
          if (opponent) {
            const defaultAction = { participantId: opponentId, type: "attack", params: {}, timestamp: Date.now() }
            actors.push({ action: defaultAction, participant: opponent })
            state.actions.push(defaultAction)
          }
        }
      }
    }

    const events = []
    const logs = []
    let finished = false
    let winnerId = null
    let loserId = null
    let blackFlash = false
    let peakMoment = null

    const initiativeOrder = calculateInitiative(actors)
    const processed = new Set()

    for (const entry of initiativeOrder) {
      if (processed.has(entry.action.participantId)) continue
      const opponentEntry = initiativeOrder.find(e => e.action.participantId !== entry.action.participantId && !processed.has(e.action.participantId))
      if (!opponentEntry) continue

      processed.add(entry.action.participantId)
      processed.add(opponentEntry.participant.id)

      const actor = entry.participant
      const defender = opponentEntry.participant
      const actorAction = entry.action
      const defenderAction = opponentEntry.action

      const resolution = resolveExchange(actor, defender, actorAction, defenderAction, state)
      events.push(...resolution.events)
      logs.push(...resolution.logs)
      if (resolution.blackFlash) {
        blackFlash = true
        state.blackFlashTriggered = true
      }
      if (resolution.peakMoment && !peakMoment) {
        peakMoment = resolution.peakMoment
      }

      applyStatusTicks(actor, state)
      applyStatusTicks(defender, state)

      if (actor.currentHp <= 0) {
        finished = true
        winnerId = defender.id
        loserId = actor.id
        break
      }
      if (defender.currentHp <= 0) {
        finished = true
        winnerId = actor.id
        loserId = defender.id
        break
      }
    }

    for (const p of state.participants.values()) {
      if (p.defending) p.defending = false
    }

    state.finished = finished
    state.winnerId = winnerId
    state.loserId = loserId
    state.lastEvents = events
    state.blackFlashTriggered = blackFlash
    state.peakMoment = peakMoment
    state.log.push(...logs)

    const narration = buildNarration(events, logs, state)

    if (finished) {
      state.status = "finished"
      if (winnerId) {
        LegendaryBattlesService.recordIfLegendary(state, winnerId, loserId)
      }
    }

    return {
      finished,
      winnerId,
      loserId,
      narration,
      events,
      participants: Array.from(state.participants.values()),
      blackFlash,
      peakMoment,
      battlefield: null,
      pressure: null
    }
  }

  getParticipant(id) {
    return this.state?.participants.get(String(id)) || null
  }

  getState() {
    return this.state
  }

  remove() {
    if (this.state) {
      this.state.status = "removed"
    }
  }

  get initialized() { return this.state ? (this.state.status === "active" || this.state.status === "finished") : false }
  get battleId() { return this.state?.battleId }
  get participants() { return this.state?.participants }
  get pendingActions() { return this.state?.pendingActions }
  get actionLocked() { return this.state?.pendingActions.size >= 2 }
  get locked() { return this.state?.pendingActions.size >= 2 }
}

function trackCombo(state, participantId, actionType) {
  if (!state.combo) state.combo = {}
  const combo = state.combo[participantId] || { count: 0, lastAction: null, timestamp: 0 }
  const now = Date.now()
  if (combo.lastAction === actionType && now - combo.timestamp < 15000) {
    combo.count++
  } else {
    combo.count = 1
  }
  combo.lastAction = actionType
  combo.timestamp = now
  state.combo[participantId] = combo
  return combo.count
}

function getComboBonus(participantId, state) {
  const combo = state.combo?.[participantId]
  if (!combo || combo.count < 3) return null
  const label = combo.count >= 6 ? "UNSTOPPABLE" : combo.count >= 4 ? "ON FIRE" : "COMBO"
  const bonus = combo.count >= 6 ? 0.5 : combo.count >= 5 ? 0.4 : combo.count >= 4 ? 0.3 : combo.count >= 3 ? 0.2 : 0
  return { count: combo.count, label, bonus }
}

function resetCombo(state, participantId) {
  if (!state.combo) return
  state.combo[participantId] = { count: 0, lastAction: null, timestamp: 0 }
}

function calculateInitiative(actors) {
  const withRolls = actors.map(entry => {
    const speed = entry.participant.rawSpeed || entry.participant.speed || 10
    const roll = randomInt(1, 20)
    const total = speed + roll
    return { ...entry, total }
  })
  withRolls.sort((a, b) => b.total - a.total)
  return withRolls
}

function resolveExchange(actor, defender, actorAction, defenderAction, state) {
  const events = []
  const logs = []
  let momentumDelta = 0
  let blackFlash = false
  let peakMoment = null

  const actionType = actorAction.type
  const defenderType = defenderAction.type

  const offensiveActions = ["attack", "heavy_attack", "skill", "weapon", "reverse", "domain", "rct"]
  const defensiveActions = ["block", "dodge", "counter"]
  const actorIsOffensive = offensiveActions.includes(actionType)
  const defenderIsOffensive = offensiveActions.includes(defenderType)

  if (!actorIsOffensive && !defenderIsOffensive) {
    if (actionType === "block") {
      actor.defending = true
      events.push(`${actor.name} takes a defensive stance.`)
      logs.push({ type: "block", actor: actor.id })
      momentumDelta += 2
    } else if (actionType === "dodge") {
      events.push(`${actor.name} shifts to evade.`)
      logs.push({ type: "dodge", actor: actor.id })
      momentumDelta += 3
    } else if (actionType === "counter") {
      events.push(`${actor.name} prepares to counter.`)
      logs.push({ type: "counter_prep", actor: actor.id })
      momentumDelta += 1
    } else if (actionType === "taunt") {
      events.push(`${actor.name} taunts ${defender.name}!`)
      logs.push({ type: "taunt", actor: actor.id })
      momentumDelta += 2
    }

    if (defenderType === "block") {
      defender.defending = true
      events.push(`${defender.name} takes a defensive stance.`)
      logs.push({ type: "block", defender: defender.id })
      momentumDelta += 2
    } else if (defenderType === "dodge") {
      events.push(`${defender.name} shifts to evade.`)
      logs.push({ type: "dodge", defender: defender.id })
      momentumDelta += 3
    } else if (defenderType === "counter") {
      events.push(`${defender.name} prepares to counter.`)
      logs.push({ type: "counter_prep", defender: defender.id })
      momentumDelta += 1
    } else if (defenderType === "taunt") {
      events.push(`${defender.name} taunts ${actor.name}!`)
      logs.push({ type: "taunt", defender: defender.id })
      momentumDelta += 2
    }

    return { events, logs, momentumDelta, blackFlash, peakMoment }
  }

  if (!actorIsOffensive && defenderIsOffensive) {
    return resolveDefenderOffensive(actor, defender, actorAction, defenderAction, state, events, logs)
  }

  if (actionType === "flee") {
    const chance = calculateFleeChance(actor, defender)
    const rolled = randomInt(1, 100) <= chance
    if (rolled) {
      actor.currentHp = 0
      events.push(`${actor.name} fled from battle!`)
      logs.push({ type: "flee", actor: actor.id, success: true })
    } else {
      events.push(`${actor.name} tried to flee but was cut off!`)
      logs.push({ type: "flee", actor: actor.id, success: false })
      momentumDelta -= 5
    }
    return { events, logs, momentumDelta, blackFlash, peakMoment }
  }

  if (actionType === "rct") {
    const healAmount = calculateRctHeal(actor)
    actor.currentHp = Math.min(actor.maxHp, actor.currentHp + healAmount)
    actor.currentCe = Math.max(0, actor.currentCe - 20)
    events.push(`${actor.name} channels Reverse Cursed Technique.`)
    events.push(`+${healAmount} HP`)
    logs.push({ type: "rct", actor: actor.id, heal: healAmount })
    momentumDelta += 5
    return { events, logs, momentumDelta, blackFlash, peakMoment }
  }

  if (actionType === "domain") {
    if (actor.domainActive) {
      events.push(`${actor.name}'s domain is already active!`)
      return { events, logs, momentumDelta, blackFlash, peakMoment }
    }
    const cost = actor.domainCeCost || 300
    if (actor.currentCe < cost) {
      events.push(`${actor.name} attempts Domain Expansion but lacks cursed energy!`)
      logs.push({ type: "domain_fail", actor: actor.id })
      momentumDelta -= 10
      return { events, logs, momentumDelta, blackFlash, peakMoment }
    }
    actor.currentCe -= cost

    if (defenderType === "domain") {
      events.push(`CLASH: ${defender.name}'s domain collides with ${actor.name}'s!`)
      const clashWinner = resolveDomainClash(actor, defender)
      if (clashWinner === actor.id) {
        events.push(`${actor.name}'s domain overwhelms ${defender.name}!`)
        defender.currentHp -= 30
        defender.domainActive = false
        momentumDelta += 15
      } else if (clashWinner === defender.id) {
        events.push(`${defender.name}'s domain shatters ${actor.name}'s!`)
        actor.currentHp -= 30
        momentumDelta -= 15
      } else {
        events.push(`Both domains cancel each other out!`)
        momentumDelta += 0
      }
      logs.push({ type: "domain_clash", actor: actor.id, defender: defender.id })
      return { events, logs, momentumDelta, blackFlash, peakMoment }
    } else {
      actor.domainActive = true
      actor.domainRounds = 3
      events.push(`DOMAIN EXPANSION: ${actor.name}'s territory swallows the battlefield!`)
      events.push(`${defender.name} is caught in the domain!`)
      const domainDmg = Math.floor((actor.rawStrength || 10) * 1.5)
      defender.currentHp = Math.max(0, defender.currentHp - domainDmg)
      logs.push({ type: "domain", actor: actor.id, damage: domainDmg })
      momentumDelta += 10
      return { events, logs, momentumDelta, blackFlash, peakMoment }
    }
  }

  if (actionType === "reverse") {
    events.push(`${actor.name} unleashes Reversed Cursed Technique!`)
    const reverseDmg = Math.floor((actor.rawStrength || 10) * 2)
    defender.currentHp = Math.max(0, defender.currentHp - reverseDmg)
    actor.currentCe = Math.max(0, actor.currentCe - 30)
    events.push(`${defender.name} is seared by reversed cursed energy!`)
    logs.push({ type: "reverse", actor: actor.id, damage: reverseDmg })
    momentumDelta += 8
    return { events, logs, momentumDelta, blackFlash, peakMoment }
  }

  if (actionType === "skill") {
    return resolveSkillAction(actor, defender, actorAction, defenderAction, state, events, logs)
  }

  if (actionType === "weapon") {
    return resolveWeaponAction(actor, defender, actorAction, defenderAction, state, events, logs)
  }

  if (actionType === "attack") {
    return resolveAttackAction(actor, defender, actorAction, defenderAction, state, events, logs)
  }

  if (actionType === "heavy_attack") {
    return resolveHeavyAttackAction(actor, defender, actorAction, defenderAction, state, events, logs)
  }

  if (actionType === "block") {
    actor.defending = true
    events.push(`${actor.name} takes a defensive stance.`)
    logs.push({ type: "block", actor: actor.id })
    momentumDelta += 2
    return { events, logs, momentumDelta, blackFlash, peakMoment }
  }

  if (actionType === "dodge") {
    events.push(`${actor.name} shifts to evade.`)
    logs.push({ type: "dodge", actor: actor.id })
    momentumDelta += 3
    return { events, logs, momentumDelta, blackFlash, peakMoment }
  }

  if (actionType === "counter") {
    events.push(`${actor.name} prepares to counter.`)
    logs.push({ type: "counter_prep", actor: actor.id })
    momentumDelta += 1
    return { events, logs, momentumDelta, blackFlash, peakMoment }
  }

  if (actionType === "taunt") {
    events.push(`${actor.name} taunts ${defender.name}!`)
    logs.push({ type: "taunt", actor: actor.id })
    momentumDelta += 2
    return { events, logs, momentumDelta, blackFlash, peakMoment }
  }

  events.push(`${actor.name} waits.`)
  logs.push({ type: "wait", actor: actor.id })
  return { events, logs, momentumDelta, blackFlash, peakMoment }
}

function resolveDefenderOffensive(actor, defender, actorAction, defenderAction, state, events, logs) {
  let momentumDelta = 0
  let blackFlash = false
  let peakMoment = null

  const defenderType = defenderAction.type

  if (actorAction.type === "block") {
    actor.defending = true
    events.push(`${actor.name} takes a defensive stance.`)
    logs.push({ type: "block", actor: actor.id })

    if (defenderType === "attack") {
      const damage = calculateBaseDamage(defender, actor, state)
      const reduced = Math.floor(damage * 0.4)
      actor.currentHp = Math.max(0, actor.currentHp - reduced)
      events.push(`${defender.name} attacks! ${actor.name} blocks. The blow still forces them back. -${reduced} HP`)
      momentumDelta += 2
      logs.push({ type: "attack_blocked", defender: defender.id, actor: actor.id, damage: reduced })
    } else if (defenderType === "heavy_attack") {
      const damage = Math.floor(calculateBaseDamage(defender, actor, state) * 1.6)
      const reduced = Math.floor(damage * 0.5)
      actor.currentHp = Math.max(0, actor.currentHp - reduced)
      events.push(`${defender.name} winds up a heavy attack! ${actor.name} blocks the heavy blow! -${reduced} HP`)
      momentumDelta += 3
      logs.push({ type: "heavy_blocked", defender: defender.id, actor: actor.id, damage: reduced })
    } else if (defenderType === "skill") {
      const damage = calculateBaseDamage(defender, actor, state)
      const reduced = Math.floor(damage * 0.4)
      actor.currentHp = Math.max(0, actor.currentHp - reduced)
      const skillName = defenderAction.params?.skillId || "Technique"
      events.push(`${defender.name} uses ${skillName}! ${actor.name} blocks! The impact still forces them back. -${reduced} HP`)
      momentumDelta += 3
      logs.push({ type: "skill_blocked", defender: defender.id, actor: actor.id, damage: reduced, skill: skillName })
    } else if (defenderType === "weapon") {
      const damage = calculateWeaponDamage(defender, actor, state)
      const reduced = Math.floor(damage * 0.4)
      actor.currentHp = Math.max(0, actor.currentHp - reduced)
      const weaponName = defender.equippedItems?.weapon?.name || "weapon"
      events.push(`${defender.name} strikes with ${weapon}! ${actor.name} blocks partially. -${reduced} HP`)
      momentumDelta += 2
      logs.push({ type: "weapon_blocked", defender: defender.id, actor: actor.id, damage: reduced })
    } else if (defenderType === "dodge") {
      events.push(`${defender.name} shifts to evade.`)
      logs.push({ type: "dodge", defender: defender.id })
      momentumDelta += 3
    } else if (defenderType === "counter") {
      events.push(`${defender.name} prepares to counter.`)
      logs.push({ type: "counter_prep", defender: defender.id })
      momentumDelta += 1
    }
    return { events, logs, momentumDelta, blackFlash, peakMoment }
  }

  if (actorAction.type === "dodge") {
    events.push(`${actor.name} shifts to evade.`)
    logs.push({ type: "dodge", actor: actor.id })

    if (defenderType === "attack" || defenderType === "heavy_attack" || defenderType === "skill" || defenderType === "weapon") {
      const dodgeChance = calculateDodgeChance(actor, defender, state)
      const bonus = defenderType === "heavy_attack" ? 15 : 0
      if (randomInt(1, 100) <= dodgeChance + bonus) {
        events.push(`${defender.name} attacks! ${actor.name} dodges smoothly!`)
        momentumDelta -= 4
        logs.push({ type: "dodge", actor: actor.id })
        return { events, logs, momentumDelta, blackFlash, peakMoment }
      }
      let damage = 0
      if (defenderType === "attack") damage = calculateBaseDamage(defender, actor, state)
      else if (defenderType === "heavy_attack") damage = Math.floor(calculateBaseDamage(defender, actor, state) * 1.6)
      else if (defenderType === "skill") damage = calculateBaseDamage(defender, actor, state)
      else if (defenderType === "weapon") damage = calculateWeaponDamage(defender, actor, state)
      actor.currentHp = Math.max(0, actor.currentHp - damage)
      events.push(`${defender.name} attacks! ${actor.name} fails to dodge! Takes ${damage} damage!`)
      momentumDelta += 4
      logs.push({ type: "dodge_failed", actor: actor.id, defender: defender.id, damage })
      return { events, logs, momentumDelta, blackFlash, peakMoment }
    }
    return { events, logs, momentumDelta, blackFlash, peakMoment }
  }

  if (actorAction.type === "counter") {
    events.push(`${actor.name} prepares to counter.`)
    logs.push({ type: "counter_prep", actor: actor.id })

    if (defenderType === "attack" || defenderType === "heavy_attack" || defenderType === "skill" || defenderType === "weapon") {
      const counterChance = calculateCounterChance(actor, defender, state)
      const bonus = defenderType === "heavy_attack" ? 10 : 0
      if (randomInt(1, 100) <= counterChance + bonus) {
        let counterDmg = calculateBaseDamage(actor, defender, state)
        if (defenderType === "heavy_attack") counterDmg = Math.floor(counterDmg * 0.9)
        else counterDmg = Math.floor(counterDmg * 0.8)
        defender.currentHp = Math.max(0, defender.currentHp - counterDmg)
        events.push(`${defender.name} attacks! ${actor.name} counters!`)
        momentumDelta -= 6
        logs.push({ type: "counter", actor: actor.id, defender: defender.id, damage: counterDmg })
        return { events, logs, momentumDelta, blackFlash, peakMoment }
      }
      let damage = 0
      if (defenderType === "attack") damage = calculateBaseDamage(defender, actor, state)
      else if (defenderType === "heavy_attack") damage = Math.floor(calculateBaseDamage(defender, actor, state) * 1.6)
      else if (defenderType === "skill") damage = calculateBaseDamage(defender, actor, state)
      else if (defenderType === "weapon") damage = calculateWeaponDamage(defender, actor, state)
      actor.currentHp = Math.max(0, actor.currentHp - damage)
      events.push(`${defender.name} attacks! ${actor.name}'s counter fails! Takes ${damage} damage!`)
      momentumDelta -= 4
      logs.push({ type: "counter_failed", actor: actor.id, defender: defender.id, damage })
      return { events, logs, momentumDelta, blackFlash, peakMoment }
    }
    return { events, logs, momentumDelta, blackFlash, peakMoment }
  }

  if (defenderType === "taunt") {
    events.push(`${defender.name} taunts ${actor.name}!`)
    logs.push({ type: "taunt", defender: defender.id })
    momentumDelta += 2
  }

  events.push(`${actor.name} waits.`)
  logs.push({ type: "wait", actor: actor.id })
  return { events, logs, momentumDelta, blackFlash, peakMoment }
}

function resolveSkillAction(actor, defender, actorAction, defenderAction, state, events, logs) {
  let momentumDelta = 0
  let blackFlash = false
  let peakMoment = null

  const skillId = actorAction.params?.skillId
  const skillIndex = actorAction.params?.skillIndex
  const vows = actorAction.params?.vows || []
  const bossAbility = actorAction.params?.bossAbility

  let damage = calculateBaseDamage(actor, defender, state)
  let skillName = skillId || "Technique"

  if (bossAbility && actor.bossAbilities && actor.bossAbilities[skillId]) {
    const ability = actor.bossAbilities[skillId]
    skillName = ability.name || skillName
    damage = Math.floor(damage * (ability.damageMult || 1.5))
    events.push(`${actor.name} uses ${skillName}!`)
  } else if (actor.technique && actor.technique.unlockedSkills && skillIndex !== undefined) {
    const skills = actor.technique.unlockedSkills
    if (skills[skillIndex]) {
      skillName = skills[skillIndex]
      const mult = getSkillMultiplier(skillName)
      damage = Math.floor(damage * mult)
      events.push(`${actor.name} uses ${skillName}!`)
    } else {
      events.push(`${actor.name} uses a technique!`)
    }
  } else {
    events.push(`${actor.name} uses ${skillName}!`)
  }

  if (vows.length > 0) {
    const vowMult = 1 + vows.length * 0.2
    damage = Math.floor(damage * vowMult)
    events.push(`Binding Vow amplifies the technique!`)
  }

  if (defenderAction.type === "block") {
    const reduced = Math.floor(damage * 0.4)
    defender.currentHp = Math.max(0, defender.currentHp - reduced)
    events.push(`${defender.name} blocks! The impact still forces them back. -${reduced} HP`)
    momentumDelta += 3
    logs.push({ type: "skill_blocked", actor: actor.id, defender: defender.id, damage: reduced, skill: skillName })
    return { events, logs, momentumDelta, blackFlash, peakMoment }
  }

  if (defenderAction.type === "dodge") {
    const dodgeChance = calculateDodgeChance(defender, actor, state)
    if (randomInt(1, 100) <= dodgeChance) {
      events.push(`${defender.name} dodges the technique!`)
      momentumDelta -= 5
      logs.push({ type: "dodge", defender: defender.id, skill: skillName })
      return { events, logs, momentumDelta, blackFlash, peakMoment }
    }
  }

  if (defenderAction.type === "counter") {
    const counterChance = calculateCounterChance(defender, actor, state)
    if (randomInt(1, 100) <= counterChance) {
      const counterDmg = calculateBaseDamage(defender, actor, state)
      actor.currentHp = Math.max(0, actor.currentHp - Math.floor(counterDmg * 0.8))
      events.push(`${defender.name} counters ${skillName}!`)
      momentumDelta -= 8
      logs.push({ type: "counter", defender: defender.id, skill: skillName })
      return { events, logs, momentumDelta, blackFlash, peakMoment }
    }
  }

  const crit = rollCritical(actor)
  let finalDmg = damage
  if (crit) {
    finalDmg = Math.floor(damage * 2)
    events.push(`CRITICAL HIT!`)
    momentumDelta += 10
  }

  const bf = rollBlackFlash(actor, state)
  if (bf) {
    finalDmg = Math.floor(finalDmg * 2.5)
    blackFlash = true
    peakMoment = "BLACK FLASH"
    events.push(`BLACK FLASH!`)
    momentumDelta += 25
  }

  finalDmg = applyDefense(finalDmg, actor, defender)
  finalDmg = Math.max(1, finalDmg)
  defender.currentHp = Math.max(0, defender.currentHp - finalDmg)
  events.push(`${defender.name} takes ${finalDmg} damage!`)
  logs.push({ type: "skill_hit", actor: actor.id, defender: defender.id, skill: skillName, damage: finalDmg, crit, blackFlash: bf })
  momentumDelta += 5

  const reciprocalActions = ["attack", "heavy_attack", "skill", "weapon", "reverse", "domain", "rct"]
  if (reciprocalActions.includes(defenderAction.type) && actor.currentHp > 0) {
    const reciprocalDmg = calculateBaseDamage(defender, actor, state)
    const reciprocalFinal = applyDefense(reciprocalDmg, defender, actor)
    const appliedReciprocal = Math.max(1, reciprocalFinal)
    actor.currentHp = Math.max(0, actor.currentHp - appliedReciprocal)
    events.push(`${actor.name} takes ${appliedReciprocal} damage!`)
    logs.push({ type: "skill_hit", actor: defender.id, defender: actor.id, skill: skillName, damage: appliedReciprocal })
    momentumDelta += 5
  }

  return { events, logs, momentumDelta, blackFlash, peakMoment }
}

function resolveWeaponAction(actor, defender, actorAction, defenderAction, state, events, logs) {
  let momentumDelta = 0
  let blackFlash = false
  let peakMoment = null

  const damage = calculateWeaponDamage(actor, defender, state)
  let weaponName = "weapon strike"
  if (actor.equippedItems?.weapon?.name) {
    weaponName = actor.equippedItems.weapon.name
  }
  events.push(`${actor.name} strikes with ${weaponName}!`)

  if (defenderAction.type === "block") {
    const reduced = Math.floor(damage * 0.4)
    defender.currentHp = Math.max(0, defender.currentHp - reduced)
    events.push(`${defender.name} blocks partially. -${reduced} HP`)
    momentumDelta += 2
    logs.push({ type: "weapon_blocked", actor: actor.id, defender: defender.id, damage: reduced })
    return { events, logs, momentumDelta, blackFlash, peakMoment }
  }

  if (defenderAction.type === "dodge") {
    const dodgeChance = calculateDodgeChance(defender, actor, state)
    if (randomInt(1, 100) <= dodgeChance) {
      events.push(`${defender.name} dodges!`)
      momentumDelta -= 3
      logs.push({ type: "dodge", defender: defender.id })
      return { events, logs, momentumDelta, blackFlash, peakMoment }
    }
    defender.currentHp = Math.max(0, defender.currentHp - damage)
    events.push(`${defender.name} takes ${damage} damage!`)
  } else if (defenderAction.type === "counter") {
    const counterChance = calculateCounterChance(defender, actor, state)
    if (randomInt(1, 100) <= counterChance) {
      const counterDmg = calculateBaseDamage(defender, actor, state)
      actor.currentHp = Math.max(0, actor.currentHp - Math.floor(counterDmg * 0.7))
      events.push(`${defender.name} counters the weapon strike!`)
      momentumDelta -= 6
      logs.push({ type: "counter", defender: defender.id })
      return { events, logs, momentumDelta, blackFlash, peakMoment }
    }
    defender.currentHp = Math.max(0, defender.currentHp - damage)
    events.push(`${defender.name} takes ${damage} damage!`)
  } else {
    defender.currentHp = Math.max(0, defender.currentHp - damage)
    events.push(`${defender.name} takes ${damage} damage!`)
  }
  logs.push({ type: "weapon", actor: actor.id, defender: defender.id, damage })
  momentumDelta += 4

  const reciprocalActions = ["attack", "heavy_attack", "skill", "weapon", "reverse", "domain", "rct"]
  if (reciprocalActions.includes(defenderAction.type) && actor.currentHp > 0) {
    const reciprocalDmg = calculateWeaponDamage(defender, actor, state)
    const reciprocalFinal = applyDefense(reciprocalDmg, defender, actor)
    const appliedReciprocal = Math.max(1, reciprocalFinal)
    actor.currentHp = Math.max(0, actor.currentHp - appliedReciprocal)
    events.push(`${actor.name} takes ${appliedReciprocal} damage!`)
    logs.push({ type: "weapon", actor: defender.id, defender: actor.id, damage: appliedReciprocal })
    momentumDelta += 4
  }

  return { events, logs, momentumDelta, blackFlash, peakMoment }
}

function resolveAttackAction(actor, defender, actorAction, defenderAction, state, events, logs) {
  let momentumDelta = 0
  let blackFlash = false
  let peakMoment = null

  const damage = calculateBaseDamage(actor, defender, state)
  events.push(`${actor.name} attacks!`)

  if (defenderAction.type === "block") {
    const reduced = Math.floor(damage * 0.4)
    defender.currentHp = Math.max(0, defender.currentHp - reduced)
    events.push(`${defender.name} blocks. The blow still forces them back. -${reduced} HP`)
    momentumDelta += 2
    logs.push({ type: "attack_blocked", actor: actor.id, defender: defender.id, damage: reduced })
    trackCombo(state, actor.id, "attack")
    const combo = getComboBonus(actor.id, state)
    if (combo) {
      events.push(`🔥 ${combo.label} x${combo.count}!`)
      momentumDelta += combo.count
    }
    return { events, logs, momentumDelta, blackFlash, peakMoment }
  }

  if (defenderAction.type === "dodge") {
    const dodgeChance = calculateDodgeChance(defender, actor, state)
    if (randomInt(1, 100) <= dodgeChance) {
      events.push(`${defender.name} dodges smoothly!`)
      momentumDelta -= 4
      logs.push({ type: "dodge", defender: defender.id })
      resetCombo(state, actor.id)
      return { events, logs, momentumDelta, blackFlash, peakMoment }
    }
    defender.currentHp = Math.max(0, defender.currentHp - damage)
    events.push(`${defender.name} takes ${damage} damage!`)
  } else if (defenderAction.type === "counter") {
    const counterChance = calculateCounterChance(defender, actor, state)
    if (randomInt(1, 100) <= counterChance) {
      const counterDmg = calculateBaseDamage(defender, actor, state)
      actor.currentHp = Math.max(0, actor.currentHp - Math.floor(counterDmg * 0.8))
      events.push(`${defender.name} counters!`)
      momentumDelta -= 8
      logs.push({ type: "counter", defender: defender.id })
      resetCombo(state, actor.id)
      return { events, logs, momentumDelta, blackFlash, peakMoment }
    }
    defender.currentHp = Math.max(0, defender.currentHp - damage)
    events.push(`${defender.name} takes ${damage} damage!`)
  } else {
    const crit = rollCritical(actor)
    let finalDmg = damage
    if (crit) {
      finalDmg = Math.floor(damage * 2)
      events.push(`CRITICAL HIT!`)
      momentumDelta += 8
    }
    const bf = rollBlackFlash(actor, state)
    if (bf) {
      finalDmg = Math.floor(finalDmg * 2.5)
      blackFlash = true
      peakMoment = "BLACK FLASH"
      events.push(`BLACK FLASH!`)
      momentumDelta += 25
    }

    trackCombo(state, actor.id, "attack")
    const combo = getComboBonus(actor.id, state)
    if (combo && combo.bonus) {
      finalDmg = Math.floor(finalDmg * (1 + combo.bonus))
      events.push(`🔥 ${combo.label} x${combo.count}! +${Math.floor(combo.bonus * 100)}% dmg`)
      momentumDelta += combo.count
    }

    finalDmg = applyDefense(finalDmg, actor, defender)
    finalDmg = Math.max(1, finalDmg)
    defender.currentHp = Math.max(0, defender.currentHp - finalDmg)
    events.push(`${defender.name} takes ${finalDmg} damage!`)
    logs.push({ type: "attack_hit", actor: actor.id, defender: defender.id, damage: finalDmg, crit, blackFlash: bf })

    const reciprocalActions = ["attack", "heavy_attack", "skill", "weapon", "reverse", "domain", "rct"]
    if (reciprocalActions.includes(defenderAction.type) && actor.currentHp > 0) {
      const reciprocalDmg = calculateBaseDamage(defender, actor, state)
      const reciprocalFinal = applyDefense(reciprocalDmg, defender, actor)
      const appliedReciprocal = Math.max(1, reciprocalFinal)
      actor.currentHp = Math.max(0, actor.currentHp - appliedReciprocal)
      events.push(`${actor.name} takes ${appliedReciprocal} damage!`)
      logs.push({ type: "attack_hit", actor: defender.id, defender: actor.id, damage: appliedReciprocal })
      trackCombo(state, defender.id, "attack")
      const defenderCombo = getComboBonus(defender.id, state)
      if (defenderCombo) {
        events.push(`🔥 ${defenderCombo.label} x${defenderCombo.count}!`)
        momentumDelta += defenderCombo.count
      }
    }
  }
  momentumDelta += 4
  return { events, logs, momentumDelta, blackFlash, peakMoment }
}

function resolveHeavyAttackAction(actor, defender, actorAction, defenderAction, state, events, logs) {
  let momentumDelta = 0
  let blackFlash = false
  let peakMoment = null

  const damage = Math.floor(calculateBaseDamage(actor, defender, state) * 1.6)
  events.push(`${actor.name} winds up a heavy attack!`)

  if (defenderAction.type === "dodge") {
    const dodgeChance = calculateDodgeChance(defender, actor, state) + 15
    if (randomInt(1, 100) <= dodgeChance) {
      events.push(`${defender.name} dodges the slow heavy blow!`)
      momentumDelta -= 6
      logs.push({ type: "dodge", defender: defender.id })
      return { events, logs, momentumDelta, blackFlash, peakMoment }
    }
  }

  if (defenderAction.type === "counter") {
    const counterChance = calculateCounterChance(defender, actor, state) + 10
    if (randomInt(1, 100) <= counterChance) {
      const counterDmg = calculateBaseDamage(defender, actor, state)
      actor.currentHp = Math.max(0, actor.currentHp - Math.floor(counterDmg * 0.9))
      events.push(`${defender.name} counters the heavy attack!`)
      momentumDelta -= 10
      logs.push({ type: "counter", defender: defender.id })
      return { events, logs, momentumDelta, blackFlash, peakMoment }
    }
  }

  if (defenderAction.type === "block") {
    const reduced = Math.floor(damage * 0.5)
    defender.currentHp = Math.max(0, defender.currentHp - reduced)
    events.push(`${defender.name} blocks the heavy blow! -${reduced} HP`)
    momentumDelta += 3
    logs.push({ type: "heavy_blocked", actor: actor.id, defender: defender.id, damage: reduced })
    trackCombo(state, actor.id, "heavy_attack")
    const combo = getComboBonus(actor.id, state)
    if (combo) {
      events.push(`💥 ${combo.label} x${combo.count}!`)
      momentumDelta += combo.count
    }
    return { events, logs, momentumDelta, blackFlash, peakMoment }
  }

  const bf = rollBlackFlash(actor, state)
  let finalDmg = damage
  if (bf) {
    finalDmg = Math.floor(finalDmg * 2.5)
    blackFlash = true
    peakMoment = "BLACK FLASH"
    events.push(`BLACK FLASH!`)
    momentumDelta += 25
  }
  finalDmg = applyDefense(finalDmg, actor, defender)
  finalDmg = Math.max(1, finalDmg)
  defender.currentHp = Math.max(0, defender.currentHp - finalDmg)
  events.push(`${defender.name} takes ${finalDmg} damage!`)
  logs.push({ type: "heavy_attack", actor: actor.id, defender: defender.id, damage: finalDmg })
  trackCombo(state, actor.id, "heavy_attack")
  const combo = getComboBonus(actor.id, state)
  if (combo) {
    events.push(`💥 ${combo.label} x${combo.count}!`)
    momentumDelta += combo.count
  }

  const reciprocalActions = ["attack", "heavy_attack", "skill", "weapon", "reverse", "domain", "rct"]
  if (reciprocalActions.includes(defenderAction.type) && actor.currentHp > 0) {
    const reciprocalDmg = Math.floor(calculateBaseDamage(defender, actor, state) * 1.6)
    const reciprocalFinal = applyDefense(reciprocalDmg, defender, actor)
    const appliedReciprocal = Math.max(1, reciprocalFinal)
    actor.currentHp = Math.max(0, actor.currentHp - appliedReciprocal)
    events.push(`${actor.name} takes ${appliedReciprocal} damage!`)
    logs.push({ type: "heavy_attack", actor: defender.id, defender: actor.id, damage: appliedReciprocal })
    trackCombo(state, defender.id, "heavy_attack")
    const defenderCombo = getComboBonus(defender.id, state)
    if (defenderCombo) {
      events.push(`💥 ${defenderCombo.label} x${defenderCombo.count}!`)
      momentumDelta += defenderCombo.count
    }
  }

  momentumDelta += 6
  return { events, logs, momentumDelta, blackFlash, peakMoment }
}

function calculateBaseDamage(actor, defender, state, skill = null) {
  const skillData = skill || {
    baseDamage: Math.max(3, Math.floor((actor.rawStrength || actor.attack || 10) * 0.35)),
    element: null,
    critChance: 0,
    critMultiplier: 1.5,
    ceCost: 0,
    type: "attack",
    domainBonus: 0,
    techniqueScale: 0.5
  }
  const battleState = {
    momentum: state.momentum || 50,
    combo: state.combo || {}
  }

  const result = calculateDamage(actor, defender, skillData, battleState)
  return result.damage
}

function calculateWeaponDamage(actor, defender, state) {
  const weaponBonus = actor.equippedItems?.weapon?.stats?.attack || 0
  const skillData = {
    baseDamage: Math.max(3, Math.floor((actor.rawStrength || actor.attack || 10) * 0.35)) + weaponBonus,
    element: null,
    critChance: actor.critRate || 0,
    critMultiplier: 1.5,
    ceCost: 0,
    type: "weapon",
    domainBonus: 0
  }
  return calculateBaseDamage(actor, defender, state, skillData)
}

function calculateRctHeal(actor) {
  const strength = actor.rawStrength || actor.attack || 10
  const base = Math.floor(strength / 5)
  const maxHeal = Math.floor(actor.maxHp * 0.3)
  return Math.min(maxHeal, Math.max(5, base))
}

function calculateFleeChance(actor, defender) {
  const speedDiff = (actor.rawSpeed || 10) - (defender.rawSpeed || 10)
  const base = 40 + speedDiff * 2
  return Math.min(90, Math.max(10, base))
}

function calculateDodgeChance(defender, attacker, state) {
  const speedDiff = (defender.rawSpeed || 10) - (attacker.rawSpeed || 10)
  const base = 30 + speedDiff * 2
  const momentumMod = Math.max(0, (state.momentum - 50) / 100)
  return Math.min(85, Math.max(10, base - momentumMod * 10))
}

function calculateCounterChance(counterer, attacker, state) {
  const skillDiff = (counterer.rawTechnique || 10) - (attacker.rawTechnique || 10)
  const base = 25 + skillDiff * 2
  const momentumMod = Math.max(0, (state.momentum - 50) / 100)
  return Math.min(80, Math.max(10, base + momentumMod * 5))
}

function rollCritical(actor) {
  const critChance = actor.critRate || 0
  return randomInt(1, 100) <= Math.min(50, critChance + 5)
}

function rollBlackFlash(actor, state) {
  const affinity = actor.blackFlashAffinity ?? 5
  const chance = Math.min(15, affinity + (state.momentum > 70 ? 5 : 0))
  return randomInt(1, 100) <= chance
}

function applyDefense(damage, attacker, defender) {
  const defense = defender.rawDefense || defender.defense || 10
  const reduction = defense / (defense + 100)
  return Math.max(1, Math.floor(damage * (1 - reduction)))
}

function getGradeMultiplier(attackerGrade, defenderGrade) {
  const diff = (attackerGrade || 4) - (defenderGrade || 4)
  if (diff > 0) return 1 + diff * 0.1
  if (diff < 0) return Math.max(0.7, 1 + diff * 0.08)
  return 1.0
}

function getSkillMultiplier(skillName) {
  const mults = {
    "blue": 1.5,
    "red": 2.0,
    "purple": 2.5,
    "hole": 3.0,
    "Cursed Strike": 1.2,
    "Energy Blast": 1.3,
    "Cursed Technique": 1.4
  }
  return mults[skillName] || 1.0
}

function resolveDomainClash(actor, defender) {
  const actorPower = (actor.rawStrength || 10) + (actor.rawTechnique || 10)
  const defenderPower = (defender.rawStrength || 10) + (defender.rawTechnique || 10)
  if (actorPower > defenderPower) return actor.id
  if (defenderPower > actorPower) return defender.id
  return "draw"
}

function applyStatusTicks(participant, state) {
  const statuses = globalStatusEngine.getStatuses(participant.id) || []
  for (const status of statuses) {
    if (status.type === "bleed" && status.amount) {
      participant.currentHp = Math.max(0, participant.currentHp - status.amount)
    } else if (status.type === "burn" && status.amount) {
      participant.currentHp = Math.max(0, participant.currentHp - status.amount)
    } else if (status.type === "rct_heal" && status.effect) {
      const heal = status.effect(participant)
      if (heal > 0) participant.currentHp = Math.min(participant.maxHp, participant.currentHp + heal)
    }
  }
}

function buildNarration(events, logs, state) {
  const lines = []
  const phaseLabel = (state.phase || "normal").toUpperCase()
  const momentum = Math.max(0, Math.min(100, state.momentum || 50))
  const round = state.round || 0

  lines.push(`━━━ ROUND ${round} ━━━`)
  lines.push(`Phase: ${phaseLabel}  |  Momentum: ${momentum}%`)
  lines.push("")

  for (const event of events) {
    if (event.includes("BLACK FLASH")) {
      lines.push(`💥 **${event}**`)
    } else if (event.includes("CRITICAL")) {
      lines.push(`🔥 ${event}`)
    } else if (event.includes("DOMAIN EXPANSION")) {
      lines.push(`🌀 ${event}`)
    } else if (event.includes("counter")) {
      lines.push(`⚡ ${event}`)
    } else if (event.includes("dodge")) {
      lines.push(`💨 ${event}`)
    } else if (event.includes("block")) {
      lines.push(`🛡️ ${event}`)
    } else if (event.includes("domain")) {
      lines.push(`🌀 ${event}`)
    } else {
      lines.push(`> ${event}`)
    }
  }

  if (state.blackFlashTriggered) {
    lines.push("")
    lines.push(`**✨ BLACK FLASH ✨**`)
    lines.push("Time freezes. The impact rattles reality itself.")
  }
  if (state.peakMoment) {
    lines.push("")
    lines.push(`**${state.peakMoment}**`)
  }

  return lines.join("\n")
}

export function getBattleEngine(battleId) {
  const id = String(battleId)
  let engine = engines.get(id)
  if (!engine) {
    engine = new BattleEngine()
    engine.init(id)
    engines.set(id, engine)
  } else {
    engine.status = "active"
  }
  return engine
}

export function removeBattleEngine(battleId) {
  engines.delete(String(battleId))
}

export function clearAllEngines() {
  engines.clear()
}
