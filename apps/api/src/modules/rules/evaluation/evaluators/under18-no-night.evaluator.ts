import { Injectable } from '@nestjs/common';
import { ShiftType } from '@nurses/shared';
import { ageOn } from '../assignment.util';
import { ResolvedRule } from '../resolved-rule';
import { RuleEvaluator } from '../rule-evaluator';
import { RuleKey } from '../rule-keys';
import { RuleViolation, ScheduleContext } from '../types';

/** UU 13/2003 Pasal 76(1): women under 18 may not work nights (23:00–07:00). */
@Injectable()
export class Under18NoNightEvaluator implements RuleEvaluator {
  readonly key = RuleKey.UNDER_18_NO_NIGHT;

  evaluate(rule: ResolvedRule, ctx: ScheduleContext): RuleViolation | null {
    const { nurse, proposed } = ctx;
    if (proposed.shiftType !== ShiftType.MALAM) return null;
    if (nurse.gender !== 'F' || !nurse.birthDate) return null;

    if (ageOn(nurse.birthDate, proposed.date) < 18) {
      return {
        ruleKey: this.key,
        ruleName: rule.name,
        type: rule.type,
        category: rule.category,
        message: 'Female workers under 18 may not be scheduled for night shifts',
        legalReference: rule.legalReference ?? 'UU 13/2003 Pasal 76(1)',
      };
    }
    return null;
  }
}
