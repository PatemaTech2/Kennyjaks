import fs from "fs-extra"
import path from "path"
import { loadPlayerByPhone, savePlayer } from "../../database/playerRepo.js"
import { TECHNIQUES } from "../../config/constants.js"
import { SKILL_EFFECTS } from "../../data/skills/skillEffects.js"
import { DailyService } from "../daily/DailyService.js"
import { BALANCE } from "../../config/balance.js"
import { globalTechniqueEngine } from "./TechniqueEngine.js"
import { migrateSinglePlayer } from "./techniqueMigrationRunner.js"
import { isPassive } from "./skillTypes.js"

const TRAINING_STATE_DIR = path.join(process.cwd(), "database", "training")

function getTrainingStatePath(playerId) {
  return path.join(TRAINING_STATE_DIR, `${playerId}.json`)
}

async function loadTrainingState(playerId) {
  try {
    await fs.ensureDir(TRAINING_STATE_DIR)
    const filePath = getTrainingStatePath(playerId)
    if (await fs.pathExists(filePath)) {
      return await fs.readJson(filePath)
    }
  } catch {}
  return {
    techniqueName: null,
    startTime: null,
    totalSeconds: 0,
    progress: {},
    lastClaim: null,
    events: []
  }
}

async function saveTrainingState(playerId, state) {
  await fs.ensureDir(TRAINING_STATE_DIR)
  await fs.writeJson(getTrainingStatePath(playerId), state, { spaces: 2 })
}

const TRAINING_CONFIG = BALANCE.TRAINING_CONFIG

function getSkillRequirements(skillName) {
  const config = TRAINING_CONFIG.skillRequirements[skillName]
  if (config) return config
  return { level: 5, trainingMinutes: 30 }
}

export class TechniqueService {
  static getTechnique(player) {
    return player.technique || null
  }

  static getSkillTree(player) {
    const technique = this.getTechnique(player)
    if (!technique) return []

    const definition = globalTechniqueEngine.getDefinition(technique.id)
    if (definition && definition.skills) {
      return Object.entries(definition.skills)
        .filter(([id, s]) => !isPassive(s.type))
        .map(([id, s]) => s.id)
    }

    return technique.skillTree || []
  }

  static getUnlockedSkills(player) {
    const technique = this.getTechnique(player)
    if (!technique) return []

    const definition = globalTechniqueEngine.getDefinition(technique.id)
    if (definition && definition.skills) {
      return (technique.unlockedSkills || []).filter(skillId => {
        const skill = definition.skills[skillId]
        return skill && !isPassive(skill.type)
      })
    }

    return technique.unlockedSkills || []
  }

  static isSkillUnlocked(player, skillName) {
    return this.getUnlockedSkills(player).includes(skillName)
  }

  static getTechniqueBranches(player) {
    const technique = this.getTechnique(player)
    if (!technique) return []
    return technique.branches || []
  }

  static getBranchSkillTrees(player) {
    const technique = this.getTechnique(player)
    if (!technique) return []
    return technique.branches || []
  }

  static async trainSkill(player, skillName) {
    const result = await this.unlockSkill(player, skillName)
    if (result.error) {
      return { error: result.error }
    }

    const technique = this.getTechnique(player)
    const branch = technique.branches?.find(b => b.skillTree.includes(skillName))
    if (branch) {
      branch.mastery = (branch.mastery || 1) + 1
    }
    technique.mastery = (technique.mastery || 1) + 0.1

    await DailyService.trainTechnique(player)
    await savePlayer(player)
    return {
      success: true,
      skill: result.skill,
      message: `Unlocked: ${result.skill}\n${SKILL_EFFECTS[skillName]?.description || ""}`,
      remainingPoints: player.skillPoints
    }
  }

  static async startTraining(player, branchName = null) {
    const state = await loadTrainingState(player.playerId)
    const technique = this.getTechnique(player)
    if (!technique) {
      return { error: "You have no cursed technique to train." }
    }

    const branch = branchName
      ? technique.branches?.find(b => b.name.toLowerCase() === branchName.toLowerCase())
      : technique.branches?.[0]

    if (!branch) {
      return { error: "Branch not found. Available: " + (technique.branches?.map(b => b.name).join(", ") || "None") }
    }

    state.techniqueName = technique.name
    state.branchName = branch.name
    state.startTime = Date.now()
    state.lastClaim = Date.now()
    state.progress = {}
    state.events = []
    state.totalSeconds = 0

    await saveTrainingState(player.playerId, state)
    return {
      success: true,
      message: `Training started for ${technique.name} - ${branch.name}!`,
      branch: branch.name
    }
  }

  static async claimTraining(player) {
    const state = await loadTrainingState(player.playerId)
    if (!state.startTime) {
      return { error: "You are not training. Use /train <branch-name> to start." }
    }

    const now = Date.now()
    const elapsedSeconds = Math.floor((now - state.lastClaim) / 1000)
    if (elapsedSeconds <= 0) {
      return { error: "No training progress to claim yet." }
    }

    state.totalSeconds += elapsedSeconds
    state.lastClaim = now

    const technique = this.getTechnique(player)
    if (!technique) {
      return { error: "You have no cursed technique to train." }
    }

    const branch = technique.branches?.find(b => b.name === state.branchName)
    if (!branch) {
      return { error: "Training branch not found." }
    }

    const progress = this.calculateTrainingProgress(player, branch, state.totalSeconds)
    state.progress = progress

    const randomEvent = this.triggerRandomEvent(player, elapsedSeconds)
    if (randomEvent) {
      state.events.push(randomEvent)
      state.events = state.events.slice(-5)
    }

    await saveTrainingState(player.playerId, state)
    await savePlayer(player)

    return {
      success: true,
      progress,
      message: this.formatTrainingProgress(progress, randomEvent, technique),
      events: state.events
    }
  }

  static calculateTrainingProgress(player, branch, totalSeconds) {
    const skillTree = branch.skillTree || []
    const unlockedSkills = branch.unlockedSkills || []
    const progress = {}

    skillTree.forEach((skill, index) => {
      const req = getSkillRequirements(skill)
      const requiredSeconds = req.trainingMinutes * 60
      const alreadyTrained = unlockedSkills.includes(skill)
      const isNext = index === unlockedSkills.length
      const effectiveSeconds = alreadyTrained ? requiredSeconds : totalSeconds
      const pct = Math.min(100, Math.floor((effectiveSeconds / requiredSeconds) * 100))
      progress[skill] = {
        skill,
        unlocked: alreadyTrained,
        available: player.level >= req.level && !alreadyTrained,
        requiredLevel: req.level,
        trainingMinutes: req.trainingMinutes,
        progress: pct,
        canUnlock: isNext && player.level >= req.level && !alreadyTrained
      }
    })

    return progress
  }

  static triggerRandomEvent(player, elapsedSeconds) {
    if (elapsedSeconds < 300) return null
    if (Math.random() < 0.15) {
      const events = [
        { type: "insight", message: "💡 Insight! Your understanding of cursed energy deepened.", effect: "mastery_up" },
        { type: "breakthrough", message: "⚡ Breakthrough! You felt your technique surge.", effect: "power_up" },
        { type: "stamina", message: "😅 You trained too hard and drained your CE. Recovery needed.", effect: "ce_drain" },
        { type: "focus", message: "🎯 Perfect form! Your precision improved.", effect: "accuracy_up" },
        { type: "fatigue", message: "😴 Exhausted from training. Take a break.", effect: "fatigue" }
      ]
      return events[Math.floor(Math.random() * events.length)]
    }
    return null
  }

  static formatTrainingProgress(progress, event, technique) {
    const lines = [
      `━━━━━━━━━━━━━━━━━━━━━━━`,
      `  Training Progress`,
      technique.name,
      `━━━━━━━━━━━━━━━━━━━━━━━`,
      ``
    ]

    let hasAvailable = false
    Object.entries(progress).forEach(([skill, info]) => {
      if (info.unlocked) {
        lines.push(`✔ ${skill}`)
        lines.push(`   Unlocked`)
      } else if (info.canUnlock && info.progress >= 100) {
        lines.push(`✨ ${skill}`)
        lines.push(`   Ready to unlock! Use /train ${skill}`)
        hasAvailable = true
      } else if (info.available) {
        lines.push(`◐ ${skill}`)
        lines.push(`   Lv${info.requiredLevel} | ${info.progress}% (${info.trainingMinutes}m)`)
        hasAvailable = true
      } else {
        lines.push(`🔒 ${skill}`)
        lines.push(`   Requires Lv${info.requiredLevel}`)
      }
      lines.push(``)
    })

    if (event) {
      lines.push(`━━━━━━━━━━━━━━━━━━━━━━━`)
      lines.push(`  Random Event`)
      lines.push(`━━━━━━━━━━━━━━━━━━━━━━━`)
      lines.push(event.message)
      lines.push(``)
    }

    return lines.join("\n")
  }

  static async unlockSkill(player, skillName) {
    const technique = this.getTechnique(player)
    if (!technique) return { error: "You have no cursed technique." }

    const definition = globalTechniqueEngine.getDefinition(technique.id)
    if (!definition) {
      return { error: "Unknown technique definition." }
    }

    const skillEntry = Object.entries(definition.skills).find(([id, s]) => s.name === skillName || id === skillName)
    if (!skillEntry) {
      return { error: "This skill is not in your technique's skill tree." }
    }

    const [skillId, skill] = skillEntry

    if (isPassive(skill.type)) {
      return { error: "Passive skills cannot be trained or unlocked manually." }
    }

    const unlocked = technique.unlockedSkills || []
    if (unlocked.includes(skillId)) {
      return { error: "Skill already unlocked." }
    }

    if (!technique.unlockedSkills) technique.unlockedSkills = []
    technique.unlockedSkills.push(skillId)

    await DailyService.trainTechnique(player)

    return {
      success: true,
      skill: skill.name,
      skillId: skillId
    }
  }

  static getSkillTreeDisplay(player) {
    const technique = this.getTechnique(player)
    if (!technique) return null

    const definition = globalTechniqueEngine.getDefinition(technique.id)
    if (!definition) return null

    const lines = [
      `━━━━━━━━━━━━━━━━━━━━━━━`,
      `  ${technique.name} - Skill Tree`,
      `━━━━━━━━━━━━━━━━━━━━━━━`,
      ``
    ]

    const skills = Object.entries(definition.skills).filter(([id, s]) => !isPassive(s.type))
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

  static getBranchProgress(player, branchName) {
    return loadTrainingState(player.playerId).then(state => {
      const technique = this.getTechnique(player)
      if (!technique) return null
      const branch = technique.branches?.find(b => b.name.toLowerCase() === branchName.toLowerCase())
      if (!branch) return null
      return this.calculateTrainingProgress(player, branch, state.totalSeconds)
    })
  }

  static getMasteryInfo(player) {
    const technique = this.getTechnique(player)
    if (!technique) return null
    return {
      name: technique.name,
      branch: technique.branch || "None",
      mastery: 0,
      challengesCompleted: 0,
      currentChallenge: null
    }
  }
}
