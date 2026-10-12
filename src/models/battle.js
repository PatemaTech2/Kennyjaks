export class BattleState {
  constructor(data) {
    this.playerId = data.playerId
    this.curse = data.curse
    this.turn = data.turn || "player"
    this.playerHp = data.playerHp
    this.playerCe = data.playerCe
    this.curseHp = data.curseHp
    this.skillCooldowns = data.skillCooldowns || {}
    this.log = data.log || []
    this.escaped = data.escaped || false
    this.finished = data.finished || false
    this.victory = data.victory || false
    this.createdAt = data.createdAt || Date.now()
  }
}
