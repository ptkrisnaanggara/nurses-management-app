import {
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { DEFAULT_SHIFT_HOURS, ShiftType } from '@nurses/shared';
import { NursesService } from '../../nurses/nurses.service';
import { ShiftsService } from '../../shifts/shifts.service';
import { WardsService } from '../../wards/wards.service';
import { RuleResolverService } from '../../rules/rule-resolver.service';
import { ROSTER_REPOSITORY, RosterRepository } from '../roster.repository';
import { ShiftHoursMap } from '../schedule-context.builder';
import { RosterSolver, SolveResult } from './roster-solver';

/** Orchestrates a full roster generation for one period (runs in the worker). */
@Injectable()
export class GenerationService {
  private readonly logger = new Logger(GenerationService.name);

  constructor(
    @Inject(ROSTER_REPOSITORY) private readonly repo: RosterRepository,
    private readonly wards: WardsService,
    private readonly nurses: NursesService,
    private readonly shifts: ShiftsService,
    private readonly resolver: RuleResolverService,
    private readonly solver: RosterSolver,
  ) {}

  async generate(periodId: string): Promise<SolveResult> {
    const period = await this.repo.findPeriodById(periodId);
    if (!period) throw new NotFoundException(`Roster period ${periodId} not found`);

    const ward = await this.wards.findOne(period.wardId);
    const nurses = await this.nurses.profilesForFacility(period.facilityId);
    const hours = await this.shiftHours(period.facilityId);
    const rules = await this.resolver.resolve({
      facilityId: period.facilityId,
      wardId: period.wardId,
    });
    const existing = await this.repo.findAssignmentsByPeriod(periodId);

    const result = this.solver.solve({
      dates: monthDates(period.year, period.month),
      demand: {
        [ShiftType.PAGI]: ward.shiftDemand.pagi,
        [ShiftType.SIANG]: ward.shiftDemand.siang,
        [ShiftType.MALAM]: ward.shiftDemand.malam,
      },
      nurses,
      hours,
      rules,
      preassigned: existing.map((a) => ({
        nurseId: a.nurseId,
        date: a.date,
        shiftType: a.shiftType,
      })),
    });

    for (const a of result.assignments) {
      await this.repo.addAssignment({ rosterPeriodId: periodId, ...a });
    }

    this.logger.log(
      `Generated ${result.assignments.length} assignments for period ${periodId} (${result.unfilled.length} unfilled slots)`,
    );
    return result;
  }

  private async shiftHours(facilityId: string): Promise<ShiftHoursMap> {
    const map: ShiftHoursMap = {
      [ShiftType.PAGI]: DEFAULT_SHIFT_HOURS[ShiftType.PAGI],
      [ShiftType.SIANG]: DEFAULT_SHIFT_HOURS[ShiftType.SIANG],
      [ShiftType.MALAM]: DEFAULT_SHIFT_HOURS[ShiftType.MALAM],
    };
    for (const def of await this.shifts.findByFacility(facilityId)) {
      if (def.active) map[def.shiftType] = { start: def.startTime, end: def.endTime };
    }
    return map;
  }
}

/** All `YYYY-MM-DD` dates in a month. */
export function monthDates(year: number, month: number): string[] {
  const days = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return Array.from({ length: days }, (_, i) => {
    const d = String(i + 1).padStart(2, '0');
    const m = String(month).padStart(2, '0');
    return `${year}-${m}-${d}`;
  });
}
