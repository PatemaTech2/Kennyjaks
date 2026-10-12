import fs from "fs-extra"
import path from "path"

const LEGENDARY_PATH = path.join(process.cwd(), "database", "legendaryBattles.json")

export class LegendaryBattlesService {
  static async load() {
    try {
      if (await fs.pathExists(LEGENDARY_PATH)) {
        return await fs.readJson(LEGENDARY_PATH)
      }
    } catch {}
    return { battles: [] }
  }

  static async save(data) {
    await fs.ensureDir(path.dirname(LEGENDARY_PATH))
    await fs.writeJson(LEGENDARY_PATH, data, { spaces: 2 })
  }

  static async recordBattle(record) {
    if (!record) return null
    const data = await this.load()
    const entry = {
      id: crypto.randomUUID(),
      ...record,
      recordedAt: Date.now()
    }
    data.battles = data.battles || []
    data.battles.push(entry)
    await this.save(data)
    return entry
  }

  static async recordIfLegendary(state, winnerId, loserId) {
    if (!state || !winnerId) return null
    const winner = state.participants.get(String(winnerId))
    const loser = state.participants.get(String(loserId))
    if (!winner || !loser) return null
    const gradeDiff = (winner.gradeValue || 0) - (loser.gradeValue || 0)
    const isLegendary = state.blackFlashTriggered || gradeDiff >= 3 || (state.peakMoment && state.peakMoment.length > 0)
    if (!isLegendary) return null
    return this.recordBattle({
      playerId: winnerId,
      victory: true,
      gradeDiff,
      opponentId: loserId,
      opponentName: loser.name,
      blackFlash: state.blackFlashTriggered,
      peakMoment: state.peakMoment,
      round: state.round,
      mode: state.mode
    })
  }

  static async getTopLegends(limit = 10) {
    const data = await this.load()
    const battles = data.battles || []
    return battles
      .filter(b => b.victory)
      .sort((a, b) => (b.gradeDiff || 0) - (a.gradeDiff || 0))
      .slice(0, limit)
  }

  static async getPlayerLegends(playerId) {
    const data = await this.load()
    const battles = data.battles || []
    return battles.filter(b => b.playerId === playerId && b.victory)
  }
}
