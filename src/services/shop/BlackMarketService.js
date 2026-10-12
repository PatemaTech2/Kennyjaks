import { loadPlayerByPhone, savePlayer } from "../../database/playerRepo.js"
import { blackMarketItems } from "../../data/shops/blackMarket.js"
import { DailyService } from "../daily/DailyService.js"

export class BlackMarketService {
  static getItems() {
    return blackMarketItems
  }

  static async buy(player, itemId) {
    const item = blackMarketItems.find(i => i.id === itemId)
    if (!item) return { error: "Item not found." }

    if (player.wallet < item.price) {
      return { error: `Insufficient funds. Need ¥${item.price.toLocaleString()}.` }
    }

    if (item.stock <= 0) {
      return { error: "Item out of stock." }
    }

    player.wallet -= item.price
    item.stock -= 1

    player.inventory = player.inventory || []
    player.inventory.push({
      id: item.id,
      name: item.name,
      rarity: item.rarity,
      quantity: 1,
      type: item.type || "misc",
      usable: item.type === "consumable",
      effect: item.effect
    })

    await DailyService.visitBlackMarket(player)
    await savePlayer(player)
    return { success: true, item, newWallet: player.wallet }
  }
}
