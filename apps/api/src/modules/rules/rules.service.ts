import { Inject, Injectable, Logger } from '@nestjs/common';
import { DEFAULT_INDONESIA_RULES } from './default-rules';
import { Rule } from './entities/rule.entity';
import { RuleEngineService } from './rule-engine.service';
import { RuleResolverService } from './rule-resolver.service';
import { RULE_REPOSITORY, RuleRepository, RuleScopeContext } from './rule.repository';
import { EvaluationResult, ScheduleContext } from './evaluation/types';

@Injectable()
export class RulesService {
  private readonly logger = new Logger(RulesService.name);

  constructor(
    @Inject(RULE_REPOSITORY) private readonly rules: RuleRepository,
    private readonly resolver: RuleResolverService,
    private readonly engine: RuleEngineService,
  ) {}

  findAll(): Promise<Rule[]> {
    return this.rules.findAll();
  }

  /** Resolve the effective rules for a scope and check one proposed assignment. */
  async evaluate(
    scope: RuleScopeContext,
    ctx: ScheduleContext,
  ): Promise<EvaluationResult> {
    const resolved = await this.resolver.resolve(scope);
    return this.engine.evaluate(resolved, ctx);
  }

  /** Seed the Indonesia default rule set if the table is empty (idempotent). */
  async seedDefaults(): Promise<number> {
    const count = await this.rules.countAll();
    if (count > 0) {
      this.logger.log(`Rules already present (${count}); skipping seed.`);
      return 0;
    }
    for (const rule of DEFAULT_INDONESIA_RULES) {
      await this.rules.create(rule);
    }
    await this.resolver.invalidateAll();
    this.logger.log(`Seeded ${DEFAULT_INDONESIA_RULES.length} default rules.`);
    return DEFAULT_INDONESIA_RULES.length;
  }
}
