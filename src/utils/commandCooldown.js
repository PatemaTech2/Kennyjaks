import { isOwnerOrModerator } from "../services/PermissionService.js"

const commandCooldowns = new Map()

export const GLOBAL_COMMAND_COOLDOWN_MS = 0.5 * 1000

export const COOLDOWN_BYPASS_COMMANDS = [
  "/start", "/profile", "/inventory", "/bag", "/b2i", "/i2b",
  "/shops", "/shop", "/help", "/menu", "/stats", "/lb-strong",
  "/leaderboard", "/daily", "/enable", "/disable", "/toggle-",
  "/group-settings", "/help-enable", "/namepet", "/pet", "/pets",
  "/pet-info", "/pet-equip", "/pet-unequip", "/pet-train",
  "/pet-heal", "/pet-rename", "/pet-feed", "/unsummon", "/summon",
  "/petskills", "/petstats", "/petevolve", "/healpet", "/revivepet",
  "/feed", "/bra", "/comments", "/link", "/news", "/skills",
  "/send", "/wallet", "/bank", "/deposit", "/withdraw", "/buy",
  "/blackmarket", "/hatch", "/equip", "/unequip", "/craft", "/craft-name",
  "/train-rct", "/train-status", "/train-domain", "/domain", "/pot",
  "/technique", "/train", "/att", "/spend", "/tq", "/spawnenemy",
  "/fight", "/ch", "/bf", "/yuji-train", "/heal-ce", "/eat", "/drink",
  "/spawnpack", "/claim-pack", "/yt", "/ytset",
  "/shop-drink", "/shop-food", "/shop-medicine", "/shop-weapon",
  "/shop-armor", "/shop-accessory", "/shop-outfit", "/shop-egg",
  "/shop-bag", "/shop-meds", "/shop-drinks", "/list",
  "/train-divine-dogs", "/train-nue", "/train-great-serpent", "/train-toad",
  "/train-rabbit-escape", "/train-max-elephant", "/train-round-deer",
  "/train-piercing-ox", "/train-tiger-funeral", "/train-mourning-tiger"
]

export function checkCooldown(phoneNumber, command = "") {
  if (isOwnerOrModerator(phoneNumber)) return { allowed: true }

  for (const bypass of COOLDOWN_BYPASS_COMMANDS) {
    if (command.startsWith(bypass)) return { allowed: true }
  }

  const now = Date.now()
  const lastTime = commandCooldowns.get(phoneNumber) || 0
  const elapsed = now - lastTime

  if (elapsed < GLOBAL_COMMAND_COOLDOWN_MS) {
    const remaining = GLOBAL_COMMAND_COOLDOWN_MS - elapsed
    const remainingSec = (remaining / 1000).toFixed(1)
    return {
      allowed: false,
      message: `⏳ Slow down.\n\nYou can use another command in ${remainingSec}s`
    }
  }

  return { allowed: true }
}

export function setCooldown(phoneNumber) {
  commandCooldowns.set(phoneNumber, Date.now())
}

export function clearCooldown(phoneNumber) {
  commandCooldowns.delete(phoneNumber)
}
