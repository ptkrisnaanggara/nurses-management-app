import { Inject, Injectable } from '@nestjs/common';
import { RuleType } from '@nurses/shared';
import { ResolvedRule } from './evaluation/resolved-rule';
import { RULE_EVALUATORS, RuleEvaluator } from './evaluation/rule-evaluator';
import { EvaluationResult, RuleViolation, ScheduleContext } from './evaluation/types';

/**
 * Runs the applicable resolved rules against a proposed assignment.
 * Dispatch is by rule key → evaluator, so adding a rule type never touches
 * this class (Open/Closed).
 */
@Injectable()
export class RuleEngineService {
  private readonly byKey: Map<string, RuleEvaluator>;

  constructor(
    @Inject(RULE_EVALUATORS) evaluators: RuleEvaluator[],
  ) {
    this.byKey = new Map(evaluators.map((e) => [e.key, e]));
  }

  evaluate(rules: ResolvedRule[], ctx: ScheduleContext): EvaluationResult {
    const violations: RuleViolation[] = [];

    for (const rule of rules) {
      const evaluator = this.byKey.get(rule.key);
      if (!evaluator) continue; // unknown key → not enforced (logged upstream)
      const violation = evaluator.evaluate(rule, ctx);
      if (violation) violations.push(violation);
    }

    const hard = violations.filter((v) => v.type === RuleType.HARD);
    const softScore = violations
      .filter((v) => v.type === RuleType.SOFT)
      .reduce((sum, v) => sum + (v.scoreDelta ?? 0), 0);

    return { violations, allowed: hard.length === 0, softScore };
  }
}
