import { loadAllPlayers, savePlayer } from "../../database/playerRepo.js"
import chalk from "chalk"

const CACHE_TTL = 30000
let cachedStats = null
let lastCacheUpdate = 0

export class ServerDashboardService {
  static async getServerStats() {
    const now = Date.now()
    if (cachedStats && now - lastCacheUpdate < CACHE_TTL) {
      return cachedStats
    }

    const players = await loadAllPlayers()
    const stats = this.calculateStats(players)
    cachedStats = stats
    lastCacheUpdate = now
    return stats
  }

  static calculateStats(players) {
    const now = Date.now()
    const totalPlayers = players.length
    const totalWallet = players.reduce((sum, p) => sum + (p.wallet || 0), 0)
    const totalBank = players.reduce((sum, p) => sum + (p.bank || 0), 0)
    const combinedWealth = totalWallet + totalBank
    const combinedLevels = players.reduce((sum, p) => sum + (p.level || 1), 0)
    const averageLevel = totalPlayers > 0 ? Math.floor(combinedLevels / totalPlayers) : 0
    const totalCurseKills = players.reduce((sum, p) => sum + (p.blackFlashes || 0), 0)
    const totalPvPWins = players.reduce((sum, p) => sum + (p.pvpWins || 0), 0)
    const totalPvPLosses = players.reduce((sum, p) => sum + (p.pvpLosses || 0), 0)
    const totalPvPBattles = totalPvPWins + totalPvPLosses
    const totalBlackFlashes = players.reduce((sum, p) => sum + (p.blackFlashes || 0), 0)
    const totalMissions = players.reduce((sum, p) => sum + (p.completedMissions?.length || 0), 0)
    const totalEggs = players.reduce((sum, p) => sum + (p.eggs?.length || 0), 0)
    const totalShikigami = players.reduce((sum, p) => sum + (p.pets?.length || 0), 0)
    const totalItems = players.reduce((sum, p) => sum + (p.inventory?.length || 0), 0)
    const totalBags = players.reduce((sum, p) => sum + (p.bags?.length || 0), 0)

    let totalPlayTime = 0
    let onlineCount = 0
    const ONLINE_THRESHOLD = 5 * 60 * 1000

    players.forEach(p => {
      totalPlayTime += p.totalPlayTime || 0
      if (p.lastSeen && now - p.lastSeen < ONLINE_THRESHOLD) {
        onlineCount++
      }
    })

    const averagePlayTimeMs = totalPlayers > 0 ? totalPlayTime / totalPlayers : 0
    const averagePlayTimeHours = Math.floor(averagePlayTimeMs / (1000 * 60 * 60))
    const averagePlayTimeMinutes = Math.floor((averagePlayTimeMs % (1000 * 60 * 60)) / (1000 * 60))

    const uptime = process.uptime()
    const uptimeDays = Math.floor(uptime / (3600 * 24))
    const uptimeHours = Math.floor((uptime % (3600 * 24)) / 3600)

    const topRichest = [...players].sort((a, b) => (b.wallet || 0) - (a.wallet || 0)).slice(0, 1)[0]
    const topLevel = [...players].sort((a, b) => (b.level || 1) - (a.level || 1)).slice(0, 1)[0]
    const topKills = [...players].sort((a, b) => (b.blackFlashes || 0) - (a.blackFlashes || 0)).slice(0, 1)[0]
    const topPvP = [...players].sort((a, b) => (b.pvpWins || 0) - (a.pvpWins || 0)).slice(0, 1)[0]

    return {
      totalPlayers,
      totalWallet,
      totalBank,
      combinedWealth,
      combinedLevels,
      averageLevel,
      totalCurseKills,
      totalPvPBattles,
      totalBlackFlashes,
      totalMissions,
      totalEggs,
      totalShikigami,
      totalItems,
      totalBags,
      totalPlayTime,
      averagePlayTimeHours,
      averagePlayTimeMinutes,
      onlineCount,
      uptimeDays,
      uptimeHours,
      botVersion: "1.0.0",
      topRichest,
      topLevel,
      topKills,
      topPvP,
      players
    }
  }

  static async getPaginatedPlayers(page = 1, pageSize = 10) {
    const stats = await this.getServerStats()
    const sorted = [...stats.players].sort((a, b) => (b.level || 1) - (a.level || 1))
    const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))
    const safePage = Math.max(1, Math.min(page, totalPages))
    const start = (safePage - 1) * pageSize
    const paginated = sorted.slice(start, start + pageSize)

    return {
      players: paginated,
      page: safePage,
      totalPages,
      total: sorted.length
    }
  }

  static async getLeaderboard(category = "richest", page = 1) {
    const stats = await this.getServerStats()
    let sorted = []

    switch (category) {
      case "richest":
        sorted = [...stats.players].sort((a, b) => ((b.wallet || 0) + (b.bank || 0)) - ((a.wallet || 0) + (a.bank || 0)))
        break
      case "level":
        sorted = [...stats.players].sort((a, b) => (b.level || 1) - (a.level || 1))
        break
      case "kills":
        sorted = [...stats.players].sort((a, b) => (b.blackFlashes || 0) - (a.blackFlashes || 0))
        break
      case "pvp":
        sorted = [...stats.players].sort((a, b) => (b.pvpWins || 0) - (a.pvpWins || 0))
        break
      case "playtime":
        sorted = [...stats.players].sort((a, b) => (b.totalPlayTime || 0) - (a.totalPlayTime || 0))
        break
      default:
        sorted = [...stats.players].sort((a, b) => ((b.wallet || 0) + (b.bank || 0)) - ((a.wallet || 0) + (a.bank || 0)))
    }

    const pageSize = 10
    const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))
    const safePage = Math.max(1, Math.min(page, totalPages))
    const start = (safePage - 1) * pageSize
    const paginated = sorted.slice(start, start + pageSize)

    return {
      players: paginated,
      page: safePage,
      totalPages,
      category
    }
  }

  static async invalidateCache() {
    cachedStats = null
    lastCacheUpdate = 0
  }
}
