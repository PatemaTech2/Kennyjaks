import { MAHORAGA_FULL_POWER, MAHORAGA_SUBJUGATION, MAHORAGA_TAMED_BASE, createMahoragaOpponent, createMahoragaBattleState } from "./MahoragaDefinition.js"

export class MahoragaService {
  static isTamed(player) {
    return !!(player.shikigamiMastery && player.shikigamiMastery.mahoragaTamed)
  }

  static canSummon(player) {
    if (!player || !player.technique) {
      return { canSummon: false, reason: "You have no cursed technique." }
    }

    const ts = player.technique.name
    if (ts !== "Ten Shadows Technique" && ts !== "Ten Shadows") {
      return { canSummon: false, reason: "Only Ten Shadows users can summon Mahoraga." }
    }

    return { canSummon: true }
  }

  static getMahoragaForBattle(player, battleContext = "normal") {
    if (battleContext === "subjugation") {
      return { ...MAHORAGA_SUBJUGATION }
    }

    if (this.isTamed(player)) {
      const level = player.level || 1
      const potential = player.potential || 1
      const scale = Math.max(0.5, level / 5)
      const potentialBonus = Math.max(0, (potential - 1) * 0.1)
      const attack = Math.floor((MAHORAGA_TAMED_BASE.attack * scale) + (level * 2) + (potentialBonus * 10))
      const hp = Math.floor((MAHORAGA_TAMED_BASE.maxHp * scale) + (level * 15))
      const defense = Math.floor((MAHORAGA_TAMED_BASE.defense * scale) + (level * 0.5))
      const speed = Math.floor((MAHORAGA_TAMED_BASE.speed * scale) + (level * 0.3))
      return {
        ...MAHORAGA_TAMED_BASE,
        hp,
        maxHp: hp,
        attack,
        defense,
        speed,
        ce: Math.floor(MAHORAGA_TAMED_BASE.maxCe * scale),
        maxCe: Math.floor(MAHORAGA_TAMED_BASE.maxCe * scale)
      }
    }

    return { ...MAHORAGA_FULL_POWER }
  }

  static startSubjugation(player) {
    if (this.isTamed(player)) {
      return { started: false, reason: "Mahoraga is already tamed." }
    }

    return {
      started: true,
      opponent: this.getMahoragaForBattle(player, "subjugation"),
      message: `MAHORAGA SUBJUGATION\n\nYou have challenged Mahoraga.\nMahoraga fights at 10% power.\n\nWin to tame it permanently.`
    }
  }

  static completeSubjugation(player, victory) {
    if (victory) {
      if (!player.shikigamiMastery) {
        player.shikigamiMastery = {
          conquered: [],
          currentTraining: null,
          trainingStartTime: null,
          mahoragaTamed: false,
          mahoragaRitualBattles: 0
        }
      }
      player.shikigamiMastery.mahoragaTamed = true
      player.shikigamiMastery.mahoragaRitualBattles = 0
      return { success: true, tamed: true, message: "MAHORAGA TAMED\n\nYou have proven your strength.\nMahoraga now serves you." }
    }
    return { success: false, tamed: false, message: "MAHORAGA DEFEATED YOU\n\nYou were not strong enough.\nTry again when you are ready." }
  }

  static createOwnerTestOpponent() {
    return createMahoragaOpponent("full", true)
  }

  static createSubjugationOpponent() {
    return createMahoragaOpponent("subjugation", false)
  }

  static createBattleState() {
    return createMahoragaBattleState()
  }

  static recordHit(battleState, attackType, attackFamily) {
    return recordMahoragaHit(battleState, attackType, attackFamily)
  }

  static getDamageMultiplier(battleState, attackFamily) {
    return getMahoragaDamageMultiplier(battleState, attackFamily)
  }

  static getWheelStatus(battleState) {
    return getMahoragaWheelStatus(battleState)
  }
}
