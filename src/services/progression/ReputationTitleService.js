export const REPUTATION_TIERS = [
  { min: 0, title: null, tier: 0 },
  { min: 10000, title: "TIER 1", tier: 1 },
  { min: 50000, title: "TIER 2", tier: 2 },
  { min: 100000, title: "TIER 3", tier: 3 },
  { min: 170000, title: "TIER 4", tier: 4 },
  { min: 250000, title: "CALAMITY LEVEL", tier: 5 },
  { min: 500000, title: "TIER 6", tier: 6 },
  { min: 700000, title: "TIER 7", tier: 7 },
  { min: 800000, title: "TIER 8", tier: 8 },
  { min: 900000, title: "TIER 9", tier: 9 },
  { min: 1000000, title: "WORLD CLASS LEVEL", tier: 10 },
  { min: 2000000, title: "UNIVERSAL LEVEL", tier: 11 }
]

export const CURSE_REPUTATION_RANGES = {
  4: { min: 100, max: 2000 },
  3: { min: 1000, max: 8000 },
  2: { min: 5000, max: 25000 },
  1: { min: 15000, max: 100000 },
  0: { min: 50000, max: 250000 }
}

function getReputationTitle(reputation) {
  const rep = Math.max(0, Math.floor(reputation || 0))
  let matched = REPUTATION_TIERS[0]
  for (const tier of REPUTATION_TIERS) {
    if (rep >= tier.min) {
      matched = tier
    }
  }
  if (matched.tier === 0) return null
  return {
    title: matched.title,
    threshold: matched.min,
    tier: matched.tier
  }
}

function getCurseReputationRange(grade) {
  return CURSE_REPUTATION_RANGES[grade] || CURSE_REPUTATION_RANGES[4]
}

function generateCurseReputation(grade) {
  const range = getCurseReputationRange(grade)
  return Math.floor(Math.random() * (range.max - range.min + 1)) + range.min
}

function reconcileReputation(player) {
  if (!player) return null
  const rep = player.reputation || 0
  const titleInfo = getReputationTitle(rep)
  if (titleInfo) {
    player.reputationTitle = titleInfo.title
  } else {
    player.reputationTitle = null
  }
  return titleInfo
}

export const ReputationTitleService = {
  getReputationTitle,
  getCurseReputationRange,
  generateCurseReputation,
  reconcileReputation
}
