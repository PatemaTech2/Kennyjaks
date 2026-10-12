export const MAHORAGA_FULL_POWER = {
  id: "mahoraga",
  name: "Eight-Handled Sword Divergent Sila Divine General Mahoraga",
  emoji: "🐉",
  type: "curse",
  grade: 0,
  hp: 2000,
  maxHp: 2000,
  attack: 90,
  defense: 60,
  speed: 40,
  cursedEnergy: 2000,
  maxCursedEnergy: 2000,
  baseAttack: 90,
  techniqueDamage: 90,
  blackFlashChance: 5,
  blackFlashDamageMultiplier: 2.5,
  personality: "ancient",
  skills: ["Adaptation", "Divine Aegis", "Regeneration", "Sword of Extermination"],
  abilities: ["Adaptation", "Divine Aegis", "Regeneration", "Sword of Extermination", "Wheel of Fortune"]
}

export const MAHORAGA_SUBJUGATION = {
  ...MAHORAGA_FULL_POWER,
  hp: 200,
  maxHp: 200,
  attack: 25,
  defense: 20,
  speed: 30,
  cursedEnergy: 500,
  maxCursedEnergy: 500,
  baseAttack: 25,
  techniqueDamage: 25,
  blackFlashDamageMultiplier: 1.5
}

export const MAHORAGA_TAMED_BASE = {
  id: "mahoraga",
  name: "Eight-Handled Sword Divergent Sila Divine General Mahoraga",
  emoji: "🐉",
  type: "shikigami",
  grade: 0,
  hp: 2000,
  maxHp: 2000,
  attack: 90,
  defense: 65,
  speed: 45,
  ce: 2000,
  maxCe: 2000,
  baseAttack: 90,
  techniqueDamage: 90,
  skills: ["Adaptation", "Divine Aegis", "Regeneration", "Sword of Extermination"],
  abilities: ["Adaptation", "Divine Aegis", "Regeneration", "Sword of Extermination", "Wheel of Fortune"],
  ceCost: 150,
  cooldown: 5,
  statusEffect: null,
  isShikigami: true,
  shikigamiData: {
    id: "mahoraga",
    name: "Mahoraga",
    emoji: "🐉"
  }
}

export const MAHORAGA_DIALOGUE = {
  intro: ["I am the Eight-Handled Sword Divergent Sila Divine General Mahoraga.", "The wheel turns. You challenged me."],
  attack: ["Take this!", "You shall not pass!", "Feel the edge of the divine sword."],
  observe: ["Interesting.", "You continue using the same method.", "I see.", "Predictable."],
  adapt: ["I understand it now.", "The wheel has turned.", "Adaptation complete.", "Your technique is no longer unknown."],
  counter: ["You forced my hand.", "This is what adaptation looks like.", "Your move."],
  lowHp: ["Ngh...", "You're stronger than I expected...", "Not yet..."],
  defeat: ["I... submit...", "You have proven yourself."],
  taunt: ["You barely beat me at 10% power. I'm not impressed.", "Is that all?", "You have much to learn."]
}

export function createMahoragaOpponent(context = "full", ownerTest = false) {
  const base = context === "subjugation" ? MAHORAGA_SUBJUGATION : { ...MAHORAGA_FULL_POWER }
  return {
    ...base,
    id: ownerTest ? "mahoraga-owner-test-" + Date.now() : "mahoraga-ritual-" + Date.now(),
    templateId: "mahoraga",
    title: context === "subjugation" ? "Mahoraga Subjugation" : "Mahoraga",
    rewards: ownerTest ? { xp: 0, yen: 0, sp: 0 } : { xp: 5000, yen: 0, sp: 1 },
    threatLevel: "★",
    isShikigamiRitual: context === "subjugation",
    shikigamiId: "mahoraga",
    isOwnerTest: ownerTest,
    dialogue: {
      intro: MAHORAGA_DIALOGUE.intro,
      attack: MAHORAGA_DIALOGUE.attack,
      low_hp: MAHORAGA_DIALOGUE.lowHp,
      defeat: MAHORAGA_DIALOGUE.defeat,
      taunt: MAHORAGA_DIALOGUE.taunt
    },
    statusEffects: [],
    drops: []
  }
}

export function createMahoragaBattleState() {
  return {
    adaptation: {},
    adaptedAttacks: [],
    wheelProgress: 0,
    roundObservations: 0,
    momentum: 0,
    dialogueCooldown: 0,
    lastAttackType: null
  }
}

export function recordMahoragaHit(battleState, attackType, attackFamily) {
  if (!battleState.adaptation) battleState.adaptation = {}
  if (!attackType) return battleState

  const key = attackFamily || attackType
  if (!battleState.adaptation[key]) {
    battleState.adaptation[key] = { hits: 0, attackTypes: [] }
  }
  battleState.adaptation[key].hits += 1
  if (!battleState.adaptation[key].attackTypes.includes(attackType)) {
    battleState.adaptation[key].attackTypes.push(attackType)
  }
  if (battleState.adaptation[key].hits >= 4 && !battleState.adaptedAttacks.includes(key)) {
    battleState.adaptedAttacks.push(key)
  }
  return battleState
}

export function getMahoragaDamageMultiplier(battleState, attackFamily) {
  if (!battleState || !battleState.adaptation) return 1.0
  const key = attackFamily || "unknown"
  const tracked = battleState.adaptation[key]
  if (!tracked) return 1.0
  if (battleState.adaptedAttacks.includes(key)) return 0.1
  const hits = tracked.hits || 0
  if (hits >= 3) return 0.3
  if (hits >= 2) return 0.5
  if (hits >= 1) return 0.7
  return 1.0
}

export function getMahoragaWheelStatus(battleState) {
  if (!battleState || !battleState.adaptation) return { progress: 0, label: "", adaptedAttacks: [] }
  const adapted = battleState.adaptedAttacks || []
  let maxProgress = 0
  for (const key of Object.keys(battleState.adaptation)) {
    const hits = battleState.adaptation[key].hits || 0
    if (hits > maxProgress) maxProgress = hits
  }
  const progress = Math.min(4, maxProgress)
  const labels = ["", "THE WHEEL HAS TURNED ONCE 1/4", "THE WHEEL HAS TURNED TWICE 2/4", "THE WHEEL HAS TURNED THREE TIMES 3/4", "ADAPTATION COMPLETE"]
  return {
    progress,
    label: labels[progress] || "",
    adaptedAttacks: adapted
  }
}

export function getMahoragaEscalation(battleState) {
  if (!battleState) return 0
  const adapted = battleState.adaptedAttacks || []
  return adapted.length
}
