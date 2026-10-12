import { test, describe } from "node:test"
import assert from "node:assert"
import { BattleEngine, getBattleEngine, removeBattleEngine } from "../src/services/battle/BattleEngine.js"
import { BattleManager } from "../src/services/battle/BattleManager.js"
import { globalStatusEngine } from "../src/services/battle/StatusEngine.js"

describe("New Combat System E2E", () => {
  test("Phase 34: attack vs counter resolves and continues", async () => {
    const engine = new BattleEngine()
    const battleId = "test:battle:1"
    engine.init(battleId, "NORMAL")

    const player = {
      id: "p1",
      playerId: "p1",
      name: "Player",
      health: 5000,
      maxHealth: 5000,
      cursedEnergy: 4000,
      maxCursedEnergy: 4000,
      strength: 1000,
      defense: 100,
      speed: 100,
      intelligence: 100,
      luck: 10,
      critRate: 5,
      grade: 4,
      technique: null,
      equippedItems: {},
      blackFlashAffinity: 5
    }

    const curse = {
      id: "c1",
      playerId: "c1",
      name: "Curse",
      health: 5000,
      maxHealth: 5000,
      cursedEnergy: 4000,
      maxCursedEnergy: 4000,
      strength: 1000,
      defense: 100,
      speed: 100,
      intelligence: 100,
      luck: 10,
      critRate: 5,
      grade: 4,
      technique: null,
      equippedItems: {},
      personality: "neutral",
      bossAbilities: null,
      isCurse: true
    }

    engine.registerParticipant({
      id: "p1",
      name: "Player",
      maxHp: 5000,
      currentHp: 5000,
      maxCe: 4000,
      currentCe: 4000,
      rawStrength: 1000,
      rawDefense: 100,
      rawSpeed: 100,
      rawTechnique: 100,
      critRate: 5,
      luck: 10,
      gradeValue: 4,
      technique: null,
      equippedItems: {},
      blackFlashAffinity: 5
    })

    engine.registerParticipant({
      id: "c1",
      name: "Curse",
      maxHp: 5000,
      currentHp: 5000,
      maxCe: 4000,
      currentCe: 4000,
      rawStrength: 1000,
      rawDefense: 100,
      rawSpeed: 100,
      rawTechnique: 100,
      critRate: 5,
      luck: 10,
      gradeValue: 4,
      technique: null,
      equippedItems: {},
      personality: "neutral",
      bossAbilities: null,
      isCurse: true
    })

    engine.submitAction("p1", "attack", { targetId: "c1" })
    engine.submitAction("c1", "counter", { targetId: "p1" })

    const resolved = await engine.resolveRound()

    console.log("=== ROUND 1 RESOLVED ===")
    console.log("Events:", resolved.events)
    console.log("Player HP:", engine.participants.get("p1")?.currentHp)
    console.log("Curse HP:", engine.participants.get("c1")?.currentHp)
    console.log("Momentum:", engine.state.momentum)
    console.log("Finished:", resolved.finished)
    console.log("Narration:", resolved.narration)

    assert.ok(resolved, "Resolution should exist")
    assert.ok(resolved.events && resolved.events.length > 0, "Should produce events")
    assert.ok(resolved.narration && resolved.narration.length > 0, "Should produce narration")

    const playerAfter = engine.participants.get("p1")
    const curseAfter = engine.participants.get("c1")

    assert.ok(typeof playerAfter.currentHp === "number", "Player HP should be a number")
    assert.ok(typeof curseAfter.currentHp === "number", "Curse HP should be a number")
    assert.ok(playerAfter.currentHp >= 0 && playerAfter.currentHp <= 5000, "Player HP should be valid")
    assert.ok(curseAfter.currentHp >= 0 && curseAfter.currentHp <= 5000, "Curse HP should be valid")

    assert.ok(typeof engine.state.momentum === "number", "Momentum should be a number")
    assert.ok(engine.state.momentum >= 0 && engine.state.momentum <= 100, "Momentum should be 0-100")

    if (!resolved.finished) {
      engine.submitAction("p1", "attack", { targetId: "c1" })
      engine.submitAction("c1", "attack", { targetId: "p1" })

      const resolved2 = await engine.resolveRound()
      console.log("\n=== ROUND 2 RESOLVED ===")
      console.log("Events:", resolved2.events)
      console.log("Player HP:", engine.participants.get("p1")?.currentHp)
      console.log("Curse HP:", engine.participants.get("c1")?.currentHp)
      console.log("Finished:", resolved2.finished)

      assert.ok(resolved2, "Round 2 should resolve")
      assert.ok(resolved2.events && resolved2.events.length > 0, "Round 2 should produce events")
    }
  })

  test("Phase 34: block reduces damage", async () => {
    const engine = new BattleEngine()
    const battleId = "test:battle:block"
    engine.init(battleId, "NORMAL")

    engine.registerParticipant({
      id: "p1", name: "Player", maxHp: 5000, currentHp: 5000,
      maxCe: 4000, currentCe: 4000, rawStrength: 1000, rawDefense: 100,
      rawSpeed: 100, rawTechnique: 100, critRate: 5, luck: 10,
      gradeValue: 4, technique: null, equippedItems: {}, blackFlashAffinity: 5
    })

    engine.registerParticipant({
      id: "c1", name: "Curse", maxHp: 5000, currentHp: 5000,
      maxCe: 4000, currentCe: 4000, rawStrength: 1000, rawDefense: 100,
      rawSpeed: 100, rawTechnique: 100, critRate: 5, luck: 10,
      gradeValue: 4, technique: null, equippedItems: {}, personality: "neutral",
      bossAbilities: null, isCurse: true
    })

    engine.submitAction("p1", "block", {})
    engine.submitAction("c1", "attack", { targetId: "p1" })

    const resolved = await engine.resolveRound()
    console.log("\n=== BLOCK TEST ===")
    console.log("Events:", resolved.events)
    console.log("Player HP:", engine.participants.get("p1")?.currentHp)

    assert.ok(resolved.events.some(e => e.includes("block") || e.includes("Block")), "Should mention block")
  })

  test("Phase 34: dodge can avoid damage", async () => {
    const engine = new BattleEngine()
    const battleId = "test:battle:dodge"
    engine.init(battleId, "NORMAL")

    engine.registerParticipant({
      id: "p1", name: "Player", maxHp: 5000, currentHp: 5000,
      maxCe: 4000, currentCe: 4000, rawStrength: 1000, rawDefense: 100,
      rawSpeed: 200, rawTechnique: 100, critRate: 5, luck: 10,
      gradeValue: 4, technique: null, equippedItems: {}, blackFlashAffinity: 5
    })

    engine.registerParticipant({
      id: "c1", name: "Curse", maxHp: 5000, currentHp: 5000,
      maxCe: 4000, currentCe: 4000, rawStrength: 1000, rawDefense: 100,
      rawSpeed: 50, rawTechnique: 100, critRate: 5, luck: 10,
      gradeValue: 4, technique: null, equippedItems: {}, personality: "neutral",
      bossAbilities: null, isCurse: true
    })

    engine.submitAction("p1", "dodge", {})
    engine.submitAction("c1", "attack", { targetId: "p1" })

    const resolved = await engine.resolveRound()
    console.log("\n=== DODGE TEST ===")
    console.log("Events:", resolved.events)
    console.log("Player HP:", engine.participants.get("p1")?.currentHp)

    assert.ok(resolved.events.some(e => e.includes("dodge") || e.includes("Dodge")), "Should mention dodge")
  })

  test("Phase 34: domain clash", async () => {
    const engine = new BattleEngine()
    const battleId = "test:battle:domain"
    engine.init(battleId, "NORMAL")

    engine.registerParticipant({
      id: "p1", name: "Player", maxHp: 5000, currentHp: 5000,
      maxCe: 4000, currentCe: 4000, rawStrength: 1000, rawDefense: 100,
      rawSpeed: 100, rawTechnique: 100, critRate: 5, luck: 10,
      gradeValue: 4, technique: null, equippedItems: {}, hasDomain: true,
      domainCeCost: 100, domainActive: false, blackFlashAffinity: 5
    })

    engine.registerParticipant({
      id: "c1", name: "Curse", maxHp: 5000, currentHp: 5000,
      maxCe: 4000, currentCe: 4000, rawStrength: 1000, rawDefense: 100,
      rawSpeed: 100, rawTechnique: 100, critRate: 5, luck: 10,
      gradeValue: 4, technique: null, equippedItems: {}, hasDomain: true,
      domainCeCost: 100, domainActive: false, personality: "neutral",
      bossAbilities: null, isCurse: true
    })

    engine.submitAction("p1", "domain", {})
    engine.submitAction("c1", "domain", {})

    const resolved = await engine.resolveRound()
    console.log("\n=== DOMAIN CLASH TEST ===")
    console.log("Events:", resolved.events)
    console.log("Player HP:", engine.participants.get("p1")?.currentHp)
    console.log("Curse HP:", engine.participants.get("c1")?.currentHp)

    assert.ok(resolved.events.some(e => e.includes("domain") || e.includes("Domain")), "Should mention domain")
  })

  test("Phase 34: full battle continuity across multiple rounds", async () => {
    const engine = new BattleEngine()
    const battleId = "test:battle:continuity"
    engine.init(battleId, "NORMAL")

    const player = {
      id: "p1", name: "Player", maxHp: 2000, currentHp: 2000,
      maxCe: 4000, currentCe: 4000, rawStrength: 1000, rawDefense: 10,
      rawSpeed: 100, rawTechnique: 100, critRate: 5, luck: 10,
      gradeValue: 4, technique: null, equippedItems: {}, blackFlashAffinity: 5
    }

    const curse = {
      id: "c1", name: "Curse", maxHp: 1500, currentHp: 1500,
      maxCe: 4000, currentCe: 4000, rawStrength: 800, rawDefense: 10,
      rawSpeed: 100, rawTechnique: 100, critRate: 5, luck: 10,
      gradeValue: 4, technique: null, equippedItems: {}, personality: "neutral",
      bossAbilities: null, isCurse: true
    }

    engine.registerParticipant(player)
    engine.registerParticipant(curse)

    let roundCount = 0
    let resolved
    let finished = false

    while (!finished && roundCount < 50) {
      roundCount++
      engine.submitAction("p1", "attack", { targetId: "c1" })
      engine.submitAction("c1", "attack", { targetId: "p1" })

      resolved = await engine.resolveRound()
      finished = resolved.finished

      const p1 = engine.getParticipant("p1")
      const c1 = engine.getParticipant("c1")

      assert.ok(typeof p1.currentHp === "number", `Round ${roundCount}: Player HP should be a number`)
      assert.ok(typeof c1.currentHp === "number", `Round ${roundCount}: Curse HP should be a number`)
      assert.ok(p1.currentHp >= 0 && p1.currentHp <= 2000, `Round ${roundCount}: Player HP should be valid`)
      assert.ok(c1.currentHp >= 0 && c1.currentHp <= 1500, `Round ${roundCount}: Curse HP should be valid`)
    }

    assert.ok(roundCount > 1, "Battle should last more than one round")
    assert.ok(finished, "Battle should eventually finish")
    assert.ok(resolved.winnerId, "Battle should have a winner")
    assert.ok(["p1", "c1"].includes(resolved.winnerId), "Winner should be one of the participants")

    const loserId = resolved.winnerId === "p1" ? "c1" : "p1"
    const loser = engine.getParticipant(loserId)
    assert.ok(loser.currentHp <= 0, "Loser should have 0 or negative HP")
  })
})
