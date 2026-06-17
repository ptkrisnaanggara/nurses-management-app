import { Injectable } from '@nestjs/common';
import { assignmentHours, isoWeekKey } from '../assignment.util';
import { ResolvedRule } from '../resolved-rule';
import { RuleEvaluator } from '../rule-evaluator';
import { RuleKey } from '../rule-keys';
import { RuleViolation, ScheduleContext } from '../types';

/** Caps total scheduled hours in the ISO week of the proposed shift. */
@Injectable()
export class MaxHoursPerWeekEvaluator implements RuleEvaluator {
  readonly key = RuleKey.MAX_HOURS_PER_WEEK;

  evaluate(rule: ResolvedRule, ctx: ScheduleContext): RuleViolation | null {
    const max = Number(rule.params.maxHoursPerWeek ?? 40);
    const week = isoWeekKey(ctx.proposed.date);

    const total = [...ctx.existing, ctx.proposed]
      .filter((a) => isoWeekKey(a.date) === week)
      .reduce((sum, a) => sum + assignmentHours(a), 0);

    if (total > max) {
      return {
        ruleKey: this.key,
        ruleName: rule.name,
        type: rule.type,
        category: rule.category,
        message: `Weekly hours ${total.toFixed(1)}h exceed the ${max}h limit`,
        legalReference: rule.legalReference,
      };
    }
    return null;
  }
}
