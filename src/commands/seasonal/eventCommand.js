import { readFileSync } from "fs"
import { sendQuotedWithFooter, sendQuotedRaw } from "../../utils/messageHelper.js"
import { loadPlayerByPhone } from "../../database/playerRepo.js"
import { DRAGON_CURSE_KING_EVENT } from "../../data/seasonal/dragonCurseKing.js"
import { getEventState, isEventActive } from "../../services/seasonal/SeasonalEventService.js"
import { getAllKnights } from "../../services/seasonal/DragonKnightService.js"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const EVENT_IMAGE_PATH = path.join(__dirname, "..", "..", "..", "event.png")

const EVENT_CAPTION = `🐉 THE DRAGON CURSE KING
KennyJaks — Summer Event 2026

The first-ever seasonal event in KennyJaks has arrived.

On August 16th, 2026, the world changes.

A surge of ancient cursed energy awakens something that should have remained forgotten. The curses roaming the world are no longer ordinary curses. Their bodies have been infused with the power of dragons, giving birth to a new breed of enemy:

DRAGON KIN

They are stronger, tougher, more aggressive, and far more rewarding than normal curses.

But the Dragon Kin are only the beginning.

🔥 THE DRAGON KIN

Once the event begins, newly spawned curses become Dragon Kin.

These curses possess enhanced:

Defense
Strength
Fire-based abilities
Combat intelligence
Survival capabilities

They are also capable of dropping better loot than ordinary curses.

The stronger the Dragon Kin you defeat, the greater the potential reward.

But there's a catch:

The Dragon Kin are not simply stronger enemies. They are preparing the world for something much worse.

⚔️ THE FIVE DRAGON KNIGHTS

Hidden behind the Dragon Kin are five legendary warriors known as the:

DRAGON KNIGHTS

Each Knight has their own personality, fighting style, abilities, transformations, dialogue, and mechanics.

They are not normal bosses.

Every Knight is intended to feel like an individual character with their own story.

🐉 Valaryia — The Black Dragon

A powerful dragon warrior who commands devastating flames.

His abilities include:

Fire Storm
Raging Flames
Dragon Transformation
Final Half-Dragon Form

His transformations dramatically increase his combat capabilities.

⚡ Sirax — The Yellow Dragon

The weakest of the Knights...

Or at least, that's what everyone believes.

Sirax normally fights in his Dragon Form and avoids revealing his true power.

But defeating him in that form can trigger something far more dangerous.

His true form:

LIGHTNING DRAGON GOD

Sirax possesses mastered RCT, meaning ordinary damage isn't enough to keep him down.

Players must figure out how to stop his regeneration and discover the secret behind his heart.

His battle is designed to evolve as it continues.

If the fight becomes intense enough, Sirax can begin genuinely enjoying himself.

Instead of simply mocking the player, he begins respecting them.

"Through all my years in Dragonstone, I have never met someone as extraordinary as you, my friend."

And if the player manages to defeat him:

"You are the strongest human I have ever faced. I thank you for giving me joy, even at the end."

His death is permanent.

☀️ Blare — The Dragon of the Crimson Sun

The strongest of the Dragon Knights.

Blare lives for battle.

He doesn't care whether his opponent is stronger than him. He wants to fight them anyway.

His abilities include:

Cruel Sun
Solar Beam
Physical combat
Dragon Form
Final Form
Dragon God State

His Dragon Form generates extreme heat that continuously damages nearby opponents.

And when Blare finally decides that his opponent is worthy...

He stops holding back.

His final state is powerful enough to challenge even Calamity-Level opponents.

But his ultimate transformation comes at a price.

Dragon God State

Blare's remaining lifespan is consumed while the form is active.

That means the player doesn't necessarily need to overpower him.

They may simply need to survive long enough.

That's the kind of battle KennyJaks should create:

A weak player can still win if they play intelligently.

🩸 Ragna — The Barbarian

Ragna is a Demi-Dragon.

Unlike the other Knights, he supposedly has no Dragon or Final Form.

He's physically brutal, arrogant, and views humanity as inferior.

But his battle isn't simply about overpowering him.

Ragna's personality and behavior change depending on the opponent.

The player eventually gets the opportunity to challenge his beliefs directly through combat.

His defeat is permanent.

🗡️ Enma — The Blade Dragon

The second strongest Knight.

Not necessarily because she has the highest raw stats...

But because she knows how to fight.

Enma is a strategist, mentalist, and manipulator.

She is also the daughter of the Eternal Dragon.

Her abilities include:

X Cutter

Cuts through cursed energy and temporarily prevents CE usage.

1,000 Dragon Cuts

A devastating barrage of slashes that causes continuous bleeding.

70 Shades of Red

Forces the victim into blindness and a powerful hallucination.

Black Abyss

Creates a devastating black abyss that pulls the target inward while cutting them.

Enma is designed to punish predictable players.

👑 THE FIVE MUST FALL

The Dragon Knights are not ordinary respawning bosses.

Once a Knight is defeated:

They are permanently dead.

They cannot be challenged again.

They cannot respawn.

Their defeat becomes part of KennyJaks history.

And when all five Knights have fallen...

Something awakens.

🐲 AURSTAV — THE ETERNAL DRAGON
THE DRAGON CURSE KING

Aurstav is not simply another boss.

He is the entity behind the Dragon Curse invasion.

He is the first curse in KennyJaks history to reach:

CALAMITY GRADE

With more than 200,000 Reputation, Aurstav stands above the entire existing curse hierarchy.

His appearance marks the final stage of the event.

🐉 DRAGON SOUL

Aurstav possesses an ability known as:

Dragon Soul

He can summon an army of powerful dragons to fight alongside him.

These aren't ordinary summons.

They are Special Grade and higher Dragon Curses.

This means players may find themselves fighting Aurstav while simultaneously dealing with several other powerful dragons.

🔥 GOLDEN DRAGON FLAMES

Aurstav's flames are different from normal fire.

They can burn:

Flesh
Cursed Energy
Cursed Techniques
Eventually, even the soul itself

Using CE against Aurstav can therefore become dangerous.

Players will need to think about how they attack, not simply how much damage they can deal.

⏳ TIME SCAPE

Aurstav can manipulate time.

His technique:

TIME SCAPE

allows him to rewind the battle by approximately 10 seconds.

However, it has a cooldown.

This means players can potentially create an incredible moment...

Only for Aurstav to reverse it.

☀️ DOMAIN EXPANSION

Aurstav's Domain turns the battlefield into an enormous, oppressive environment dominated by a scorching sun.

Inside the Domain:

Thirst rapidly decreases
Players become exhausted
Attacks become weaker
Fighting becomes increasingly difficult

Players with their own Domain can attempt a:

DOMAIN CLASH

The winner is determined through battle momentum, technique compatibility, CE, mastery, and the decisions made during the fight.

Lose the clash?

You may become stunned.

Have RCT?

You may be able to use RCT-Slow to regenerate the damaged parts of your brain and continue fighting.

⚔️ THE LEGENDARY BATTLE SYSTEM

This is one of the most important parts of the event.

KennyJaks won't only remember who won.

It can remember how the battle happened.

If a player fights Aurstav long enough and creates an exceptionally intense battle involving things such as:

Major momentum swings
Black Flashes
Domain clashes
Near-death situations
Major reversals
Multiple phases
Massive damage
Extraordinary survival

The battle can be classified as a:

LEGENDARY BATTLE

The battle can then be permanently recorded in KennyJaks history.

Even if the player loses...

Their battle mattered.

Aurstav can acknowledge the player after their defeat, recognizing that they forced the Dragon Curse King to fight seriously.

🌎 THE WORLD RAID

If the first challenger falls after pushing Aurstav far enough, the battle doesn't simply end.

Aurstav becomes even more dangerous.

His power rises.

And the entire player base gets the opportunity to participate.

DRAGON CURSE KING RAID

Multiple players can enter the battlefield together.

Players can:

Attack
Block
Heal teammates
Use RCT
Use Domains
Use Weapons
Use Techniques
Coordinate attacks
Manipulate battle momentum

This is where KennyJaks stops being a normal one-player battle.

It becomes:

EVERYONE VS THE DRAGON CURSE KING
🏆 THE DRAGON LONG BLADE

Defeating Aurstav gives the players a chance at one of the most valuable weapons introduced during the event:

DRAGON LONG BLADE

A Mythic Cursed Weapon forged from the power of the Dragon Curse King.

It possesses the ability to:

Cut through cursed energy
Disrupt an opponent's CE
Perform devastating strikes
Interact with Black Flash mechanics

If one player defeats Aurstav alone, they receive the weapon.

If multiple players contribute to the final victory, the weapon is awarded among the eligible contributors.

☀️ SUMMER 2026 — THIS IS ONLY THE BEGINNING

THE DRAGON CURSE KING isn't designed to be an ordinary seasonal quest.

It's designed to create stories.

A Grade 4 sorcerer surviving against an enemy that should have destroyed them.

A player landing the perfect Black Flash at the exact moment they need it.

A group of players combining their abilities to bring down Aurstav.

A player losing an impossible battle but creating a Legendary Battle that everyone remembers.

A Knight developing respect for an opponent who refused to give up.

A final attack that turns the entire battle around.

Power matters.
Stats matter.
But during the Dragon Curse King event...
HOW YOU FIGHT MATTERS TOO.

The dragons are coming.

The Knights are waiting.

The Dragon Curse King is watching.

Will you become a legend... or become another name forgotten by the flames?`

export async function handleEvent(sock, message) {
  const remoteJid = message.key.remoteJid
  const sender = message.key.participant || remoteJid
  const phoneNumber = sender.split("@")[0]

  const player = await loadPlayerByPhone(phoneNumber)
  if (!player) {
    await sendQuotedWithFooter(sock, remoteJid, "You need to register first.\n\nUse /start to begin.", message)
    return
  }

  const active = await isEventActive()
  const eventState = await getEventState()
  const knights = getAllKnights()
  const defeatedCount = Object.values(eventState.knights || {}).filter(k => k.permanentlyDead).length
  const aurstav = eventState.aurstav || {}

  const lines = [
    "╔════════════════════════════╗",
    "   THE DRAGON CURSE KING",
    "       SUMMER 2026",
    "╚════════════════════════════╝",
    "",
    `Status: ${active ? "ACTIVE" : "ENDED"}`,
    "",
    `Dragon Kin: ${active ? "ACTIVE" : "INACTIVE"}`,
    "",
    "Dragon Knights:"
  ]

  for (const knight of Object.values(knights)) {
    const state = eventState.knights?.[knight.id] || {}
    const status = state.permanentlyDead ? "DEFEATED" : "ALIVE"
    const emoji = state.permanentlyDead ? "💀" : knight.emoji
    lines.push(`${emoji} ${knight.name}`)
  }

  lines.push("")
  lines.push(`Defeated: ${defeatedCount} / 5`)
  lines.push("")
  lines.push("Final Boss:")

  if (aurstav.permanentlyDead) {
    lines.push("AURSTAV")
    lines.push("DEFEATED")
  } else if (aurstavUnlocked(eventState)) {
    lines.push("AURSTAV")
    lines.push(`PHASE ${aurstav.phase || 1}`)
    if (aurstav.raidOpen) {
      lines.push(`RAID OPEN (${(aurstav.raidPlayers || []).length}/8)`)
    }
  } else {
    lines.push("AURSTAV")
    lines.push("LOCKED")
  }

  try {
    const imageBuffer = readFileSync(EVENT_IMAGE_PATH)
    await sock.sendMessage(remoteJid, {
      image: imageBuffer,
      caption: EVENT_CAPTION
    }, { quoted: message })
  } catch (err) {
    console.error("[EVENT] Failed to send event image:", err.message)
    await sendQuotedWithFooter(sock, remoteJid, lines.join("\n"), message)
  }
}

function aurstavUnlocked(eventState) {
  const knights = Object.values(eventState.knights || {})
  return knights.length === 5 && knights.every(k => k.permanentlyDead)
}
