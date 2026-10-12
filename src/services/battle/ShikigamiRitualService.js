import fs from "fs-extra"
import path from "path"
import { setActiveCurse, clearActiveCurse, hasActiveCurse } from "../battle/CurseService.js"
import { TechniqueMasteryService } from "../technique/TechniqueMasteryService.js"

const SHIKIGAMI_RITUAL_PREFIX = "shikigami_ritual_"

const RITUAL_DIALOGUES = {
  "divine-dogs": [
    "...You have proven yourself worthy.",
    "Divine Dogs have accepted you as their master.",
    "🐺 Divine Dogs\n\n\"...You have proven yourself worthy.\"\n\nDivine Dogs have accepted you as their master."
  ],
  "nue": [
    "The storm answers your call.",
    "Nue has submitted to your will.",
    "🦅 Nue\n\n\"The storm answers your call.\"\n\nNue has submitted to your will."
  ],
  "great-serpent": [
    "The depths obey your command.",
    "Great Serpent has accepted you as its master.",
    "🐍 Great Serpent\n\n\"The depths obey your command.\"\n\nGreat Serpent has accepted you as its master."
  ],
  "toad": [
    "Your wisdom is recognized.",
    "Toad has submitted to your will.",
    "🐸 Toad\n\n\"Your wisdom is recognized.\"\n\nToad has submitted to your will."
  ],
  "rabbit-escape": [
    "Swift as the wind, loyal as a friend.",
    "Rabbit Escape has accepted you as its master.",
    "🐰 Rabbit Escape\n\n\"Swift as the wind, loyal as a friend.\"\n\nRabbit Escape has accepted you as his master."
  ],
  "max-elephant": [
    "The weight of the mountain bows to you.",
    "Max Elephant has submitted to your will.",
    "🐘 Max Elephant\n\n\"The weight of the mountain bows to you.\"\n\nMax Elephant has submitted to your will."
  ],
  "round-deer": [
    "The divine beast bows in reverence.",
    "Round Deer has accepted you as its master.",
    "🦌 Round Deer\n\n\"The divine beast bows in reverence.\"\n\nRound Deer has accepted you as its master."
  ],
  "piercing-ox": [
    "The unstoppable force yields to you.",
    "Piercing Ox has submitted to your will.",
    "🐂 Piercing Ox\n\n\"The unstoppable force yields to you.\"\n\nPiercing Ox has submitted to your will."
  ],
  "tiger-funeral": [
    "Death itself acknowledges your strength.",
    "Tiger Funeral has accepted you as its master.",
    "🐯 Tiger Funeral\n\n\"Death itself acknowledges your strength.\"\n\nTiger Funeral has accepted you as its master."
  ],
  "mourning-tiger": [
    "From grief, you forge strength.",
    "Mourning Tiger has submitted to your will.",
    "🐅 Mourning Tiger\n\n\"From grief, you forge strength.\"\n\nMourning Tiger has accepted you as its master."
  ],
  "mahoraga": [
    "The wheel turns. You have faced the divine general.",
    "Mahoraga has been tamed.",
    "🐉 Mahoraga\n\n\"The wheel turns. You have faced the divine general.\"\n\nMahoraga has been tamed."
  ]
}

export async function setShikigamiRitual(player, shikigamiId) {
  if (!player || !player.playerId) {
    return { error: "Player data error." }
  }

  const canConquer = TechniqueMasteryService.canConquerShikigami(player, shikigamiId)
  if (!canConquer.canConquer) {
    return { error: canConquer.reason }
  }

  if (hasActiveCurse(player.playerId)) {
    return { error: "You already have an active curse. Defeat it first." }
  }

  const shikigami = TechniqueMasteryService.getShikigamiById(shikigamiId)
  if (!shikigami) {
    return { error: `Unknown shikigami: ${shikigamiId}` }
  }

  const playerLevel = player.level || 1
  const stats = TechniqueMasteryService.getShikigamiScaledStats(shikigami, playerLevel)

  const scaleFactor = 0.10
  const ritualCurse = {
    id: SHIKIGAMI_RITUAL_PREFIX + shikigamiId,
    templateId: SHIKIGAMI_RITUAL_PREFIX + shikigamiId,
    name: shikigami.name,
    title: "Shikigami Ritual",
    grade: 2,
    type: "curse",
    hp: Math.max(1, Math.floor(stats.hp * scaleFactor)),
    maxHp: Math.max(1, Math.floor(stats.hp * scaleFactor)),
    ce: 0,
    maxCe: 0,
    attack: Math.max(1, Math.floor(stats.attack * scaleFactor)),
    baseAttack: Math.max(1, Math.floor(stats.attack * scaleFactor)),
    techniqueDamage: Math.max(1, Math.floor(stats.attack * scaleFactor)),
    defense: Math.max(0, Math.floor(stats.defense * scaleFactor)),
    speed: Math.max(1, Math.floor(stats.speed * scaleFactor)),
    skills: ["shikigami_attack"],
    rewards: {
      xp: 5000,
      yen: 0,
      sp: 1
    },
    threatLevel: "★",
    personality: "aggressive",
    isShikigamiRitual: true,
    shikigamiId: shikigamiId,
    dialogue: {
      intro: [`I am ${shikigami.name}. Face me at full power if you dare!`],
      attack: [`Take this!`, `You shall not pass!`],
      low_hp: [`Ngh...`, `You're stronger than I expected...`],
      defeat: [`I... submit...`],
      taunt: [`You barely beat me at 10% power. I'm not impressed.`]
    },
    statusEffects: [],
    drops: []
  }

  setActiveCurse(player.playerId, ritualCurse)

  const dialogue = RITUAL_DIALOGUES[shikigamiId] || RITUAL_DIALOGUES["divine-dogs"]

  return {
    success: true,
    shikigamiId,
    shikigamiName: shikigami.name,
    opponentHp: ritualCurse.hp,
    opponentAttack: ritualCurse.attack,
    dialogue: dialogue[0]
  }
}

export async function completeShikigamiRitual(player, shikigamiId) {
  clearActiveCurse(player.playerId)

  const result = await TechniqueMasteryService.recordShikigamiConquest(player, shikigamiId)
  return result
}

export function getShikigamiRitualDialogue(shikigamiId) {
  return RITUAL_DIALOGUES[shikigamiId] || RITUAL_DIALOGUES["divine-dogs"]
}
