import { randomInt } from "../../utils/generator.js"

export function calculateDamage(attacker, defender, skill, battleState = {}) {
  let damage = skill.baseDamage || 10

  const strength = attacker.rawStrength || attacker.attack || 10
  const strengthScaling = 1 + strength / 1000
  damage *= strengthScaling

  const technique = attacker.rawTechnique || attacker.technique || 10
  const techniqueScaling = technique * (skill.techniqueScale || 0.5) / 100
  damage += techniqueScaling

  const weaponBonus = attacker.equippedItems?.weapon?.stats?.attack || 0
  damage *= 1 + weaponBonus / 500

  const skillLevel = 1
  damage *= 1 + skillLevel * 0.1

  if (skill.ceCost && skill.ceCost > 0 && (attacker.currentCe || attacker.cursedEnergy || 0) >= skill.ceCost) {
    damage *= 1 + skill.ceCost / 200
  }

  if (attacker.bindingVows && attacker.bindingVows.length > 0) {
    for (const vow of attacker.bindingVows) {
      if (vow.effects?.extraDamage) {
        damage *= 1 + vow.effects.extraDamage
      }
    }
  }

  const momentum = battleState.momentum || 50
  if (momentum > 50) {
    const momentumBonus = (momentum - 50) / 10 * 0.05
    damage *= 1 + momentumBonus
  }

  if (skill.element && defender.weakness === skill.element) {
    damage *= 1.5
  }

  const comboCount = battleState.combo?.[attacker.id] || 0
  if (comboCount >= 5) {
    damage *= 1.5
  } else if (comboCount >= 3) {
    damage *= 1.3
  }

  return {
    damage: Math.max(1, Math.round(damage)),
    isCritical: false,
    defenseReduction: 0,
    comboCount
  }
}
