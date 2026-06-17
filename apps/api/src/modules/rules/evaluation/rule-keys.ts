/** Canonical rule keys. A rule row's `key` maps to exactly one evaluator. */
export const RuleKey = {
  MAX_HOURS_PER_WEEK: 'MAX_HOURS_PER_WEEK',
  MIN_REST_BETWEEN_SHIFTS: 'MIN_REST_BETWEEN_SHIFTS',
  NO_NIGHT_THEN_MORNING: 'NO_NIGHT_THEN_MORNING',
  MAX_CONSECUTIVE_NIGHTS: 'MAX_CONSECUTIVE_NIGHTS',
  UNDER_18_NO_NIGHT: 'UNDER_18_NO_NIGHT',
  PREGNANT_NO_NIGHT: 'PREGNANT_NO_NIGHT',
} as const;

export type RuleKeyType = (typeof RuleKey)[keyof typeof RuleKey];
