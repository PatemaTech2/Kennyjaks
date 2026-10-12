import { Player } from "../../models/player.js"

const BASE_CURSE_STATS = {
  grade5: { hp: 200, attack: 20, defense: 10, speed: 8, ce: 100 },
  grade4: { hp: 350, attack: 35, defense: 18, speed: 12, ce: 180 },
  grade3: { hp: 550, attack: 55, defense: 28, speed: 16, ce: 280 },
  grade2: { hp: 800, attack: 80, defense: 42, speed: 22, ce: 400 },
  grade1: { hp: 1200, attack: 120, defense: 65, speed: 30, ce: 600 },
  special: { hp: 2000, attack: 200, defense: 100, speed: 40, ce: 1000 }
}

const CURSE_NAMES = {
  grade5: ["Weak Curse", "Lesser Spirit", "Minor Impurity", "Faint Residue", "Drifting Wisp"],
  grade4: ["Cursed Spirit", "Vengeful Soul", "Malicious Shade", "Twisted Phantom", "Corrupted Echo"],
  grade3: ["Grade 3 Curse", "Bound Phantom", "Wraith of Hatred", "Abyssal Stalker", "Festering Rot"],
  grade2: ["Grade 2 Curse", "Cursed Womb Remnant", "Disaster Beast", "Calamity Spawn", "Domain Fragment"],
  grade1: ["Grade 1 Curse", "Special Grade Fragment", "Catastrophe Incarnate", "Ancient Malice", "Primordial Horror"],
  special: ["Special Grade", "King of Curses", "Ancient Evil", "World Ender", "Reality Breaker"]
}

const CURSE_DESCRIPTIONS = {
  grade5: "A weak curse born from minor negative emotions.",
  grade4: "A standard curse formed from accumulated malice.",
  grade3: "A dangerous curse that requires a skilled sorcerer.",
  grade2: "A powerful curse nearing special grade.",
  grade1: "A near-special grade curse of immense power.",
  special: "A special grade curse capable of destroying cities."
}

function getPlayerGrade(player) {
  if (!player) return "grade5"
  const grade = player.grade || 4
  if (grade <= 0) return "special"
  if (grade === 1) return "grade1"
  if (grade === 2) return "grade2"
  if (grade === 3) return "grade3"
  if (grade === 4) return "grade4"
  return "grade5"
}

function getScalingFactor(player) {
  const grade = getPlayerGrade(player)
  const baseLevels = { grade5: 1, grade4: 1.2, grade3: 1.5, grade2: 2, grade1: 3, special: 5 }
  return baseLevels[grade]
}

function getRandomName(grade) {
  const names = CURSE_NAMES[grade] || CURSE_NAMES.grade5
  return names[Math.floor(Math.random() * names.length)]
}

export function generateCurse(player, overrideGrade = null) {
  const targetGrade = overrideGrade || getPlayerGrade(player)
  const base = BASE_CURSE_STATS[targetGrade] || BASE_CURSE_STATS.grade5
  const scaling = getScalingFactor(player)

  const variation = 0.85 + Math.random() * 0.3

  const hp = Math.floor(base.hp * scaling * variation)
  const attack = Math.floor(base.attack * scaling * variation)
  const defense = Math.floor(base.defense * scaling * variation)
  const speed = Math.floor(base.speed * scaling * variation)
  const ce = Math.floor(base.ce * scaling * variation)

  const name = getRandomName(targetGrade)
  const description = CURSE_DESCRIPTIONS[targetGrade]

  return {
    id: `curse_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    name,
    grade: targetGrade,
    description,
    maxHp: hp,
    hp,
    attack,
    defense,
    speed,
    maxCe: ce,
    ce,
    isBoss: targetGrade === "special",
    xpReward: Math.floor(50 * scaling),
    yenReward: Math.floor(200 * scaling),
    sprite: null
  }
}

export function generateFairCurse(level, grade) {
  const player = { level, grade }
  return generateCurse(player)
}

export function generateSpriteBattleCurse(player, spriteName = "johnken") {
  const curse = generateCurse(player)
  
  const spriteMultipliers = {
    johnken: { hp: 1.0, attack: 1.0, defense: 1.0, speed: 1.0 },
    barney: { hp: 1.1, attack: 0.95, defense: 1.05, speed: 0.9 },
    misaki: { hp: 0.9, attack: 1.1, defense: 0.9, speed: 1.15 }
  }

  const mult = spriteMultipliers[spriteName] || spriteMultipliers.johnken
  curse.maxHp = Math.floor(curse.maxHp * mult.hp)
  curse.hp = curse.maxHp
  curse.attack = Math.floor(curse.attack * mult.attack)
  curse.defense = Math.floor(curse.defense * mult.defense)
  curse.speed = Math.floor(curse.speed * mult.speed)
  curse.sprite = spriteName

  return curse
}

export function getCurseGradeLabel(grade) {
  const labels = {
    grade5: "Grade 5 (Weak)",
    grade4: "Grade 4 (Standard)",
    grade3: "Grade 3 (Dangerous)",
    grade2: "Grade 2 (Powerful)",
    grade1: "Grade 1 (Near Special)",
    special: "Special Grade (Catastrophic)"
  }
  return labels[grade] || "Unknown"
}

export function getCurseDisplayName(curse) {
  return `${curse.name} [${getCurseGradeLabel(curse.grade)}]`
}

export { BASE_CURSE_STATS, CURSE_NAMES, CURSE_DESCRIPTIONS }