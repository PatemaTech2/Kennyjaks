export function pickNarrationTone(context = {}) {
  const hasBlackFlash = context.hasBlackFlash
  const hasDomain = context.hasDomain
  const isBoss = context.isBoss
  const momentumSwing = context.momentumSwing || 0

  if (hasBlackFlash && hasDomain) return "legendary_clash"
  if (hasBlackFlash) return "black_flash"
  if (hasDomain) return "domain_epic"
  if (isBoss && momentumSwing >= 20) return "boss_swing"
  if (momentumSwing >= 25) return "momentum_shift"
  return "standard"
}

export function getNarrationTemplate(tone, enemyName) {
  const templates = {
    standard: {
      attack: [
        `Your strike cuts through the air toward ${enemyName}.`,
        `You press the attack against ${enemyName}.`,
        `${enemyName} braces as you close the distance.`
      ],
      defend: [
        `You steady your breathing and raise your guard.`,
        `You choose restraint, watching ${enemyName} carefully.`
      ],
      dodge: [
        `You shift your weight, looking for an opening.`,
        `You keep your distance, measuring ${enemyName}'s rhythm.`
      ]
    },
    black_flash: {
      attack: [
        `Time distorts. Your strike lands with a thunderclap of cursed energy.`,
        `A perfect instant. Your blow detonates against ${enemyName}.`
      ]
    },
    domain_epic: {
      attack: [
        `The domain swallows the battlefield. Every cut echoes with absolute sure-hit force.`,
        `Within the expanded domain, ${enemyName} cannot escape your technique.`
      ]
    },
    boss_swing: {
      attack: [
        `The ground shakes. You refuse to yield against ${enemyName}.`,
        `${enemyName} is powerful, but you keep pushing forward.`
      ]
    },
    momentum_shift: {
      attack: [
        `The momentum is turning. You build on the pressure.`,
        `You can feel the tide shifting. ${enemyName} is reacting now.`
      ]
    },
    legendary_clash: {
      attack: [
        `This moment will be remembered. ${enemyName} meets you in a clash of overwhelming force.`,
        `Legends are forged here. Both of you pour everything into this exchange.`
      ]
    }
  }

  const group = templates[tone] || templates.standard
  const key = ["attack", "defend", "dodge"][Math.floor(Math.random() * 3)]
  const options = group[key] || templates.standard[key]
  return options[Math.floor(Math.random() * options.length)]
}

export function getFallbackNarration(enemyName) {
  return `The battle continues against ${enemyName}.`
}
