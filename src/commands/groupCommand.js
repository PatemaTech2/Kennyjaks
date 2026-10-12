import { sendQuotedWithFooter } from "../utils/messageHelper.js"
import { getGroup, saveGroup, enableGroup, disableGroup, enableGroupModule, disableGroupModule } from "../database/groupRepo.js"
import { isOwnerOrModerator } from "../services/PermissionService.js"

const VALID_MODULES = ["economy", "combat", "utility", "ai", "welcome"]
const MODULE_LABELS = {
  economy: "Economy",
  combat: "Combat",
  utility: "Utility",
  ai: "AI",
  welcome: "Welcome"
}

function getSenderNumber(message) {
  const sender = message.key.participant || message.key.remoteJid
  return sender.split("@")[0]
}

function isAdminOrOwner(phoneNumber) {
  return isOwnerOrModerator(phoneNumber)
}

function getSenderJid(message) {
  const sender = message.key.participant || message.key.remoteJid
  if (sender.includes("@")) return sender
  return sender.endsWith("@s.whatsapp.net") ? sender : `${sender}@s.whatsapp.net`
}

export async function handleEnable(sock, message) {
  const remoteJid = message.key.remoteJid
  if (!remoteJid.endsWith("@g.us")) {
    await sendQuotedWithFooter(sock, remoteJid, "This command can only be used in groups.", message)
    return
  }

  const senderNumber = getSenderNumber(message)
  const senderJid = getSenderJid(message)

  if (!isAdminOrOwner(senderNumber)) {
    const metadata = await sock.groupMetadata(remoteJid)
    const participant = metadata.participants.find(p => p.id === senderJid)

    const isGroupAdmin = participant &&
      (participant.admin === "admin" || participant.admin === "superadmin")

    console.log("[GROUP AUTH DEBUG]")
    console.log("Sender JID:", senderJid)
    console.log("Sender number:", senderNumber)
    console.log("Participant found:", participant ? "YES" : "NO")
    console.log("Admin status:", participant?.admin || "none")
    console.log("Owner status:", isAdminOrOwner(senderNumber))

    if (!isGroupAdmin) {
      await sendQuotedWithFooter(sock, remoteJid, "❌ Only WhatsApp group admins or bot owners can use this command.", message)
      return
    }
  }

  const text = (message.message?.conversation || message.message?.extendedTextMessage?.text || "").trim().toLowerCase()

  const moduleMatch = text.match(/\/enable\s+(.+)/)
  if (moduleMatch) {
    const moduleName = moduleMatch[1]
    if (VALID_MODULES.includes(moduleName)) {
      await enableGroupModule(remoteJid, moduleName)
      const moduleLabel = MODULE_LABELS[moduleName]
      await sendQuotedWithFooter(sock, remoteJid, `✅ Module enabled: ${moduleLabel}`, message)
      return
    } else {
      await sendQuotedWithFooter(sock, remoteJid, `Unknown module: ${moduleName}\nValid modules: ${VALID_MODULES.join(", ")}`, message)
      return
    }
  }

  const prevGroup = await getGroup(remoteJid)
  if (prevGroup.enabled) {
    await sendQuotedWithFooter(sock, remoteJid, "KennyJaks is already enabled in this group.", message)
    return
  }

  const group = await enableGroup(remoteJid, senderNumber)
  const meta = await sock.groupMetadata(remoteJid)
  const groupName = meta?.subject || "this group"

  const msg = [
    "━━━━━━━━━━━━━━━━━━━━━━",
    "",
    "✅ KennyJaks Enabled",
    "",
    "This group has been authorized.",
    "",
    "All game, economy, combat, AI and utility commands are now active.",
    "",
    "Enabled by:",
    `@${senderNumber}`,
    "",
    "Enjoy!",
    "",
    "━━━━━━━━━━━━━━━━━━━━━━",
    "",
    "Useful commands:",
    "  /menu",
    "  /help",
    "  /profile",
    "  /start"
  ].join("\n")

  await sendQuotedWithFooter(sock, remoteJid, msg, message)
}

export async function handleDisable(sock, message) {
  const remoteJid = message.key.remoteJid
  if (!remoteJid.endsWith("@g.us")) {
    await sendQuotedWithFooter(sock, remoteJid, "This command can only be used in groups.", message)
    return
  }

  const senderNumber = getSenderNumber(message)
  const senderJid = getSenderJid(message)

  if (!isAdminOrOwner(senderNumber)) {
    const metadata = await sock.groupMetadata(remoteJid)
    const participant = metadata.participants.find(p => p.id === senderJid)

    const isGroupAdmin = participant &&
      (participant.admin === "admin" || participant.admin === "superadmin")

    console.log("[GROUP AUTH DEBUG]")
    console.log("Sender JID:", senderJid)
    console.log("Sender number:", senderNumber)
    console.log("Participant found:", participant ? "YES" : "NO")
    console.log("Admin status:", participant?.admin || "none")
    console.log("Owner status:", isAdminOrOwner(senderNumber))

    if (!isGroupAdmin) {
      await sendQuotedWithFooter(sock, remoteJid, "❌ Only WhatsApp group admins or bot owners can use this command.", message)
      return
    }
  }

  const text = (message.message?.conversation || message.message?.extendedTextMessage?.text || "").trim().toLowerCase()
  const moduleMatch = text.match(/\/disable\s+(.+)/)
  if (moduleMatch) {
    const moduleName = moduleMatch[1]
    if (VALID_MODULES.includes(moduleName)) {
      await disableGroupModule(remoteJid, moduleName)
      const moduleLabel = MODULE_LABELS[moduleName]
      await sendQuotedWithFooter(sock, remoteJid, `✅ Module disabled: ${moduleLabel}`, message)
      return
    } else {
      await sendQuotedWithFooter(sock, remoteJid, `Unknown module: ${moduleName}\nValid modules: ${VALID_MODULES.join(", ")}`, message)
      return
    }
  }

  await disableGroup(remoteJid)
  await sendQuotedWithFooter(sock, remoteJid, "❌ KennyJaks has been disabled in this group.\n\nTo re-enable, an admin must use /enable", message)
}

export async function handleHelpEnable(sock, message) {
  const remoteJid = message.key.remoteJid
  const msg = [
    "━━━━━━━━━━━━━━━━━━━━━━",
    "KennyJaks Group Authorization",
    "━━━━━━━━━━━━━━━━━━━━━━",
    "",
    "To enable KennyJaks in this group:",
    "",
    "  1. You must be a WhatsApp group admin",
    "  2. Type: /enable",
    "  3. The bot will confirm activation",
    "",
    "After enabling:",
    "  - All commands become active",
    "  - AI features are available",
    "  - Battle system works",
    "",
    "To disable:",
    "  - /disable (admins only)",
    "",
    "Module toggling:",
    "  /enable <module>",
    "  /disable <module>",
    "",
    "Modules:",
    "  economy  - Wallet, gambling, shops",
    "  combat   - Battles, RCT, PvP",
    "  utility  - Profile, inventory, pets",
    "  ai       - AI features",
    "",
    "━━━━━━━━━━━━━━━━━━━━━━"
  ].join("\n")

  await sendQuotedWithFooter(sock, remoteJid, msg, message)
}

export async function handleGroupSettings(sock, message) {
  const remoteJid = message.key.remoteJid
  if (!remoteJid.endsWith("@g.us")) {
    await sendQuotedWithFooter(sock, remoteJid, "This command can only be used in groups.", message)
    return
  }

  const senderNumber = getSenderNumber(message)

  if (!isAdminOrOwner(senderNumber)) {
    const senderJid = getSenderJid(message)
    const metadata = await sock.groupMetadata(remoteJid)
    const participant = metadata.participants.find(p => p.id === senderJid)

    const isGroupAdmin = participant &&
      (participant.admin === "admin" || participant.admin === "superadmin")

    if (!isGroupAdmin) {
      await sendQuotedWithFooter(sock, remoteJid, "❌ Only WhatsApp group admins can view group settings.", message)
      return
    }
  }

  const group = await getGroup(remoteJid)

  const status = group.enabled ? "✅ Enabled" : "❌ Disabled"
  const combat = group.combat ? "ON" : "OFF"
  const economy = group.economy ? "ON" : "OFF"
  const utility = group.utility ? "ON" : "OFF"

  const msg = [
    "⚙️ KennyJaks Group Settings",
    "",
    `Status: ${status}`,
    "",
    `Combat: ${combat}`,
    `Economy: ${economy}`,
    `Utilities: ${utility}`,
    "",
    "Use:",
    "  /toggle-combat",
    "  /toggle-economy",
    "  /toggle-utility",
    "",
    "  /enable  - Enable all modules",
    "  /disable - Disable all modules"
  ].join("\n")

  await sendQuotedWithFooter(sock, remoteJid, msg, message)
}

export async function handleToggle(sock, message) {
  const remoteJid = message.key.remoteJid
  if (!remoteJid.endsWith("@g.us")) {
    await sendQuotedWithFooter(sock, remoteJid, "This command can only be used in groups.", message)
    return
  }

  const senderNumber = getSenderNumber(message)

  if (!isAdminOrOwner(senderNumber)) {
    const senderJid = getSenderJid(message)
    const metadata = await sock.groupMetadata(remoteJid)
    const participant = metadata.participants.find(p => p.id === senderJid)

    const isGroupAdmin = participant &&
      (participant.admin === "admin" || participant.admin === "superadmin")

    if (!isGroupAdmin) {
      await sendQuotedWithFooter(sock, remoteJid, "❌ Only WhatsApp group admins can toggle modules.", message)
      return
    }
  }

  const text = (message.message?.conversation || message.message?.extendedTextMessage?.text || "").trim().toLowerCase()
  const moduleName = text.replace("/toggle-", "")

  const validModules = {
    "combat": "combat",
    "economy": "economy",
    "utility": "utility",
    "ai": "utility"
  }

  const key = validModules[moduleName]
  if (!key) {
    await sendQuotedWithFooter(sock, remoteJid, `Unknown module: ${moduleName}\nValid modules: combat, economy, utility`, message)
    return
  }

  const group = await getGroup(remoteJid)
  group[key] = !group[key]
  await saveGroup(remoteJid, group)

  const moduleLabel = moduleName.charAt(0).toUpperCase() + moduleName.slice(1)
  const status = group[key] ? "ON" : "OFF"
  await sendQuotedWithFooter(sock, remoteJid, `✅ ${moduleLabel}: ${status}`, message)
}
