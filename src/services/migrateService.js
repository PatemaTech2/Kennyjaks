import { loadAllPlayers, savePlayer } from "../database/playerRepo.js"

export async function migratePotentials() {
  try {
    const players = await loadAllPlayers()
    let migrated = 0

    for (const player of players) {
      let modified = false

      if (player.potential && player.potential !== "A" && player.potential !== "B" && player.potential !== "C" && player.potential !== "D" && player.potential !== "E" && player.potential !== "F") {
        player.potential = "A"
        modified = true
      }

      if (player.grade === undefined || player.grade === null) {
        if (player.sorcererGrade) {
          const gradeMap = {
            "Special Grade": 0,
            "Grade 1": 1,
            "Grade 2": 2,
            "Grade 3": 3,
            "Grade 4": 4
          }
          player.grade = gradeMap[player.sorcererGrade] || 4
          modified = true
        } else {
          player.grade = 4
          player.sorcererGrade = "Grade 4"
          modified = true
        }
      }

      if (!player.potential) {
        const PotentialService = await import("./technique/PotentialService.js")
        PotentialService.assignPotential(player)
        PotentialService.applyPotentialToStats(player)
        modified = true
      }

      if (modified) {
        await savePlayer(player)
        migrated++
      }
    }

    if (migrated > 0) {
      console.log(`[KENNYJAKS MIGRATION] Migrated ${migrated} player(s)`)
    }

    return migrated
  } catch (err) {
    console.error("[KENNYJAKS ERROR] Potential migration failed:", err.message)
    return 0
  }
}
