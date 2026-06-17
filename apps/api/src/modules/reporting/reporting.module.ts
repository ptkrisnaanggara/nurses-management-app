import { Module } from '@nestjs/common';
import { FacilitiesModule } from '../facilities/facilities.module';
import { HolidaysModule } from '../holidays/holidays.module';
import { NursesModule } from '../nurses/nurses.module';
import { RosterModule } from '../roster/roster.module';
import { ShiftsModule } from '../shifts/shifts.module';
import { ReportingController } from './reporting.controller';
import { ReportingService } from './reporting.service';

@Module({
  imports: [
    RosterModule,
    ShiftsModule,
    HolidaysModule,
    FacilitiesModule,
    NursesModule,
  ],
  controllers: [ReportingController],
  providers: [ReportingService],
})
export class ReportingModule {}
