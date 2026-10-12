export const LOCATIONS = {
  tokyo: {
    id: "tokyo",
    name: "Tokyo",
    description: "The capital of sorcery. Dense cursed energy, but relatively stable.",
    dangerLevel: 3,
    encounterRate: 0.7,
    cursePool: [
      "curse_cracked_mirror",
      "curse_rotten_egg",
      "curse_broken_pencil",
      "curse_crumpled_paper",
      "curse_dried_paint",
      "curse_bent_spoon",
      "curse_shadow_wraith",
      "curse_broken_doll",
      "curse_mud_burrower",
      "curse_ink_spray"
    ],
    specialBosses: [],
    roamingBosses: [],
    colors: { primary: "⚪", secondary: "🏙️" }
  },
  shinjuku: {
    id: "shinjuku",
    name: "Shinjuku",
    description: "Cursed energy festers in the alleyways. Nightlife hides dark presences.",
    dangerLevel: 4,
    encounterRate: 0.75,
    cursePool: [
      "curse_forgotten_key",
      "curse_lost_button",
      "curse_crushed_ice",
      "curse_staple_remover",
      "curse_dryer_sheet",
      "curse_empty_spoon",
      "curse_loose_change",
      "curse_tattered_katana",
      "curse_giggle_ghost",
      "curse_coal_roll",
      "curse_mirror_shard",
      "curse_stitched_wound",
      "curse_wind_chimes",
      "curse_fog_wisp",
      "curse_moonlight_brothers",
      "curse_toge_ichimaru"
    ],
    specialBosses: [],
    roamingBosses: [],
    colors: { primary: "🟣", secondary: "🌃" }
  },
  shibuya: {
    id: "shibuya",
    name: "Shibuya",
    description: "The veil between life and death is thin here. High-grade curses roam.",
    dangerLevel: 5,
    encounterRate: 0.8,
    cursePool: [
      "curse_tattered_katana",
      "curse_giggle_ghost",
      "curse_coal_roll",
      "curse_mirror_shard",
      "curse_stitched_wound",
      "curse_wind_chimes",
      "curse_fog_wisp",
      "curse_broken_puppet",
      "curse_rust_mite",
      "curse_crumpled_letter",
      "curse_jingle_bell",
      "curse_dust_bunny",
      "curse_spilled_ink",
      "curse_tarnished_medal",
      "curse_lonely_candle",
      "curse_moonlight_brothers",
      "curse_toge_ichimaru",
      "curse_rain",
      "curse_reggie",
      "curse_koibito_maid",
      "curse_norimya_suchi",
      "curse_sgyu",
      "curse_death_king",
      "curse_yorimitsu",
      "curse_kirara",
      "curse_geto"
    ],
    specialBosses: [],
    roamingBosses: [],
    colors: { primary: "🔴", secondary: "🌉" }
  },
  kyoto: {
    id: "kyoto",
    name: "Kyoto",
    description: "Ancient techniques linger in the old capital. Technique-heavy curses dwell here.",
    dangerLevel: 5,
    encounterRate: 0.8,
    cursePool: [
      "curse_tattered_katana",
      "curse_giggle_ghost",
      "curse_coal_roll",
      "curse_mirror_shard",
      "curse_stitched_wound",
      "curse_wind_chimes",
      "curse_fog_wisp",
      "curse_broken_puppet",
      "curse_rust_mite",
      "curse_crumpled_letter",
      "curse_jingle_bell",
      "curse_dust_bunny",
      "curse_spilled_ink",
      "curse_tarnished_medal",
      "curse_lonely_candle",
      "curse_moonlight_brothers",
      "curse_toge_ichimaru",
      "curse_rain",
      "curse_reggie",
      "curse_koibito_maid",
      "curse_norimya_suchi",
      "curse_sgyu",
      "curse_death_king",
      "curse_yorimitsu",
      "curse_kirara",
      "curse_geto"
    ],
    specialBosses: [],
    roamingBosses: [],
    colors: { primary: "🟢", secondary: "⛩️" }
  },
  sendai: {
    id: "sendai",
    name: "Sendai",
    description: "Remote mountains hide rare and powerful curses. Few sorcerers venture this far.",
    dangerLevel: 6,
    encounterRate: 0.85,
    cursePool: [
      "curse_moonlight_brothers",
      "curse_toge_ichimaru",
      "curse_rain",
      "curse_reggie",
      "curse_koibito_maid",
      "curse_norimya_suchi",
      "curse_sgyu",
      "curse_death_king",
      "curse_yorimitsu",
      "curse_kirara",
      "curse_geto",
      "curse_amateratsukuyomi",
      "curse_hanami",
      "curse_jogo",
      "curse_dagon",
      "curse_kenjaku"
    ],
    specialBosses: [],
    roamingBosses: [],
    colors: { primary: "🔵", secondary: "🏔️" }
  },
  abuja: {
    id: "abuja",
    name: "Abuja",
    description: "Extremely dangerous cursed energy. Only the strongest should enter.",
    dangerLevel: 7,
    encounterRate: 0.9,
    cursePool: [
      "curse_koibito_maid",
      "curse_norimya_suchi",
      "curse_sgyu",
      "curse_death_king",
      "curse_yorimitsu",
      "curse_kirara",
      "curse_geto",
      "curse_amateratsukuyomi",
      "curse_hanami",
      "curse_jogo",
      "curse_dagon",
      "curse_kenjaku"
    ],
    specialBosses: ["ogun"],
    roamingBosses: [],
    colors: { primary: "🟠", secondary: "🔥" }
  },
  anambra: {
    id: "anambra",
    name: "Anambra",
    description: "Water/ocean-themed curses and extremely rare encounters. The river remembers.",
    dangerLevel: 8,
    encounterRate: 0.95,
    cursePool: [
      "curse_koibito_maid",
      "curse_norimya_suchi",
      "curse_sgyu",
      "curse_death_king",
      "curse_yorimitsu",
      "curse_kirara",
      "curse_geto",
      "curse_amateratsukuyomi",
      "curse_hanami",
      "curse_jogo",
      "curse_dagon",
      "curse_kenjaku"
    ],
    specialBosses: ["mami_wata"],
    roamingBosses: [],
    colors: { primary: "🩵", secondary: "🌊" }
  }
}

export const ROAMING_BOSSES = {
  benimaru: {
    id: "benimaru",
    name: "Benimaru",
    titles: ["The Devil's Spawn", "The Tainted Sorcerer"],
    classification: "ARCH TIER",
    grade: 0,
    hp: 100000000,
    ce: 60000000,
    attack: 500000,
    defense: 400000,
    speed: 350000,
    technique: "Inferno Apex",
    domain: "Hellfire Crematorium",
    encounterRate: 0.13,
    locations: ["tokyo", "shinjuku", "shibuya", "kyoto", "sendai", "abuja", "anambra"],
    personality: "stoic",
    statusEffects: ["burn", "stun"],
    xpReward: 5000000,
    yenReward: 5000000,
    drops: ["infernal_heart", "devil_spawn_essence"]
  }
}

export const BOSS_DEFINITIONS = {
  mami_wata: {
    id: "mami_wata",
    name: "Mami Wata",
    titles: ["Queen of the Ocean"],
    classification: "SPECIAL GRADE",
    grade: 0,
    hp: 100000,
    ce: 79000,
    attack: 4500,
    defense: 3200,
    speed: 2800,
    technique: "Siren's Current",
    domain: "Abyssal Shrine of the Tide",
    personality: "calm",
    statusEffects: ["confusion", "slow"],
    xpReward: 500000,
    yenReward: 250000,
    drops: ["ocean_tear", "cursed_pearl"]
  },
  ogun: {
    id: "ogun",
    name: "Ogun",
    titles: ["The Iron War God"],
    classification: "SPECIAL GRADE",
    grade: 0,
    hp: 130000,
    ce: 100000,
    attack: 5200,
    defense: 3800,
    speed: 2400,
    technique: "Crucible of Iron",
    domain: "Iron Forge of the Bloodstained Anvil",
    personality: "stoic",
    statusEffects: ["stun", "burn"],
    xpReward: 600000,
    yenReward: 300000,
    drops: ["iron_war_god_essence", "bloodstained_anvil_fragment"]
  }
}

export const CURSE_REPUTATION_RANGES = {
  4: { min: 100, max: 2000 },
  3: { min: 1000, max: 8000 },
  2: { min: 5000, max: 25000 },
  1: { min: 15000, max: 100000 },
  0: { min: 50000, max: 250000 }
}

export function getCurseReputationRange(grade) {
  return CURSE_REPUTATION_RANGES[grade] || CURSE_REPUTATION_RANGES[4]
}

export function generateCurseReputation(grade) {
  const range = getCurseReputationRange(grade)
  return Math.floor(Math.random() * (range.max - range.min + 1)) + range.min
}
