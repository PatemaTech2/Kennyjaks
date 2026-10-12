import { SKILL_REQUIREMENTS } from "../../config/skillRequirements.js"
import { TECHNIQUES } from "../../config/constants.js"
import { savePlayer } from "../../database/playerRepo.js"
import { TechniqueMasteryService } from "../technique/TechniqueMasteryService.js"
import { isPassive } from "../technique/skillTypes.js"
import { globalTechniqueEngine } from "../technique/TechniqueEngine.js"

class ProgressionManager {
  static getTechniqueDefinition(techniqueName) {
    return TECHNIQUES.find(t => t.name === techniqueName) || null
  }

  static getSkillRequirements(techniqueName, skillName) {
    const techniqueReqs = SKILL_REQUIREMENTS[techniqueName]
    if (!techniqueReqs) return null
    const reqs = techniqueReqs[skillName]
    if (!reqs) return null
    return {
      name: skillName,
      requirements: Object.entries(reqs).map(([type, amount]) => ({ type, amount }))
    }
  }

  static getAllTechniqueSkills(techniqueName) {
    const technique = this.getTechniqueDefinition(techniqueName)
    if (!technique) return []

    const skills = []
    if (technique.branches) {
      for (const branch of technique.branches) {
        const skillTree = branch.skillTree || []
        for (const skillName of skillTree) {
          if (!skills.find(s => s.name === skillName)) {
            skills.push({ name: skillName, branch: branch.name, tier: 1 })
          }
        }
        const unlockedSkills = branch.unlockedSkills || []
        for (const skillName of unlockedSkills) {
          if (!skills.find(s => s.name === skillName)) {
            skills.push({ name: skillName, branch: branch.name, tier: 2 })
          }
        }
      }
    }

    if (technique.skillTree && !skills.length) {
      for (const skillName of technique.skillTree) {
        skills.push({ name: skillName, branch: technique.branch || "None", tier: 1 })
      }
    }

    if (technique.unlockedSkills && !skills.length) {
      for (const skillName of technique.unlockedSkills) {
        skills.push({ name: skillName, branch: technique.branch || "None", tier: 2 })
      }
    }

    return skills
  }

  static getSortedSkills(techniqueName) {
    const skills = this.getAllTechniqueSkills(techniqueName)
    return skills
  }

  static getPlayerProgress(player, skillName) {
    const techniqueName = player.technique?.name
    if (!techniqueName) return { current: 0, needed: 1, type: null, completed: false }

    const config = this.getSkillRequirements(techniqueName, skillName)
    if (!config) return { current: 0, needed: 1, type: null, completed: false }

    const isUnlocked = this.isSkillUnlocked(player, skillName)
    if (isUnlocked) return { current: 1, needed: 1, type: null, completed: true }

    const reqs = config.requirements || []
    for (const req of reqs) {
      if (req.type === "level") continue
      const tracked = this.getTrackerValue(player, req.type)
      if (tracked < req.amount) {
        return {
          current: tracked,
          needed: req.amount,
          type: req.type,
          completed: tracked >= req.amount
        }
      }
    }

    return { current: 0, needed: 0, type: null, completed: true }
  }

  static getTrackerValue(player, eventType) {
    switch (eventType) {
      case "level": return player.level || 1
      case "xp": return player.xp || 0
      case "curse_kill": return player.curseKills || 0
      case "black_flash": return player.blackFlashes || 0
      case "special_grade_kill": return player.specialGradeKills || 0
      case "pvp_win": return player.pvpWins || 0
      case "mission_complete": return (player.completedMissions || []).length
      case "block": return player.blocks || 0
      case "critical_hit": return player.criticalHits || 0
      case "damage_dealt": return player.totalDamageDealt || 0
      case "domain_unlocked":
        return (player.technique?.unlockedSkills?.includes("Domain Expansion") || player.domainExpansion?.name) ? 1 : 0
      default: return player.progression?.trackers?.[eventType] || 0
    }
  }

  static async recordEvent(player, event_type, amount = 1) {
    if (!player) return null
    if (!player.technique) return null

    const techniqueName = player.technique.name
    if (!techniqueName) return null

    if (!player.progression) {
      player.progression = {
        trackers: {},
        unlockedSkills: [],
        activeTraining: null
      }
    }
    if (!player.progression.trackers) player.progression.trackers = {}

    if (["curse_kill", "black_flash", "special_grade_kill", "pvp_win", "mission_complete", "block", "critical_hit", "damage_dealt"].includes(event_type)) {
    } else {
      const prevValue = player.progression.trackers[event_type] || 0
      player.progression.trackers[event_type] = prevValue + amount
    }

    console.log(`[TRAIN] Player: ${player.name || "Unknown"} | Event: ${event_type} | Current ${event_type}: ${this.getTrackerValue(player, event_type)}`)

    const result = await this.checkAllUnlocks(player)

    const masteryResult = await TechniqueMasteryService.checkAllMasteryUnlocks(player)

    if (result && masteryResult) {
      return {
        unlocked: result.unlocked,
        messages: result.messages + (masteryResult ? "\n\n" + masteryResult.messages : ""),
        masteryUnlocked: masteryResult
      }
    }

    if (result) return result
    if (masteryResult) return { unlocked: [], messages: masteryResult.messages, masteryUnlocked: masteryResult }

    return result
  }

  static async checkAllUnlocks(player) {
    if (!player || !player.technique) return null

    const techniqueName = player.technique.name
    const skills = this.getAllTechniqueSkills(techniqueName)
    if (!skills.length) return null

    const notifications = []
    const technique = globalTechniqueEngine.getDefinition(player.technique.id)
    const allSkillIds = technique
      ? Object.keys(technique.skills).filter(id => !isPassive(technique.skills[id].type))
      : []

    if (!player.progression) {
      player.progression = { trackers: {}, unlockedSkills: [], activeTraining: null }
    }
    if (!player.progression.unlockedSkills) player.progression.unlockedSkills = []
    if (!player.technique.unlockedSkills) player.technique.unlockedSkills = []

    for (const skillId of allSkillIds) {
      const skillName = technique.skills[skillId].name

      if (!player.technique.unlockedSkills.includes(skillId)) {
        player.technique.unlockedSkills.push(skillId)
      }
      if (!player.progression.unlockedSkills.includes(skillName)) {
        player.progression.unlockedSkills.push(skillName)
      }

      if (!notifications.find(n => n.skill === skillName)) {
        notifications.push({
          skill: skillName,
          displayName: skillName,
          command: this.getSkillCommand(player, skillName),
          tier: 1
        })
      }
    }

    try {
      await savePlayer(player)
    } catch (err) {
      console.error("[TRAIN] Failed to save player after unlock:", err.message)
    }

    if (notifications.length > 0) {
      const messages = notifications.map(n =>
        `✨ TECHNIQUE EVOLVED\n\n${n.displayName}\nUnlocked.\n\nUse\n${n.command}`
      )
      return {
        unlocked: notifications,
        messages: messages.join("\n\n━━━━━━━━━━━━━━━━━━━━━━\n\n")
      }
    }

    return null
  }

  static getSkillCommand(player, skillName) {
    const unlocked = player.technique?.unlockedSkills || []
    const idx = unlocked.indexOf(skillName)
    if (idx >= 0) return `/btq${idx + 1}`

    const progressionUnlocked = player.progression?.unlockedSkills || []
    const allUnlocked = [...unlocked, ...progressionUnlocked]
    const progIdx = allUnlocked.indexOf(skillName)
    if (progIdx >= 0) return `/btq${progIdx + 1}`

    return `/btq${allUnlocked.length + 1}`
  }

  static checkRequirements(player, skill) {
    if (!player) return false
    if (!player.level && !player.technique) return false

    const skillName = typeof skill === "string" ? skill : skill.name
    const techniqueName = typeof skill === "string" ? player.technique?.name : player.technique?.name
    if (!techniqueName || !skillName) return false

    const config = this.getSkillRequirements(techniqueName, skillName)
    if (!config || !config.requirements) return false
    const reqs = config.requirements

    for (const req of reqs) {
      const current = this.getTrackerValue(player, req.type)
      if (current < req.amount) return false
    }

    return true
  }

  static isSkillUnlocked(player, skillName) {
    if (!player) return false

    const techniqueSkills = player.technique?.unlockedSkills || []
    if (techniqueSkills.includes(skillName)) return true

    const progressionUnlocked = player.progression?.unlockedSkills || []
    if (progressionUnlocked.includes(skillName)) return true

    return false
  }

  static getUnlockedSkills(player) {
    const techniqueName = player.technique?.name
    if (!techniqueName) return []

    const skills = this.getAllTechniqueSkills(techniqueName)
    const allUnlocked = new Set([
      ...(player.technique?.unlockedSkills || []),
      ...(player.progression?.unlockedSkills || [])
    ])

    return skills
      .filter(s => allUnlocked.has(s.name))
      .map(s => ({
        name: s.name,
        displayName: s.name,
        command: this.getSkillCommand(player, s.name),
        tier: s.tier
      }))
  }

  static getActiveTraining(player, skillName) {
    const activeTraining = player.progression?.activeTraining
    if (!activeTraining) return null
    if (activeTraining.skill !== skillName) return null
    return activeTraining
  }

  static async setActiveTraining(player, skillName) {
    if (!player) return { error: "Player data error" }

    const techniqueName = player.technique?.name
    if (!techniqueName) return { error: "You have no cursed technique." }

    const config = this.getSkillRequirements(techniqueName, skillName)
    if (!config) return { error: `Unknown skill: ${skillName}` }

    if (this.isSkillUnlocked(player, skillName)) {
      return { error: `You have already unlocked ${skillName}.` }
    }

    if (!player.progression) {
      player.progression = { trackers: {}, unlockedSkills: [], activeTraining: null }
    }
    if (!player.progression.trackers) player.progression.trackers = {}
    if (!player.progression.unlockedSkills) player.progression.unlockedSkills = []

    const existingActive = player.progression.activeTraining
    if (existingActive && existingActive.skill === skillName) {
      const progress = this.getPlayerProgress(player, skillName)
      return {
        training: skillName,
        progress: progress.current,
        needed: progress.needed,
        type: progress.type
      }
    }

    const canTrain = this.canTrainSkill(player, skillName)
    if (!canTrain.canTrain) {
      return { error: canTrain.reason }
    }

    if (existingActive) {
      return { error: `⚠️ You are already training ${existingActive.skill}.` }
    }

    player.progression.activeTraining = {
      skill: skillName,
      startTime: Date.now()
    }

    savePlayer(player).catch(err => console.error("[TRAIN] Failed to save training:", err.message))

    const progress = this.getPlayerProgress(player, skillName)
    return {
      training: skillName,
      progress: progress.current,
      needed: progress.needed,
      type: progress.type
    }
  }

  static canTrainSkill(player, skillName) {
    const techniqueName = player.technique?.name
    if (!techniqueName) return { canTrain: false, reason: "You have no cursed technique." }

    const config = this.getSkillRequirements(techniqueName, skillName)
    if (!config) return { canTrain: false, reason: `Unknown skill: ${skillName}` }

    if (this.isSkillUnlocked(player, skillName)) {
      return { canTrain: false, reason: `You have already unlocked ${skillName}.` }
    }

    const skills = this.getAllTechniqueSkills(techniqueName)
    const skillIndex = skills.findIndex(s => s.name === skillName)

    if (skillIndex > 0) {
      const prevSkill = skills[skillIndex - 1]
      if (!this.isSkillUnlocked(player, prevSkill.name)) {
        return { canTrain: false, reason: `You must unlock ${prevSkill.name} first.` }
      }
    }

    return { canTrain: true }
  }

  static getTrainingDisplay(player) {
    const techniqueName = player.technique?.name
    if (!techniqueName) return { error: "You have no cursed technique." }

    const skills = this.getAllTechniqueSkills(techniqueName)
    const activeTraining = player.progression?.activeTraining
    const unlockedCount = skills.filter(s => this.isSkillUnlocked(player, s.name)).length

    const lines = []
    lines.push("⚡ " + (techniqueName || "Unknown").toUpperCase())
    lines.push("━".repeat(18))
    lines.push("")

    skills.forEach(skill => {
      const isUnlocked = this.isSkillUnlocked(player, skill.name)
      const command = this.getSkillCommand(player, skill.name)

      if (isUnlocked) {
        lines.push(skill.name)
        lines.push("✅ UNLOCKED")
      } else {
        lines.push(skill.name)
        lines.push("🔒 LOCKED")

        const config = this.getSkillRequirements(techniqueName, skill.name)
        if (config && config.requirements) {
          lines.push("Requirements")
          config.requirements.forEach(req => {
            const current = this.getTrackerValue(player, req.type)
            const met = current >= req.amount
            const label = this.getEventLabel(req.type)
            lines.push(label)
            lines.push(`${req.amount} ${met ? "✅" : "🔸"}`)
          })
        }

        const progress = this.getPlayerProgress(player, skill.name)
        if (progress.type && progress.needed > 0) {
          lines.push("Training")
          lines.push(`${progress.current} / ${progress.needed} ${this.getEventLabel(progress.type)}`)
          const pct = Math.round((progress.current / progress.needed) * 100)
          lines.push("Progress")
          lines.push(`${pct}%`)
        }
      }
      lines.push("━".repeat(18))
    })

    lines.push("")
    lines.push("Skills: " + unlockedCount + "/" + skills.length)

    if (activeTraining) {
      lines.push("ACTIVE: " + activeTraining.skill)
    }

    if (player.hasRCT && player.reversedTechnique) {
      lines.push("")
      lines.push("━".repeat(18))
      lines.push("")
      lines.push("🔄 REVERSE TECHNIQUE")
      lines.push("━".repeat(18))
      lines.push("")
      lines.push(player.reversedTechnique.name)
      lines.push("UNLOCKED")
      if (player.reversedTechnique.damage !== undefined) {
        lines.push(`Damage: ${player.reversedTechnique.damage}`)
      }
      if (player.reversedTechnique.ceCost !== undefined) {
        lines.push(`CE Cost: ${player.reversedTechnique.ceCost}`)
      }
      lines.push("")
      lines.push("Use")
      lines.push("/rtu (in battle)")
    }

    return { display: lines.join("\n"), activeTraining }
  }

  static getEventLabel(eventType) {
    const labels = {
      level: "Level",
      xp: "XP",
      curse_kill: "Curse Kills",
      black_flash: "Black Flashes",
      special_grade_kill: "Special Grade Kills",
      pvp_win: "PvP Wins",
      mission_complete: "Missions",
      block: "Blocks",
      critical_hit: "Critical Hits",
      damage_dealt: "Damage Dealt",
      domain_unlocked: "Domain"
    }
    return labels[eventType] || eventType
  }

  static getPreGrantedSkills(techniqueName) {
    const technique = this.getTechniqueDefinition(techniqueName)
    if (!technique) return []
    const preGranted = new Set()
    if (technique.branches) {
      for (const branch of technique.branches) {
        if (branch.unlockedSkills) {
          branch.unlockedSkills.forEach(s => preGranted.add(s))
        }
      }
    }
    if (technique.unlockedSkills) {
      technique.unlockedSkills.forEach(s => preGranted.add(s))
    }
    return preGranted
  }

  static async migratePlayer(player) {
    if (!player) return null
    if (!player.technique || !player.technique.name) return null

    const techniqueName = player.technique.name

    if (!player.progression) {
      player.progression = {
        trackers: {},
        unlockedSkills: [],
        activeTraining: null
      }
    }
    if (!player.progression.trackers) player.progression.trackers = {}
    if (!player.progression.unlockedSkills) player.progression.unlockedSkills = []

    if (!player.specialGradeKills) player.specialGradeKills = 0
    if (!player.criticalHits) player.criticalHits = 0

    const initialTrackers = {
      curse_kill: player.curseKills || 0,
      black_flash: player.blackFlashes || 0,
      special_grade_kill: player.specialGradeKills || 0,
      pvp_win: player.pvpWins || 0,
      mission_complete: (player.completedMissions || []).length,
      block: player.blocks || 0,
      critical_hit: player.criticalHits || 0,
      damage_dealt: player.totalDamageDealt || 0,
      xp_gain: player.xp || 0,
      level_up: (player.level || 1) - 1,
      domain_unlocked: player.domainExpansion?.name ? 1 : 0
    }

    for (const [key, value] of Object.entries(initialTrackers)) {
      if ((player.progression.trackers[key] || 0) < value) {
        player.progression.trackers[key] = value
      }
    }

    const preGranted = this.getPreGrantedSkills(techniqueName)
    const definition = globalTechniqueEngine.getDefinition(player.technique.id)
    const allSkillIds = definition
      ? Object.keys(definition.skills).filter(id => !isPassive(definition.skills[id].type))
      : []
    const allSkillNames = allSkillIds.map(id => definition.skills[id].name)

    player.progression.unlockedSkills = [...new Set([...(player.progression.unlockedSkills || []), ...allSkillNames])]
    player.technique.unlockedSkills = [...new Set([...(player.technique.unlockedSkills || []), ...preGranted, ...allSkillIds])]

    try {
      await savePlayer(player)
    } catch (err) {
      console.error("[MIGRATION] Failed to save player:", err.message)
    }

    const result = await this.checkAllUnlocks(player)

    return result ? result.unlocked : []
  }

  static async migrateAllPlayers(players) {
    const results = {
      total: players.length,
      migrated: 0,
      unlocked: 0,
      unlockedList: [],
      errors: []
    }

    for (const player of players) {
      try {
        const unlocked = await this.migratePlayer(player)
        if (unlocked && unlocked.length > 0) {
          results.migrated++
          results.unlocked += unlocked.length
          results.unlockedList.push({
            player: player.name || "Unknown",
            skills: unlocked.map(s => s.displayName || s.skill).join(", ")
          })
        }
      } catch (err) {
        results.errors.push({ player: player.name, error: err.message })
        console.error(`[MIGRATION] Error migrating player ${player.name}:`, err.message)
      }
    }

    console.log(`[MIGRATION] Complete: ${results.migrated}/${results.total} players migrated, ${results.unlocked} skills unlocked`)
    return results
  }
}

export { ProgressionManager }
