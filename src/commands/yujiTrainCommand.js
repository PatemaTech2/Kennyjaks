import { sendQuotedWithFooter } from "../utils/messageHelper.js"
import { loadPlayerByPhone, savePlayer } from "../database/playerRepo.js"

const YUJIHAND_TASKS = [
  { type: "curses", desc: "Defeat 10 Grade 4 curses.", param: 10, label: "Curse Kills" },
  { type: "curses", desc: "Defeat 25 curses of any grade.", param: 25, label: "Curse Kills" },
  { type: "blackflashes", desc: "Land 3 Black Flashes.", param: 3, label: "Black Flashes" },
  { type: "blackflashes", desc: "Land 5 Black Flashes.", param: 5, label: "Black Flashes" },
  { type: "blocks", desc: "Block 15 attacks.", param: 15, label: "Blocks" },
  { type: "blocks", desc: "Block 30 attacks.", param: 30, label: "Blocks" },
  { type: "pvp_wins", desc: "Win 5 PvP matches.", param: 5, label: "PvP Wins" },
  { type: "pvp_wins", desc: "Win 3 PvP matches.", param: 3, label: "PvP Wins" },
  { type: "damage", desc: "Deal 10,000 total damage.", param: 10000, label: "Damage Dealt" },
  { type: "damage", desc: "Deal 5,000 total damage.", param: 5000, label: "Damage Dealt" },
]

const MARTIAL_SKILL_ORDER = ["battack2", "battack3", "battack4"]

function generateTask(player) {
  const availableTasks = YUJIHAND_TASKS.filter(t => {
    if (t.type === "pvp_wins" && (player.pvpWins || 0) < t.param) return true
    return true
  })
  const task = availableTasks[Math.floor(Math.random() * availableTasks.length)]
  return {
    type: task.type,
    desc: task.desc,
    param: task.param,
    progress: 0,
    label: task.label
  }
}

function getProgress(player, taskType, state = {}) {
  switch (taskType) {
    case "curses": return player.curseKills || 0
    case "blackflashes": return player.blackFlashes || 0
    case "blocks": return player.blocks || 0
    case "pvp_wins": return player.pvpWins || 0
    case "damage": return player.totalDamageDealt || 0
    default: return 0
  }
}

export async function handleYujiTrain(sock, message) {
  const remoteJid = message.key.remoteJid
  const sender = message.key.participant || remoteJid
  const phoneNumber = sender.split("@")[0]

  const player = await loadPlayerByPhone(phoneNumber)
  if (!player) {
    await sendQuotedWithFooter(sock, remoteJid, "You need to register first.\n\nUse /start to begin.", message)
    return
  }

  player.yujiUnlocked = player.yujiUnlocked || ["battack1"]
  const nextSkillIndex = player.yujiUnlocked.length - 1
  const nextSkill = MARTIAL_SKILL_ORDER[nextSkillIndex]

  if (!nextSkill) {
    await sendQuotedWithFooter(sock, remoteJid,
      `━━━━━━━━━━━━━━━━━━━━━━\n🥊 Yuji Itadori\n\n"You've mastered all martial arts.\nYour fists are the pinnacle of human technique."\n\nAll martial skills unlocked!\n━━━━━━━━━━━━━━━━━━━━━━`, message)
    return
  }

  if (!player.yujiMission) {
    player.yujiMission = generateTask(player)
    player.yujiMissionProgress = 0
    player.yujiMissionParam = player.yujiMission.param
    await savePlayer(player)

    const msg = `
━━━━━━━━━━━━━━━━━━━━━━
🥊 Yuji Itadori

"Hey. If you wanna get stronger, you gotta put
in the work. Here's your first task, sorcerer."

MISSION: ${player.yujiMission.desc}

Progress: 0/${player.yujiMission.param}

When you complete this, you'll unlock:
${MARTIAL_SKILL_ORDER[nextSkillIndex] === "battack2" ? "Jab" : MARTIAL_SKILL_ORDER[nextSkillIndex] === "battack3" ? "Roundhouse Kick" : "Body Blow"}

Use /yuji-train again to check progress.
━━━━━━━━━━━━━━━━━━━━━━
`.trim()
    await sendQuotedWithFooter(sock, remoteJid, msg, message)
    return
  }

  const progress = getProgress(player, player.yujiMission.type, { blocks: player.blocks || 0, damageDealt: 0 })

  if (progress >= player.yujiMission.param) {
    player.yujiUnlocked.push(nextSkill)
    player.yujiTrainingLevel += 1
    player.yujiMission = null
    player.yujiMissionProgress = 0
    player.yujiMissionParam = 0
    await savePlayer(player)

    const skillName = MARTIAL_SKILL_ORDER[nextSkillIndex] === "battack2" ? "Jab" :
                      MARTIAL_SKILL_ORDER[nextSkillIndex] === "battack3" ? "Roundhouse Kick" : "Body Blow"

    const msg = `
━━━━━━━━━━━━━━━━━━━━━━
🥊 Yuji Itadori

"...Nice.

You've gotten stronger."

New Skill Unlocked

${skillName}

Use:
/${nextSkill}

${MARTIAL_SKILL_ORDER[nextSkillIndex + 1] ? `Next task available with /yuji-train` : "All martial arts mastered!"}
━━━━━━━━━━━━━━━━━━━━━━
`.trim()
    await sendQuotedWithFooter(sock, remoteJid, msg, message)
    return
  }

  player.yujiMissionProgress = progress
  await savePlayer(player)

  const msg = `
━━━━━━━━━━━━━━━━━━━━━━
🥊 Yuji Itadori

"Still not there yet. Keep going."

MISSION: ${player.yujiMission.desc}

Progress: ${progress}/${player.yujiMission.param}

Reward: ${MARTIAL_SKILL_ORDER[nextSkillIndex] === "battack2" ? "Jab" : MARTIAL_SKILL_ORDER[nextSkillIndex] === "battack3" ? "Roundhouse Kick" : "Body Blow"} (/${nextSkill})

━━━━━━━━━━━━━━━━━━━━━━
`.trim()
  await sendQuotedWithFooter(sock, remoteJid, msg, message)
}

export function checkYujiTrainingProgress(player, state = {}) {
  if (!player.yujiMission) return false

  const progress = getProgress(player, player.yujiMission.type, state)
  if (progress < player.yujiMission.param) return false

  const nextSkillIndex = player.yujiUnlocked ? player.yujiUnlocked.length - 1 : 0
  const nextSkill = MARTIAL_SKILL_ORDER[nextSkillIndex]
  if (!nextSkill) return false

  player.yujiUnlocked.push(nextSkill)
  player.yujiTrainingLevel += 1
  player.yujiMission = null
  player.yujiMissionProgress = 0
  player.yujiMissionParam = 0
  return nextSkill
}
