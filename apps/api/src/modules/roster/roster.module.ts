import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NursesModule } from '../nurses/nurses.module';
import { RulesModule } from '../rules/rules.module';
import { ShiftsModule } from '../shifts/shifts.module';
import { Assignment } from './entities/assignment.entity';
import { RosterPeriod } from './entities/roster-period.entity';
import { ROSTER_REPOSITORY } from './roster.repository';
import { RosterTypeOrmRepository } from './roster.typeorm.repository';
import { RosterController } from './roster.controller';
import { RosterService } from './roster.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([RosterPeriod, Assignment]),
    NursesModule,
    ShiftsModule,
    RulesModule,
  ],
  controllers: [RosterController],
  providers: [
    RosterService,
    { provide: ROSTER_REPOSITORY, useClass: RosterTypeOrmRepository },
  ],
  exports: [RosterService],
})
export class RosterModule {}
