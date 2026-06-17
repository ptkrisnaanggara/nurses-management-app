import { Injectable } from '@nestjs/common';
import { ShiftType } from '@nurses/shared';
import { addDays } from '../assignment.util';
import { ResolvedRule } from '../resolved-rule';
import { RuleEvaluator } from '../rule-evaluator';
import { RuleKey } from '../rule-keys';
import { RuleViolation, ScheduleContext } from '../types';

/** Limits the run of consecutive night shifts ending at the proposed shift. */
@Injectable()
export class MaxConsecutiveNightsEvaluator implements RuleEvaluator {
  readonly key = RuleKey.MAX_CONSECUTIVE_NIGHTS;

  evaluate(rule: ResolvedRule, ctx: ScheduleContext): RuleViolation | null {
    if (ctx.proposed.shiftType !== ShiftType.MALAM) return null;
    const max = Number(rule.params.maxConsecutiveNights ?? 2);

    const nights = new Set(
      ctx.existing
        .filter((a) => a.shiftType === ShiftType.MALAM)
        .map((a) => a.date),
    );

    // Count the unbroken run of nights ending on the proposed date.
    let run = 1;
    let cursor = addDays(ctx.proposed.date, -1);
    while (nights.has(cursor)) {
      run++;
      cursor = addDays(cursor, -1);
    }

    if (run > max) {
      return {
        ruleKey: this.key,
        ruleName: rule.name,
        type: rule.type,
        category: rule.category,
        message: `${run} consecutive night shifts exceed the limit of ${max}`,
        legalReference: rule.legalReference,
      };
    }
    return null;
  }
}
