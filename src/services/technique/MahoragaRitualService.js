import { TechniqueMasteryService } from "./TechniqueMasteryService.js"
import { setActiveCurse, clearActiveCurse } from "../battle/CurseService.js"
import { MAHORAGA_DIALOGUE, createMahoragaOpponent } from "./MahoragaDefinition.js"

export class MahoragaRitualService {
  static TAMED_KEY = "mahoragaTamed"
  static RITUAL_BATTLES_KEY = "mahoragaRitualBattles"

  static isTamed(player) {
    return !!(player.shikigamiMastery && player.shikigamiMastery.mahoragaTamed)
  }

  static getRitualBattles(player) {
    return (player.shikigamiMastery && player.shikigamiMastery.mahoragaRitualBattles) || 0
  }

  static startRitual(player) {
    if (!player.shikigamiMastery) {
      player.shikigamiMastery = {
        conquered: [],
        currentTraining: null,
        trainingStartTime: null,
        mahoragaTamed: false,
        mahoragaRitualBattles: 0
      }
    }
    player.shikigamiMastery.mahoragaTamed = false
    player.shikigamiMastery.mahoragaRitualBattles = (player.shikigamiMastery.mahoragaRitualBattles || 0) + 1

    const mahoraga = createMahoragaOpponent("subjugation", false)
    const ritualCurse = {
      ...mahoraga,
      dialogue: {
        intro: MAHORAGA_DIALOGUE.intro,
        attack: MAHORAGA_DIALOGUE.attack,
        low_hp: MAHORAGA_DIALOGUE.lowHp,
        defeat: MAHORAGA_DIALOGUE.defeat,
        taunt: MAHORAGA_DIALOGUE.taunt
      }
    }

    clearActiveCurse(player.playerId)
    setActiveCurse(player.playerId, ritualCurse)

    return {
      success: true,
      ritualBattles: player.shikigamiMastery.mahoragaRitualBattles,
      message: `MAHORAGA SUBJUGATION\n\nYou have challenged Mahoraga.\nMahoraga fights at 10% power.\n\nWin to tame it permanently.`
    }
  }

  static async completeRitual(player, victory) {
    if (!player.shikigamiMastery) {
      player.shikigamiMastery = {
        conquered: [],
        currentTraining: null,
        trainingStartTime: null,
        mahoragaTamed: false,
        mahoragaRitualBattles: 0
      }
    }
    if (victory) {
      player.shikigamiMastery.mahoragaTamed = true
      player.shikigamiMastery.mahoragaRitualBattles = 0
      await TechniqueMasteryService.recordShikigamiConquest(player, "mahoraga")
      return { success: true, tamed: true, message: "MAHORAGA TAMED\n\nYou have proven your strength.\nMahoraga now serves you." }
    }
    return { success: false, tamed: false, message: "MAHORAGA DEFEATED YOU\n\nYou were not strong enough.\nTry again when you are ready." }
  }
}
