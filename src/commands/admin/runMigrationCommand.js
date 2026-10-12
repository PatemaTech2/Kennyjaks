import { sendQuotedWithFooter } from "../../utils/messageHelper.js"
import { isOwnerOrModerator } from "../../services/PermissionService.js"
import { migrateAllPlayers } from "../../services/progression/CombatStatMigration.js"
import { migrateInventoryCapacity } from "../../database/playerRepo.js"

export async function handleRunCombatMigration(sock, message) {
  const remoteJid = message.key.remoteJid
  const sender = message.key.participant || remoteJid
  const phoneNumber = sender.split("@")[0]

  if (!isOwnerOrModerator(phoneNumber)) {
    await sendQuotedWithFooter(sock, remoteJid, "⛔ This command is restricted to the Bot Owner and Bot Moderators.", message)
    return
  }

  await sendQuotedWithFooter(sock, remoteJid, "🔄 Running combat stat migration...", message)

  try {
    const results = await migrateAllPlayers()
    const response = [
      "✅ COMBAT STAT MIGRATION COMPLETE",
      "",
      `Total players: ${results.total}`,
      `Migrated: ${results.migrated}`,
      `Skipped: ${results.skipped}`,
      `Errors: ${results.errors.length}`,
      "",
      "All combat attributes have been recalculated from SP.",
      "Formula: 100 SP = 1 Strength, Strength = base damage."
    ].join("\n")

    if (results.errors.length > 0) {
      response.concat("\n\nErrors:\n" + results.errors.slice(0, 5).map(e => `${e.playerId}: ${e.error}`).join("\n"))
    }

    await sendQuotedWithFooter(sock, remoteJid, response, message)
  } catch (err) {
    await sendQuotedWithFooter(sock, remoteJid, `❌ Migration failed: ${err.message}`, message)
  }

  // Run inventory capacity migration
  try {
    const migrated = await migrateInventoryCapacity()
    await sendQuotedWithFooter(sock, remoteJid, `✅ Inventory capacity migration complete.\n${migrated} players updated to 30 slots.`, message)
  } catch (err) {
    await sendQuotedWithFooter(sock, remoteJid, `❌ Inventory migration failed: ${err.message}`, message)
  }
}
