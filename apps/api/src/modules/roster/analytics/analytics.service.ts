import { Inject, Injectable } from '@nestjs/common';
import { HolidaysService } from '../../holidays/holidays.service';
import { NursesService } from '../../nurses/nurses.service';
import { ShiftsService } from '../../shifts/shifts.service';
import { ROSTER_REPOSITORY, RosterRepository } from '../roster.repository';
import { RosterService } from '../roster.service';
import { computeFairness, FairnessReport } from './fairness';
import {
  computeNightCompliance,
  NightComplianceReport,
} from './night-compliance';

/** Read-side analytics for a roster period: fairness + women's night-work flags. */
@Injectable()
export class AnalyticsService {
  constructor(
    @Inject(ROSTER_REPOSITORY) private readonly repo: RosterRepository,
    private readonly rosterService: RosterService,
    private readonly nurses: NursesService,
    private readonly shifts: ShiftsService,
    private readonly holidays: HolidaysService,
  ) {}

  async fairness(periodId: string): Promise<FairnessReport> {
    const period = await this.rosterService.getPeriod(periodId);
    const [assignments, hours, profiles, holidays] = await Promise.all([
      this.repo.findAssignmentsByPeriod(periodId),
      this.shifts.hoursMap(period.facilityId),
      this.nurses.profilesForFacility(period.facilityId),
      this.holidays.findByYear(period.year),
    ]);
    return computeFairness(
      assignments,
      profiles.map((p) => p.id),
      hours,
      new Set(holidays.map((h) => h.date)),
    );
  }

  async nightCompliance(periodId: string): Promise<NightComplianceReport> {
    const period = await this.rosterService.getPeriod(periodId);
    const [assignments, profiles] = await Promise.all([
      this.repo.findAssignmentsByPeriod(periodId),
      this.nurses.profilesForFacility(period.facilityId),
    ]);
    const genderByNurse = new Map(profiles.map((p) => [p.id, p.gender]));
    return computeNightCompliance(assignments, genderByNurse);
  }
}
