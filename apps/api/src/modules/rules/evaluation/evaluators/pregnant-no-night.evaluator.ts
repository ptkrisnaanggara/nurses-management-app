import { Injectable } from '@nestjs/common';
import { ShiftType } from '@nurses/shared';
import { ResolvedRule } from '../resolved-rule';
import { RuleEvaluator } from '../rule-evaluator';
import { RuleKey } from '../rule-keys';
import { RuleViolation, ScheduleContext } from '../types';

/**
 * UU 13/2003 Pasal 76(2): a pregnant worker medically flagged as at-risk must
 * not work nights. Here the `isPregnant` flag is treated as the at-risk marker
 * (facility policy may set it only after a doctor's certificate).
 */
@Injectable()
export class PregnantNoNightEvaluator implements RuleEvaluator {
  readonly key = RuleKey.PREGNANT_NO_NIGHT;

  evaluate(rule: ResolvedRule, ctx: ScheduleContext): RuleViolation | null {
    const { nurse, proposed } = ctx;
    if (proposed.shiftType !== ShiftType.MALAM) return null;
    if (!nurse.isPregnant) return null;

    return {
      ruleKey: this.key,
      ruleName: rule.name,
      type: rule.type,
      category: rule.category,
      message: 'Medically-flagged pregnant workers may not be scheduled for night shifts',
      legalReference: rule.legalReference ?? 'UU 13/2003 Pasal 76(2)',
    };
  }
}
