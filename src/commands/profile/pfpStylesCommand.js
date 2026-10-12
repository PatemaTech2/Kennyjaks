import { sendQuotedWithFooter } from "../../utils/messageHelper.js"
import { loadPlayerByPhone, savePlayer } from "../../database/playerRepo.js"

const PFP_STYLES = [
  { name: "Red", color: "#ef4444" },
  { name: "Yellow", color: "#facc15" },
  { name: "Blue", color: "#3b82f6" },
  { name: "Purple", color: "#a855f7" },
  { name: "Grey", color: "#94a3b8" },
  { name: "Orange", color: "#f97316" },
  { name: "Pink", color: "#ec4899" },
  { name: "Dark Blue", color: "#1e40af" },
  { name: "Green", color: "#22c55e" },
  { name: "Black", color: "#171717" },
  { name: "Gold", color: "#ffd700" },
  { name: "Violet", color: "#7c3aed" }
]

export async function handlePfpStyles(sock, message) {
  const remoteJid = message.key.remoteJid
  const sender = message.key.participant || remoteJid
  const phoneNumber = sender.split("@")[0]
  const text = (message.message?.conversation || message.message?.extendedTextMessage?.text || "").trim()
  const args = text.split(" ").slice(1)
  const choice = args[0]

  const player = await loadPlayerByPhone(phoneNumber)
  if (!player) {
    await sendQuotedWithFooter(sock, remoteJid, "You need to register first.\n\nUse /start to begin.", message)
    return
  }

  if (!choice) {
    const lines = ["🎨 Profile Color Styles", "", "Choose your profile accent color:"]
    PFP_STYLES.forEach((style, index) => {
      lines.push(`${index + 1}. ${style.name}`)
    })
    lines.push("")
    lines.push("Usage: /pfpstyles <number>")
    lines.push("Example: /pfpstyles 3")
    await sendQuotedWithFooter(sock, remoteJid, lines.join("\n"), message)
    return
  }

  const index = parseInt(choice, 10) - 1
  if (Number.isNaN(index) || index < 0 || index >= PFP_STYLES.length) {
    await sendQuotedWithFooter(sock, remoteJid, "Invalid choice. Use /pfpstyles to see available options.", message)
    return
  }

  const selected = PFP_STYLES[index]
  player.profileAccent = selected.color
  await savePlayer(player)

  await sendQuotedWithFooter(sock, remoteJid, `✅ Profile color updated to ${selected.name}!`, message)
}
