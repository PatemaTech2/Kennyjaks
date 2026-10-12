import { sendQuotedWithFooter } from "../../utils/messageHelper.js"
import { loadPlayerByPhone } from "../../database/playerRepo.js"
import { ProgressionManager } from "../../services/progression/ProgressionManager.js"
import { TechniqueMasteryService } from "../../services/technique/TechniqueMasteryService.js"

export async function handleTechnique(sock, message) {
  const remoteJid = message.key.remoteJid
  const sender = message.key.participant || remoteJid
  const phoneNumber = sender.split("@")[0]

  const player = await loadPlayerByPhone(phoneNumber)
  if (!player) {
    await sendQuotedWithFooter(sock, remoteJid, "You need to register first.\n\nUse /start to begin.", message)
    return
  }

  if (!player.progression) {
    player.progression = { trackers: {}, unlockedSkills: [], activeTraining: null }
  }
  if (!player.progression.trackers) player.progression.trackers = {}
  if (!player.progression.unlockedSkills) player.progression.unlockedSkills = []

  const text = (message.message?.conversation || message.message?.extendedTextMessage?.text || "").trim().toLowerCase()
  const args = text.split(" ")

  if (args[0] === "/train") {
    if (args.length === 1) {
      await handleTrainList(sock, message, player, remoteJid)
      return
    }

    const input = args.slice(1).join(" ")
    await handleTrainAssign(sock, message, player, remoteJid, input)
    return
  }

  const techniqueName = player.technique?.name

  if (techniqueName === "Ten Shadows Technique" || techniqueName === "Ten Shadows") {
    const result = TechniqueMasteryService.getTenShadowsDisplay(player)
    if (result.error) {
      await sendQuotedWithFooter(sock, remoteJid, result.error, message)
      return
    }
    await sendQuotedWithFooter(sock, remoteJid, result.display, message)
    return
  }

  const masteryResult = TechniqueMasteryService.getMasteryDisplay(player)
  if (masteryResult.error) {
    const result = ProgressionManager.getTrainingDisplay(player)
    if (result.error) {
      await sendQuotedWithFooter(sock, remoteJid, result.error, message)
      return
    }
    await sendQuotedWithFooter(sock, remoteJid, result.display, message)
    return
  }

  await sendQuotedWithFooter(sock, remoteJid, masteryResult.display, message)
}

async function handleTrainList(sock, message, player, remoteJid) {
  if (!player.technique) {
    await sendQuotedWithFooter(sock, remoteJid, "You have no cursed technique.", message)
    return
  }

  const techniqueName = player.technique.name

  if (techniqueName === "Ten Shadows Technique" || techniqueName === "Ten Shadows") {
    const result = TechniqueMasteryService.getTenShadowsDisplay(player)
    if (result.error) {
      await sendQuotedWithFooter(sock, remoteJid, result.error, message)
      return
    }
    await sendQuotedWithFooter(sock, remoteJid, result.display, message)
    return
  }

  const result = ProgressionManager.getTrainingDisplay(player)
  if (result.error) {
    await sendQuotedWithFooter(sock, remoteJid, result.error, message)
    return
  }

  await sendQuotedWithFooter(sock, remoteJid, result.display, message)
}

async function handleTrainAssign(sock, message, player, remoteJid, input) {
  if (!player.technique) {
    await sendQuotedWithFooter(sock, remoteJid, "You have no cursed technique.", message)
    return
  }

  const techniqueName = player.technique.name

  if (techniqueName === "Ten Shadows Technique" || techniqueName === "Ten Shadows") {
    const shikigami = TechniqueMasteryService.getShikigamiById(input) || TechniqueMasteryService.getShikigamiByName(input)
    if (shikigami) {
      await handleShikigamiTrain(sock, message, player, remoteJid, shikigami.id)
      return
    }

    const allShikigami = TechniqueMasteryService.getShikigamiList()
    let match
    for (const s of allShikigami) {
      if (s.name.toLowerCase().includes(input.toLowerCase())) {
        match = s
        break
      }
    }
    if (match) {
      await handleShikigamiTrain(sock, message, player, remoteJid, match.id)
      return
    }

    await sendQuotedWithFooter(sock, remoteJid, `Cannot train "${input}".\n\nFor Ten Shadows, use /train <shikigami-name> or /train-<shikigami-id>\nSee /technique for available shikigami.`, message)
    return
  }

  let skillName = null

  const masterySkills = TechniqueMasteryService.getTechniqueMasterySkills(techniqueName)
  const masteryMatch = masterySkills.find(s =>
    s.name.toLowerCase() === input.toLowerCase() ||
    s.name.toLowerCase().includes(input.toLowerCase())
  )

  if (masteryMatch) {
    const check = TechniqueMasteryService.checkMasteryRequirements(player, masteryMatch.name)
    if (!check.meets) {
      await sendQuotedWithFooter(sock, remoteJid, `⚡ ${masteryMatch.name}\n\n${check.reason}`, message)
      return
    }

    if (TechniqueMasteryService.isMasterySkillUnlocked(player, masteryMatch.name)) {
      await sendQuotedWithFooter(sock, remoteJid, `You have already unlocked ${masteryMatch.name}.`, message)
      return
    }

    const result = await TechniqueMasteryService.unlockMasterySkill(player, masteryMatch.name)
    if (result.error) {
      await sendQuotedWithFooter(sock, remoteJid, result.error, message)
      return
    }

    const lines = []
    lines.push("━━━━━━━━━━━━━━━━━━━━━━")
    lines.push("✨ MASTERY SKILL UNLOCKED")
    lines.push("━━━━━━━━━━━━━━━━━━━━━━")
    lines.push("")
    lines.push("⚡ " + masteryMatch.name)
    if (masteryMatch.description) {
      lines.push(masteryMatch.description)
    }
    lines.push("")
    lines.push("Tier: " + masteryMatch.tier)
    if (masteryMatch.effects) {
      lines.push("Effects: " + Object.entries(masteryMatch.effects)
        .map(([k, v]) => `${k}: ${v}`)
        .join(", "))
    }
    lines.push("")
    lines.push("━━━━━━━━━━━━━━━━━━━━━━")

    await sendQuotedWithFooter(sock, remoteJid, lines.join("\n"), message)
    return
  }

  const inputCapitalized = input.charAt(0).toUpperCase() + input.slice(1).toLowerCase()

  if (input.toLowerCase() === techniqueName.toLowerCase()) {
    const skills = ProgressionManager.getAllTechniqueSkills(techniqueName)
    const nextLocked = skills.find(s => !ProgressionManager.isSkillUnlocked(player, s.name))
    if (nextLocked) {
      skillName = nextLocked.name
    }
  }

  if (!skillName) {
    const skill = findSkillByName(input, techniqueName)
    if (skill) {
      skillName = skill
    } else {
      await sendQuotedWithFooter(sock, remoteJid, `Cannot train "${input}".\n\nUse /train <skill-name>\nUse /technique to see available skills.`, message)
      return
    }
  }

  const result = await ProgressionManager.setActiveTraining(player, skillName)

  if (result.error) {
    await sendQuotedWithFooter(sock, remoteJid, result.error, message)
    return
  }

  const skillConfig = ProgressionManager.getSkillRequirements(techniqueName, result.training)
  const lines = []
  lines.push("━━━━━━━━━━━━━━━━━━━━━━")
  lines.push("🎯 TRAINING ASSIGNED")
  lines.push("━━━━━━━━━━━━━━━━━━━━━━")
  lines.push("")
  lines.push("⚡ " + (result.training || "Unknown"))
  if (skillConfig?.description) {
    lines.push(skillConfig.description)
  }
  lines.push("")
  lines.push("Progress: " + result.progress + " / " + result.needed + " " + (result.type || ""))
  lines.push("")
  lines.push("━━━━━━━━━━━━━━━━━━━━━━")

  await sendQuotedWithFooter(sock, remoteJid, lines.join("\n"), message)
}

async function handleShikigamiTrain(sock, message, player, remoteJid, shikigamiId) {
  const canConquer = TechniqueMasteryService.canConquerShikigami(player, shikigamiId)
  const shikigami = TechniqueMasteryService.getShikigamiById(shikigamiId)

  if (!canConquer.canConquer) {
    await sendQuotedWithFooter(sock, remoteJid, `${shikigami.emoji} ${shikigami.name}\n\n${canConquer.reason}`, message)
    return
  }

  const { setShikigamiRitual } = await import("../../services/battle/ShikigamiRitualService.js")
  const result = setShikigamiRitual(player, shikigami.id)

  if (result.error) {
    await sendQuotedWithFooter(sock, remoteJid, result.error, message)
    return
  }

  const lines = []
  lines.push("")
  lines.push("━━━ SHIKIGAMI RITUAL ━━━")
  lines.push("")
  lines.push(`${shikigami.emoji} ${shikigami.name}`)
  lines.push("")
  lines.push(`"${result.dialogue}"`)
  lines.push("")
  lines.push(`${shikigami.name} have accepted your challenge!`)
  lines.push("The shikigami fights at 10% of its true power.")
  lines.push("")
  lines.push("Use /spawnenemy to encounter a curse and battle it.")
  lines.push("Defeat it to earn its submission.")
  lines.push("")
  lines.push("━━━ BATTLE INFO ━━━")
  lines.push(`HP: ${result.opponentHp}`)
  lines.push(`Attack: ${result.opponentAttack}`)
  lines.push(`CE Cost: ${shikigami.ceCost || 50} CE`)
  lines.push("")

  await sendQuotedWithFooter(sock, remoteJid, lines.join("\n"), message)
}

function findSkillByName(input, techniqueName) {
  const skills = ProgressionManager.getAllTechniqueSkills(techniqueName)
  const inputLower = input.toLowerCase()

  let match = skills.find(s => s.name.toLowerCase() === inputLower)
  if (match) return match.name

  match = skills.find(s => s.name.toLowerCase().includes(inputLower))
  if (match) return match.name

  return null
}
