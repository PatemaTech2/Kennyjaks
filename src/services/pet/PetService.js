import { loadPlayerByPhone, savePlayer } from "../../database/playerRepo.js"
import { SHIKIGAMI_POOL } from "../../data/shikigami/shikigamiPool.js"
import { BALANCE } from "../../config/balance.js"
import { DailyService } from "../daily/DailyService.js"

export class PetService {
  static getActivePet(player) {
    return player.activePet || null
  }

  static getPetById(player, petId) {
    return (player.pets || []).find(p => p.id === petId) || null
  }

  static async hatchEgg(player, eggIndex) {
    const eggs = player.eggs || []
    const egg = eggs[eggIndex]
    if (!egg) return { error: "Egg not found." }

    const now = Date.now()
    if (now < new Date(egg.hatchTime).getTime()) {
      const remaining = new Date(egg.hatchTime).getTime() - now
      const hours = Math.floor(remaining / (1000 * 60 * 60))
      const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60))
      return { error: `Egg not ready. Remaining: ${hours}h ${minutes}m` }
    }

    const pool = egg.shikigamiPool || SHIKIGAMI_POOL.filter(s => s.rarity === egg.rarity).map(s => s.name)
    const shikigamiName = pool[Math.floor(Math.random() * pool.length)]
    const template = SHIKIGAMI_POOL.find(s => s.name === shikigamiName) || SHIKIGAMI_POOL[0]

    const pet = {
      id: crypto.randomUUID(),
      name: shikigamiName,
      nickname: null,
      species: template.species,
      rank: template.rank,
      rarity: template.rarity,
      appearance: template.appearance,
      lore: template.lore,
      personality: template.personality,
      passive: template.passive,
      activeTechniques: template.activeTechniques,
      evolutionPath: template.evolutionPath,
      preferredFood: template.preferredFood,
      level: 1,
      xp: 0,
      hp: template.baseStats.hp,
      maxHp: template.baseStats.hp,
      attack: template.baseStats.attack,
      defense: template.baseStats.defense,
      speed: template.baseStats.speed,
      hunger: 100,
      loyalty: 50,
      mood: "Neutral",
      status: "Healthy",
      evolutionStage: 0,
      age: 0,
      wins: 0,
      losses: 0,
      owner: player.playerId,
      createdAt: Date.now(),
      growthRate: template.growthRate
    }

    player.pets = player.pets || []
    player.pets.push(pet)
    player.activePet = pet.id
    egg.status = "Hatched"

    await savePlayer(player)
    return { success: true, pet }
  }

  static async renamePet(player, petId, newName) {
    if (!newName || newName.length > 16) {
      return { error: "Pet name must be 1-16 characters." }
    }

    const pet = this.getPetById(player, petId)
    if (!pet) return { error: "Pet not found." }

    if (pet.owner !== player.playerId) {
      return { error: "You don't own this pet." }
    }

    pet.nickname = newName
    await savePlayer(player)
    return { success: true }
  }

  static async summonPet(player) {
    const pet = this.getPetById(player, player.activePet)
    if (!pet) return { error: "No active pet." }

    if (pet.status === "Unconscious") {
      return { error: "Your pet is unconscious. Revive it first." }
    }

    return { success: true, pet }
  }

  static async unsummonPet(player) {
    player.activePet = null
    await savePlayer(player)
    return { success: true }
  }

  static async feedPet(player, petId, foodItem) {
    const pet = this.getPetById(player, petId)
    if (!pet) return { error: "Pet not found." }

    if (pet.status === "Unconscious") {
      return { error: "Cannot feed an unconscious pet." }
    }

    const hungerRestore = foodItem.effect?.heal || 20
    pet.hunger = Math.min(100, pet.hunger + hungerRestore)
    pet.mood = "Happy"
    pet.loyalty = Math.min(100, pet.loyalty + 5)
    pet.bond = Math.min(100, (pet.bond || 0) + 3)

    const xpGain = 10
    pet.xp += xpGain
    await this.checkLevelUp(player, pet)

    player.inventory = (player.inventory || []).filter(i => i !== foodItem)

    try {
      await DailyService.feedPet(player)
    } catch (e) {
      console.error("[KENNYJAKS ERROR] DailyService.feedPet failed:", e.message)
    }

    await savePlayer(player)
    return { success: true, pet, xpGain }
  }

  static async healPet(player, petId, healItem) {
    const pet = this.getPetById(player, petId)
    if (!pet) return { error: "Pet not found." }

    if (pet.status === "Healthy") {
      return { error: "Pet is already healthy." }
    }

    const healAmount = healItem.effect?.heal || 50
    pet.hp = Math.min(pet.maxHp, pet.hp + healAmount)
    pet.status = pet.hp >= pet.maxHp ? "Healthy" : "Injured"

    player.inventory = (player.inventory || []).filter(i => i !== healItem)

    await savePlayer(player)
    return { success: true, pet }
  }

  static async revivePet(player, petId) {
    const pet = this.getPetById(player, petId)
    if (!pet) return { error: "Pet not found." }

    if (pet.status !== "Unconscious") {
      return { error: "Pet is not unconscious." }
    }

    pet.hp = Math.floor(pet.maxHp * 0.3)
    pet.status = "Injured"
    await savePlayer(player)
    return { success: true, pet }
  }

  static async checkLevelUp(player, pet) {
    const xpRequired = Math.floor(100 * Math.pow(1.15, pet.level - 1))
    let leveledUp = false
    while (pet.xp >= xpRequired && pet.level < 100) {
      pet.xp -= xpRequired
      pet.level += 1
      pet.maxHp += Math.floor(10 * pet.growthRate)
      pet.hp = pet.maxHp
      pet.attack += Math.floor(2 * pet.growthRate)
      pet.defense += Math.floor(2 * pet.growthRate)
      pet.speed += Math.floor(1 * pet.growthRate)
      leveledUp = true

      if (pet.level === 10 || pet.level === 25 || pet.level === 50) {
        if (!pet.abilities) pet.abilities = []
        const learned = pet.activeTechniques?.slice(0, Math.min(Math.floor(pet.level / 10), pet.activeTechniques?.length || 0)) || []
        const newAbilities = [...new Set([...pet.abilities, ...learned])]
        pet.abilities = newAbilities
      }
    }
    return leveledUp
  }

  static async addPetXp(player, petId, amount) {
    const pet = this.getPetById(player, petId)
    if (!pet) return

    pet.xp += amount
    await this.checkLevelUp(player, pet)
    await savePlayer(player)
  }

  static async evolvePet(player, petId) {
    const pet = this.getPetById(player, petId)
    if (!pet) return { error: "Pet not found." }

    if (!pet.evolutionPath) {
      return { error: "This pet cannot evolve." }
    }

    const req = pet.evolutionPath.requirements
    if (pet.level < req.level) {
      return { error: `Pet must be level ${req.level} to evolve.` }
    }
    if (pet.loyalty < req.loyalty) {
      return { error: `Pet loyalty must be ${req.loyalty}. Current: ${pet.loyalty}` }
    }

    const evolution = pet.evolutionPath.stages[pet.evolutionStage + 1]
    if (!evolution) {
      return { error: "Pet is at max evolution." }
    }

    pet.evolutionStage += 1
    pet.name = evolution.name
    pet.rank = evolution.rank
    pet.rarity = evolution.rarity
    pet.maxHp += 50
    pet.hp = pet.maxHp
    pet.attack += 10
    pet.defense += 8
    pet.speed += 5

    await savePlayer(player)
    return { success: true, pet }
  }
}
