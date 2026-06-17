import { ResolvedRule } from './resolved-rule';
import { RuleViolation, ScheduleContext } from './types';

/**
 * Strategy interface for one rule. Each evaluator handles exactly one `key`,
 * matching a rule row's key. New rule types are added as new evaluators —
 * the engine never changes (Open/Closed).
 */
export interface RuleEvaluator {
  /** Must match the `key` of the rules this evaluator handles. */
  readonly key: string;
  /** Returns a violation, or null if the proposed assignment satisfies the rule. */
  evaluate(rule: ResolvedRule, ctx: ScheduleContext): RuleViolation | null;
}

/** Multi-provider DI token collecting every RuleEvaluator. */
export const RULE_EVALUATORS = Symbol('RULE_EVALUATORS');
