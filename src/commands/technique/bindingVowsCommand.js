import { sendQuotedWithFooter } from "../../utils/messageHelper.js"
import { loadPlayerByPhone } from "../../database/playerRepo.js"
import { BindingVowService } from "../../services/technique/BindingVowService.js"
import { getTechniqueControl } from "../../services/player/attributeService.js"

export async function handleBindingVows(sock, message) {
  const remoteJid = message.key.remoteJid
  const sender = message.key.participant || remoteJid
  const phoneNumber = sender.split("@")[0]

  const player = await loadPlayerByPhone(phoneNumber)
  if (!player) {
    await sendQuotedWithFooter(sock, remoteJid, "You need to register first.\n\nUse /start to begin.", message)
    return
  }

  const vows = BindingVowService.getAllVows()
  const techniqueControl = getTechniqueControl(player)
  const accuracy = BindingVowService.calculateVowAccuracy(player, [])
  const strength = BindingVowService.calculateVowStrength(player, [])
  const lines = [
    "╔══════════════════════════════════╗",
    "         BINDING VOWS",
    "╚══════════════════════════════════╝",
    ""
  ]

  vows.forEach((vow, index) => {
    lines.push(`${index + 1}. ${vow.name.toUpperCase()}`)
    lines.push(vow.description)
    lines.push(`Cost: ${vow.hpCost === "variable" ? "Variable / high risk" : vow.hpCost + " HP"}`)
    if (vow.effects) {
      const effectKeys = Object.keys(vow.effects)
      if (effectKeys.length > 0) {
        lines.push(`Effects: ${effectKeys.join(", ")}`)
      }
    }
    lines.push("")
  })

  lines.push("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
  lines.push("")
  lines.push(`Your Technique Control: ${techniqueControl}`)
  lines.push(`Vow Accuracy: ${Math.floor(accuracy * 100)}%`)
  lines.push(`Vow Strength: ${strength.toFixed(2)}x`)
  lines.push("")
  lines.push("Higher Technique Control increases")
  lines.push("Binding Vow accuracy and strength.")
  lines.push("")
  lines.push("Usage: /btq1 <vow-name>")
  lines.push("Multiple: /btq1 <vow1> x <vow2> x <vow3>")

  await sendQuotedWithFooter(sock, remoteJid, lines.join("\n"), message)
}
