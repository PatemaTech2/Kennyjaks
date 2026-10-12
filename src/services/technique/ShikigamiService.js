import { TechniqueMasteryService } from "./TechniqueMasteryService.js"

export class ShikigamiService {
  static getShikigamiForBattle(player, shikigamiId) {
    return TechniqueMasteryService.getShikigamiForBattle(player, shikigamiId)
  }

  static getSummonableShikigami(player) {
    return TechniqueMasteryService.getSummonableShikigami(player)
  }

  static getAllShikigami() {
    return TechniqueMasteryService.getShikigamiList()
  }

  static formatShikigamiDisplay(player, shikigamiId) {
    const shikigami = TechniqueMasteryService.getShikigamiById(shikigamiId)
    if (!shikigami) return null

    const playerLevel = player.level || 1
    const stats = TechniqueMasteryService.getShikigamiScaledStats(shikigami, playerLevel)
    const isConquered = TechniqueMasteryService.isShikigamiConquered(player, shikigamiId)

    return {
      id: shikigami.id,
      name: shikigami.name,
      emoji: shikigami.emoji,
      description: shikigami.description,
      abilities: shikigami.abilities || [],
      stats: stats,
      ceCost: shikigami.ceCost || 50,
      cooldown: shikigami.cooldown || 1,
      conquered: isConquered,
      statusEffect: shikigami.statusEffect
    }
  }

  static getShikigamiAttackNarration(shikigami, damage, isCritical, abilityUsed) {
    const emoji = shikigami.emoji || "🐾"
    const name = shikigami.name || "Shikigami"

    let narration = ""
    if (abilityUsed) {
      narration = `${emoji} ${name} uses ${abilityUsed}!\n`
    } else {
      narration = `${emoji} ${name} attacks!\n`
    }

    if (isCritical) {
      narration += `⚡ Critical hit! 💥 ${damage} damage to ${shikigami.targetName || "Unknown"}!`
    } else {
      narration += `💥 ${damage} damage to ${shikigami.targetName || "Unknown"}!`
    }

    return narration
  }

  static getMahoragaAdaptation(player, shikigamiId) {
    const ts = player.technique?.name
    if (ts !== "Ten Shadows Technique" && ts !== "Ten Shadows") return null
    if (shikigamiId !== "mahoraga") return null

    if (!player.shikigamiMastery) {
      player.shikigamiMastery = {
        conquered: [],
        currentTraining: null,
        trainingStartTime: null
      }
    }

    if (!player.shikigamiMastery.mahoragaAdaptation) {
      player.shikigamiMastery.mahoragaAdaptation = {
        attacksSeen: {},
        adaptedAttacks: [],
        wheelProgress: 0,
        isDefeated: false
      }
    }

    return player.shikigamiMastery.mahoragaAdaptation
  }

  static recordMahoragaAttack(player, attackType) {
    const adaptation = this.getMahoragaAdaptation(player, "mahoraga")
    if (!adaptation) return 0

    if (!adaptation.attacksSeen[attackType]) {
      adaptation.attacksSeen[attackType] = 0
    }
    adaptation.attacksSeen[attackType] += 1

    const seen = adaptation.attacksSeen[attackType]
    if (seen >= 4 && !adaptation.adaptedAttacks.includes(attackType)) {
      adaptation.adaptedAttacks.push(attackType)
    }

    adaptation.wheelProgress = Math.min(4, Math.floor(seen / 1))
    return adaptation.wheelProgress
  }

  static getMahoragaDamageMultiplier(player, attackType) {
    const adaptation = this.getMahoragaAdaptation(player, "mahoraga")
    if (!adaptation) return 1.0

    if (adaptation.adaptedAttacks.includes(attackType)) {
      return 0.1
    }

    const seen = adaptation.attacksSeen[attackType] || 0
    if (seen >= 3) return 0.3
    if (seen >= 2) return 0.5
    if (seen >= 1) return 0.7
    return 1.0
  }

  static getMahoragaWheelStatus(player) {
    const adaptation = this.getMahoragaAdaptation(player, "mahoraga")
    if (!adaptation) return null

    const progress = Math.min(4, adaptation.wheelProgress || 0)
    const labels = ["", "THE WHEEL HAS TURNED ONCE 1/4", "THE WHEEL HAS TURNED TWICE 2/4", "THE WHEEL HAS TURNED THREE TIMES 3/4", "MAHORAGA HAS ADAPTED"]
    const emojis = ["", "🎡", "🎡", "🎡", "🐉"]

    return {
      progress,
      label: labels[progress] || "",
      emoji: emojis[progress] || "🎡",
      adaptedAttacks: adaptation.adaptedAttacks || []
    }
  }
}
