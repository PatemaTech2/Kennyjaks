export const RARE_DROPS = [
  { name: "Sukuna Finger", dropRate: 0.005, emoji: "🩸" },
  { name: "Inverted Spear Fragment", dropRate: 0.01, emoji: "🌟" },
  { name: "Cursed Core", dropRate: 0.05, emoji: "💎" },
  { name: "Rotten Finger", dropRate: 0.08, emoji: "🦴" },
  { name: "Grade Essence", dropRate: 0.1, emoji: "✨" }
]

export const VICTORY_QUOTES = [
  "The curse was completely erased.",
  "The curse dissolved into cursed mist.",
  "Your cursed energy overwhelmed the enemy.",
  "The surrounding air finally became calm.",
  "The curse screamed before disappearing forever.",
  "Victory belongs to the strong.",
  "The exorcism was successful.",
  "The curse could no longer regenerate.",
  "The battlefield falls silent.",
  "You survived another encounter with death.",
  "Another curse has fallen before your power.",
  "Your cursed energy continues to grow stronger.",
  "Jujutsu High would be proud.",
  "You walk away covered in cursed blood.",
  "The curse never stood a chance.",
  "Only the strongest survive.",
  "Every battle shapes a true sorcerer."
]

export const BATTLE_TITLES = [
  { condition: (s) => s.damageTaken === 0, title: "⚡ Perfect Victory" },
  { condition: (s) => s.turnCount <= 5, title: "💀 Curse Destroyer" },
  { condition: (s) => s.blackFlashes >= 3, title: "🔥 Black Flash Master" },
  { condition: (s) => s.blocks >= 5, title: "🛡 Iron Wall" },
  { condition: (s) => s.damageDealt >= 2000, title: "⚔ Berserker" },
  { condition: (s) => s.techniquesUsed >= 3, title: "🎯 Technique Specialist" }
]
