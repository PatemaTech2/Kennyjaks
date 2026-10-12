import { sendQuotedWithFooter } from "../utils/messageHelper.js"
import { loadPlayerByPhone } from "../database/playerRepo.js"

export async function handleBranchInfo(sock, message) {
  const remoteJid = message.key.remoteJid
  const sender = message.key.participant || remoteJid
  const phoneNumber = sender.split("@")[0]

  const player = await loadPlayerByPhone(phoneNumber)
  if (!player) {
    await sendQuotedWithFooter(sock, remoteJid, "You need to register first.\n\nUse /start to begin.", message)
    return
  }

  const technique = player.technique
  if (!technique) {
    await sendQuotedWithFooter(sock, remoteJid, "You have no technique yet.", message)
    return
  }

  const branch = technique.branch || "Unknown"
  const techName = technique.name || "Unknown"

  const lines = [
    "╔══════════════════════════════════════╗",
    "          BRANCH INFORMATION           ",
    "╚══════════════════════════════════════╝",
    "",
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    " ⚡ Technique",
    ` ${techName}`,
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    " 🌳 Branch",
    ` ${branch}`,
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    " 📜 Description",
    ` The ${branch} branch focuses on mastery over ${techName.toLowerCase()} through specialized techniques and combat applications.`,
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    " 🛡 Passive",
    ` ${technique.passive || "None"}`,
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    " ⚔️ Playstyle",
    " Defensive, Crowd Control, Late Game Scaling",
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    " ✅ Advantages",
    " - High utility",
    " - Strong defense",
    " - Versatile",
    " ❌ Weaknesses",
    " - Lower early damage",
    " - High CE cost",
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    " 📚 Future Unlocks",
    " ✓ " + branch,
    " ✗ Advanced Technique",
    " ✗ Domain Expansion",
    " ✗ Reversed Cursed Technique",
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    " 📈 Mastery",
    ` ${technique.mastery || 0}%`,
    "  Next Skill: Advanced Technique",
    "  Unlocks at 25%"
  ]

  await sendQuotedWithFooter(sock, remoteJid, lines.join("\n"), message)
}
