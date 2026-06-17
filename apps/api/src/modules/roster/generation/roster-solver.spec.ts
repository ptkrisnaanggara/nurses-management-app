import {
  RuleCategory,
  RuleScope,
  RuleType,
  ShiftType,
} from '@nurses/shared';
import { RuleEngineService } from '../../rules/rule-engine.service';
import { EVALUATOR_CLASSES } from '../../rules/evaluation/evaluators';
import { RuleKey } from '../../rules/evaluation/rule-keys';
import { ResolvedRule } from '../../rules/evaluation/resolved-rule';
import { NurseProfile } from '../../rules/evaluation/types';
import { ShiftHoursMap } from '../schedule-context.builder';
import { monthDates } from './generation.service';
import { RosterSolver } from './roster-solver';

const HOURS: ShiftHoursMap = {
  [ShiftType.PAGI]: { start: '07:00', end: '14:00' },
  [ShiftType.SIANG]: { start: '14:00', end: '21:00' },
  [ShiftType.MALAM]: { start: '21:00', end: '07:00' },
};

function rule(key: string, params: Record<string, unknown> = {}): ResolvedRule {
  return {
    key,
    name: key,
    type: RuleType.HARD,
    category: RuleCategory.FATIGUE,
    scope: RuleScope.GLOBAL,
    weight: 0,
    params,
  };
}

const solver = new RosterSolver(
  new RuleEngineService(EVALUATOR_CLASSES.map((C) => new C())),
);

function nurses(n: number): NurseProfile[] {
  return Array.from({ length: n }, (_, i) => ({
    id: `n${i + 1}`,
    gender: 'F' as const,
  }));
}

describe('RosterSolver', () => {
  it('fills every shift slot when enough nurses are available', () => {
    const result = solver.solve({
      dates: monthDates(2026, 7), // 31 days
      demand: { [ShiftType.PAGI]: 2, [ShiftType.SIANG]: 2, [ShiftType.MALAM]: 2 },
      nurses: nurses(20),
      hours: HOURS,
      rules: [
        rule(RuleKey.NO_NIGHT_THEN_MORNING),
        rule(RuleKey.MAX_CONSECUTIVE_NIGHTS, { maxConsecutiveNights: 2 }),
        rule(RuleKey.MIN_REST_BETWEEN_SHIFTS, { minRestHours: 11 }),
        rule(RuleKey.MAX_HOURS_PER_WEEK, { maxHoursPerWeek: 40 }),
      ],
    });
    expect(result.unfilled).toHaveLength(0);
  });

  it('never violates a hard rule it is given (no malam-lalu-pagi)', () => {
    const result = solver.solve({
      dates: monthDates(2026, 7),
      demand: { [ShiftType.PAGI]: 1, [ShiftType.SIANG]: 1, [ShiftType.MALAM]: 1 },
      nurses: nurses(10),
      hours: HOURS,
      rules: [rule(RuleKey.NO_NIGHT_THEN_MORNING)],
    });

    const byNurse = new Map<string, typeof result.assignments>();
    for (const a of result.assignments) {
      byNurse.set(a.nurseId, [...(byNurse.get(a.nurseId) ?? []), a]);
    }
    for (const shifts of byNurse.values()) {
      const malamDates = new Set(
        shifts.filter((s) => s.shiftType === ShiftType.MALAM).map((s) => s.date),
      );
      for (const s of shifts) {
        if (s.shiftType === ShiftType.PAGI) {
          const prev = new Date(`${s.date}T00:00:00Z`);
          prev.setUTCDate(prev.getUTCDate() - 1);
          expect(malamDates.has(prev.toISOString().slice(0, 10))).toBe(false);
        }
      }
    }
  });

  it('reports unfilled slots when understaffed', () => {
    const result = solver.solve({
      dates: ['2026-07-01'],
      demand: { [ShiftType.PAGI]: 5, [ShiftType.SIANG]: 0, [ShiftType.MALAM]: 0 },
      nurses: nurses(2),
      hours: HOURS,
      rules: [],
    });
    expect(result.unfilled[0]).toMatchObject({
      shiftType: ShiftType.PAGI,
      missing: 3,
    });
  });

  it('distributes night shifts fairly across nurses', () => {
    const result = solver.solve({
      dates: monthDates(2026, 7),
      demand: { [ShiftType.PAGI]: 0, [ShiftType.SIANG]: 0, [ShiftType.MALAM]: 1 },
      nurses: nurses(10),
      hours: HOURS,
      rules: [rule(RuleKey.MAX_CONSECUTIVE_NIGHTS, { maxConsecutiveNights: 2 })],
    });
    const nightCounts = Object.values(result.fairness).map((f) => f.nights);
    const spread = Math.max(...nightCounts) - Math.min(...nightCounts);
    expect(spread).toBeLessThanOrEqual(1); // evenly spread
  });
});
