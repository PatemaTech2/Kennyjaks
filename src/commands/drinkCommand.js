import { sendQuotedWithFooter } from "../utils/messageHelper.js"
import { loadPlayerByPhone, savePlayer } from "../database/playerRepo.js"
import { parseItemName, findItemByName } from "../utils/itemNameParser.js"
import { checkThirstPenalty, checkThirstSpeedMultiplier, isThirstDepleted } from "../utils/thirstSystem.js"

export async function handleDrink(sock, message) {
  const remoteJid = message.key.remoteJid
  const sender = message.key.participant || remoteJid
  const phoneNumber = sender.split("@")[0]

  const player = await loadPlayerByPhone(phoneNumber)
  if (!player) {
    await sendQuotedWithFooter(sock, remoteJid, "You need to register first.\n\nUse /start to begin.", message)
    return
  }

  const text = (message.message?.conversation || message.message?.extendedTextMessage?.text || "").trim()
  const args = text.split(" ")
  if (args.length < 2) {
    await sendQuotedWithFooter(sock, remoteJid, "Usage: /drink <drink-name> [quantity]\nExample: /drink water\nExample: /drink water 3", message)
    return
  }

  let quantity = 1
  let drinkArgs = args.slice(1)

  if (drinkArgs.length > 1 && /^\d+$/.test(drinkArgs[drinkArgs.length - 1])) {
    quantity = Math.max(1, parseInt(drinkArgs.pop(), 10) || 1)
  }

  const rawDrinkName = drinkArgs.join(" ")
  const drinkName = parseItemName(rawDrinkName)
  player.inventory = player.inventory || []
  player.bagInventory = player.bagInventory || []

  const drinkItem = findItemByName(drinkName, [
    ...player.inventory.filter(i => i.type === "consumable" && (i.category === "Drinks" || i.effect?.restoreThirst)),
    ...player.bagInventory.filter(i => i.type === "consumable" && (i.category === "Drinks" || i.effect?.restoreThirst))
  ])
  if (!drinkItem) {
    await sendQuotedWithFooter(sock, remoteJid, `You don't have "${drinkName}" in your inventory.\nVisit /shop-drink to buy drinks.`, message)
    return
  }

  if (!drinkItem.effect) {
    await sendQuotedWithFooter(sock, remoteJid, `"${drinkItem.name}" has no effect.`, message)
    return
  }

  const thirstAmount = drinkItem.effect.restoreThirst || 0
  if (thirstAmount <= 0 && !drinkItem.effect.buff && !drinkItem.effect.restoreCE) {
    await sendQuotedWithFooter(sock, remoteJid, `"${drinkItem.name}" does not restore thirst.`, message)
    return
  }

  const available = drinkItem.quantity || 1
  const actualQuantity = Math.min(quantity, available)

  if (actualQuantity <= 0) {
    await sendQuotedWithFooter(sock, remoteJid, `You don't have any ${drinkItem.name} left.`, message)
    return
  }

  const oldThirst = player.thirst || 0
  const totalThirst = thirstAmount * actualQuantity
  if (totalThirst >= 100) {
    player.thirst = 100
  } else {
    player.thirst = Math.min(100, (player.thirst || 0) + totalThirst)
  }
  const actualThirst = player.thirst - oldThirst

  let ceText = ""
  if (drinkItem.effect.restoreCE && drinkItem.effect.restoreCE > 0) {
    const oldCe = player.cursedEnergy
    player.cursedEnergy = Math.min(player.maxCursedEnergy, player.cursedEnergy + drinkItem.effect.restoreCE * actualQuantity)
    ceText = `CE Restored: +${player.cursedEnergy - oldCe}\n`
  }

  let hpText = ""
  if (drinkItem.effect.heal && drinkItem.effect.heal > 0) {
    const oldHp = player.health
    player.health = Math.min(player.maxHealth, player.health + drinkItem.effect.heal * actualQuantity)
    hpText = `HP Restored: +${player.health - oldHp}\n`
  }

  let buffText = ""
  if (drinkItem.effect.buff) {
    const now = Date.now()
    player.temporaryBuffs = player.temporaryBuffs || []
    player.temporaryBuffs.push({
      type: drinkItem.effect.buff.type,
      amount: drinkItem.effect.buff.amount,
      expiresAt: now + (drinkItem.effect.buff.duration || 60000)
    })
    buffText = `Buff Applied: ${drinkItem.effect.buff.type} +${drinkItem.effect.buff.amount}\n`
  }

  let effectText = ""
  if (drinkItem.effect.randomBuff) {
    const buffs = ["attack", "accuracy"]
    const randomType = buffs[Math.floor(Math.random() * buffs.length)]
    const randomAmount = randomType === "attack" ? 20 : -25
    const now = Date.now()
    player.temporaryBuffs = player.temporaryBuffs || []
    player.temporaryBuffs.push({
      type: randomType,
      amount: randomAmount,
      expiresAt: now + 60000
    })
    const label = randomType === "attack" ? "Attack UP" : "Accuracy DOWN"
    effectText = `Sake effect: ${label}!\n`
  }

  const inventoryIndex = player.inventory.findIndex(i => i.name === drinkItem.name && i.id === drinkItem.id)
  if ((player.inventory[inventoryIndex]?.quantity || 1) > actualQuantity) {
    player.inventory[inventoryIndex].quantity -= actualQuantity
  } else {
    player.inventory.splice(inventoryIndex, 1)
  }

  await savePlayer(player)

  let status = "💧"
  if (player.thirst === 100) status = "✅"
  else if (player.thirst < 25) status = "⚠️"

  const response = [
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    `🥤 ${drinkItem.name?.toUpperCase() || "DRINK"}`,
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    "",
    `Consumed: ×${actualQuantity}`,
    `Thirst Restored: +${Math.round(actualThirst || 0)}`,
    hpText + ceText + buffText + effectText,
    `Current Thirst: ${Math.round(player.thirst || 0)}/100 ${status}`,
    "",
    `Remaining: ${drinkItem.name || "Unknown"} ×${Math.max(0, available - actualQuantity)}`,
    "",
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  ].join("\n")

  await sendQuotedWithFooter(sock, remoteJid, response, message)
}

export function isThirstExemptCommand(text) {
  const exempt = [
    "/drink", "/shop-drink", "/shop", "/shops",
    "/enable", "/disable", "/help-enable", "/group-settings",
    "/toggle-", "/start", "/register", "/help",
    "/profile", "/inventory", "/bag", "/b2i", "/i2b",
    "/stats", "/leaderboard", "/daily", "/daily-gift", "/bf", "/yuji-train"
  ]
  for (const cmd of exempt) {
    if (text.startsWith(cmd)) return true
  }
  return false
}

export function checkThirst(player) {
  if (isThirstDepleted(player)) {
    player.thirst = 0
    return false
  }
  return true
}

export { checkThirstPenalty, checkThirstSpeedMultiplier }
