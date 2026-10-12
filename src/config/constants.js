import fsExtra from "fs-extra"
import path from "path"

export const TECHNIQUES = [
  {
    name: "Limitless",
    branches: [
      {
        name: "Infinity",
        mastery: 1,
        skillTree: ["Infinity Basics", "Spatial Awareness"],
        passive: "Slow incoming attacks automatically",
        unlockedSkills: ["Barrier Creation"]
      },
      {
        name: "Hollow Purple",
        mastery: 1,
        skillTree: ["Attraction Basics", "Repulsion Basics"],
        passive: "Amplify attack power on contact",
        unlockedSkills: ["Matter Collapse"]
      },
      {
        name: "Unlimited Void",
        mastery: 1,
        skillTree: ["Domain Fundamentals", "Information Overload"],
        passive: "Multiply sensory input endlessly",
        unlockedSkills: ["Domain Expansion"]
      }
    ]
  },
  {
    name: "Blood Manipulation",
    branches: [
      {
        name: "Crimson Flow",
        mastery: 1,
        skillTree: ["Blood Sensing", "Blood Clot"],
        passive: "Manipulate own blood freely",
        unlockedSkills: ["Piercing Blood"]
      },
      {
        name: "Piercing Blood",
        mastery: 1,
        skillTree: ["Piercing Focus", "Piercing Range"],
        passive: "Blood projectiles boost penetration",
        unlockedSkills: ["Bloody Spray"]
      },
      {
        name: "Flowing Red Scale",
        mastery: 1,
        skillTree: ["Blood Armor", "Flow Control"],
        passive: "Boost stats with blood flow",
        unlockedSkills: ["Crimson Bullets"]
      },
      {
        name: "Blood Forge",
        mastery: 1,
        skillTree: ["Weapon Shaping", "Material Bond"],
        passive: "Shape blood into weapons",
        unlockedSkills: ["Blood Blade"]
      }
    ]
  },
  {
    name: "Ten Shadows Technique",
    branches: [
      {
        name: "Divine Dogs",
        mastery: 1,
        skillTree: ["Canine Bond", "Pack Tactics"],
        passive: "Summon shadow canine familiars",
        unlockedSkills: ["Perfect Self-Reflection"]
      },
      {
        name: "Nue",
        mastery: 1,
        skillTree: ["Wing Bindings", "Elephant Control"],
        passive: "Summon Nue for aerial strikes",
        unlockedSkills: ["Lightning Wrapper"]
      },
      {
        name: "Toad",
        mastery: 1,
        skillTree: ["Toxic Cloud", "Swamp Bindings"],
        passive: "Immobilize targets with shadow toad",
        unlockedSkills: ["Demon Dog Weave"]
      },
      {
        name: "Shadow Garden",
        mastery: 1,
        skillTree: ["Shadow Step", "Dark Expansion"],
        passive: "Expand shadow reach",
        unlockedSkills: ["Grand Scale Manipulation"]
      }
    ]
  },
  {
    name: "Ratio",
    branches: [
      {
        name: "Cursed Technique Reversal: Red",
        mastery: 1,
        skillTree: ["Amplification Basics", "Power Conversion"],
        passive: "Amplify attacks through cursed energy",
        unlockedSkills: ["Shredding Burst"]
      },
      {
        name: "Cursed Technique Lapse: Blue",
        mastery: 1,
        skillTree: ["Collapse Basics", "Zone Control"],
        passive: "Collapse targets with negative force",
        unlockedSkills: ["Collapse Wave"]
      }
    ]
  },
  {
    name: "Projection Sorcery",
    branches: [
      {
        name: "Dismantle & Cleave",
        mastery: 1,
        skillTree: ["Cutting Precision", "Hitbox Theory"],
        passive: "Slice through matter on contact",
        unlockedSkills: ["Radiant Slash"]
      },
      {
        name: "Number Frames",
        mastery: 1,
        skillTree: ["Frame Analysis", "Time Lock"],
        passive: "Lock movement within frames",
        unlockedSkills: ["Number Lock"]
      }
    ]
  },
  {
    name: "Boogie Woogie",
    branches: [
      {
        name: "Basic Swap",
        mastery: 1,
        skillTree: ["Swap Speed", "Swap Range"],
        passive: "Teleport between marked positions",
        unlockedSkills: ["Clap Swap"]
      },
      {
        name: "Twin Swap",
        mastery: 1,
        skillTree: ["Double Mark", "Echo Position"],
        passive: "Swap twice in rapid succession",
        unlockedSkills: ["Rotation Strike"]
      }
    ]
  },
  {
    name: "Chimera Shadow Garden",
    branches: [
      {
        name: "Basic Shadow",
        mastery: 1,
        skillTree: ["Shadow Spawn", "Shadow Speed"],
        passive: "Multiply shadows rapidly",
        unlockedSkills: ["Shadow Surge"]
      },
      {
        name: "Shadow Merge",
        mastery: 1,
        skillTree: ["Merge Stability", "Merge Range"],
        passive: "Fuse shadows for power",
        unlockedSkills: ["Shadow Unleash"]
      }
    ]
  },
  {
    name: "Disaster Curse",
    branches: [
      {
        name: "Maximum Output",
        mastery: 1,
        skillTree: ["Curse Fuel", "Relentless Wrath"],
        passive: "Grow stronger with damage taken",
        unlockedSkills: ["Hephaestion"]
      },
      {
        name: "Storm Rage",
        mastery: 1,
        skillTree: ["Wind Control", "Pressure Blast"],
        passive: "Channel storm energy",
        unlockedSkills: ["Hurricane Slam"]
      }
    ]
  },
  {
    name: "Awakening",
    branches: [
      {
        name: "Surge Unleashed",
        mastery: 1,
        skillTree: ["Burst Growth", "Cursed Surge"],
        passive: "Unleash raw cursed energy burst",
        unlockedSkills: ["Limit Break"]
      },
      {
        name: "Ethereal Form",
        mastery: 1,
        skillTree: ["Energy Body", "Phase Shift"],
        passive: "Shift partially to cursed energy form",
        unlockedSkills: ["Soul Diffusion"]
      }
    ]
  }
]

export const RARITIES = ["Common", "Rare", "Epic", "Legendary", "Special Grade"]
export const RARITY_WEIGHTS = [40, 30, 18, 9, 3]

 export const STARTING_ITEMS = [
  { id: "item_student_uniform", name: "Student Uniform", rarity: "Common", quantity: 1, type: "armor", usable: false },
  { id: "item_wooden_sword", name: "Wooden Practice Sword", rarity: "Common", quantity: 1, type: "weapon", usable: false },
  { id: "item_bandage", name: "Bandage", rarity: "Common", quantity: 5, type: "consumable", usable: true, effect: { heal: 20 } },
  { id: "item_bread", name: "Bread", rarity: "Common", quantity: 5, type: "consumable", usable: true, effect: { heal: 15 } },
  { id: "item_water", name: "Water", rarity: "Common", quantity: 5, type: "consumable", usable: true, effect: { restoreCE: 10 } }
]

export const MAX_INVENTORY_SLOTS = 24
export const DATABASE_PATH = "database/players"
export const SESSION_PATH = "data/sessions"
export const OWNER_PHONE = "2347037148740"
export const OWNER_NUMBERS = ["2347037148740", "2347049724284", "91865827250241", "SJ000001"]
export const MODERATOR_NUMBERS = ["2347037148740", "91865827250241", "SJ000001"]
export const TEMP_OWNERS_FILE = "database/tempOwners.json"

// Permission helpers — moderator + owner share elevated privileges.
export function isOwner(phoneNumber) {
  return OWNER_NUMBERS.includes(phoneNumber)
}

export function isModerator(phoneNumber) {
  return MODERATOR_NUMBERS.includes(phoneNumber)
}

export function isOwnerOrModerator(phoneNumber) {
  return isOwner(phoneNumber) || isModerator(phoneNumber)
}

export function getNextPlayerId(savePath) {
  try {
    const files = fsExtra.readdirSync(savePath).filter(f => /^SJ\d{6}\.json$/.test(f))
    let maxNum = 0
    for (const f of files) {
      const m = /SJ(\d+)\.json/.exec(f)
      if (m) {
        const n = parseInt(m[1], 10)
        if (n > maxNum) maxNum = n
      }
    }
    return `SJ${String(maxNum + 1).padStart(6, "0")}`
  } catch {
    return "SJ000001"
  }
}

 export const GRADE_TITLES = {
  4: "Grade 4 Sorcerer",
  3: "Grade 3 Sorcerer",
  2: "Grade 2 Sorcerer",
  1: "Grade 1 Sorcerer",
  0: "Special Grade Sorcerer"
}
