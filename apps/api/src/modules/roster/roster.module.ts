import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NursesModule } from '../nurses/nurses.module';
import { RulesModule } from '../rules/rules.module';
import { ShiftsModule } from '../shifts/shifts.module';
import { WardsModule } from '../wards/wards.module';
import { Assignment } from './entities/assignment.entity';
import { RosterPeriod } from './entities/roster-period.entity';
import { SwapRequest } from './swap/entities/swap-request.entity';
import { ROSTER_REPOSITORY } from './roster.repository';
import { RosterTypeOrmRepository } from './roster.typeorm.repository';
import { RosterController } from './roster.controller';
import { RosterService } from './roster.service';
import { SwapController } from './swap/swap.controller';
import { SwapService } from './swap/swap.service';
import { RosterSolver } from './generation/roster-solver';
import { GenerationService } from './generation/generation.service';
import { GenerationPublisher } from './generation/generation.publisher';
import { RosterGenerationConsumer } from './generation/roster-generation.consumer';
import { RosterJobStore } from './generation/roster-job.store';

@Module({
  imports: [
    TypeOrmModule.forFeature([RosterPeriod, Assignment, SwapRequest]),
    NursesModule,
    ShiftsModule,
    WardsModule,
    RulesModule,
  ],
  controllers: [RosterController, SwapController],
  providers: [
    RosterService,
    SwapService,
    RosterSolver,
    GenerationService,
    GenerationPublisher,
    RosterGenerationConsumer,
    RosterJobStore,
    { provide: ROSTER_REPOSITORY, useClass: RosterTypeOrmRepository },
  ],
  exports: [RosterService],
})
export class RosterModule {}
