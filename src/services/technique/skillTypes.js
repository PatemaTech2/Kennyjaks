export const SKILL_TYPES = {
  ACTIVE: "ACTIVE",
  PASSIVE: "PASSIVE",
  DEFENSIVE: "DEFENSIVE",
  COUNTER: "COUNTER",
  MOVEMENT: "MOVEMENT",
  SUMMON: "SUMMON",
  BUFF: "BUFF",
  DEBUFF: "DEBUFF",
  DOMAIN: "DOMAIN",
  REVERSAL: "REVERSAL",
  ULTIMATE: "ULTIMATE",
  REACTION: "REACTION"
}

export function isPassive(type) {
  return type === SKILL_TYPES.PASSIVE
}

export function isActive(type) {
  return type === SKILL_TYPES.ACTIVE || type === SKILL_TYPES.ULTIMATE || type === SKILL_TYPES.DOMAIN
}

export function isDefensive(type) {
  return type === SKILL_TYPES.DEFENSIVE || type === SKILL_TYPES.COUNTER || type === SKILL_TYPES.REACTION
}
