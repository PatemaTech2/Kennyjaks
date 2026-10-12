import fs from "fs-extra"
import path from "path"

const DOMAINS_PATH = path.resolve(process.cwd(), "src", "data", "domains.json")
let cache = null

function loadDomains() {
  if (cache) return cache
  try {
    cache = fs.readJsonSync(DOMAINS_PATH)
  } catch (err) {
    console.error("[DOMAIN] Failed to load domains.json:", err.message)
    cache = {}
  }
  return cache
}

export const DomainService = {
  getDomainForTechnique(techniqueName) {
    const domains = loadDomains()
    return domains[techniqueName] || null
  },

  hasDomain(player) {
    return !!(player.domains && (player.domains.unlocked || player.domains.infernalPurgatory))
  },

  grantDomain(player, techniqueName) {
    const domain = this.getDomainForTechnique(techniqueName)
    if (!domain) return { error: `No domain defined for technique: ${techniqueName}` }
    player.domains = player.domains || {}
    player.domains.unlocked = true
    player.domains.infernalPurgatory = true
    player.domains.name = domain.name
    player.domains.technique = techniqueName
    return { success: true, domain }
  },

  activate(player, battle) {
    if (!this.hasDomain(player)) return { error: "Domain Expansion not unlocked." }
    const techniqueName = player.domains.technique || player.technique?.name
    const domain = this.getDomainForTechnique(techniqueName)
    if (!domain) return { error: "No domain defined for your technique." }
    if ((player.cursedEnergy || 0) < domain.ceCost) {
      return { error: `Not enough CE. Domain requires ${domain.ceCost} CE.` }
    }
    player.cursedEnergy -= domain.ceCost
    battle.domainActive = true
    battle.domainRounds = domain.battleEffect.rounds || 3
    battle.domainName = domain.name
    battle.domainEffect = domain.battleEffect
    return { success: true, domain, effect: domain.battleEffect }
  },

  processDomainRound(participant, battle, statusEngine) {
    return []
  },

  getDomainCounterplay(techniqueName) {
    const domain = this.getDomainForTechnique(techniqueName)
    if (!domain) return []
    return []
  }
}
