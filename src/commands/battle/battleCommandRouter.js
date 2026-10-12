import { sendQuotedWithFooter } from "../../utils/messageHelper.js"
import { loadPlayerByPhone, savePlayer } from "../../database/playerRepo.js"
import { SimpleBattleService } from "../../services/battle/SimpleBattleService.js"
import {
  formatBattleStart,
  formatActionMenu,
  formatRoundDisplay
} from "../../utils/battle/battleDisplay.js"
import { ProgressionService } from "../../services/progression/ProgressionService.js"
import { recordBattle, saveCurseResult } from "../../services/battle/CurseService.js"
import { KlootService } from "../../services/kloot/KlootService.js"
import { CombinedBattleCanvas } from "../../canvas/CombinedBattleCanvas.js"
import { BattleCard } from "../../canvas/battleCard.js"
import play from "play-dl"

export async function handleBattleCommand(sock, message) {
  const remoteJid = message.key.remoteJid
  const sender = message.key.participant || remoteJid
  const phoneNumber = sender.split("@")[0]
  const text = (message.message?.conversation || message.message?.extendedTextMessage?.text || "").trim().toLowerCase()

  const player = await loadPlayerByPhone(phoneNumber)
  if (!player) {
    await sendQuotedWithFooter(sock, remoteJid, "You need to register first.\n\nUse /start to begin.", message)
    return
  }

  const battle = SimpleBattleService.getByPlayer(player.playerId)
  if (!battle) {
    await sendQuotedWithFooter(sock, remoteJid, "No active battle. Use /fight to engage a curse!", message)
    return
  }

  if (battle.finished) {
    const resultText = battle.winner?.id === String(player.playerId) ? "🏆 Victory!" : "💀 Defeated..."
    await sendQuotedWithFooter(sock, remoteJid, `Battle already ended.\n\n${resultText}`, message)
    return
  }

  const validActions = ["attack", "skill", "defend", "heal", "ultimate", "flee", "battack", "bblock", "block", "dodge", "counter", "heavy_attack", "taunt", "rct", "domain", "reverse", "execute", "absorb", "bflee"]
  const actionMap = {
    "attack": "attack",
    "battack": "attack",
    "skill": "skill",
    "bblock": "defend",
    "block": "block",
    "defend": "defend",
    "heal": "heal",
    "ultimate": "ultimate",
    "dodge": "dodge",
    "counter": "counter",
    "heavy_attack": "heavy_attack",
    "taunt": "taunt",
    "rct": "rct",
    "domain": "domain",
    "reverse": "reverse",
    "execute": "execute",
    "absorb": "absorb",
    "bflee": "flee",
    "flee": "flee"
  }

  const actionKey = text.replace("/", "")
  const actionType = actionMap[actionKey]

  if (!actionType) {
    await sendQuotedWithFooter(sock, remoteJid, "Invalid action.\n\n" + formatActionMenu(), message)
    return
  }

if (actionType === "ultimate" && battle.player.cursedEnergy < 50) {
      await sendQuotedWithFooter(sock, remoteJid, "Not enough CE for ultimate! Need 50 CE.", message)
      return
    }

    if (actionType === "ultimate") {
      battle.player.cursedEnergy -= 50
    } else if (actionType === "skill") {
      if (battle.player.cursedEnergy < 20) {
        await sendQuotedWithFooter(sock, remoteJid, "Not enough CE for skill! Need 20 CE.", message)
        return
      }
      battle.player.cursedEnergy -= 20
    } else if (actionType === "heal") {
      if (battle.player.cursedEnergy < 15) {
        await sendQuotedWithFooter(sock, remoteJid, "Not enough CE to heal! Need 15 CE.", message)
        return
      }
      battle.player.cursedEnergy -= 15
    } else if (actionType === "heavy_attack") {
      if (battle.player.cursedEnergy < 30) {
        await sendQuotedWithFooter(sock, remoteJid, "Not enough CE for heavy attack! Need 30 CE.", message)
        return
      }
      battle.player.cursedEnergy -= 30
    } else if (actionType === "taunt") {
      if (battle.player.cursedEnergy < 10) {
        await sendQuotedWithFooter(sock, remoteJid, "Not enough CE to taunt! Need 10 CE.", message)
        return
      }
      battle.player.cursedEnergy -= 10
    } else if (actionType === "rct") {
      if (battle.player.cursedEnergy < 25) {
        await sendQuotedWithFooter(sock, remoteJid, "Not enough CE for RCT! Need 25 CE.", message)
        return
      }
      battle.player.cursedEnergy -= 25
    } else if (actionType === "domain") {
      if (battle.player.cursedEnergy < 100) {
        await sendQuotedWithFooter(sock, remoteJid, "Not enough CE for Domain! Need 100 CE.", message)
        return
      }
      battle.player.cursedEnergy -= 100
    } else if (actionType === "reverse") {
      if (battle.player.cursedEnergy < 20) {
        await sendQuotedWithFooter(sock, remoteJid, "Not enough CE for Reverse! Need 20 CE.", message)
        return
      }
      battle.player.cursedEnergy -= 20
    }

  const result = await SimpleBattleService.processRound(battle, actionType)
  SimpleBattleService.syncToPlayer(result.battle, player)

  if (result.finished) {
    const isVictory = result.battle.winner?.id === String(player.playerId)
    const battleStats = {
      totalDamage: Math.max(0, result.battle.opponent.maxHp - result.battle.opponent.hp),
      finalCombo: result.battle.player.combo,
      maxCombo: Math.max(result.battle.player.combo, result.battle.opponent.combo),
      roundsLasted: result.battle.round,
      accuracy: 100
    }

    const xpReward = isVictory ? 250 : 50
    const coinReward = isVictory ? 150 : 25

    // Add XP to player and get level up info
    const xpInfo = await ProgressionService.addXP(player, xpReward)

    const rewards = await SimpleBattleService.calculateRewards(result.battle, isVictory, player)
    await SimpleBattleService.applyRewards(player, rewards)

    let rewardText = ""
    if (rewards.yen > 0) rewardText += `🪙 +${rewards.yen} Yen\n`
    if (rewards.ken > 0) rewardText += `🎫 +${rewards.ken} Ken Tokens\n`
    if (rewards.cards.length > 0) {
      rewards.cards.forEach(card => {
        rewardText += `🃏 +${card.rarity} ${card.name}\n`
      })
    }
    if (rewards.kloots.length > 0) {
      rewards.kloots.forEach(klootId => {
        const def = KlootService.getDefinitions()[klootId]
        rewardText += `📦 +${def?.name || klootId} Kloot!\n`
      })
    }

    const battleCard = new BattleCard()

    if (isVictory) {
      const victoryRewards = {
        xp: xpReward,
        coins: coinReward,
        rankPoints: 12,
        currentXp: player.xp || 0,
        nextLevelXp: (player.level || 1) * 1000
      }
      
      // Create victory canvas
      const canvasBuffer = await battleCard.renderVictory(result.battle.player, battleStats, victoryRewards, xpInfo)
      
      // Add rewards text to the message
      const rewardMessage = "\n\n🎁 REWARDS\n" + rewardText
      
      // Send canvas as image with rewards text - send buffer directly, not data URL
      await sock.sendMessage(remoteJid, {
        image: canvasBuffer
      }, { quoted: message })
    } else {
      // For defeat, include participation rewards and any level up
      const participationRewards = {
        xp: xpReward,
        coins: coinReward,
        ken: rewards.ken,
        yen: rewards.yen
      }
      
      // Create defeat canvas  
      const canvasBuffer = await battleCard.renderDefeat(result.battle.player, battleStats, participationRewards, xpInfo)
      
      // Add participation rewards text to the message
      const rewardMessage = "\n\n🎁 PARTICIPATION REWARDS\n" + rewardText
      
      // Send canvas as image with rewards text - send buffer directly, not data URL
      await sock.sendMessage(remoteJid, {
        image: canvasBuffer
      }, { quoted: message })
    }

    if (battle.type === "CURSE" || battle.type === "GROUP_CURSE") {
      const opponent = result.battle.opponent
      const battleResult = isVictory ? "victory" : (result.battle.fledByPlayer ? "escaped" : "defeat")
      const damageDealt = Math.max(0, opponent.maxHp - opponent.hp)
      const damageTaken = Math.max(0, result.battle.player.maxHp - result.battle.player.hp)
      
      if (isVictory && opponent.templateId) {
        await saveCurseResult(opponent, player.playerId, "victory", damageDealt, damageTaken)
      } else if (!isVictory) {
        await recordBattle(opponent, player.playerId, battleResult, damageDealt, damageTaken, result.battle.round)
      }
    }

    SimpleBattleService.end(battle.id)
    await savePlayer(player)
    return
  }

  if (battle.round >= 5 && player.profileSongUrl) {
    if (!battle.cachedThemeBuffer && !battle.themeSongFailed) {
      try {
        const streams = await play.streams(player.profileSongUrl)
        if (streams && streams.type === "video") {
          const audioStream = await play.streams(streams.url)
          if (audioStream && audioStream.type === "audio") {
            const audioBuffer = await play.download(audioStream.url)
            if (audioBuffer && audioBuffer.length > 0) {
              battle.cachedThemeBuffer = audioBuffer
            }
          }
        }
      } catch (error) {
        console.error("[KENNYJAKS ERROR] Failed to cache theme song:", error.message)
        battle.themeSongFailed = true
      }
    }

    if (battle.cachedThemeBuffer) {
      try {
        await sock.sendMessage(remoteJid, {
          audio: battle.cachedThemeBuffer,
          mimetype: "audio/mpeg",
          fileName: "theme.mp3"
        }, { quoted: message })
      } catch (error) {
        console.error("[KENNYJAKS ERROR] Failed to send theme song:", error.message)
      }
    } else if (!battle.themeSongSent && battle.themeSongFailed) {
      battle.themeSongSent = true
      await sendQuotedWithFooter(sock, remoteJid, `🎵 Theme Song: ${player.profileSongTitle || "Unknown"}\n${player.profileSongUrl || ""}`, message)
}
   }

   const roundDisplayLog = [...result.battle.battleLog]
   if (result.battle.aiDialogue) {
     roundDisplayLog.push(`\n${result.battle.aiDialogue}`)
   }
   if (result.battle.aiEmotion) {
     roundDisplayLog.push(`🎭 Emotion: ${result.battle.aiEmotion}`)
   }

   // Generate combined battle canvas image
   const combinedCanvas = new CombinedBattleCanvas()
   const battleImage = await combinedCanvas.render(
     result.battle.player,
     result.battle.opponent,
     result.battle.round,
     result.battle.battleLog
   )

   // Send battle image with round info as caption
   const roundText = formatRoundDisplay(
     result.battle.round,
     result.battle.player,
     result.battle.opponent,
     roundDisplayLog,
     "player"
   )
   await sock.sendMessage(remoteJid, {
     image: battleImage,
     caption: roundText
   }, { quoted: message })
   
   await savePlayer(player)
 }
