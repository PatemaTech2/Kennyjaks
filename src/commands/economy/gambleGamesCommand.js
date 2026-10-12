import { sendQuotedWithFooter } from "../../utils/messageHelper.js"
import { loadPlayerByPhone, savePlayer } from "../../database/playerRepo.js"
import { globalEconomy } from "../../services/economy/EconomyService.js"

const COOLDOWN_MS = 5000
const lastGameTime = new Map()

function canPlay(playerId) {
  const last = lastGameTime.get(playerId) || 0
  return Date.now() - last >= COOLDOWN_MS
}

function recordPlay(playerId) {
  lastGameTime.set(playerId, Date.now())
}

function getCardValue(card) {
  if (card === "K" || card === "Q" || card === "J") return 10
  if (card === "A") return 11
  return parseInt(card)
}

function generateCard() {
  const cards = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"]
  return cards[Math.floor(Math.random() * cards.length)]
}

function generateSlotReel() {
  const symbols = ["🍎", "🍊", "🍋", "🍌", "🍉", "💎", "🎰", "💰", "⭐", "7️⃣"]
  return symbols[Math.floor(Math.random() * symbols.length)]
}

function evaluateSlot(reels, bet) {
  const [r1, r2, r3] = reels
  if (r1 === r2 && r2 === r3) {
    if (r1 === "🎰" || r1 === "💰" || r1 === "7️⃣") return { multiplier: 10, text: "🎉 JACKPOT! 🎉" }
    return { multiplier: 5, text: "🎊 THREE MATCH! 🎊" }
  }
  if (r1 === r2 || r2 === r3 || r1 === r3) {
    return { multiplier: 2, text: "✨ TWO MATCH! ✨" }
  }
  return { multiplier: 0, text: "😢 NO MATCH" }
}

export async function handleGambleGames(sock, message) {
  const remoteJid = message.key.remoteJid
  const sender = message.key.participant || remoteJid
  const phoneNumber = sender.split("@")[0]
  const text = (message.message.conversation || message.message.extendedTextMessage?.text || "").trim()
  const args = text.split(" ").slice(1)

  const player = await loadPlayerByPhone(phoneNumber)
  if (!player) {
    await sendQuotedWithFooter(sock, remoteJid, "You need to register first.\n\nUse /start to begin.", message)
    return
  }

  const gameType = (args[0] || "").toLowerCase()
  const bet = Math.floor(parseFloat(args[1]) || 100)

  if (!gameType || !["dice", "flip", "slots", "higher", "poker", "blackjack", "bj", "card"].includes(gameType)) {
    await sendQuotedWithFooter(sock, remoteJid, 
      `🎰 *GAMBLING GAMES*\n\n` +
      `Usage: /play <game> <bet>\n\n` +
      `Games:\n` +
      `  • dice [bet] - Roll dice vs dealer (1.5x win)\n` +
      `  • flip [bet] - Coin flip (2x win)\n` +
      `  • slots [bet] - Slot machine (up to 10x)\n` +
      `  • higher [bet] - Higher/lower card (2x win)\n` +
      `  • poker [bet] - Simple poker (2x win)\n` +
      `  • blackjack [bet] - Blackjack (2.5x blackjack)\n\n` +
      `Min bet: ¥50 | Max bet: ¥100,000\n` +
      `Cooldown: 5s`, message)
    return
  }

  if (bet < 50) {
    await sendQuotedWithFooter(sock, remoteJid, "❌ Minimum bet: ¥50", message)
    return
  }
  if (bet > 100000) {
    await sendQuotedWithFooter(sock, remoteJid, "❌ Maximum bet: ¥100,000", message)
    return
  }
  if (bet > player.wallet) {
    await sendQuotedWithFooter(sock, remoteJid, "❌ Insufficient wallet balance.", message)
    return
  }
  if (!canPlay(player.playerId)) {
    await sendQuotedWithFooter(sock, remoteJid, "⏳ Cooldown active. Wait 5 seconds.", message)
    return
  }

  if (!globalEconomy.canGamble(player.playerId)) {
    await sendQuotedWithFooter(sock, remoteJid, "⏳ Gambling cooldown. Wait 5 seconds.", message)
    return
  }

  player.wallet -= bet
  globalEconomy.recordGamble(player.playerId)
  recordPlay(player.playerId)
  player.gamblingGamesPlayed = (player.gamblingGamesPlayed || 0) + 1
  player.lifetimeSpent = (player.lifetimeSpent || 0) + bet

  let winnings = 0
  let resultText = ""
  let gameDetails = ""

  switch (gameType) {
    case "dice": {
      const playerRoll = Math.floor(Math.random() * 6) + 1
      const dealerRoll = Math.floor(Math.random() * 6) + 1
      if (playerRoll > dealerRoll) {
        winnings = Math.floor(bet * 1.5)
        resultText = "🎉 YOU WIN!"
      } else if (dealerRoll > playerRoll) {
        resultText = "😢 YOU LOSE!"
      } else {
        winnings = 0
        resultText = "🤝 DRAW!"
      }
      gameDetails = `Your roll: ${playerRoll}\nDealer roll: ${dealerRoll}`
      break
    }

    case "flip": {
      const choices = ["heads", "tails"]
      const result = choices[Math.floor(Math.random() * 2)]
      const won = Math.random() > 0.5
      if (won) {
        winnings = bet * 2
        resultText = "🎉 YOU WIN!"
      } else {
        resultText = "😢 YOU LOSE!"
      }
      gameDetails = `Coin landed: ${result.toUpperCase()}`
      break
    }

    case "slots": {
      const reels = [generateSlotReel(), generateSlotReel(), generateSlotReel()]
      const result = evaluateSlot(reels, bet)
      winnings = Math.floor(bet * result.multiplier)
      resultText = result.text
      gameDetails = `${reels.join(" | ")}`
      break
    }

    case "higher":
    case "card": {
      const card1 = generateCard()
      const card2 = generateCard()
      const val1 = getCardValue(card1)
      const val2 = getCardValue(card2)
      const won = val2 > val1
      if (won) {
        winnings = bet * 2
        resultText = "🎉 HIGHER!"
      } else if (val2 < val1) {
        resultText = "😢 LOWER!"
      } else {
        winnings = 0
        resultText = "🤝 SAME VALUE!"
      }
      gameDetails = `Card 1: ${card1}\nCard 2: ${card2}`
      break
    }

    case "poker": {
      const playerHand = [generateCard(), generateCard()]
      const dealerHand = [generateCard(), generateCard()]
      const playerVal = getCardValue(playerHand[0]) + getCardValue(playerHand[1])
      const dealerVal = getCardValue(dealerHand[0]) + getCardValue(dealerHand[1])
      if (playerVal > dealerVal) {
        winnings = bet * 2
        resultText = "🎉 YOU WIN!"
      } else if (dealerVal > playerVal) {
        resultText = "😢 YOU LOSE!"
      } else {
        winnings = 0
        resultText = "🤝 DRAW!"
      }
      gameDetails = `Your hand: ${playerHand.join(" ")}\nDealer hand: ${dealerHand.join(" ")}`
      break
    }

    case "blackjack":
    case "bj": {
      const playerCard1 = Math.floor(Math.random() * 10) + 2
      const playerCard2 = Math.floor(Math.random() * 10) + 2
      const dealerCard1 = Math.floor(Math.random() * 10) + 2
      const dealerCard2 = Math.floor(Math.random() * 10) + 2
      const playerTotal = playerCard1 + playerCard2
      const dealerTotal = dealerCard1 + dealerCard2

      if (playerTotal > 21) {
        resultText = "😢 BUST! Over 21"
      } else if (playerTotal === 21) {
        winnings = Math.floor(bet * 2.5)
        resultText = "🎉 BLACKJACK!"
      } else if (dealerTotal > 21) {
        winnings = bet * 2
        resultText = "🎉 DEALER BUST!"
      } else if (playerTotal > dealerTotal) {
        winnings = bet * 2
        resultText = "🎉 YOU WIN!"
      } else if (dealerTotal > playerTotal) {
        resultText = "😢 DEALER WINS!"
      } else {
        winnings = 0
        resultText = "🤝 PUSH!"
      }
      gameDetails = `Your cards: ${playerCard1} + ${playerCard2} = ${playerTotal}\nDealer: ${dealerCard1} + ${dealerCard2} = ${dealerTotal}`
      break
    }
  }

  player.wallet += winnings

  if (winnings > 0) {
    player.lifetimeEarned = (player.lifetimeEarned || 0) + winnings
    player.gamblingProfit = (player.gamblingProfit || 0) + winnings
    player.currentWinStreak = (player.currentWinStreak || 0) + 1
    player.currentLoseStreak = 0
    if (winnings > (player.largestWin || 0)) player.largestWin = winnings
  } else if (winnings === 0) {
    player.currentWinStreak = 0
    player.currentLoseStreak = 0
  } else {
    player.gamblingLosses = (player.gamblingLosses || 0) + bet
    player.currentLoseStreak = (player.currentLoseStreak || 0) + 1
    player.currentWinStreak = 0
    if (bet > (player.largestLoss || 0)) player.largestLoss = bet
  }

  await savePlayer(player)

  const lines = [
    `🎰 ${gameType.toUpperCase()}`,
    "",
    `Bet: ¥${bet.toLocaleString()}`,
    "",
    gameDetails,
    "",
    resultText,
    "",
    winnings > 0 ? `Reward: ¥${winnings.toLocaleString()}` : winnings === 0 ? "No change" : `Lost: ¥${bet.toLocaleString()}`,
    "",
    `New Wallet: ¥${player.wallet.toLocaleString()}`,
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  ]

  await sendQuotedWithFooter(sock, remoteJid, lines.join("\n"), message)
}