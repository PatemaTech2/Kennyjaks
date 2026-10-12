import fs from "fs-extra"
import path from "path"
import { savePlayer } from "../../database/playerRepo.js"
import { TechniqueMasteryService } from "./TechniqueMasteryService.js"

const MIGRATION_FLAG_PATH = path.join(process.cwd(), ".kilo", "migrated", "technique_mastery_v2.json")

export async function migrateTechniqueMastery(players) {
  let migrated = 0
  let skipped = 0
  let skillsAutoUnlocked = 0
  let shikigamiAutoConquered = 0

  for (const player of players) {
    if (!player) continue
    if (!player.technique || !player.technique.name) continue

    const techniqueName = player.technique.name

    let playerChanged = false

    if (!player.techniqueMastery) {
      player.techniqueMastery = {}
      playerChanged = true
    }

    const skills = TechniqueMasteryService.getTechniqueMasterySkills(techniqueName)
    if (skills.length > 0) {
      for (const skill of skills) {
        if (TechniqueMasteryService.isMasterySkillUnlocked(player, skill.name)) continue

        const check = TechniqueMasteryService.checkMasteryRequirements(player, skill.name)
        if (check.meets) {
          player.techniqueMastery[skill.name] = {
            unlocked: true,
            level: 1,
            mastery: 0,
            unlockedAt: Date.now()
          }
          playerChanged = true
          skillsAutoUnlocked++
          console.log(`[TECH_MASTERY MIGRATION] Player: ${player.name || "Unknown"} | Auto-unlocked mastery skill: ${skill.name}`)
        }
      }
    }

    if (!player.shikigamiMastery) {
      player.shikigamiMastery = {
        conquered: [],
        currentTraining: null,
        trainingStartTime: null
      }
      playerChanged = true
    }

    if (techniqueName === "Ten Shadows Technique" || techniqueName === "Ten Shadows") {
      const allShikigami = TechniqueMasteryService.getShikigamiList()
      const existingUnlocked = player.technique.unlockedSkills || []

      const shikigamiBySkill = {
        "Perfect Self-Reflection": "divine-dogs",
        "Lightning Wrapper": "nue",
        "Demon Dog Weave": "toad",
        "Grand Scale Manipulation": "shadow-garden"
      }

      const existingBranches = player.technique.branches || []
      const branchNames = existingBranches.map(b => b.name || "")

      const shikigamiByBranch = {
        "Divine Dogs": "divine-dogs",
        "Nue": "nue",
        "Toad": "toad",
        "Shadow Garden": "shadow-garden"
      }

      for (const [skillName, shikigamiId] of Object.entries(shikigamiBySkill)) {
        if (existingUnlocked.includes(skillName)) {
          if (!player.shikigamiMastery.conquered.includes(shikigamiId)) {
            player.shikigamiMastery.conquered.push(shikigamiId)
            playerChanged = true
            shikigamiAutoConquered++
            console.log(`[TECH_MASTERY MIGRATION] Player: ${player.name || "Unknown"} | Auto-conquered shikigami: ${shikigamiId} (via ${skillName})`)
          }
        }
      }

      if (branchNames.includes("Nue") || existingUnlocked.includes("Lightning Wrapper")) {
        if (!player.shikigamiMastery.conquered.includes("nue")) {
          player.shikigamiMastery.conquered.push("nue")
          playerChanged = true
          shikigamiAutoConquered++
        }
      }

      if (branchNames.includes("Toad") || existingUnlocked.includes("Demon Dog Weave")) {
        if (!player.shikigamiMastery.conquered.includes("toad")) {
          player.shikigamiMastery.conquered.push("toad")
          playerChanged = true
          shikigamiAutoConquered++
        }
      }

      if (branchNames.includes("Shadow Garden") || existingUnlocked.includes("Grand Scale Manipulation")) {
        if (!player.shikigamiMastery.conquered.includes("shadow-garden")) {
          player.shikigamiMastery.conquered.push("shadow-garden")
          playerChanged = true
          shikigamiAutoConquered++
        }
      }

      const conquered = player.shikigamiMastery.conquered
      if (conquered.length >= 1 && !conquered.includes("great-serpent")) {
        player.shikigamiMastery.conquered.push("great-serpent")
        playerChanged = true
        shikigamiAutoConquered++
      }

      if (conquered.length >= 2 && !conquered.includes("rabbit-escape")) {
        player.shikigamiMastery.conquered.push("rabbit-escape")
        playerChanged = true
        shikigamiAutoConquered++
      }

      if (conquered.length >= 3 && !conquered.includes("max-elephant")) {
        player.shikigamiMastery.conquered.push("max-elephant")
        playerChanged = true
        shikigamiAutoConquered++
      }

      if (conquered.length >= 4 && !conquered.includes("round-deer")) {
        player.shikigamiMastery.conquered.push("round-deer")
        playerChanged = true
        shikigamiAutoConquered++
      }

      if (conquered.length >= 5 && !conquered.includes("piercing-ox")) {
        player.shikigamiMastery.conquered.push("piercing-ox")
        playerChanged = true
        shikigamiAutoConquered++
      }

      if (conquered.length >= 6 && !conquered.includes("tiger-funeral")) {
        player.shikigamiMastery.conquered.push("tiger-funeral")
        playerChanged = true
        shikigamiAutoConquered++
      }

      if (conquered.length >= 7 && !conquered.includes("mourning-tiger")) {
        player.shikigamiMastery.conquered.push("mourning-tiger")
        playerChanged = true
        shikigamiAutoConquered++
      }
    }

    if (techniqueName === "Limitless") {
      if (player.technique?.unlockedSkills?.includes("Barrier Creation") ||
          player.technique?.branches?.some(b => b.unlockedSkills?.includes("Barrier Creation"))) {
        if (!TechniqueMasteryService.isMasterySkillUnlocked(player, "Blue")) {
          player.techniqueMastery["Blue"] = {
            unlocked: true,
            level: 1,
            mastery: 0,
            unlockedAt: Date.now()
          }
          playerChanged = true
          skillsAutoUnlocked++
          console.log(`[TECH_MASTERY MIGRATION] Player: ${player.name || "Unknown"} | Auto-unlocked: Blue (via Barrier Creation)`)
        }
      }
      if (player.technique?.unlockedSkills?.includes("Matter Collapse") ||
          player.technique?.branches?.some(b => b.unlockedSkills?.includes("Matter Collapse"))) {
        if (!TechniqueMasteryService.isMasterySkillUnlocked(player, "Red")) {
          player.techniqueMastery["Red"] = {
            unlocked: true,
            level: 1,
            mastery: 0,
            unlockedAt: Date.now()
          }
          playerChanged = true
          skillsAutoUnlocked++
          console.log(`[TECH_MASTERY MIGRATION] Player: ${player.name || "Unknown"} | Auto-unlocked: Red (via Matter Collapse)`)
        }
      }
      if (player.technique?.unlockedSkills?.includes("Domain Expansion") ||
          player.technique?.branches?.some(b => b.unlockedSkills?.includes("Domain Expansion"))) {
        const purpleCheck = TechniqueMasteryService.checkMasteryRequirements(player, "Purple")
        if (purpleCheck.meets) {
          if (!TechniqueMasteryService.isMasterySkillUnlocked(player, "Purple")) {
            player.techniqueMastery["Purple"] = {
              unlocked: true,
              level: 1,
              mastery: 0,
              unlockedAt: Date.now()
            }
            playerChanged = true
            skillsAutoUnlocked++
          }
        }
      }
      if (player.technique?.unlockedSkills?.includes("Barrier Creation") ||
          player.technique?.branches?.some(b => b.unlockedSkills?.includes("Barrier Creation"))) {
        if (!TechniqueMasteryService.isMasterySkillUnlocked(player, "Infinity")) {
          player.techniqueMastery["Infinity"] = {
            unlocked: true,
            level: 1,
            mastery: 0,
            unlockedAt: Date.now()
          }
          playerChanged = true
          skillsAutoUnlocked++
          console.log(`[TECH_MASTERY MIGRATION] Player: ${player.name || "Unknown"} | Auto-unlocked: Infinity (via Barrier Creation)`)
        }
      }
    }

    if (techniqueName === "Blood Manipulation") {
      if (player.technique?.unlockedSkills?.includes("Piercing Blood") ||
          player.technique?.branches?.some(b => b.unlockedSkills?.includes("Piercing Blood"))) {
        if (!TechniqueMasteryService.isMasterySkillUnlocked(player, "Flowing Red Scale")) {
          player.techniqueMastery["Flowing Red Scale"] = {
            unlocked: true,
            level: 1,
            mastery: 0,
            unlockedAt: Date.now()
          }
          playerChanged = true
          skillsAutoUnlocked++
        }
      }
      if (player.technique?.unlockedSkills?.includes("Crimson Bullets") ||
          player.technique?.branches?.some(b => b.unlockedSkills?.includes("Crimson Bullets"))) {
        if (!TechniqueMasteryService.isMasterySkillUnlocked(player, "Supernova")) {
          player.techniqueMastery["Supernova"] = {
            unlocked: true,
            level: 1,
            mastery: 0,
            unlockedAt: Date.now()
          }
          playerChanged = true
          skillsAutoUnlocked++
        }
      }
    }

    if (techniqueName === "Boogie Woogie") {
      if (player.technique?.unlockedSkills?.includes("Clap Swap") ||
          player.technique?.branches?.some(b => b.unlockedSkills?.includes("Clap Swap"))) {
        if (!TechniqueMasteryService.isMasterySkillUnlocked(player, "Clap Swap")) {
          player.techniqueMastery["Clap Swap"] = {
            unlocked: true,
            level: 1,
            mastery: 0,
            unlockedAt: Date.now()
          }
          playerChanged = true
          skillsAutoUnlocked++
        }
      }
      if (player.technique?.unlockedSkills?.includes("Rotation Strike") ||
          player.technique?.branches?.some(b => b.unlockedSkills?.includes("Rotation Strike"))) {
        if (!TechniqueMasteryService.isMasterySkillUnlocked(player, "Double Clap")) {
          player.techniqueMastery["Double Clap"] = {
            unlocked: true,
            level: 1,
            mastery: 0,
            unlockedAt: Date.now()
          }
          playerChanged = true
          skillsAutoUnlocked++
        }
      }
    }

    if (techniqueName === "Projection Sorcery") {
      if (player.technique?.unlockedSkills?.includes("Radiant Slash") ||
          player.technique?.branches?.some(b => b.unlockedSkills?.includes("Radiant Slash"))) {
        if (!TechniqueMasteryService.isMasterySkillUnlocked(player, "2D Projection")) {
          player.techniqueMastery["2D Projection"] = {
            unlocked: true,
            level: 1,
            mastery: 0,
            unlockedAt: Date.now()
          }
          playerChanged = true
          skillsAutoUnlocked++
        }
      }
      if (player.technique?.unlockedSkills?.includes("Number Lock") ||
          player.technique?.branches?.some(b => b.unlockedSkills?.includes("Number Lock"))) {
        if (!TechniqueMasteryService.isMasterySkillUnlocked(player, "3D Projection")) {
          player.techniqueMastery["3D Projection"] = {
            unlocked: true,
            level: 1,
            mastery: 0,
            unlockedAt: Date.now()
          }
          playerChanged = true
          skillsAutoUnlocked++
        }
      }
    }

    if (techniqueName === "Ratio") {
      if (player.technique?.unlockedSkills?.includes("Shredding Burst") ||
          player.technique?.branches?.some(b => b.unlockedSkills?.includes("Shredding Burst"))) {
        if (!TechniqueMasteryService.isMasterySkillUnlocked(player, "3:3:3:3:3")) {
          player.techniqueMastery["3:3:3:3:3"] = {
            unlocked: true,
            level: 1,
            mastery: 0,
            unlockedAt: Date.now()
          }
          playerChanged = true
          skillsAutoUnlocked++
        }
      }
      if (player.technique?.unlockedSkills?.includes("Collapse Wave") ||
          player.technique?.branches?.some(b => b.unlockedSkills?.includes("Collapse Wave"))) {
        if (!TechniqueMasteryService.isMasterySkillUnlocked(player, "6:6:6:6:6")) {
          player.techniqueMastery["6:6:6:6:6"] = {
            unlocked: true,
            level: 1,
            mastery: 0,
            unlockedAt: Date.now()
          }
          playerChanged = true
          skillsAutoUnlocked++
        }
      }
    }

    if (techniqueName === "Chimera Shadow Garden") {
      if (player.technique?.unlockedSkills?.includes("Shadow Surge") ||
          player.technique?.branches?.some(b => b.unlockedSkills?.includes("Shadow Surge"))) {
        if (!TechniqueMasteryService.isMasterySkillUnlocked(player, "Shadow Lurk")) {
          player.techniqueMastery["Shadow Lurk"] = {
            unlocked: true,
            level: 1,
            mastery: 0,
            unlockedAt: Date.now()
          }
          playerChanged = true
          skillsAutoUnlocked++
        }
      }
      if (player.technique?.unlockedSkills?.includes("Shadow Unleash") ||
          player.technique?.branches?.some(b => b.unlockedSkills?.includes("Shadow Unleash"))) {
        if (!TechniqueMasteryService.isMasterySkillUnlocked(player, "Shadow Tendrils")) {
          player.techniqueMastery["Shadow Tendrils"] = {
            unlocked: true,
            level: 1,
            mastery: 0,
            unlockedAt: Date.now()
          }
          playerChanged = true
          skillsAutoUnlocked++
        }
      }
    }

    if (techniqueName === "Disaster Curse") {
      if (player.technique?.unlockedSkills?.includes("Hephaestion") ||
          player.technique?.branches?.some(b => b.unlockedSkills?.includes("Hephaestion"))) {
        if (!TechniqueMasteryService.isMasterySkillUnlocked(player, "Storm Vortex")) {
          player.techniqueMastery["Storm Vortex"] = {
            unlocked: true,
            level: 1,
            mastery: 0,
            unlockedAt: Date.now()
          }
          playerChanged = true
          skillsAutoUnlocked++
        }
      }
      if (player.technique?.unlockedSkills?.includes("Hurricane Slam") ||
          player.technique?.branches?.some(b => b.unlockedSkills?.includes("Hurricane Slam"))) {
        if (!TechniqueMasteryService.isMasterySkillUnlocked(player, "Pressure Cascade")) {
          player.techniqueMastery["Pressure Cascade"] = {
            unlocked: true,
            level: 1,
            mastery: 0,
            unlockedAt: Date.now()
          }
          playerChanged = true
          skillsAutoUnlocked++
        }
      }
    }

    if (techniqueName === "Awakening") {
      if (player.technique?.unlockedSkills?.includes("Limit Break") ||
          player.technique?.branches?.some(b => b.unlockedSkills?.includes("Limit Break"))) {
        if (!TechniqueMasteryService.isMasterySkillUnlocked(player, "Burst Growth")) {
          player.techniqueMastery["Burst Growth"] = {
            unlocked: true,
            level: 1,
            mastery: 0,
              unlockedAt: Date.now()
          }
          playerChanged = true
          skillsAutoUnlocked++
        }
      }
      if (player.technique?.unlockedSkills?.includes("Soul Diffusion") ||
          player.technique?.branches?.some(b => b.unlockedSkills?.includes("Soul Diffusion"))) {
        if (!TechniqueMasteryService.isMasterySkillUnlocked(player, "Energy Body")) {
          player.techniqueMastery["Energy Body"] = {
            unlocked: true,
            level: 1,
            mastery: 0,
            unlockedAt: Date.now()
          }
          playerChanged = true
          skillsAutoUnlocked++
        }
      }
    }

    if (playerChanged) {
      try {
        await savePlayer(player)
        migrated++
      } catch (err) {
        console.error(`[TECH_MASTERY MIGRATION] Failed to save player ${player.name}:`, err.message)
      }
    } else {
      skipped++
    }
  }

  return { migrated, skipped, skillsAutoUnlocked, shikigamiAutoConquered }
}

export async function isTechniqueMasteryMigrationCompleted() {
  try {
    if (await fs.pathExists(MIGRATION_FLAG_PATH)) {
      const flag = await fs.readJson(MIGRATION_FLAG_PATH)
      return flag?.completed === true
    }
  } catch {}
  return false
}

export async function markTechniqueMasteryMigrationComplete() {
  await fs.ensureDir(path.dirname(MIGRATION_FLAG_PATH))
  await fs.writeJson(MIGRATION_FLAG_PATH, {
    completed: true,
    timestamp: Date.now(),
    version: "2.17.0"
  }, { spaces: 2 })
}
