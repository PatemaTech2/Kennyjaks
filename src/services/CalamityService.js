const CALAMITY_REP_THRESHOLD = 10000

export function isCalamityLevel(player) {
  const grade = player.grade !== undefined && player.grade !== null ? player.grade : 4
  const rep = player.reputation || 0
  return grade === 0 && rep >= CALAMITY_REP_THRESHOLD
}

export function getCalamityStatus(player) {
  if (isCalamityLevel(player)) {
    return "CALAMITY-LEVEL SORCERER"
  }
  return null
}

export function getCalamityDialogue(playerName) {
  const name = playerName || "Sorcerer"
  const variations = [
    [
      "The curse suddenly stops.",
      "",
      `"...Wait."`,
      "",
      "It looks at you again.",
      "",
      `"${name}..."`,
      "",
      '"You\'re the Calamity-Level Sorcerer."',
      "",
      '"I\'ve heard your name."'
    ],
    [
      `"..."`,
      "",
      `"That name... ${name}..."`,
      "",
      '"The Calamity-Level Sorcerer..."',
      "",
      '"The legends were true."'
    ],
    [
      "The curse freezes mid-step.",
      "",
      `"You..."`,
      "",
      `"You're ${name}."`,
      "",
      '"I can feel it... that cursed energy."',
      "",
      '"Calamity-level... no wonder..."'
    ],
    [
      `"Wait."`,
      "",
      '"Something is different about you."',
      "",
      `"You're ${name}, aren't you?"`,
      "",
      '"The Calamity-Level Sorcerer..."',
      "",
      '"I\'ve heard stories."'
    ]
  ]
  return variations[Math.floor(Math.random() * variations.length)]
}

export function getCalamityPersonalityDialogue(personality, playerName) {
  const name = playerName || "Sorcerer"
  const p = (personality || "default").toLowerCase()
  const pool = {
    fearful: [
      [
        '"...No."',
        "",
        `"That's ${name}..."`,
        "",
        '"I\'m not fighting that monster."',
        "",
        '"I\'m leaving."'
      ],
      [
        '"N-no..."',
        "",
        `"You're ${name}..."`,
        "",
        '"The Calamity-Level Sorcerer...?"',
        "",
        '"I-I can\'t fight that!"'
      ]
    ],
    arrogant: [
      [
        `"So you're ${name}."`,
        "",
        '"The so-called Calamity-Level Sorcerer?"',
        "",
        '"Let\'s see whether you\'re actually worth the reputation."'
      ],
      [
        `"${name}..."`,
        "",
        '"I\'ve heard your name."',
        "",
        '"Calamity-Level? Pfft. Let\'s put that to the test."'
      ]
    ],
    intelligent: [
      [
        '"I know that cursed energy."',
        "",
        `"So you're the one everyone's been talking about."`,
        "",
        `"${name}, the Calamity-Level Sorcerer."`,
        "",
        '"This should be... instructive."'
      ],
      [
        '"Interesting."',
        "",
        `"You're ${name}."`,
        "",
        '"The Calamity-Level Sorcerer... finally, a worthy specimen."'
      ]
    ],
    terrified: [
      [
        '"...Calamity."',
        "",
        "The curse begins backing away.",
        "",
        '"Nope. I\'m leaving."'
      ],
      [
        '"T-That\'s..."',
        "",
        `"${name}..."`,
        "",
        '"CALAMITY-LEVEL?!',
        "",
        '"I\'m out!"'
      ]
    ]
  }

  const personalityPool = pool[p] || pool["arrogant"]
  return personalityPool[Math.floor(Math.random() * personalityPool.length)]
}

export function getCalamityEscapeDialogue(playerName) {
  const name = playerName || "Sorcerer"
  const variations = [
    [
      "⚠️ THE CURSE IS TRYING TO ESCAPE",
      "",
      "It recognizes your name.",
      "",
      `"I've heard enough."`,
      "",
      '"I\'m not dying here."'
    ],
    [
      "⚠️ THE CURSE IS TRYING TO ESCAPE",
      "",
      `"${name}..."`,
      "",
      '"No... not against you."',
      "",
      '"I\'m out of here!"'
    ],
      [
        "⚠️ THE CURSE IS TRYING TO ESCAPE",
        "",
        '"Wait wait wait!"',
        "",
        `"You're ${name}?!"`,
        "",
        '"I didn\'t sign up for this!"'
      ]
  ]
  return variations[Math.floor(Math.random() * variations.length)]
}

export function getCalamityBattleOpening(playerName) {
  const name = playerName || "Sorcerer"
  return [
    "╔══════════════════════════════╗",
    "      CALAMITY ENCOUNTER",
    "╚══════════════════════════════╝",
    "",
    "The curse recognizes you.",
    "",
    `"${name}..."`,
    "",
    '"Calamity-Level Sorcerer."',
    "",
    '"So the rumors were true."',
    "",
    "The curse raises its guard.",
    "",
    '"Fine."',
    "",
    '"Let\'s see which one of us is still standing."'
  ]
}

export function getEscapeResultDialogue(escaped) {
  if (escaped) {
    return [
      "The curse escapes!",
      "",
      "It got away... for now."
    ]
  }
  return [
    "The curse attempts to escape.",
    "",
    "Your luck turns the situation against it.",
    "",
    "ESCAPE FAILED.",
    "",
    "The curse is trapped.",
    "",
    "The battle begins."
  ]
}
