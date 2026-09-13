export const RULES = {
  GAUGE_MAX: 150,
  ULT_THRESHOLD: 100,
  GAUGE_BASIC_HIT: 20,
  GAUGE_SKILL_HIT: 10,
  GAUGE_ON_HIT_TAKEN: 10,
  GAUGE_CHAIN_BONUS: 50,
  CHAIN_MUL: [1.0, 1.2, 1.5],
  CRIT_MUL: 1.5,
  STAB_MUL: 1.2,
  VARIANCE_MIN: 0.9,
  VARIANCE_MAX: 1.1,
  SWITCH_PRIORITY: 100,
  BASIC: { power: 20, critChance: 0.12 },
  SKILL1: { cooldown: 2, critChance: 0.12 },
  SKILL2: { cooldown: 3, critChance: 0.22 },
  ULTIMATE: { critChance: 0.12 },
  AI: {
    KO_BONUS: 1000,
    CHAIN_CONTINUE_BONUS: 18,
    OVERCHARGE_READY_BONUS: 12,
    SWITCH_MARGIN: 35,
    LOW_HP_RATIO: 0.35,
    BAD_EFFECTIVENESS: 0.5,
    JITTER: 4,
  },
} as const;

export const CHAIN_ORDER = ["basic", "skill1", "skill2"] as const;

export const overchargeMul = (gauge: number): number =>
  gauge < RULES.ULT_THRESHOLD
    ? 1
    : 2 +
      (gauge - RULES.ULT_THRESHOLD) / (RULES.GAUGE_MAX - RULES.ULT_THRESHOLD);
