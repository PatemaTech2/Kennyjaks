import { sendQuotedWithFooter } from "../utils/messageHelper.js"
import { loadPlayerByPhone } from "../database/playerRepo.js"
import { resolveTarget } from "../utils/targetResolver.js"
import { ProfileCanvasV2 } from "../canvas/profileCanvasV2.js"
import { ProfileCharacterSheet } from "../canvas/profileCharacterSheet.js"
import { ProfileTechCanvas } from "../canvas/profileTechCanvas.js"
import { BirthdayService } from "../services/events/BirthdayService.js"
import { getBirthdayBonusText } from "../utils/birthdayProfile.js"
import { getSpriteBuffer, getSpriteName } from "../services/sprite/SpriteService.js"

export async function handleProfile(sock, message) {
  const remoteJid = message.key.remoteJid
  const sender = message.key.participant || remoteJid
  const phoneNumber = sender.split("@")[0]

  const player = await loadPlayerByPhone(phoneNumber)
  if (!player) {
    await sendQuotedWithFooter(sock, remoteJid, "You need to register first.\n\nUse /start to begin.", message)
    return
  }

  const text = (message.message?.conversation || message.message?.extendedTextMessage?.text || "").trim()
  const args = text.split(" ")

  let targetPlayer = player
  if (args.length > 1 && !args[1].toLowerCase().startsWith("/")) {
    const target = await resolveTarget(message, phoneNumber)
    if (target) {
      targetPlayer = target.player
    } else {
      await sendQuotedWithFooter(sock, remoteJid, "Player not found.", message)
      return
    }
  }

  const variant = (targetPlayer.profileStyle || "TECH").toUpperCase()
  let imageBuffer
  try {
    if (variant === "TECH") {
      const renderer = new ProfileTechCanvas()
      imageBuffer = await renderer.render(targetPlayer)
    } else if (variant === "E") {
      const renderer = new ProfileCharacterSheet()
      imageBuffer = await renderer.render(targetPlayer)
    } else {
      const renderer = new ProfileCanvasV2()
      imageBuffer = await renderer.render(targetPlayer)
    }
  } catch (err) {
    console.error("Profile render failed:", err)
    await sendQuotedWithFooter(sock, remoteJid, `❌ Profile card failed.\n${err.message}`, message)
    return
  }

  await sock.sendMessage(remoteJid, { image: imageBuffer }, { quoted: message })

  if (BirthdayService.isEventActive() && targetPlayer.birthdayCakeCurrency > 0) {
    const bonusText = getBirthdayBonusText(targetPlayer)
    if (bonusText) {
      await sendQuotedWithFooter(sock, remoteJid, bonusText, message)
    }
  }
  
  // Show sprite info
  const spriteName = targetPlayer.currentSpriteName || 'johnken'
  await sendQuotedWithFooter(sock, remoteJid, `🎮 Current Sprite: ${spriteName}\nUse */sprites* to see all available sprites\nUse */sprite-v <number>* to preview a sprite\nUse */set-sprite <number>* to change your sprite`, message)
}
