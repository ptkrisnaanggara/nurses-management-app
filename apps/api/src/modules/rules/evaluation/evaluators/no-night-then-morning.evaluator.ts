import { Injectable } from '@nestjs/common';
import { ShiftType } from '@nurses/shared';
import { addDays } from '../assignment.util';
import { ResolvedRule } from '../resolved-rule';
import { RuleEvaluator } from '../rule-evaluator';
import { RuleKey } from '../rule-keys';
import { RuleViolation, ScheduleContext } from '../types';

/** Blocks the classic fatigue pattern: a morning shift right after a night shift. */
@Injectable()
export class NoNightThenMorningEvaluator implements RuleEvaluator {
  readonly key = RuleKey.NO_NIGHT_THEN_MORNING;

  evaluate(rule: ResolvedRule, ctx: ScheduleContext): RuleViolation | null {
    const { proposed, existing } = ctx;

    const conflict =
      // proposed PAGI preceded by a MALAM the day before
      (proposed.shiftType === ShiftType.PAGI &&
        existing.some(
          (a) =>
            a.shiftType === ShiftType.MALAM &&
            a.date === addDays(proposed.date, -1),
        )) ||
      // proposed MALAM followed by a PAGI the next day
      (proposed.shiftType === ShiftType.MALAM &&
        existing.some(
          (a) =>
            a.shiftType === ShiftType.PAGI &&
            a.date === addDays(proposed.date, 1),
        ));

    if (conflict) {
      return {
        ruleKey: this.key,
        ruleName: rule.name,
        type: rule.type,
        category: rule.category,
        message: 'Morning shift immediately after a night shift (malam-lalu-pagi) is not allowed',
        legalReference: rule.legalReference,
      };
    }
    return null;
  }
}
