import {
  EmploymentClass,
  PkLevel,
  RuleCategory,
  RuleType,
  ShiftType,
} from '@nurses/shared';

/** A single shift a nurse is (or would be) assigned to. */
export interface Assignment {
  nurseId: string;
  /** Calendar date of the shift, ISO `YYYY-MM-DD` (the date the shift starts). */
  date: string;
  shiftType: ShiftType;
  /** Shift start/end as ISO datetime strings (end may be on the next day). */
  startsAt: string;
  endsAt: string;
}

/** Minimal nurse facts the rule engine needs (no PII beyond what's required). */
export interface NurseProfile {
  id: string;
  gender: 'M' | 'F';
  birthDate?: string;
  isPregnant?: boolean;
  pkLevel?: PkLevel;
  employmentClass?: EmploymentClass;
  weeklyContractHours?: number;
}

/**
 * Everything an evaluator needs to judge a proposed assignment: the nurse,
 * the shift being proposed, and the surrounding assignments already on the
 * roster (used for rest gaps, weekly hours, consecutive nights, etc.).
 */
export interface ScheduleContext {
  nurse: NurseProfile;
  proposed: Assignment;
  existing: Assignment[];
}

export interface RuleViolation {
  ruleKey: string;
  ruleName: string;
  type: RuleType;
  category: RuleCategory;
  message: string;
  legalReference?: string;
  /** For SOFT rules: penalty added to the schedule's cost (higher = worse). */
  scoreDelta?: number;
}

export interface EvaluationResult {
  violations: RuleViolation[];
  /** True when no HARD rule is violated — i.e. the assignment is legal. */
  allowed: boolean;
  /** Sum of SOFT scoreDeltas — lower is a better schedule. */
  softScore: number;
}
