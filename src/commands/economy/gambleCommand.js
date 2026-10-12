import { sendQuotedWithFooter } from "../../utils/messageHelper.js"
import { loadPlayerByPhone, savePlayer } from "../../database/playerRepo.js"
import { globalGambling } from "../../services/economy/GamblingService.js"
import { GAMBLE } from "../../config/gambleConfig.js"
import chalk from "chalk"

const GAMBLE_COLORS = ["blue", "red", "green", "black"]

export async function handleGamble(sock, message) {
  const remoteJid = message.key.remoteJid
  const sender = message.key.participant || remoteJid
  const phoneNumber = sender.split("@")[0]
  const text = (message.message.conversation || message.message.extendedTextMessage?.text || "").trim().toLowerCase()

  const player = await loadPlayerByPhone(phoneNumber)
  if (!player) {
    await sendQuotedWithFooter(sock, remoteJid, "You need to register first.\n\nUse /start to begin.", message)
    return
  }

  const parts = text.split(" ")
  const command = parts[0]
  const color = command.replace("/gamble-", "")
  const isValidColor = GAMBLE_COLORS.includes(color)
  if (!isValidColor) {
    await sendQuotedWithFooter(sock, remoteJid, "Usage: /gamble-<blue|red|green|black> <amount>\n\nMinimum bet: ¥50\nMaximum bet: ¥100,000", message)
    return
  }

  const bet = parseInt(parts[1], 10)
  if (!Number.isFinite(bet) || bet <= 0) {
    await sendQuotedWithFooter(sock, remoteJid, "Invalid bet amount. Enter a whole number.", message)
    return
  }
  if (bet < GAMBLE.minBet) {
    await sendQuotedWithFooter(sock, remoteJid, `❌ Minimum gamble: ¥${GAMBLE.minBet}`, message)
    return
  }
  if (bet > GAMBLE.maxBet) {
    await sendQuotedWithFooter(sock, remoteJid, `❌ Maximum gamble: ¥${GAMBLE.maxBet.toLocaleString()}`, message)
    return
  }
  if (bet > player.wallet) {
    await sendQuotedWithFooter(sock, remoteJid, "Insufficient wallet balance.", message)
    return
  }

  const colorEmoji = color === "blue" ? "🔵" : color === "red" ? "🔴" : color === "green" ? "🟢" : "⚫"
  const colorLabel = color.charAt(0).toUpperCase() + color.slice(1)

  await sendQuotedWithFooter(sock, remoteJid, [
    `${colorEmoji} ${colorLabel.toUpperCase()} GAMBLE`,
    "",
    `Bet: ¥${bet.toLocaleString()}`,
    "",
    "Rolling...",
    "...",
    "...",
  ].join("\n"), message)

  const result = await globalGambling.processGamble(player, color, bet)
  await savePlayer(player)

  if (result.error) {
    await sendQuotedWithFooter(sock, remoteJid, result.error, message)
    return
  }

  const won = result.payout > 0
  const lines = [
    `${colorEmoji} ${colorLabel.toUpperCase()} GAMBLE`,
    "",
    `Bet: ¥${bet.toLocaleString()}`,
    "",
    "Rolling...",
    "...",
    "...",
    "",
    won ? "🎉 JACKPOT!!" : "The house won.",
    "",
    `Multiplier: ×${result.multiplier}`,
    "",
    won ? `Reward: ¥${result.payout.toLocaleString()}` : `Lost: ¥${bet.toLocaleString()}`,
    "",
    `New Wallet: ¥${result.newWallet.toLocaleString()}`,
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  ]

  if (result.message) {
    lines.splice(lines.length - 1, 0, result.message)
  }

  console.log(chalk.cyan("[GAMBLE]"), `Color: ${colorLabel}, Bet: ¥${bet}, Multiplier: ×${result.multiplier}, Reward: ¥${result.payout}, RNG Seed: ${Math.floor(Math.random() * 1000000)}`)

  await sendQuotedWithFooter(sock, remoteJid, lines.join("\n"), message)
}
