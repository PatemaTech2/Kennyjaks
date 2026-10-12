export const NORMAL_ATTACKS = [
  `@{{name}} lunges forward with a cursed-infused jab.`,
  `@{{name}} throws a rapid straight punch.`,
  `@{{name}} closes the distance and strikes.`,
  `A flurry of blows from @{{name}}!`,
  `@{{name}} channels cursed energy into their fist.`,
  `@{{name}} launches a devastating right hook.`,
  `The air crackles as @{{name}} throws a punch.`,
  `@{{name}}'s fist glows with cursed energy.`,
  `A precise strike from @{{name}}!`,
  `@{{name}} presses the advantage with a combo.`,
  `Cursed energy flares around @{{name}}'s fist.`,
  `@{{name}} strikes with surgical precision.`,
  `The ground cracks beneath @{{name}}'s assault.`,
  `@{{name}} unleashes a flurry of punches.`,
  `A thunderous blow from @{{name}}!`,
  `@{{name}} channels their spirit into one strike.`,
  `The curse reels from @{{name}}'s attack!`,
  `@{{name}} shows no hesitation in their strike.`,
  `A wave of cursed energy emanates from @{{name}}.`,
  `@{{name}} delivers a bone-rattling punch.`,
  `The power of @{{name}}'s fist splits the air.`,
  `@{{name}} strikes with the force of a hurricane.`,
  `Cursed technique manifests in @{{name}}'s blow.`,
  `@{{name}}'s fist ignites with purple energy.`,
  `A devastating blow that shakes the ground.`,
  `@{{name}} moves like a specter, striking.`,
  `The curse barely dodges @{{name}}'s attack.`,
  `@{{name}}'s fist connects with a deafening crack.`,
  `A perfectly executed strike by @{{name}}.`,
  `The air itself screams as @{{name}} attacks.`,
  `@{{name}} channels everything into this blow.`,
  `@{{name}} strikes faster than the eye can see.`,
  `A thunderclap echoes from the impact.`,
  `@{{name}}'s cursed energy amplifies the punch.`,
  `The curse staggers from @{{name}}'s relentless assault.`,
  `A barrage that would fell a mountain.`,
  `@{{name}} strikes with the fury of a storm.`,
  `Purple black waves ripple from the impact.`,
  `@{{name}} doesn't hold back a single ounce.`,
  `@{{name}}'s fist becomes a blur of violence.`,
  `The shockwave from @{{name}}'s punch is immense.`,
  `@{{name}} delivers a final, decisive blow.`,
  `A technique-infused punch from @{{name}}!`,
  `@{{name}} strikes with the precision of a master.`,
  `The curse can barely withstand @{{name}}'s onslaught.`,
  `A bone-crushing blow that echoes.`,
  `@{{name}}'s fist becomes a comet of energy.`,
  `The curse's defenses crumble against @{{name}}.`,
  `@{{name}} presses forward without pause.`,
  `A devastating combination from @{{name}}!`
]

export const BLOCK_NARRATIONS = [
  `@{{name}} raises their guard just in time!`,
  `@{{name}} blocks the incoming attack!`,
  `A perfect block by @{{name}}!`,
  `@{{name}} absorbs the blow with their arm!`,
  `The curse's attack bounces off @{{name}}'s defense!`,
  `@{{name}} stands firm against the onslaught!`,
  `An impenetrable guard from @{{name}}!`,
  `@{{name}} parries and counters!`,
  `The shockwave of the block sends debris flying!`,
  `@{{name}}'s stance is unshakeable!`
]

export const TECHNIQUE_NARRATIONS = [
  `@{{name}} releases their cursed technique!`,
  `The technique manifests with tremendous force!`,
  `@{{name}}'s cursed energy explodes outward!`,
  `A devastating technique from @{{name}}!`,
  `@{{name}} channels their domain into this attack!`,
  `The cursed technique pierces the air!`,
  `A technique of immense power from @{{name}}!`,
  `@{{name}} releases the technique with full force!`,
  `The technique's barrier-forming properties activate!`,
  `@{{name}}'s technique tears reality apart!`
]

export const BLACK_FLASH_NARRATIONS = [
  `⚫⚡ BLACK FLASH ⚡⚫`,
  `Space distorts for 0.000001 seconds.`,
  `The cursed energy strikes at the perfect frequency.`,
  `A BLACK FLASH erupts with overwhelming force!`,
  `The space between 0.000001 seconds is weaponized.`,
  `⚫⚡ Reality fractures under the Black Flash!`,
  `The cursed energy converges into a single point.`,
  `A spatial distortion of cursed energy manifests.`,
  `The Black Flash's power exceeds all expectations!`,
  `Cursed energy density reaches critical levels.`,
  `The Black Flash tears through the fabric of space!`,
  `0.000001 seconds tore open reality itself.`,
  `The Black Flash's roar echoes across dimensions.`,
  `A concentrated explosion of cursed energy.`,
  `⚫⚡ The Black Flash's impact shakes the world!`
]

export const CURSE_TAUNTS = [
  `"You dare challenge me?"`,
  `"Foolish sorcerer."`,
  `"I'll crush you easily."`,
  `"Your cursed energy... it's laughable."`,
  `"Another bug to squash."`,
  `"How adorable, a little sorcerer."`,
  `"I can smell your fear."`,
  `"You're not worth my time."`,
  `"Is this the best you've got?"`,
  `"I'll make you suffer slowly."`
]

export const VICTORY_NARRATIONS = [
  `The curse dissolves into nothingness.`,
  `The curse's form crumbles to ash.`,
  `With a final strike, the curse is exorcised.`,
  `The curse collapses, defeated.`,
  `The curse's cursed energy dissipates.`,
  `A clean victory over the curse.`,
  `The curse lies defeated before you.`,
  `The cursed spirit is banished.`,
  `The curse's roar fades into silence.`,
  `Victory! The curse is no more.`
]

export const DEFEAT_NARRATIONS = [
  `You have been overwhelmed...`,
  `The curse stands over your fallen form.`,
  `You feel your vision growing dark...`,
  `The curse's power was too great.`,
  `You have been bested.`,
  `Your body fails to endure the curse's might.`,
  `The last thing you see is the curse's grin.`,
  `You have been exorcised by the curse.`,
  `Your body collapses as the curse claims victory.`,
  `The cursed spirit's laugh echoes as you fall.`
]

export const DODGE_NARRATIONS = [
  `@{{name}} narrowly avoids the attack!`,
  `A quick sidestep from @{{name}}!`,
  `@{{name}} ducked under the blow!`,
  `The attack whistles past @{{name}}!`,
  `@{{name}}'s reflexes save them!`,
  `A graceful dodge by @{{name}}!`,
  `@{{name}} weaves between the attacks!`,
  `The curse's attack misses by inches!`
]

export function randomFrom(pool) {
  return pool[Math.floor(Math.random() * pool.length)]
}

export function substituteTemplate(template, vars) {
  let result = template
  for (const [key, value] of Object.entries(vars)) {
    result = result.replace(new RegExp(`{{${key}}}`, "g"), value)
  }
  return result
}

export function randomAttack(player) {
  return substituteTemplate(randomFrom(NORMAL_ATTACKS), { name: player.name || "You" })
}

export function randomBlock(player) {
  return substituteTemplate(randomFrom(BLOCK_NARRATIONS), { name: player.name || "You" })
}

export function randomTechnique(player) {
  return substituteTemplate(randomFrom(TECHNIQUE_NARRATIONS), { name: player.name || "You" })
}

export function randomBlackFlash(player) {
  return substituteTemplate(randomFrom(BLACK_FLASH_NARRATIONS), { name: player.name || "You" })
}

export function randomCurseTaunt(opponent) {
  return randomFrom(CURSE_TAUNTS)
}

export function randomVictory() {
  return randomFrom(VICTORY_NARRATIONS)
}

export function randomDefeat() {
  return randomFrom(DEFEAT_NARRATIONS)
}

export function randomDodge(player) {
  return substituteTemplate(randomFrom(DODGE_NARRATIONS), { name: player.name || "You" })
}
