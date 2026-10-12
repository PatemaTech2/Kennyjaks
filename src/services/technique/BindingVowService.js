import fs from "fs-extra"
import path from "path"
import { getTechniqueControl } from "../player/attributeService.js"

const BINDING_VOWS_PATH = path.resolve(process.cwd(), "src", "data", "bindingVows.json")
let vowsCache = null

function loadBindingVows() {
  if (!vowsCache) {
    vowsCache = fs.readJsonSync(BINDING_VOWS_PATH)
  }
  return vowsCache
}

export const GRADE_VALUES = {
  "special grade": 0,
  "special": 0,
  "grade 1": 1,
  "grade1": 1,
  "grade 2": 2,
  "grade2": 2,
  "grade 3": 3,
  "grade3": 3,
  "grade 4": 4,
  "grade4": 4
}

export function getGradeValue(player) {
  const grade = player.grade
  if (grade === 0 || grade === "0") return 0
  const num = typeof grade === "number" ? grade : parseInt(grade, 10)
  if (!isNaN(num)) return num
  const title = (player.gradeTitle || "").toLowerCase()
  return GRADE_VALUES[title] !== undefined ? GRADE_VALUES[title] : 4
}

export class BindingVowService {
  static getAllVows() {
    const data = loadBindingVows()
    return data.bindingVows || []
  }

  static getVowById(id) {
    const all = this.getAllVows()
    return all.find(v => v.id === id) || null
  }

  static getVowByName(name) {
    const all = this.getAllVows()
    const lower = name.toLowerCase()
    return all.find(v => v.id === lower || v.name.toLowerCase() === lower) || null
  }

  static parseVows(text) {
    const vowPart = text.trim().toLowerCase()
    if (!vowPart) return { vows: [], declaration: "" }

    const normalized = vowPart.replace(/\s*x\s*/gi, " x ").replace(/\s+/g, " ").trim()
    const parts = normalized.split(" x ")

    const vows = []
    const declarationParts = []
    let foundDeclaration = false

    for (const part of parts) {
      const trimmed = part.trim()
      if (!trimmed) continue

      const vow = this.getVowByName(trimmed)
      if (vow) {
        if (vows.find(v => v.id === vow.id)) {
          return { error: `Duplicate Binding Vow: ${vow.name}. You cannot stack the same vow.`, vows: [], declaration: "" }
        }
        vows.push(vow)
      } else {
        foundDeclaration = true
        declarationParts.push(trimmed)
      }
    }

    return {
      vows,
      declaration: declarationParts.join(" ").trim(),
      error: null
    }
  }

  static calculateTotalHpCost(vows) {
    return vows.reduce((total, vow) => {
      if (vow.hpCost === "variable") return total
      return total + (vow.hpCost || 0)
    }, 0)
  }

  static calculateSuccessChance(player, vows) {
    const techniqueControl = getTechniqueControl(player)
    const gradeValue = getGradeValue(player)
    const hpRatio = (player.health || 0) / Math.max(1, player.maxHealth || 1)
    const ceRatio = (player.cursedEnergy || 0) / Math.max(1, player.maxCursedEnergy || 1)
    const vowCount = vows.length

    let baseChance = 0.5
    const tcBonus = Math.min(0.5, techniqueControl * 0.01)
    const gradeBonus = Math.max(0, (4 - gradeValue) * 0.08)
    const hpBonus = hpRatio * 0.15
    const ceBonus = ceRatio * 0.1

    baseChance += tcBonus + gradeBonus + hpBonus + ceBonus

    const vowPenalty = vowCount * 0.1
    baseChance -= vowPenalty

    return Math.max(0.05, Math.min(0.95, baseChance))
  }

  static calculateVowAccuracy(player, vows) {
    const techniqueControl = getTechniqueControl(player)
    const gradeValue = getGradeValue(player)
    const vowCount = vows.length

    const baseAccuracy = 0.6
    const tcBonus = Math.min(0.4, techniqueControl * 0.01)
    const gradeBonus = Math.max(0, (4 - gradeValue) * 0.1)
    const vowPenalty = vowCount * 0.08

    let accuracy = baseAccuracy + tcBonus + gradeBonus - vowPenalty
    return Math.max(0.1, Math.min(0.95, accuracy))
  }

  static calculateVowStrength(player, vows) {
    const techniqueControl = getTechniqueControl(player)
    const gradeValue = getGradeValue(player)

    const baseStrength = 1.0
    const tcBonus = Math.min(0.8, techniqueControl * 0.015)
    const gradeBonus = Math.max(0, (4 - gradeValue) * 0.12)

    let strength = baseStrength + tcBonus + gradeBonus
    return Math.max(0.2, Math.min(2.0, strength))
  }

  static async validateAndPrepare(player, vows) {
    if (!vows || vows.length === 0) {
      return { valid: true, vows: [], hpCost: 0, successChance: 1.0, accuracy: 1.0, strength: 1.0 }
    }

    const techniqueControl = getTechniqueControl(player)
    const gradeValue = getGradeValue(player)

    for (const vow of vows) {
      if (vow.requirements.minGrade !== undefined && gradeValue > vow.requirements.minGrade) {
        return { valid: false, error: `You must be at least Grade ${vow.requirements.minGrade} to use ${vow.name}.`, vows: [], hpCost: 0, successChance: 0, accuracy: 0, strength: 0 }
      }
    }

    const totalHpCost = this.calculateTotalHpCost(vows)
    if (totalHpCost > 0 && (player.health || 0) < totalHpCost) {
      return { valid: false, error: `❌ You don't have enough HP to fulfill these Binding Vows.\n\nRequired: ${totalHpCost} HP\nCurrent: ${player.health || 0} HP`, vows: [], hpCost: 0, successChance: 0, accuracy: 0, strength: 0 }
    }

    const successChance = this.calculateSuccessChance(player, vows)
    const accuracy = this.calculateVowAccuracy(player, vows)
    const strength = this.calculateVowStrength(player, vows)

    return { valid: true, vows, hpCost: totalHpCost, successChance, accuracy, strength }
  }

  static applyFailureEffects(player, vows) {
    const totalSelfDamage = vows.reduce((total, vow) => {
      return total + (vow.failureBehavior.selfDamage || 0)
    }, 0)

    player.health = Math.max(0, (player.health || 0) - totalSelfDamage)
    return totalSelfDamage
  }

  static applyVowEffects(baseDamage, player, vows, battle) {
    let damage = baseDamage
    let penetration = false
    let fleeImmune = false
    let techniqueControlBonus = 0

    for (const vow of vows) {
      const effects = vow.effects || {}

      if (effects.damageMultiplier) {
        const gradeValue = getGradeValue(player)
        const gradeScaled = Math.min(effects.damageMultiplier, 1 + (10 / Math.max(1, gradeValue)))
        damage = Math.floor(damage * gradeScaled)
      }

      if (effects.penetration) penetration = true
      if (effects.attackRange) fleeImmune = true
      if (effects.techniqueControlBonus) techniqueControlBonus += effects.techniqueControlBonus
    }

    return {
      damage,
      penetration,
      fleeImmune,
      techniqueControlBonus,
      finalDamage: Math.floor(damage * (1 + techniqueControlBonus))
    }
  }

  static buildVowNarration(player, vows, success, declaration, skillName) {
    const lines = []
    lines.push("╔══════════════════════════════════╗")
    lines.push("         BINDING VOW")
    lines.push("╚══════════════════════════════════╝")
    lines.push("")

    if (!success) {
      lines.push("BINDING VOW FAILED")
      lines.push("")
      lines.push("The cursed energy destabilizes.")
      lines.push("")
      lines.push("Technique Control was insufficient.")
      lines.push("")
      lines.push("The technique could not reach the")
      lines.push("required output.")
      lines.push("")
      lines.push("╚══════════════════════════════════╝")
      return lines.join("\n")
    }

    lines.push(`${player.name || "Unknown"} forces their cursed energy`)
    lines.push("beyond its normal limit.")
    lines.push("")

    vows.forEach(vow => {
      lines.push(vow.name.toUpperCase())
      lines.push("")
    })

    lines.push("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    lines.push("")
    lines.push(`Technique Control: ${getTechniqueControl(player)}`)
    lines.push(`Vow Accuracy: ${Math.floor(this.calculateVowAccuracy(player, vows) * 100)}%`)
    lines.push(`Vow Strength: ${this.calculateVowStrength(player, vows).toFixed(2)}x`)
    lines.push(`Output: MAXIMUM`)
    lines.push("")
    lines.push(`${player.name || "Unknown"}:`)
    lines.push(`"${declaration || skillName || "..."}"`)
    lines.push("")
    lines.push("╔══════════════════════════════════╗")
    lines.push(`       ${(declaration || skillName || "TECHNIQUE").toUpperCase()}`)
    lines.push("╚══════════════════════════════════╝")

    return lines.join("\n")
  }
}
