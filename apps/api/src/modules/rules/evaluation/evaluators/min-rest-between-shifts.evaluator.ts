import { Injectable } from '@nestjs/common';
import { restGapHours } from '../assignment.util';
import { ResolvedRule } from '../resolved-rule';
import { RuleEvaluator } from '../rule-evaluator';
import { RuleKey } from '../rule-keys';
import { RuleViolation, ScheduleContext } from '../types';

/** Requires a minimum rest gap between the proposed shift and any neighbour. */
@Injectable()
export class MinRestBetweenShiftsEvaluator implements RuleEvaluator {
  readonly key = RuleKey.MIN_REST_BETWEEN_SHIFTS;

  evaluate(rule: ResolvedRule, ctx: ScheduleContext): RuleViolation | null {
    const minRest = Number(rule.params.minRestHours ?? 11);

    for (const other of ctx.existing) {
      if (other === ctx.proposed) continue;
      const gap = restGapHours(ctx.proposed, other);
      if (gap < minRest) {
        return {
          ruleKey: this.key,
          ruleName: rule.name,
          type: rule.type,
          category: rule.category,
          message: `Only ${gap.toFixed(1)}h rest before/after ${other.shiftType} on ${other.date}; ${minRest}h required`,
          legalReference: rule.legalReference,
        };
      }
    }
    return null;
  }
}
