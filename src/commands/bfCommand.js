import { sendQuotedWithFooter } from "../utils/messageHelper.js"
import { loadPlayerByPhone } from "../database/playerRepo.js"

export async function handleBf(sock, message) {
  const remoteJid = message.key.remoteJid
  const sender = message.key.participant || remoteJid
  const phoneNumber = sender.split("@")[0]

  const player = await loadPlayerByPhone(phoneNumber)
  const name = player ? (player.name || "Sorcerer") : "Sorcerer"
  const bfCount = (player && player.blackFlashes) || 0

  const manual = `
━━━━━━━━━━━━━━━━━━━━━━
⚫⚡ BLACK FLASH MANUAL ⚡⚫
━━━━━━━━━━━━━━━━━━━━━━

What is Black Flash?
A natural phenomenon where a sorcerer's cursed energy strikes
exactly 0.000001 seconds after physical impact. The space between
is distorted, creating a radiant explosion of cursed energy.

BASE CHANCE: 9%

Your Black Flashes landed: ${bfCount}

━━━ PERFECT BLACK FLASH ━━━

Condition:
  • Your CE must be 0
  • Enemy must still have CE > 0
  • You use ANY martial attack

Result:
  • GUARANTEED Black Flash
  • 2x damage multiplier
  • Enemy is STUNNED
  • Dramatic cinematic display

"When your cursed energy burns out,
instinct takes over and space itself
distorts to answer your strike."

━━━ COMBO BLACK FLASH ━━━

Condition:
  • Use /battack2 (Jab) 4 times consecutively
  • The 4th hit becomes COMBO JAB
  • 23% chance to trigger Black Flash Combo

Result:
  • 4x normal damage
  • Can trigger Black Flash on top
  • Resets combo counter after use

Note: Using any other attack or skill
resets your jab counter.

━━━ TRAINING METHODS ━━━

1. Yuji Itadori Training (/yuji-train)
   • Complete tasks to unlock martial attacks
   • Each tier unlocks a new /battack skill

2. Consistent Attacks
   • Land consecutive hits (3+) to build up
   • Black Flash chance increases with consistency

3. Perfect Spark Setup
   • Drain your CE to 0 in battle
   • Ensure the enemy still has CE
   • Use /battack1 for guaranteed Perfect Black Flash

━━━ MARTIAL ARTS ━━━

/battack1 - Uppercut (Unlocked by default)
  High damage single strike. 9% Black Flash chance.

/battack2 - Jab (Unlocked via /yuji-train)
  Low damage. 4 consecutive hits = Combo Jab (4x damage).

/battack3 - Roundhouse Kick (Unlocked via /yuji-train)
  Medium damage. Small stun chance.

/battack4 - Body Blow (Unlocked via /yuji-train)
  Lower damage. Drains enemy CE.

━━━━━━━━━━━━━━━━━━━━━━
  "The spark that distorts space...
  that is the essence of Black Flash."
━━━━━━━━━━━━━━━━━━━━━━
`.trim()

  await sendQuotedWithFooter(sock, remoteJid, manual, message)
}
