import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  IsNull,
  LessThanOrEqual,
  MoreThanOrEqual,
  Or,
  Repository,
} from 'typeorm';
import { RuleScope } from '@nurses/shared';
import { Rule } from './entities/rule.entity';
import { RuleRepository, RuleScopeContext } from './rule.repository';

/** TypeORM adapter implementing the RuleRepository port. */
@Injectable()
export class RuleTypeOrmRepository implements RuleRepository {
  constructor(
    @InjectRepository(Rule)
    private readonly repo: Repository<Rule>,
  ) {}

  create(data: Partial<Rule>): Promise<Rule> {
    return this.repo.save(this.repo.create(data));
  }

  findAll(): Promise<Rule[]> {
    return this.repo.find({ order: { category: 'ASC', name: 'ASC' } });
  }

  countAll(): Promise<number> {
    return this.repo.count();
  }

  async findEffective(ctx: RuleScopeContext, at: Date): Promise<Rule[]> {
    // Collect candidate scope refs; GLOBAL rules (null ref) always apply.
    const refs = [
      ctx.facilityId,
      ctx.wardId,
      ctx.roleId,
      ctx.employmentClassId,
      ctx.nurseId,
    ].filter((v): v is string => Boolean(v));

    const rules = await this.repo.find({
      where: [
        // GLOBAL rules
        {
          scope: RuleScope.GLOBAL,
          enabled: true,
          effectiveFrom: Or(IsNull(), LessThanOrEqual(at)),
          effectiveTo: Or(IsNull(), MoreThanOrEqual(at)),
        },
        // Scoped rules whose ref matches the context
        ...(refs.length
          ? refs.map((ref) => ({
              scopeRefId: ref,
              enabled: true,
              effectiveFrom: Or(IsNull(), LessThanOrEqual(at)),
              effectiveTo: Or(IsNull(), MoreThanOrEqual(at)),
            }))
          : []),
      ],
    });
    return rules;
  }
}
