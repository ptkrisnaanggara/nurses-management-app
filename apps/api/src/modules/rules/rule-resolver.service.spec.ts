import { RuleScope, RuleType } from '@nurses/shared';
import { RuleResolverService } from './rule-resolver.service';
import { Rule } from './entities/rule.entity';

// Only reduceByKey is exercised here — it's pure, so no Redis/DB needed.
const resolver = new RuleResolverService(
  null as never,
  null as never,
);

function ruleRow(over: Partial<Rule>): Rule {
  return {
    id: Math.random().toString(),
    key: 'MAX_HOURS_PER_WEEK',
    name: 'rule',
    description: null,
    scope: RuleScope.GLOBAL,
    scopeRefId: null,
    type: RuleType.HARD,
    category: 'WORKING_HOURS' as never,
    weight: 0,
    params: { maxHoursPerWeek: 40 },
    legalReference: null,
    effectiveFrom: null,
    effectiveTo: null,
    enabled: true,
    overridable: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...over,
  } as Rule;
}

describe('RuleResolverService.reduceByKey', () => {
  it('lets a more specific scope override an overridable rule', () => {
    const resolved = resolver.reduceByKey([
      ruleRow({ scope: RuleScope.GLOBAL, params: { maxHoursPerWeek: 40 } }),
      ruleRow({ scope: RuleScope.FACILITY, params: { maxHoursPerWeek: 38 } }),
    ]);
    expect(resolved).toHaveLength(1);
    expect(resolved[0].params.maxHoursPerWeek).toBe(38);
  });

  it('keeps a locked (non-overridable) less-specific rule as a legal floor', () => {
    const resolved = resolver.reduceByKey([
      ruleRow({
        scope: RuleScope.GLOBAL,
        overridable: false,
        params: { maxHoursPerWeek: 40 },
      }),
      ruleRow({ scope: RuleScope.FACILITY, params: { maxHoursPerWeek: 48 } }),
    ]);
    expect(resolved[0].params.maxHoursPerWeek).toBe(40);
  });
});
