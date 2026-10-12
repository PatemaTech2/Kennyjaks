import { loadPlayerByPhone, savePlayer } from "../../database/playerRepo.js"
import { incidents } from "../../data/missions/incidents.js"
import { addXp, calculateXpRequired } from "../LevelUpService.js"
import { DailyService } from "../daily/DailyService.js"
import { ProgressionManager } from "../progression/ProgressionManager.js"

export class MissionService {
  static getAvailableIncidents() {
    return incidents
  }

  static getIncident(incidentId) {
    return incidents.find(i => i.id === incidentId) || null
  }

  static getActiveMission(player) {
    return (player.activeMissions || []).find(m => m.status !== "completed" && m.status !== "failed") || null
  }

  static async acceptMission(player, incidentId) {
    const incident = this.getIncident(incidentId)
    if (!incident) return { error: "Incident not found." }

    const existing = this.getActiveMission(player)
    if (existing) {
      return { error: "You already have an active mission. Complete or abandon it first." }
    }

    player.activeMissions = player.activeMissions || []
    player.activeMissions.push({
      incidentId,
      status: "accepted",
      startedAt: Date.now()
    })

    await savePlayer(player)
    return { success: true, incident }
  }

  static async travel(player) {
    const mission = this.getActiveMission(player)
    if (!mission) return { error: "No active mission." }
    if (mission.status !== "accepted") return { error: "You are already at the location." }

    mission.status = "traveling"
    await savePlayer(player)
    return { success: true }
  }

  static async investigate(player) {
    const mission = this.getActiveMission(player)
    if (!mission) return { error: "No active mission." }
    if (mission.status !== "traveling" && mission.status !== "investigating") {
      return { error: "You need to travel first." }
    }

    const incident = this.getIncident(mission.incidentId)
    if (!incident) return { error: "Incident data missing." }

    const roll = Math.random()
    if (roll < 0.6) {
      mission.status = "ready"
      await DailyService.completeInvestigation(player)
      await savePlayer(player)
      return { success: true, outcome: "discovered", incident }
    } else if (roll < 0.85) {
      await savePlayer(player)
      return { success: true, outcome: "nothing", incident }
    } else {
      mission.status = "disturbed"
      await savePlayer(player)
      return { success: true, outcome: "disturbed", incident }
    }
  }

  static async completeMission(player, victory) {
    const mission = this.getActiveMission(player)
    if (!mission) return { error: "No active mission." }

    const incident = this.getIncident(mission.incidentId)
    if (!incident) return { error: "Incident data missing." }

    if (victory) {
      player.wallet += incident.yenReward
      player.lifetimeEarned += incident.yenReward

      const xpResult = addXp(player, incident.xpReward)
      let levelUp = xpResult.levelUps > 0
      let newGrade = null
        if (xpResult.gradePromoted) {
          newGrade = xpResult.newGrade
        }

      await ProgressionManager.recordEvent(player, "xp_gain", incident.xpReward)
      if (xpResult.levelUps > 0) {
        await ProgressionManager.recordEvent(player, "level_up", xpResult.levelUps)
        await ProgressionManager.checkAllUnlocks(player)
      }
      await ProgressionManager.recordEvent(player, "mission_complete", 1)
    } else {
      var levelUp = false
      var newGrade = null
    }

    mission.status = victory ? "completed" : "failed"
    await savePlayer(player)

    if (victory) {
      await DailyService.completeDailyMission(player)
    }

    return {
      success: true,
      victory,
      incident,
      levelUp,
      newGrade,
      player
    }
  }

  static async abandonMission(player) {
    player.activeMissions = (player.activeMissions || []).filter(m => {
      const mission = m
      return mission.status === "completed" || mission.status === "failed"
    })
    await savePlayer(player)
    return { success: true }
  }
}
