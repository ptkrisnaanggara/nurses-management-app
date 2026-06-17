import { Rule } from './entities/rule.entity';

/** Scope chain for a given evaluation, most-specific first is resolved later. */
export interface RuleScopeContext {
  facilityId?: string;
  wardId?: string;
  roleId?: string;
  employmentClassId?: string;
  nurseId?: string;
}

/** Persistence port for rules. */
export interface RuleRepository {
  create(data: Partial<Rule>): Promise<Rule>;
  findAll(): Promise<Rule[]>;
  /** All enabled rules currently in effect for any scope ref in `ctx`. */
  findEffective(ctx: RuleScopeContext, at: Date): Promise<Rule[]>;
  countAll(): Promise<number>;
}

export const RULE_REPOSITORY = Symbol('RULE_REPOSITORY');
