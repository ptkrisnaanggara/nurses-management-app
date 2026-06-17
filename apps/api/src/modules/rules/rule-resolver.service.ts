import { Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { RuleScope } from '@nurses/shared';
import { REDIS_CLIENT } from '../../redis/redis.constants';
import { Rule } from './entities/rule.entity';
import { ResolvedRule } from './evaluation/resolved-rule';
import {
  RULE_REPOSITORY,
  RuleRepository,
  RuleScopeContext,
} from './rule.repository';

/** Most-specific scope wins. Higher number = more specific. */
const PRECEDENCE: Record<RuleScope, number> = {
  [RuleScope.GLOBAL]: 0,
  [RuleScope.FACILITY]: 1,
  [RuleScope.WARD]: 2,
  [RuleScope.EMPLOYMENT_CLASS]: 3,
  [RuleScope.ROLE]: 4,
  [RuleScope.INDIVIDUAL]: 5,
};

const CACHE_TTL_SECONDS = 300;

@Injectable()
export class RuleResolverService {
  constructor(
    @Inject(RULE_REPOSITORY) private readonly rules: RuleRepository,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) {}

  /**
   * Resolve the effective rule set for a scope context: one rule per key,
   * choosing the most specific scope unless a less-specific rule is locked
   * (overridable = false), which models a non-negotiable legal floor.
   */
  async resolve(ctx: RuleScopeContext, at = new Date()): Promise<ResolvedRule[]> {
    const cacheKey = this.cacheKey(ctx);
    const cached = await this.redis.get(cacheKey).catch(() => null);
    if (cached) return JSON.parse(cached) as ResolvedRule[];

    const effective = await this.rules.findEffective(ctx, at);
    const resolved = this.reduceByKey(effective);

    await this.redis
      .set(cacheKey, JSON.stringify(resolved), 'EX', CACHE_TTL_SECONDS)
      .catch(() => undefined);
    return resolved;
  }

  /** Invalidate cached resolutions (call after any rule edit). */
  async invalidateAll(): Promise<void> {
    const keys = await this.redis.keys('rules:resolved:*').catch(() => []);
    if (keys.length) await this.redis.del(...keys);
  }

  /** Pure reduction — exposed for unit testing without Redis/DB. */
  reduceByKey(rules: Rule[]): ResolvedRule[] {
    const winners = new Map<string, Rule>();

    const ascending = [...rules].sort(
      (a, b) => PRECEDENCE[a.scope] - PRECEDENCE[b.scope],
    );

    for (const rule of ascending) {
      const current = winners.get(rule.key);
      if (!current) {
        winners.set(rule.key, rule);
      } else if (current.overridable) {
        // current is less specific (ascending order) and may be overridden
        winners.set(rule.key, rule);
      }
      // else: current is a locked, less-specific rule → keep it
    }

    return [...winners.values()].map((r) => ({
      key: r.key,
      name: r.name,
      type: r.type,
      category: r.category,
      scope: r.scope,
      weight: r.weight,
      params: r.params,
      legalReference: r.legalReference ?? undefined,
    }));
  }

  private cacheKey(ctx: RuleScopeContext): string {
    return `rules:resolved:${[
      ctx.facilityId,
      ctx.wardId,
      ctx.roleId,
      ctx.employmentClassId,
      ctx.nurseId,
    ]
      .map((v) => v ?? '-')
      .join(':')}`;
  }
}
