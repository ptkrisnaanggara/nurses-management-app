import { RuleCategory, RuleScope, RuleType } from '@nurses/shared';

/**
 * A rule after scope resolution — flattened and ready to evaluate.
 * `params` is rule-specific (e.g. { maxHoursPerWeek: 40 }).
 */
export interface ResolvedRule {
  key: string;
  name: string;
  type: RuleType;
  category: RuleCategory;
  scope: RuleScope;
  weight: number;
  params: Record<string, unknown>;
  legalReference?: string;
}
