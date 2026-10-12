import assert from "node:assert"
import { describe, it } from "node:test"
import { ShopService } from "../src/services/shop/ShopService.js"

describe("ShopService buy flow", () => {
  it("should buy a food item when the player has funds and inventory space", async () => {
    const player = {
      wallet: 5000,
      lifetimeSpent: 0,
      level: 1,
      grade: 4,
      inventoryCapacity: 10,
      inventory: [],
      bagInventory: [],
      equippedBag: false
    }

    const response = await ShopService.buy(player, "food", "food_bread")
    assert.equal(response.success, true)
    assert.equal(player.wallet, 4000)
    assert.equal(player.lifetimeSpent, 1000)
    assert.equal(player.inventory.length, 1)
    assert.equal(player.inventory[0].id, "food_bread")
    assert.equal(player.inventory[0].quantity, 1)
  })

  it("should fail purchase when funds are insufficient", async () => {
    const player = {
      wallet: 500,
      lifetimeSpent: 0,
      level: 1,
      grade: 4,
      inventoryCapacity: 10,
      inventory: [],
      bagInventory: [],
      equippedBag: false
    }

    const response = await ShopService.buy(player, "food", "food_bread")
    assert.ok(response.error.includes("Insufficient funds"))
    assert.ok(response.error.includes("¥1,000"))
    assert.equal(player.wallet, 500)
  })

  it("should return an error for an unknown item", async () => {
    const player = {
      wallet: 5000,
      lifetimeSpent: 0,
      level: 1,
      grade: 4,
      inventoryCapacity: 10,
      inventory: [],
      bagInventory: [],
      equippedBag: false
    }

    const response = await ShopService.buy(player, "food", "food_unknown")
    assert.equal(response.error, "Item not found.")
  })

  it("should prevent purchase when inventory is full and no bag is equipped", async () => {
    const player = {
      wallet: 5000,
      lifetimeSpent: 0,
      level: 1,
      grade: 4,
      inventoryCapacity: 1,
      inventory: [{ id: "food_rice_ball", name: "Rice Ball", quantity: 1 }],
      bagInventory: [],
      equippedBag: false
    }

    const response = await ShopService.buy(player, "food", "food_bread")
    assert.equal(response.error.includes("INVENTORY FULL"), true)
  })
})
