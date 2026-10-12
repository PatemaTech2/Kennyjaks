import { TechniqueMasteryService } from "./TechniqueMasteryService.js"
import { MAHORAGA_TAMED_BASE } from "./MahoragaDefinition.js"

export class ShikigamiCombatService {
  static getActiveLimit(player) {
    const mastered = TechniqueMasteryService.getConqueredShikigamiCount(player)
    if (mastered >= 10) return 3
    if (mastered >= 6) return 2
    return 1
  }

  static getActiveShikigami(player) {
    return player.activeShikigami || null
  }

  static canSummon(player, shikigamiId) {
    if (!shikigamiId) return { canSummon: false, reason: "No shikigami specified." }
    const shikigami = TechniqueMasteryService.getShikigamiById(shikigamiId)
    if (!shikigami) return { canSummon: false, reason: "Unknown shikigami." }
    if (shikigamiId === "mahoraga") {
      const ts = player.technique?.name
      if (ts !== "Ten Shadows Technique" && ts !== "Ten Shadows") {
        return { canSummon: false, reason: "Only Ten Shadows users can summon Mahoraga." }
      }
      return { canSummon: true, shikigami, limit: 1, activeCount: 0 }
    }
    const conquered = TechniqueMasteryService.getConqueredShikigami(player)
    if (!conquered.includes(shikigamiId)) return { canSummon: false, reason: "You have not conquered this shikigami yet." }
    const limit = this.getActiveLimit(player)
    const active = this.getActiveShikigami(player)
    if (active && active !== shikigamiId && limit <= 1) {
      return { canSummon: false, reason: `Active summons limit reached (${limit}/${limit}). Use /unsummon first.` }
    }
    return { canSummon: true, shikigami, limit, activeCount: active ? 1 : 0 }
  }

  static getScaledCombatStats(player, shikigamiId) {
    if (shikigamiId === "mahoraga") {
      const level = player.level || 1
      const potential = player.potential || 1
      const scale = Math.max(0.5, level / 5)
      const potentialBonus = Math.max(0, (potential - 1) * 0.1)
      const attack = Math.floor((MAHORAGA_TAMED_BASE.attack * scale) + (level * 2) + (potentialBonus * 10))
      const hp = Math.floor((MAHORAGA_TAMED_BASE.maxHp * scale) + (level * 15))
      const defense = Math.floor((MAHORAGA_TAMED_BASE.defense * scale) + (level * 0.5))
      const speed = Math.floor((MAHORAGA_TAMED_BASE.speed * scale) + (level * 0.3))
      return {
        id: MAHORAGA_TAMED_BASE.id,
        name: MAHORAGA_TAMED_BASE.name,
        emoji: MAHORAGA_TAMED_BASE.emoji,
        hp,
        maxHp: hp,
        attack,
        defense,
        speed,
        ceCost: MAHORAGA_TAMED_BASE.ceCost,
        cooldown: MAHORAGA_TAMED_BASE.cooldown,
        statusEffect: MAHORAGA_TAMED_BASE.statusEffect,
        abilities: MAHORAGA_TAMED_BASE.abilities,
        isShikigami: true,
        shikigamiData: MAHORAGA_TAMED_BASE
      }
    }

    const shikigami = TechniqueMasteryService.getShikigamiById(shikigamiId)
    if (!shikigami) return null
    const level = player.level || 1
    const scale = Math.max(0.5, level / 5)
    const base = shikigami.scaledStats || shikigami.baseStats || { hp: 100, attack: 20, defense: 10, speed: 15 }
    const bonus = Math.max(0, level - 1) * 45
    const attack = Math.floor((base.attack || 20) * scale + bonus * 0.4)
    const hp = Math.floor((base.hp || 100) * scale + bonus * 0.3)
    const defense = Math.floor((base.defense || 10) * scale + bonus * 0.2)
    const speed = Math.floor((base.speed || 15) * scale + bonus * 0.1)
    return {
      id: shikigami.id,
      name: shikigami.name,
      emoji: shikigami.emoji,
      hp,
      maxHp: hp,
      attack,
      defense,
      speed,
      ceCost: shikigami.ceCost || 50,
      cooldown: shikigami.cooldown || 1,
      statusEffect: shikigami.statusEffect || null,
      abilities: shikigami.abilities || [],
      isShikigami: true,
      shikigamiData: shikigami
    }
  }

  static buildAutoAttackNarration(combatant, target, damage, isCritical, statusApplied) {
    const emoji = combatant.emoji || "🐾"
    const name = combatant.name || "Shikigami"
    let text = `\n\n${emoji} ${name} attacks!`
    if (isCritical) text += `\n⚫⚡ BLACK FLASH ⚡⚡`
    text += `\n💥 ${damage} damage to ${target.name || "Unknown"}!`
    if (statusApplied) {
      text += `\n✨ Status: ${statusApplied}`
    }
    return text
  }
}
