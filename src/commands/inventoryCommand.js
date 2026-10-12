import { sendQuotedWithFooter } from "../utils/messageHelper.js"
import { loadPlayerByPhone } from "../database/playerRepo.js"
import { MAX_INVENTORY_SLOTS } from "../config/constants.js"
import { InventoryCanvasRenderer } from "../services/inventory/InventoryCanvasRenderer.js"

export async function handleInventory(sock, message) {
  const remoteJid = message.key.remoteJid
  const sender = message.key.participant || remoteJid
  const phoneNumber = sender.split("@")[0]

  const player = await loadPlayerByPhone(phoneNumber)
  if (!player) {
    await sendQuotedWithFooter(sock, remoteJid, "You need to register first.\n\nUse /start to begin.", message)
    return
  }

  const renderer = new InventoryCanvasRenderer()
  const maxSlots = player.inventoryCapacity || MAX_INVENTORY_SLOTS
  const imageBuffer = await renderer.renderInventory(player, maxSlots)

  await sock.sendMessage(remoteJid, { image: imageBuffer }, { quoted: message })
}
