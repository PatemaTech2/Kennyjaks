import { SKILL_TYPES, isPassive, isActive, isDefensive } from "./skillTypes.js"
import { getActiveCurse, clearActiveCurse } from "../battle/CurseService.js"
import { BattleManager } from "../battle/BattleManager.js"

import limitlessDefinition from "./definitions/limitless.js"
import bloodManipulationDefinition from "./definitions/bloodManipulation.js"
import tenShadowsDefinition from "./definitions/tenShadows.js"
import ratioDefinition from "./definitions/ratio.js"
import projectionSorceryDefinition from "./definitions/projectionSorcery.js"
import boogieWoogieDefinition from "./definitions/boogieWoogie.js"
import chimeraShadowGardenDefinition from "./definitions/chimeraShadowGarden.js"
import disasterCurseDefinition from "./definitions/disasterCurse.js"
import awakeningDefinition from "./definitions/awakening.js"

export class TechniqueEngine {
  constructor() {
    this.definitions = new Map()
    this.passiveRegistry = new Map()
    this.combatRules = new Map()

    this.register(limitlessDefinition)
    this.register(bloodManipulationDefinition)
    this.register(tenShadowsDefinition)
    this.register(ratioDefinition)
    this.register(projectionSorceryDefinition)
    this.register(boogieWoogieDefinition)
    this.register(chimeraShadowGardenDefinition)
    this.register(disasterCurseDefinition)
    this.register(awakeningDefinition)
  }

  register(definition) {
    this.definitions.set(definition.id, definition)
    if (definition.passiveEffects && definition.passiveEffects.length > 0) {
      this.passiveRegistry.set(definition.id, definition.passiveEffects)
    }
    if (definition.combatRules && definition.combatRules.length > 0) {
      this.combatRules.set(definition.id, definition.combatRules)
    }
  }

  getDefinition(techniqueId) {
    return this.definitions.get(techniqueId) || null
  }

  getPassiveEffects(techniqueId) {
    return this.passiveRegistry.get(techniqueId) || []
  }

  getCombatRules(techniqueId) {
    return this.combatRules.get(techniqueId) || []
  }

  resolveSkill(attacker, defender, battle, skillId, context = {}) {
    const technique = attacker.technique
    if (!technique) {
      return { success: false, error: "No technique equipped" }
    }

    const definition = this.getDefinition(technique.id)
    if (!definition) {
      return { success: false, error: "Unknown technique" }
    }

    const skill = definition.skills[skillId]
    if (!skill) {
      return { success: false, error: `Skill ${skillId} not found` }
    }

    if (isPassive(skill.type)) {
      return { success: false, error: "Passive skills cannot be activated" }
    }

    if (skill.ceCost && attacker.cursedEnergy < skill.ceCost) {
      return { success: false, error: "Insufficient CE" }
    }

    if (skill.cooldown && attacker.skillCooldowns && attacker.skillCooldowns[skillId] > 0) {
      return { success: false, error: "Skill on cooldown" }
    }

    if (skill.conditions && !this.evaluateConditions(skill.conditions, attacker, defender, battle, context)) {
      return { success: false, error: "Conditions not met" }
    }

    const result = this.applySkill(attacker, defender, battle, skill, context)

    if (result.success && skill.ceCost) {
      attacker.cursedEnergy = Math.max(0, attacker.cursedEnergy - skill.ceCost)
    }

    if (result.success && skill.cooldown) {
      if (!attacker.skillCooldowns) attacker.skillCooldowns = {}
      attacker.skillCooldowns[skillId] = skill.cooldown
    }

    return result
  }

  applySkill(attacker, defender, battle, skill, context) {
    const baseResult = {
      success: true,
      skillId: skill.id,
      skillName: skill.name,
      type: skill.type,
      damage: 0,
      effects: [],
      narration: "",
      metadata: {}
    }

    if (skill.damage) {
      baseResult.damage += skill.damage
    }

    if (skill.effects) {
      for (const [effectName, effectConfig] of Object.entries(skill.effects)) {
        const effectResult = this.applyEffect(attacker, defender, battle, effectName, effectConfig, context)
        if (effectResult) {
          baseResult.effects.push(effectResult)
        }
      }
    }

    if (skill.onHit && typeof skill.onHit === "function") {
      const onHitResult = skill.onHit(attacker, defender, battle, context)
      if (onHitResult) {
        baseResult.metadata = { ...baseResult.metadata, ...onHitResult }
      }
    }

    return baseResult
  }

  applyEffect(attacker, defender, battle, effectName, effectConfig, context) {
    switch (effectName) {
      case "damage":
        return { type: "damage", value: effectConfig, source: attacker.name }
      case "damageBonus":
        return { type: "damageBonus", value: effectConfig, source: attacker.name }
      case "aoeDamage":
        return { type: "aoeDamage", value: effectConfig, source: attacker.name }
      case "pull":
        return { type: "pull", strength: effectConfig, source: attacker.name }
      case "push":
        return { type: "push", strength: effectConfig, source: attacker.name }
      case "stun":
        return { type: "stun", chance: effectConfig.chance || 1, duration: effectConfig.duration || 1, source: attacker.name }
      case "slow":
        return { type: "slow", chance: effectConfig.chance || 1, amount: effectConfig.amount || 0.2, duration: effectConfig.duration || 1, source: attacker.name }
      case "dodge":
        return { type: "dodge", chance: effectConfig.chance || 0.3, source: attacker.name }
      case "damageReduction":
        return { type: "damageReduction", value: effectConfig, duration: effectConfig.duration || 1, source: attacker.name }
      case "heal":
        return { type: "heal", value: effectConfig, source: attacker.name }
      case "ceDrain":
        return { type: "ceDrain", value: effectConfig, target: defender.name }
      case "buff":
        return { type: "buff", stat: effectConfig.stat, value: effectConfig.value, duration: effectConfig.duration || 1, source: attacker.name }
      case "debuff":
        return { type: "debuff", stat: effectConfig.stat, value: effectConfig.value, duration: effectConfig.duration || 1, target: defender.name }
      case "summon":
        return { type: "summon", entity: effectConfig.entity, duration: effectConfig.duration || 3, source: attacker.name }
      case "mark":
        return { type: "mark", count: effectConfig.count || 2, duration: effectConfig.duration || 5, source: attacker.name }
      case "swap":
        return { type: "swap", source: attacker.name, target: defender.name }
      case "reflect":
        return { type: "reflect", chance: effectConfig.chance || 0.3, source: attacker.name }
      case "armorPierce":
        return { type: "armorPierce", value: effectConfig || true, source: attacker.name }
      default:
        return { type: effectName, config: effectConfig, source: attacker.name }
    }
  }

  evaluateConditions(conditions, attacker, defender, battle, context) {
    if (!conditions) return true
    for (const condition of conditions) {
      if (!this.checkCondition(condition, attacker, defender, battle, context)) {
        return false
      }
    }
    return true
  }

  checkCondition(condition, attacker, defender, battle, context) {
    switch (condition.type) {
      case "hpAbove":
        return (attacker.health || 0) > (condition.value || 0)
      case "hpBelow":
        return (attacker.health || 0) < (condition.value || 0)
      case "ceAbove":
        return (attacker.cursedEnergy || 0) > (condition.value || 0)
      case "ceBelow":
        return (attacker.cursedEnergy || 0) < (condition.value || 0)
      case "hasMark":
        return (attacker.marks || 0) >= (condition.count || 1)
      case "turnCount":
        return (battle.turnCount || 0) >= (condition.value || 0)
      case "momentum":
        return (attacker.momentum || 0) >= (condition.value || 0)
      case "combo":
        return (attacker.combo || 0) >= (condition.value || 0)
      default:
        return true
    }
  }

  evaluatePassives(attacker, defender, battle, context = {}) {
    const technique = attacker.technique
    if (!technique) return []

    const definition = this.getDefinition(technique.id)
    if (!definition || !definition.passiveEffects) return []

    const results = []
    for (const passive of definition.passiveEffects) {
      if (this.evaluateConditions(passive.conditions, attacker, defender, battle, context)) {
        const result = this.applyPassive(attacker, defender, battle, passive, context)
        if (result) {
          results.push(result)
        }
      }
    }
    return results
  }

  applyPassive(attacker, defender, battle, passive, context) {
    const baseResult = {
      passiveId: passive.id,
      name: passive.name,
      type: passive.type || "PASSIVE",
      effects: [],
      narration: ""
    }

    if (passive.effects) {
      for (const [effectName, effectConfig] of Object.entries(passive.effects)) {
        const effect = this.applyEffect(attacker, defender, battle, effectName, effectConfig, context)
        if (effect) {
          baseResult.effects.push(effect)
        }
      }
    }

    if (passive.onTrigger && typeof passive.onTrigger === "function") {
      const triggerResult = passive.onTrigger(attacker, defender, battle, context)
      if (triggerResult) {
        baseResult.metadata = { ...baseResult.metadata, ...triggerResult }
      }
    }

    return baseResult
  }

  canBypassInfinity(attacker, attack, defender) {
    const technique = defender.technique
    if (!technique || technique.id !== "limitless") {
      return true
    }

    const definition = this.getDefinition("limitless")
    if (!definition || !definition.infinityRules) {
      return true
    }

    const rules = definition.infinityRules

    if (rules.domainSureHit && attack.isDomainSureHit) {
      return rules.domainSureHit.bypass || false
    }

    if (rules.domainAmplification && attack.isDomainAmplification) {
      return rules.domainAmplification.bypass || false
    }

    if (rules.blackFlash && attack.isBlackFlash) {
      return rules.blackFlash.bypass !== false
    }

    if (rules.specialConditions && attack.specialCondition) {
      const condition = rules.specialConditions[attack.specialCondition]
      if (condition) {
        return condition.bypass || false
      }
    }

    if (rules.ordinaryAttacks !== false) {
      return false
    }

    return false
  }

  getInfinityNarration(defender) {
    const technique = defender.technique
    if (!technique || technique.id !== "limitless") {
      return ""
    }

    const definition = this.getDefinition("limitless")
    if (!definition || !definition.infinityNarration) {
      return "∞ INFINITY\nThe attack approaches... but never reaches you."
    }

    return definition.infinityNarration
  }

  checkMahoragaAdaptation(mahoraga, attack) {
    if (!mahoraga || !mahoraga.adaptations) {
      return { adapted: false }
    }

    const key = this.getAdaptationKey(attack)
    const adaptation = mahoraga.adaptations[key]

    if (!adaptation) {
      return { adapted: false, key }
    }

    const stage = adaptation.stage || 0
    const maxStages = adaptation.maxStages || 4

    if (stage >= maxStages) {
      return {
        adapted: true,
        stage,
        maxStages,
        complete: true,
        reduction: adaptation.finalReduction || 0.9,
        key
      }
    }

    return {
      adapted: true,
      stage,
      maxStages,
      complete: false,
      reduction: adaptation.reduction || (0.3 + stage * 0.15),
      key
    }
  }

  recordMahoragaAdaptation(mahoraga, attack) {
    if (!mahoraga || !mahoraga.adaptations) {
      return null
    }

    const key = this.getAdaptationKey(attack)
    if (!mahoraga.adaptations[key]) {
      mahoraga.adaptations[key] = {
        stage: 0,
        maxStages: 4,
        reduction: 0.3,
        finalReduction: 0.9
      }
    }

    const adaptation = mahoraga.adaptations[key]
    if (adaptation.stage < adaptation.maxStages) {
      adaptation.stage++
      adaptation.reduction = 0.3 + adaptation.stage * 0.15
    }

    return {
      key,
      stage: adaptation.stage,
      maxStages: adaptation.maxStages,
      complete: adaptation.stage >= adaptation.maxStages
    }
  }

  getAdaptationKey(attack) {
    const techniqueId = attack.techniqueId || attack.attackerTechnique || "unknown"
    const skillId = attack.skillId || attack.skill || "unknown"
    const mechanicId = attack.mechanicId || attack.mechanic || "unknown"
    return `${techniqueId}:${skillId}:${mechanicId}`
  }

  tickCooldowns(actor) {
    if (!actor.skillCooldowns) return
    for (const [skillId, cooldown] of Object.entries(actor.skillCooldowns)) {
      if (cooldown > 0) {
        actor.skillCooldowns[skillId] = cooldown - 1
      }
    }
  }

  getAvailableSkills(actor) {
    const technique = actor.technique
    if (!technique) return []

    const definition = this.getDefinition(technique.id)
    if (!definition) return []

    const available = []
    for (const [skillId, skill] of Object.entries(definition.skills)) {
      if (isPassive(skill.type)) continue

      const canUse =
        (!skill.ceCost || actor.cursedEnergy >= skill.ceCost) &&
        (!skill.cooldown || !actor.skillCooldowns || actor.skillCooldowns[skillId] <= 0) &&
        (!skill.conditions || this.evaluateConditions(skill.conditions, actor, null, null, {}))

      available.push({
        id: skillId,
        name: skill.name,
        type: skill.type,
        ceCost: skill.ceCost || 0,
        cooldown: skill.cooldown || 0,
        canUse
      })
    }

    return available
  }
}

export const globalTechniqueEngine = new TechniqueEngine()
