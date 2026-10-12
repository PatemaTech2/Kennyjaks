import { randomInt } from "../utils/generator.js"
import { BALANCE } from "../config/balance.js"

export class Curse {
  constructor(data) {
    this.id = data.id
    this.name = data.name
    this.grade = data.grade
    this.hp = data.hp
    this.maxHp = data.maxHp
    this.ce = data.ce
    this.maxCe = data.maxCe
    this.strength = data.strength
    this.defense = data.defense
    this.speed = data.speed
    this.skills = data.skills || []
    this.weakness = data.weakness || []
    this.rewards = data.rewards
    this.threatLevel = data.threatLevel
    this.baseAttack = data.baseAttack || 10
    this.personality = data.personality || "aggressive"
    this.timesFought = data.timesFought || 0
    this.timesEscaped = data.timesEscaped || 0
    this.damageDealt = data.damageDealt || 0
    this.damageTaken = data.damageTaken || 0
    this.gradeLabel = data.gradeLabel || BALANCE.gradeLabels[data.grade] || "Grade 4"
    this.evolved = data.evolved || false
  }
}

export function generateCurse(grade = 4, personality = null) {
  const stats = BALANCE.curseStats[grade]
  if (!stats) throw new Error("Invalid curse grade")

  const namesByGrade = {
    4: ["Finger Bearer", "Grasshopper Curse", "Pufferfish Curse", "Leaper Curse", "Tsuchigumari Curse"],
    3: ["Upper Grade", "Soldier Curse", "Locust Curse", "Fish Curse", "Amalgamation Curse"],
    2: ["Semi-Grade 1", "Lightning Curse", "Stone Curse", "Dragon Curse", "Vine Curse"],
    1: ["Grade 1", "Water Curse", "Fire Curse", "Shadow Curse", "Venom Curse"],
    0: ["Special Grade", "Mahoraga", "Hanami", "Jogo", "Dagon"]
  }

  const namePool = namesByGrade[grade] || namesByGrade[4]
  const name = namePool[randomInt(0, namePool.length - 1)]
  const hp = randomInt(stats.hp.min, stats.hp.max)
  const ce = randomInt(stats.ce.min, stats.ce.max)

  const id = crypto.randomUUID()

  const baseAttackRange = BALANCE.curseBaseAttack[grade]
  const baseAttack = randomInt(baseAttackRange.min, baseAttackRange.max)

  return new Curse({
    id,
    name,
    grade,
    hp,
    maxHp: hp,
    ce,
    maxCe: ce,
    strength: randomInt(stats.strength.min, stats.strength.max),
    defense: randomInt(stats.defense.min, stats.defense.max),
    speed: randomInt(stats.speed.min, stats.speed.max),
    skills: ["Cursed Strike", "Energy Blast"],
    weakness: [],
    rewards: {
      xp: randomInt(stats.xp.min, stats.xp.max),
      yen: randomInt(stats.yen.min, stats.yen.max),
      sp: stats.sp
    },
    threatLevel: "★★★★★",
    personality: personality || generatePersonalityFromFile(),
    baseAttack
  })
}

function generatePersonalityFromFile() {
  const personalities = ["aggressive", "coward", "sadistic", "arrogant", "silent", "bloodthirsty", "tactical", "crazy"]
  return personalities[Math.floor(Math.random() * personalities.length)]
}
