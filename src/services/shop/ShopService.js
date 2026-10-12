import crypto from "crypto"
import { loadPlayerByPhone, savePlayer } from "../../database/playerRepo.js"
import { outfitShop } from "../../data/shops/outfitShop.js"
import { eggShop } from "../../data/shops/eggShop.js"
import { foodShop } from "../../data/shops/foodShop.js"
import { drinksShop } from "../../data/shops/drinksShop.js"
import { bagShop } from "../../data/shops/bagShop.js"
import { weaponShop } from "../../data/shops/weaponShop.js"
import { armorShop } from "../../data/shops/armorShop.js"
import { accessoryShop } from "../../data/shops/accessoryShop.js"
import { medicineShop } from "../../data/shops/medicineShop.js"
import { parseItemName, findItemByName, normalizeItemReference } from "../../utils/itemNameParser.js"
import { BALANCE } from "../../config/balance.js"
import fs from "fs-extra"
import path from "path"

const SHOPS = [outfitShop, eggShop, foodShop, drinksShop, bagShop, weaponShop, armorShop, accessoryShop, medicineShop]

const TRANSACTION_LOG_PATH = path.join(process.cwd(), "database", "transactions")

async function ensureTransactionDir() {
  await fs.ensureDir(TRANSACTION_LOG_PATH)
}

async function logTransaction(entry) {
  await ensureTransactionDir()
  const date = new Date()
  const dateStr = date.toISOString().split("T")[0]
  const filePath = path.join(TRANSACTION_LOG_PATH, `${dateStr}.json`)
  let logs = []
  if (await fs.pathExists(filePath)) {
    logs = await fs.readJson(filePath)
  }
  logs.push(entry)
  await fs.writeJson(filePath, logs, { spaces: 2 })
}

export class ShopService {
  static getShop(shopId) {
    return SHOPS.find(s => s.id === shopId) || null
  }

  static resolveShopId(input) {
    if (!input) return null
    const normalized = normalizeItemReference(input)
    const aliases = {
      food: "food",
      foods: "food",
      drink: "drinks",
      drinks: "drinks",
      water: "drinks",
      medicine: "medicine",
      meds: "medicine",
      weapon: "weapon",
      weapons: "weapon",
      armor: "armor",
      accessory: "accessory",
      accessories: "accessory",
      bag: "bag",
      bags: "bag",
      outfit: "outfit",
      outfits: "outfit",
      egg: "egg",
      eggs: "egg",
      blackmarket: "blackmarket"
    }
    if (aliases[normalized]) return aliases[normalized]
    if (normalized.startsWith("shop ")) {
      return aliases[normalized.slice(5)] || null
    }
    return null
  }

  static findShopByItem(itemId) {
    for (const shop of SHOPS) {
      if (shop.items.find(i => i.id === itemId)) return shop.id
      const name = parseItemName(itemId)
      if (findItemByName(name, shop.items)) return shop.id
    }
    return null
  }

  static getAllShops() {
    return SHOPS
  }

  static getItem(shopId, itemId) {
    const shop = this.getShop(shopId)
    if (!shop) return null
    let item = shop.items.find(i => i.id === itemId) || null
    if (!item) {
      const name = parseItemName(itemId)
      item = findItemByName(name, shop.items)
    }
    return item
  }

  static getPaginatedItems(shopId, page = 0, pageSize = 8) {
    const shop = this.getShop(shopId)
    if (!shop) return { items: [], totalPages: 0 }
    const totalPages = Math.max(1, Math.ceil(shop.items.length / pageSize))
    const start = page * pageSize
    const items = shop.items.slice(start, start + pageSize)
    return { items, totalPages, currentPage: page }
  }

  static canBuy(player, shopId, itemId, quantity = 1) {
    const item = this.getItem(shopId, itemId)
    if (!item) return { error: "Item not found." }

    if (shopId === "bag") {
      player.bags = player.bags || []
      if (player.bags.find(b => b.id === item.id)) {
        return { error: "You already own this bag." }
      }
    }

    const playerGradeNum = player.grade !== undefined && player.grade !== null ? player.grade : 4
    if (item.gradeReq !== undefined && playerGradeNum > item.gradeReq) {
      return { error: `Requires ${BALANCE.gradeLabels[item.gradeReq]} or higher to purchase.` }
    }
    if (item.levelReq !== undefined && player.level < item.levelReq) {
      return { error: `Requires Level ${item.levelReq} to purchase.` }
    }

    const totalCost = item.price * quantity
    if (player.wallet < totalCost) {
      return { error: `Insufficient funds.\n\nItem: ${item.name}\nQuantity: ${quantity}\nTotal: ¥${totalCost.toLocaleString()}\nYour wallet: ¥${player.wallet.toLocaleString()}` }
    }

    player.inventory = player.inventory || []
    player.bagInventory = player.bagInventory || []

    const inventoryUsed = player.inventory.reduce((sum, i) => sum + (i.quantity || 1), 0)
    const existingInventoryItem = player.inventory.find(i => i.id === item.id)
    const isConsumablePurchase = ["food", "medicine", "drinks"].includes(shopId)
    const inventoryNeedsSlot = isConsumablePurchase ? (existingInventoryItem ? 0 : 1) : quantity
    const inventoryHasSpace = inventoryUsed + inventoryNeedsSlot <= (player.inventoryCapacity || 0)

    const bagCapacity = player.bagCapacity === 9999 ? Infinity : (player.bagCapacity || 0)
    const bagHasSpace = player.equippedBag && player.bagInventory.length < bagCapacity

    if (!inventoryHasSpace && !bagHasSpace) {
      return { error: "🎒 INVENTORY FULL\n\nYou don't have enough space for this item.\n\nFree space in your inventory or bag before purchasing it." }
    }

    return { success: true, item, placeInBag: !inventoryHasSpace && bagHasSpace, newWallet: player.wallet - totalCost, totalCost, quantity }
  }

  static async buy(player, shopId, itemId, quantity = 1) {
    const validate = this.canBuy(player, shopId, itemId, quantity)
    if (validate.error) return validate
    const item = validate.item
    const placeInBag = validate.placeInBag
    const totalCost = validate.totalCost
    const qty = validate.quantity

    player.wallet -= totalCost
    player.lifetimeSpent += totalCost

    player.inventory = player.inventory || []
    player.bagInventory = player.bagInventory || []
    const existingInventoryItem = player.inventory.find(i => i.id === item.id)

    if (shopId === "outfit") {
      player.inventory.push({
        id: item.id,
        name: item.name,
        rarity: item.rarity,
        quantity: 1,
        type: item.type || "misc",
        usable: false,
        effect: item.stats || null,
        gradeReq: item.gradeReq,
        levelReq: item.levelReq
      })
    } else if (shopId === "food" || shopId === "medicine" || shopId === "drinks") {
      if (placeInBag) {
        const bagExisting = player.bagInventory.find(i => i.id === item.id)
        if (bagExisting) {
          bagExisting.quantity = (bagExisting.quantity || 1) + qty
        } else {
          player.bagInventory.push({
            id: item.id,
            name: item.name,
            rarity: item.rarity,
            quantity: qty,
            type: "consumable",
            usable: true,
            effect: item.effect,
            icon: item.icon || "🍴",
            category: item.category || "Drinks",
            tier: item.tier || "common",
            gradeReq: item.gradeReq,
            levelReq: item.levelReq
          })
        }
      } else {
        if (existingInventoryItem) {
          existingInventoryItem.quantity += qty
        } else {
          player.inventory.push({
            id: item.id,
            name: item.name,
            rarity: item.rarity,
            quantity: qty,
            type: "consumable",
            usable: true,
            effect: item.effect,
            icon: item.icon || "🍴",
            category: item.category || "Drinks",
            tier: item.tier || "common",
            gradeReq: item.gradeReq,
            levelReq: item.levelReq
          })
        }
      }
    } else if (shopId === "egg") {
      player.eggs = player.eggs || []
      const hatchTime = new Date(Date.now() + item.hatchHours * 60 * 60 * 1000).toISOString()
      player.eggs.push({
        id: crypto.randomUUID(),
        itemId: item.id,
        name: item.name,
        rarity: item.rarity,
        purchaseTime: new Date().toISOString(),
        hatchTime,
        status: "Incubating",
        shikigamiPool: item.shikigamiPool
      })
    } else if (shopId === "bag") {
      player.bags = player.bags || []
      const existing = player.bags.find(b => b.id === item.id)
      if (!existing) {
        player.bags.push({
          id: item.id,
          name: item.name,
          rarity: item.rarity,
          slots: item.slots,
          description: item.description
        })
        player.equippedBag = item.name
        const bonus = item.slots === -1 ? 9999 : item.slots
        player.bagCapacity = bonus
      }
    } else if (shopId === "weapon" || shopId === "armor" || shopId === "accessory") {
      if (placeInBag) {
        player.bagInventory.push({
          id: item.id,
          name: item.name,
          rarity: item.rarity,
          quantity: 1,
          type: shopId === "weapon" ? "weapon" : shopId === "armor" ? "armor" : "accessory",
          usable: false,
          effect: item.stats || null,
          stats: item.stats || null,
          icon: item.icon || "🗡️",
          category: item.category,
          durability: item.durability,
          maxDurability: item.durability,
          weight: item.weight,
          skills: item.skills,
          passive: item.passive,
          gradeReq: item.gradeReq,
          levelReq: item.levelReq,
          description: item.description
        })
      } else {
        player.inventory.push({
          id: item.id,
          name: item.name,
          rarity: item.rarity,
          quantity: 1,
          type: shopId === "weapon" ? "weapon" : shopId === "armor" ? "armor" : "accessory",
          usable: false,
          effect: item.stats || null,
          stats: item.stats || null,
          icon: item.icon || "🗡️",
          category: item.category,
          durability: item.durability,
          maxDurability: item.durability,
          weight: item.weight,
          skills: item.skills,
          passive: item.passive,
          gradeReq: item.gradeReq,
          levelReq: item.levelReq,
          description: item.description
        })
      }
    }

    await savePlayer(player)

    await logTransaction({
      playerId: player.playerId || player.phoneNumber,
      playerName: player.name,
      shopId,
      itemId: item.id,
      itemName: item.name,
      quantity: qty,
      price: totalCost,
      timestamp: new Date().toISOString()
    })

    await creditTreasury(totalCost)

    return { success: true, item, newWallet: player.wallet, quantity: qty, totalCost }
  }
}

async function creditTreasury(amount) {
  try {
    await ensureTransactionDir()
    const treasuryPath = path.join(TRANSACTION_LOG_PATH, "treasury.json")
    let treasury = { total: 0, credits: [], lastUpdated: null }
    if (await fs.pathExists(treasuryPath)) {
      treasury = await fs.readJson(treasuryPath)
    }
    treasury.total = (treasury.total || 0) + amount
    treasury.credits.push({
      amount,
      timestamp: new Date().toISOString()
    })
    treasury.lastUpdated = new Date().toISOString()
    await fs.writeJson(treasuryPath, treasury, { spaces: 2 })
  } catch (err) {
    console.error("[KENNYJAKS ERROR] Failed to credit treasury:", err.message)
  }
}

export async function getTreasuryBalance() {
  try {
    await ensureTransactionDir()
    const treasuryPath = path.join(TRANSACTION_LOG_PATH, "treasury.json")
    if (await fs.pathExists(treasuryPath)) {
      const treasury = await fs.readJson(treasuryPath)
      return treasury.total || 0
    }
  } catch {}
  return 0
}

export async function getTransactionLogs(dateStr = null) {
  try {
    await ensureTransactionDir()
    if (dateStr) {
      const filePath = path.join(TRANSACTION_LOG_PATH, `${dateStr}.json`)
      if (await fs.pathExists(filePath)) {
        return await fs.readJson(filePath)
      }
      return []
    }
    const files = await fs.readdir(TRANSACTION_LOG_PATH)
    const txFiles = files.filter(f => f.endsWith(".json") && f !== "treasury.json")
    const allLogs = []
    for (const f of txFiles) {
      const logs = await fs.readJson(path.join(TRANSACTION_LOG_PATH, f))
      allLogs.push(...logs)
    }
    return allLogs
  } catch {
    return []
  }
}
