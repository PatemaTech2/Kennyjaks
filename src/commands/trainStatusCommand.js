import { sendQuotedWithFooter } from "../utils/messageHelper.js"
import { loadPlayerByPhone } from "../database/playerRepo.js"
import { ProgressionManager } from "../services/progression/ProgressionManager.js"
import { getPotentialInfo } from "../services/technique/PotentialService.js"

export async function handleTrainStatus(sock, message) {
  const remoteJid = message.key.remoteJid
  const sender = message.key.participant || remoteJid
  const phoneNumber = sender.split("@")[0]

  const player = await loadPlayerByPhone(phoneNumber)
  if (!player) {
    await sendQuotedWithFooter(sock, remoteJid, "You need to register first.\n\nUse /start to begin.", message)
    return
  }

  if (!player.technique) {
    await sendQuotedWithFooter(sock, remoteJid, "You have no cursed technique.", message)
    return
  }

  const techniqueName = player.technique?.name || "Unknown"
  const skills = ProgressionManager.getSortedSkills(techniqueName)
  const unlocked = player.progression?.unlockedSkills || []
  const activeTraining = player.progression?.activeTraining

  const barWidth = 20
  const lines = []
  lines.push("━━━━━━━━━━━━━━━━━━━━━━")
  lines.push("TRAINING STATUS")
  lines.push("━━━━━━━━━━━━━━━━━━━━━━")
  lines.push("")
  lines.push(`⚡ ${techniqueName}`)
  lines.push(`Branch: ${player.technique?.branch || "None"}`)

  const potentialInfo = getPotentialInfo(player.potential || "F")
  lines.push(`Potential: ${player.potential || "F"} (${potentialInfo?.label || "F"})`)
  lines.push("")

  const skillsUnlocked = ProgressionManager.getUnlockedSkills(player)
  lines.push(`Skills Unlocked: ${skillsUnlocked.length}/${skills.length}`)
  lines.push("")

  if (activeTraining) {
    const skill = ProgressionManager.getSkillConfig(techniqueName, activeTraining.skill)
    const progress = ProgressionManager.getPlayerProgress(player, activeTraining.skill)
    lines.push(`ACTIVE TRAINING: ${activeTraining.skill}`)
    if (skill?.description) lines.push(skill.description)
    lines.push(`Progress: ${progress.current}/${progress.needed} ${progress.type || ""}`)

    const pct = progress.needed > 0 ? Math.round((progress.current / progress.needed) * 100) : 100
    const filled = Math.floor((pct / 100) * barWidth)
    let bar = ""
    for (let i = 0; i < barWidth; i++) {
      bar += i < filled ? "█" : "░"
    }
    lines.push(`Progress Bar: ${bar}`)
    lines.push(`${pct}%`)
    lines.push("")
  }

  if (skillsUnlocked.length > 0) {
    lines.push("Unlocked Skills:")
    skillsUnlocked.forEach(s => {
      lines.push(`  ✅ ${s.name} - ${s.command}`)
    })
    lines.push("")
  }

  const nextSkill = skills.find(s => !ProgressionManager.isSkillUnlocked(player, s.name))
  if (nextSkill) {
    const command = ProgressionManager.getSkillCommand(player, nextSkill.name)
    lines.push(`Next: ${nextSkill.name} (${command})`)
    const reqs = nextSkill.requirements || []
    reqs.forEach(req => {
      const label = ProgressionManager.getEventLabel(req.type)
      let current = 0
      if (req.type === "level") current = player.level || 1
      else if (req.type === "corpse_kill") current = player.curseKills || 0
      else if (req.type === "curse_kill") current = player.curseKills || 0
      else if (req.type === "black_flash") current = player.blackFlashes || 0
      else if (req.type === "special_grade_kill") current = player.specialGradeKills || 0
      else if (req.type === "pvp_win") current = player.pvpWins || 0
      else if (req.type === "mission_complete") current = (player.completedMissions || []).length
      else if (req.type === "block") current = player.blocks || 0
      else if (req.type === "critical_hit") current = player.criticalHits || 0
      else if (req.type === "damage_dealt") current = player.totalDamageDealt || 0
      else current = player.progression?.trackers?.[req.type] || 0
      const met = current >= req.amount
      lines.push(`  ${met ? "✅" : "🔸"} ${label}: ${current}/${req.amount}`)
    })
  }

  lines.push("")
  lines.push("━━━━━━━━━━━━━━━━━━━━━━")

  await sendQuotedWithFooter(sock, remoteJid, lines.join("\n"), message)
}
