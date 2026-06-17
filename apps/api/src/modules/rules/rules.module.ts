import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Rule } from './entities/rule.entity';
import { evaluatorProviders } from './evaluation/evaluators';
import { RuleEngineService } from './rule-engine.service';
import { RuleResolverService } from './rule-resolver.service';
import { RULE_REPOSITORY } from './rule.repository';
import { RuleTypeOrmRepository } from './rule.typeorm.repository';
import { RulesController } from './rules.controller';
import { RulesService } from './rules.service';

@Module({
  imports: [TypeOrmModule.forFeature([Rule])],
  controllers: [RulesController],
  providers: [
    RulesService,
    RuleEngineService,
    RuleResolverService,
    { provide: RULE_REPOSITORY, useClass: RuleTypeOrmRepository },
    ...evaluatorProviders,
  ],
  exports: [RulesService, RuleEngineService, RuleResolverService],
})
export class RulesModule {}
