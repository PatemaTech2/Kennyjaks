import { sendQuotedWithFooter } from "../utils/messageHelper.js"
import { loadPlayerByPhone, savePlayer } from "../database/playerRepo.js"
import { parseItemName, findItemByName } from "../utils/itemNameParser.js"

export async function handleEat(sock, message) {
  const remoteJid = message.key.remoteJid
  const sender = message.key.participant || remoteJid
  const phoneNumber = sender.split("@")[0]

  const player = await loadPlayerByPhone(phoneNumber)
  if (!player) {
    await sendQuotedWithFooter(sock, remoteJid, "You need to register first.\n\nUse /start to begin.", message)
    return
  }

  const text = (message.message.conversation || message.message.extendedTextMessage?.text || "").trim()
  const args = text.split(" ")
  if (args.length < 2) {
    await sendQuotedWithFooter(sock, remoteJid, "Usage: /eat <food-name> [quantity]\nExample: /eat ramen\nExample: /eat ramen 3", message)
    return
  }

  let quantity = 1
  let foodArgs = args.slice(1)

  if (foodArgs.length > 1 && /^\d+$/.test(foodArgs[foodArgs.length - 1])) {
    quantity = Math.max(1, parseInt(foodArgs.pop(), 10) || 1)
  }

  const rawFoodName = foodArgs.join(" ")
  const foodName = parseItemName(rawFoodName)
  player.inventory = player.inventory || []
  player.bagInventory = player.bagInventory || []

  const foodItem = findItemByName(foodName, player.inventory.filter(i => i.type === "consumable"))
  if (!foodItem) {
    const inBag = findItemByName(foodName, player.bagInventory.filter(i => i.type === "consumable"))
    if (inBag) {
      await sendQuotedWithFooter(sock, remoteJid, `🍜 ${inBag.name} is inside your bag.\nMove it to your inventory first.\nUse: /b2i ${inBag.name.replace(/ /g, "-")}`, message)
      return
    }
    await sendQuotedWithFooter(sock, remoteJid, `You don't have "${foodName}" in your inventory.`, message)
    return
  }

  if (!foodItem.effect) {
    await sendQuotedWithFooter(sock, remoteJid, `"${foodItem.name}" is not edible.`, message)
    return
  }

  const available = foodItem.quantity || 1
  const actualQuantity = Math.min(quantity, available)

  if (actualQuantity <= 0) {
    await sendQuotedWithFooter(sock, remoteJid, `You don't have any ${foodItem.name} left.`, message)
    return
  }

  const healAmount = (foodItem.effect.heal || 0) * actualQuantity
  const ceAmount = (foodItem.effect.restoreCE || 0) * actualQuantity
  const thirstAmount = (foodItem.effect.restoreThirst || 0) * actualQuantity
  const oldHealth = player.health

  let actualHeal = 0
  if (foodItem.effect.fullHeal) {
    actualHeal = player.maxHealth - player.health
    player.health = player.maxHealth
  } else if (healAmount > 0) {
    player.health = Math.min(player.maxHealth, player.health + healAmount)
    actualHeal = player.health - oldHealth
  }

  let ceText = ""
  if (foodItem.effect.fullRestoreCE) {
    const restored = player.maxCursedEnergy - player.cursedEnergy
    player.cursedEnergy = player.maxCursedEnergy
    ceText = `CE Restored: +${restored}\n`
  } else if (ceAmount > 0) {
    const oldCe = player.cursedEnergy
    player.cursedEnergy = Math.min(player.maxCursedEnergy, player.cursedEnergy + ceAmount)
    const actualCe = player.cursedEnergy - oldCe
    ceText = `CE Restored: +${actualCe}\n`
  }

  let thirstText = ""
  if (thirstAmount > 0) {
    const oldThirst = player.thirst || 0
    if (thirstAmount >= 100) {
      player.thirst = 100
    } else {
      player.thirst = Math.min(100, (player.thirst || 0) + thirstAmount)
    }
    const actualThirst = player.thirst - oldThirst
    thirstText = `Thirst Restored: +${actualThirst}\n`
  }

  let buffText = ""
  if (foodItem.effect.buff) {
    const now = Date.now()
    player.temporaryBuffs = player.temporaryBuffs || []
    player.temporaryBuffs.push({
      type: foodItem.effect.buff.type,
      amount: foodItem.effect.buff.amount,
      expiresAt: now + (foodItem.effect.buff.duration || 600000)
    })
    buffText = `Buff Applied: ${foodItem.effect.buff.type} +${foodItem.effect.buff.amount}\n`
  }

  let effectText = ""
  if (foodItem.effect.adrenaline) {
    player.hasAdrenaline = true
    effectText = "Adrenaline Shot: Ignore next fatal hit!\n"
  }
  if (foodItem.effect.cureAll) {
    player.status = {}
    effectText += "Status effects cleared!\n"
  }
  if (foodItem.effect.randomBuff) {
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
    effectText += `Sake effect: ${label}!\n`
  }

  let messageText = "";
  if (foodItem.effect.petHunger) {
    messageText = `Pet hunger restored: +${foodItem.effect.petHunger}\n`;
    if (foodItem.effect.petMood) messageText += "Pet mood increased!\n";
    if (foodItem.effect.petXp) messageText += `Pet XP gained: +${foodItem.effect.petXp}\n`;
  }

  const inventoryIndex = player.inventory.findIndex(i => i.name === foodItem.name && i.type === "consumable")
  if ((player.inventory[inventoryIndex]?.quantity || 1) > actualQuantity) {
    player.inventory[inventoryIndex].quantity -= actualQuantity
  } else {
    player.inventory.splice(inventoryIndex, 1)
  }

  await savePlayer(player)

  const response = [
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    `🍖 ${foodItem.name?.toUpperCase() || "FOOD"}`,
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    "",
    `Consumed: ×${actualQuantity}`,
    `HP: +${actualHeal || 0}`,
    ceText + thirstText + buffText + effectText + messageText,
    `HP: ${player.health || 0} / ${player.maxHealth || 0}`,
    "",
    `Remaining: ${foodItem.name || "Unknown"} ×${Math.max(0, available - actualQuantity)}`,
    "",
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  ].join("\n")

  await sendQuotedWithFooter(sock, remoteJid, response, message)
}