import {
  RuleCategory,
  RuleScope,
  RuleType,
  ShiftType,
} from '@nurses/shared';
import { RuleEngineService } from './rule-engine.service';
import { ResolvedRule } from './evaluation/resolved-rule';
import { EVALUATOR_CLASSES } from './evaluation/evaluators';
import { RuleKey } from './evaluation/rule-keys';
import { Assignment, ScheduleContext } from './evaluation/types';

function rule(partial: Partial<ResolvedRule> & { key: string }): ResolvedRule {
  return {
    name: partial.key,
    type: RuleType.HARD,
    category: RuleCategory.WORKING_HOURS,
    scope: RuleScope.GLOBAL,
    weight: 0,
    params: {},
    ...partial,
  };
}

// Instantiate evaluators directly (they are plain classes, no DI needed).
const engine = new RuleEngineService(EVALUATOR_CLASSES.map((C) => new C()));

const pagi = (date: string, nurseId = 'n1'): Assignment => ({
  nurseId,
  date,
  shiftType: ShiftType.PAGI,
  startsAt: `${date}T07:00:00Z`,
  endsAt: `${date}T14:00:00Z`,
});
const malam = (date: string, nurseId = 'n1'): Assignment => {
  const next = new Date(`${date}T00:00:00Z`);
  next.setUTCDate(next.getUTCDate() + 1);
  return {
    nurseId,
    date,
    shiftType: ShiftType.MALAM,
    startsAt: `${date}T21:00:00Z`,
    endsAt: `${next.toISOString().slice(0, 10)}T07:00:00Z`,
  };
};

const nurse = (over: Partial<ScheduleContext['nurse']> = {}) => ({
  id: 'n1',
  gender: 'F' as const,
  ...over,
});

describe('RuleEngineService', () => {
  it('allows a clean assignment with no violations', () => {
    const ctx: ScheduleContext = {
      nurse: nurse(),
      proposed: pagi('2026-06-20'),
      existing: [],
    };
    const result = engine.evaluate(
      [rule({ key: RuleKey.MAX_HOURS_PER_WEEK, params: { maxHoursPerWeek: 40 } })],
      ctx,
    );
    expect(result.allowed).toBe(true);
    expect(result.violations).toHaveLength(0);
  });

  it('blocks malam-lalu-pagi (morning right after a night)', () => {
    const ctx: ScheduleContext = {
      nurse: nurse(),
      proposed: pagi('2026-06-21'),
      existing: [malam('2026-06-20')],
    };
    const result = engine.evaluate(
      [rule({ key: RuleKey.NO_NIGHT_THEN_MORNING, category: RuleCategory.FATIGUE })],
      ctx,
    );
    expect(result.allowed).toBe(false);
    expect(result.violations[0].ruleKey).toBe(RuleKey.NO_NIGHT_THEN_MORNING);
  });

  it('enforces the 40h weekly cap', () => {
    // 5 existing night shifts (10h each = 50h) in the same week + proposed.
    const existing = [
      malam('2026-06-15'),
      malam('2026-06-16'),
      malam('2026-06-17'),
      malam('2026-06-18'),
      malam('2026-06-19'),
    ];
    const ctx: ScheduleContext = {
      nurse: nurse(),
      proposed: pagi('2026-06-20'),
      existing,
    };
    const result = engine.evaluate(
      [rule({ key: RuleKey.MAX_HOURS_PER_WEEK, params: { maxHoursPerWeek: 40 } })],
      ctx,
    );
    expect(result.allowed).toBe(false);
  });

  it('blocks night shifts for women under 18', () => {
    const ctx: ScheduleContext = {
      nurse: nurse({ birthDate: '2010-06-20' }), // age 16 on shift date
      proposed: malam('2026-06-20'),
      existing: [],
    };
    const result = engine.evaluate(
      [
        rule({
          key: RuleKey.UNDER_18_NO_NIGHT,
          type: RuleType.HARD,
          category: RuleCategory.GENDER_PROTECTION,
        }),
      ],
      ctx,
    );
    expect(result.allowed).toBe(false);
    expect(result.violations[0].legalReference).toContain('Pasal 76');
  });

  it('blocks night shifts for medically-flagged pregnant nurses', () => {
    const ctx: ScheduleContext = {
      nurse: nurse({ isPregnant: true }),
      proposed: malam('2026-06-20'),
      existing: [],
    };
    const result = engine.evaluate(
      [rule({ key: RuleKey.PREGNANT_NO_NIGHT, category: RuleCategory.GENDER_PROTECTION })],
      ctx,
    );
    expect(result.allowed).toBe(false);
  });

  it('caps consecutive night shifts', () => {
    const ctx: ScheduleContext = {
      nurse: nurse(),
      proposed: malam('2026-06-20'),
      existing: [malam('2026-06-18'), malam('2026-06-19')],
    };
    const result = engine.evaluate(
      [rule({ key: RuleKey.MAX_CONSECUTIVE_NIGHTS, params: { maxConsecutiveNights: 2 } })],
      ctx,
    );
    expect(result.allowed).toBe(false); // would be the 3rd consecutive night
  });
});
