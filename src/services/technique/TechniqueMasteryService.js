import fs from "fs-extra"
import path from "path"
import { savePlayer } from "../../database/playerRepo.js"
import { ShikigamiCombatService } from "./ShikigamiCombatService.js"
import { globalTechniqueEngine } from "./TechniqueEngine.js"
import { isPassive } from "./skillTypes.js"

const SHIKIGAMI_PATH = path.resolve(process.cwd(), "src", "data", "shikigamiMastery.json")
const TECHNIQUE_MASTERY_PATH = path.resolve(process.cwd(), "src", "data", "techniqueMastery.json")

let shikigamiCache = null
let techniqueMasteryCache = null

function loadShikigamiData() {
  if (!shikigamiCache) {
    shikigamiCache = fs.readJsonSync(SHIKIGAMI_PATH)
  }
  return shikigamiCache
}

function loadTechniqueMasteryData() {
  if (!techniqueMasteryCache) {
    techniqueMasteryCache = fs.readJsonSync(TECHNIQUE_MASTERY_PATH)
  }
  return techniqueMasteryCache
}

export class TechniqueMasteryService {
  static getShikigamiList() {
    const data = loadShikigamiData()
    return data.shikigami || []
  }

  static getShikigamiById(id) {
    const list = this.getShikigamiList()
    return list.find(s => s.id === id) || null
  }

  static getShikigamiByName(name) {
    const list = this.getShikigamiList()
    const lowerName = name.toLowerCase()
    return list.find(s =>
      s.name.toLowerCase() === lowerName ||
      s.id.toLowerCase() === lowerName
    ) || null
  }

  static getTechniqueMasteryConfig(techniqueName) {
    const data = loadTechniqueMasteryData()
    return data.techniques[techniqueName] || null
  }

  static getTechniqueMasterySkills(techniqueName) {
    const config = this.getTechniqueMasteryConfig(techniqueName)
    if (!config) return []
    return config.masterySkills || []
  }

  static getMasteryLevel(player, skillName) {
    const mastery = player.techniqueMastery || {}
    const skillMastery = mastery[skillName]
    if (!skillMastery) return 0
    return skillMastery.level || 0
  }

  static isMasterySkillUnlocked(player, skillName) {
    const mastery = player.techniqueMastery || {}
    const skillMastery = mastery[skillName]
    if (!skillMastery) return false
    return skillMastery.unlocked === true
  }

  static getUnlockedSkills(player) {
    const technique = player.technique
    if (!technique) return []

    const definition = globalTechniqueEngine.getDefinition(technique.id)
    if (definition && definition.skills) {
      return (technique.unlockedSkills || []).filter(skillId => {
        const skill = definition.skills[skillId]
        return skill && skill.type !== "PASSIVE"
      })
    }

    return technique.unlockedSkills || []
  }

  static getSkillTree(player) {
    const technique = player.technique
    if (!technique) return []

    const definition = globalTechniqueEngine.getDefinition(technique.id)
    if (definition && definition.skills) {
      return Object.entries(definition.skills)
        .filter(([id, s]) => s.type !== "PASSIVE")
        .map(([id, s]) => s.id)
    }

    return technique.skillTree || []
  }

  static getSkillTreeDisplay(player) {
    const technique = player.technique
    if (!technique) return null

    const definition = globalTechniqueEngine.getDefinition(technique.id)
    if (!definition) return null

    const lines = [
      `━━━━━━━━━━━━━━━━━━━━━━━`,
      `  ${technique.name} - Skill Tree`,
      `━━━━━━━━━━━━━━━━━━━━━━━`,
      ``
    ]

    const skills = Object.entries(definition.skills).filter(([id, s]) => s.type !== "PASSIVE")
    const unlocked = technique.unlockedSkills || []

    for (const [skillId, skill] of skills) {
      const isUnlocked = unlocked.includes(skillId)
      const status = isUnlocked ? "✔" : "🔒"
      const effectText = skill.description ? `\n    ${skill.description}` : ""

      lines.push(`  ${status} ${skill.name}${effectText}`)
      lines.push(`    Requires: Lv${(skill.tier || 1) * 10} | Type: ${skill.type}`)

      if (!isUnlocked && player.level >= (skill.tier || 1) * 10 && player.skillPoints > 0) {
        lines.push(`    → Use /train ${skill.name}`)
      }

      lines.push(``)
    }

    lines.push(``)
    lines.push(`━━━━━━━━━━━━━━━━━━━━━━━`)
    lines.push(`Skill Points: ${player.skillPoints || 0}`)
    lines.push(`Use /train to check training progress`)

    return lines.join("\n")
  }

  static getMasterySkillRequirements(player, skillName) {
    const techniqueName = player.technique?.name
    if (!techniqueName) return null
    const config = this.getTechniqueMasteryConfig(techniqueName)
    if (!config) return null
    return config.masterySkills.find(s => s.name === skillName) || null
  }

  static getTrackerValue(player, eventType) {
    switch (eventType) {
      case "level": return player.level || 1
      case "xp": return player.xp || 0
      case "curse_kill": return player.curseKills || 0
      case "black_flash": return player.blackFlashes || 0
      case "special_grade_kill": return player.specialGradeKills || 0
      case "pvp_win": return player.pvpWins || 0
      case "block": return player.blocks || 0
      case "critical_hit": return player.criticalHits || 0
      case "damage_dealt": return player.totalDamageDealt || 0
      default:
        if (eventType.endsWith("_mastery")) {
          const skillName = eventType.replace("_mastery", "")
          return this.getMasteryLevel(player, skillName)
        }
        if (eventType === "shikigami_conquered") return this.getConqueredShikigamiCount(player) || 0
        return player.progression?.trackers?.[eventType] || 0
    }
  }

  static checkMasteryRequirements(player, skillName) {
    const skill = this.getMasterySkillRequirements(player, skillName)
    if (!skill) return { meets: false, reason: `Unknown skill: ${skillName}` }

    if (this.isMasterySkillUnlocked(player, skillName)) {
      return { meets: false, reason: "Already unlocked" }
    }

    const reqs = skill.requirements || []
    for (const req of reqs) {
      const current = this.getTrackerValue(player, req.type)
      if (current < req.amount) {
        return {
          meets: false,
          reason: `Requires ${req.type}: ${req.amount} (you have ${current})`,
          missing: { type: req.type, amount: req.amount, current }
        }
      }
    }

    const skills = this.getTechniqueMasterySkills(player.technique?.name || "")
    const skillIndex = skills.findIndex(s => s.name === skillName)
    if (skillIndex > 0) {
      const prevSkill = skills[skillIndex - 1]
      if (!this.isMasterySkillUnlocked(player, prevSkill.name)) {
        return {
          meets: false,
          reason: `Must unlock ${prevSkill.name} first`,
          missing: { type: "prerequisite", skill: prevSkill.name }
        }
      }
    }

    return { meets: true }
  }

  static async unlockMasterySkill(player, skillName) {
    if (!player || !player.technique?.name) {
      return { error: "You have no cursed technique." }
    }

    const check = this.checkMasteryRequirements(player, skillName)
    if (!check.meets) {
      return { error: check.reason }
    }

    if (!player.techniqueMastery) {
      player.techniqueMastery = {}
    }

    player.techniqueMastery[skillName] = {
      unlocked: true,
      level: 1,
      mastery: 0,
      unlockedAt: Date.now()
    }

    await savePlayer(player)
    return { success: true, skill: skillName }
  }

  static recordSkillUsage(player, skillName) {
    if (!player.techniqueMastery) player.techniqueMastery = {}
    if (!player.techniqueMastery[skillName]) {
      player.techniqueMastery[skillName] = { unlocked: true, level: 1, mastery: 0, unlockedAt: Date.now() }
    }
    const skillMastery = player.techniqueMastery[skillName]
    skillMastery.mastery = (skillMastery.mastery || 0) + 1

    const masteryThresholds = [10, 25, 50, 100]
    for (const threshold of masteryThresholds) {
      if (skillMastery.mastery >= threshold && skillMastery.level < masteryThresholds.indexOf(threshold) + 1) {
        skillMastery.level = masteryThresholds.indexOf(threshold) + 1
      }
    }

    try {
      savePlayer(player)
    } catch (err) {
      console.error("[MASTER YI ERROR] Failed to save mastery progress:", err.message)
    }
  }

  static getConqueredShikigami(player) {
    const ts = player.technique?.name
    if (ts !== "Ten Shadows Technique" && ts !== "Ten Shadows") return []
    return (player.shikigamiMastery && player.shikigamiMastery.conquered) || []
  }

  static getConqueredShikigamiCount(player) {
    return this.getConqueredShikigami(player).length
  }

  static isShikigamiConquered(player, shikigamiId) {
    const conquered = this.getConqueredShikigami(player)
    return conquered.includes(shikigamiId)
  }

  static canConquerShikigami(player, shikigamiId) {
    const ts = player.technique?.name
    if (ts !== "Ten Shadows Technique" && ts !== "Ten Shadows") {
      return { canConquer: false, reason: "You do not wield the Ten Shadows Technique." }
    }

    const shikigami = this.getShikigamiById(shikigamiId)
    if (!shikigami) {
      return { canConquer: false, reason: `Unknown shikigami: ${shikigamiId}` }
    }

    if (this.isShikigamiConquered(player, shikigamiId)) {
      return { canConquer: false, reason: `${shikigami.name} has already been conquered.` }
    }

    const req = shikigami.conquestRequirement
    if (!req) {
      return { canConquer: false, reason: "No conquest requirement defined." }
    }

    if (req.type === "direct") {
      return { canConquer: true }
    }

    if (req.prereqId) {
      if (!this.isShikigamiConquered(player, req.prereqId)) {
        const prevShiki = this.getShikigamiById(req.prereqId)
        return {
          canConquer: false,
          reason: `You must conquer ${prevShiki?.name || req.prereqId} first.`
        }
      }
    }

    return { canConquer: true }
  }

  static getShikigamiScaledStats(shikigami, playerLevel = 1) {
    const combatStats = ShikigamiCombatService.getScaledCombatStats({ level: playerLevel }, shikigami.id)
    if (!combatStats) {
      const scale = Math.max(0.5, playerLevel / 5)
      const base = shikigami.scaledStats || shikigami.baseStats
      return {
        hp: Math.floor((base.hp || 100) * scale),
        attack: Math.floor((base.attack || 20) * scale),
        defense: Math.floor((base.defense || 10) * scale),
        speed: Math.floor((base.speed || 20) * scale)
      }
    }
    return {
      hp: combatStats.hp,
      attack: combatStats.attack,
      defense: combatStats.defense,
      speed: combatStats.speed
    }
  }

  static getSummonableShikigami(player) {
    const ts = player.technique?.name
    if (ts !== "Ten Shadows Technique" && ts !== "Ten Shadows") {
      return []
    }
    const conquered = this.getConqueredShikigami(player)
    const allShikigami = this.getShikigamiList()
    return allShikigami.filter(s => conquered.includes(s.id))
  }

  static getShikigamiForBattle(player, shikigamiId) {
    const shikigami = this.getShikigamiById(shikigamiId)
    if (!shikigami) return null
    if (!this.isShikigamiConquered(player, shikigamiId)) return null

    const playerLevel = player.level || 1
    const stats = this.getShikigamiScaledStats(shikigami, playerLevel)

    return {
      id: shikigami.id,
      name: shikigami.name,
      emoji: shikigami.emoji,
      type: "shikigami",
      hp: stats.hp,
      maxHp: stats.hp,
      ce: 0,
      maxCe: 0,
      attack: stats.attack,
      techniqueDamage: stats.attack,
      defense: stats.defense,
      speed: stats.speed,
      skills: shikigami.abilities?.map(a => a.split(":")[0]) || [],
      abilities: shikigami.abilities || [],
      ceCost: shikigami.ceCost || 50,
      cooldown: shikigami.cooldown || 1,
      statusEffect: shikigami.statusEffect || null,
      grade: 2,
      isShikigami: true,
      shikigamiData: shikigami
    }
  }

  static getMasteryDisplay(player) {
    const technique = player.technique
    if (!technique) {
      return { error: "You have no cursed technique." }
    }

    const definition = globalTechniqueEngine.getDefinition(technique.id)
    if (!definition || !definition.skills) {
      return { error: "No mastery skills defined for your technique." }
    }

    const lines = []
    lines.push("")
    lines.push(`⚡ ${technique.name || "Unknown"}`)
    lines.push("━".repeat(18))
    lines.push("")

    const unlocked = technique.unlockedSkills || []

    for (const [skillId, skill] of Object.entries(definition.skills)) {
      if (skill.type === "PASSIVE") continue

      const isUnlocked = unlocked.includes(skillId)

      if (isUnlocked) {
        lines.push(skill.name)
        lines.push("✅ UNLOCKED")
        if (skill.description) {
          lines.push("  " + skill.description)
        }
      } else {
        lines.push(skill.name)
        lines.push("🔒 LOCKED")
        lines.push(`    Requires: Lv${(skill.tier || 1) * 10}`)
      }
      lines.push("")
    }

    return { display: lines.join("\n"), skills: Object.keys(definition.skills).filter(id => definition.skills[id].type !== "PASSIVE") }
  }

  static getTenShadowsDisplay(player) {
    const techniqueName = player.technique?.name
    if (techniqueName !== "Ten Shadows Technique" && techniqueName !== "Ten Shadows") {
      return { error: "You do not wield the Ten Shadows Technique." }
    }

    const allShikigami = this.getShikigamiList()
    const conquered = this.getConqueredShikigami(player)
    const summonable = this.getSummonableShikigami(player)

    const lines = []
    lines.push("")
    lines.push("⚡ Ten Shadows Technique")
    lines.push("━".repeat(18))
    lines.push("")

    allShikigami.forEach(s => {
      const isConquered = conquered.includes(s.id)
      const canConquer = this.canConquerShikigami(player, s.id)
      const status = isConquered ? "✅" : (canConquer.canConquer ? "🔸" : "🔒")

      lines.push(s.emoji + " " + s.name)
      lines.push("  " + status + (isConquered ? " CONQUERED" : canConquer.canConquer ? " AVAILABLE" : " " + (canConquer.reason || "LOCKED")))
    })

    lines.push("")
    lines.push("━".repeat(18))
    lines.push("")
    lines.push("Conquered: " + conquered.length + "/" + allShikigami.length)

    if (conquered.length > 0) {
      lines.push("Summonable:")
      summonable.forEach(s => {
        lines.push("  " + s.emoji + " " + s.name + " — /summon " + s.id)
      })
    }

    if (techniqueName === "Ten Shadows Technique" || techniqueName === "Ten Shadows") {
      const next = allShikigami.find(s => !conquered.includes(s.id))
      if (next) {
        const canNext = this.canConquerShikigami(player, next.id)
        lines.push("")
        lines.push("Next: " + next.emoji + " " + next.name)
        if (canNext.canConquer) {
          lines.push("Use /train-" + next.id + " to challenge")
        } else {
          lines.push("Status: " + canNext.reason)
        }
      }
    }

    return { display: lines.join("\n"), conquered, summonable }
  }

  static getEventLabel(eventType) {
    const labels = {
      level: "Level",
      xp: "XP",
      curse_kill: "Curse Kills",
      black_flash: "Black Flashes",
      special_grade_kill: "Special Grade Kills",
      pvp_win: "PvP Wins",
      block: "Blocks",
      critical_hit: "Critical Hits",
      damage_dealt: "Damage Dealt",
      shikigami_conquered: "Shikigami Conquered",
      domain_unlocked: "Domain"
    }
    if (labels[eventType]) return labels[eventType]
    if (eventType.endsWith("_mastery")) {
      const skill = eventType.replace("_mastery", "")
      return skill + " Mastery"
    }
    return eventType
  }

  static async checkAllMasteryUnlocks(player) {
    if (!player || !player.technique?.name) return null

    const techniqueName = player.technique.name
    const skills = this.getTechniqueMasterySkills(techniqueName)
    if (!skills.length) return null

    const unlocked = []
    const notifications = []

    for (const skill of skills) {
      if (this.isMasterySkillUnlocked(player, skill.name)) continue

      const check = this.checkMasteryRequirements(player, skill.name)
      if (check.meets) {
        const result = await this.unlockMasterySkill(player, skill.name)
        if (result.success) {
          unlocked.push(skill.name)
          notifications.push({
            skill: skill.name,
            description: skill.description || "",
            tier: skill.tier
          })
        }
      }
    }

    if (notifications.length > 0) {
      const messages = notifications.map(n =>
        `✨ MASTERY UNLOCKED\n\n${n.skill}\n${n.description || ""}`
      )
      return {
        unlocked: notifications,
        messages: messages.join("\n\n━━━━━━━━━━━━━━━━━━━━━━\n\n")
      }
    }

    return null
  }

  static async recordShikigamiConquest(player, shikigamiId) {
    if (!player.shikigamiMastery) {
      player.shikigamiMastery = {
        conquered: [],
        currentTraining: null,
        trainingStartTime: null
      }
    }
    if (!player.shikigamiMastery.conquered) {
      player.shikigamiMastery.conquered = []
    }

    if (!player.shikigamiMastery.conquered.includes(shikigamiId)) {
      player.shikigamiMastery.conquered.push(shikigamiId)
      player.shikigamiMastery.currentTraining = null
      player.shikigamiMastery.trainingStartTime = null
      await savePlayer(player)
      return { success: true, shikigamiId }
    }

    return { success: false, alreadyConquered: true }
  }
}
