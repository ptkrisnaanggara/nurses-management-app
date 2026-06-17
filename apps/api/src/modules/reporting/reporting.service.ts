import { Injectable } from '@nestjs/common';
import { ShiftType, WorkWeekScheme } from '@nurses/shared';
import { FacilitiesService } from '../facilities/facilities.service';
import { HolidaysService } from '../holidays/holidays.service';
import { NursesService } from '../nurses/nurses.service';
import { ShiftsService } from '../shifts/shifts.service';
import { RosterService } from '../roster/roster.service';
import { isoWeekKey } from '../rules/evaluation/assignment.util';
import { holidayOvertimeUnits, weeklyOvertimeHours } from './overtime';

type HoursMap = Partial<Record<ShiftType, { start: string; end: string }>>;

function durationHours(shiftType: ShiftType, hours: HoursMap): number {
  if (shiftType === ShiftType.LIBUR) return 0;
  const h = hours[shiftType];
  if (!h) return 0;
  const [sh, sm] = h.start.split(':').map(Number);
  const [eh, em] = h.end.split(':').map(Number);
  let mins = eh * 60 + em - (sh * 60 + sm);
  if (mins <= 0) mins += 24 * 60;
  return mins / 60;
}

export interface OvertimeRow {
  nurseId: string;
  totalHours: number;
  weeklyOvertimeHours: number;
  holidayShiftHours: number;
  /** Holiday-rate pay expressed in hourly-wage units (PP 35/2021). */
  holidayPayUnits: number;
}

@Injectable()
export class ReportingService {
  constructor(
    private readonly roster: RosterService,
    private readonly shifts: ShiftsService,
    private readonly holidays: HolidaysService,
    private readonly facilities: FacilitiesService,
    private readonly nurses: NursesService,
  ) {}

  async overtimeReport(periodId: string): Promise<OvertimeRow[]> {
    const period = await this.roster.getPeriod(periodId);
    const [assignments, hours, facility, holidays] = await Promise.all([
      this.roster.getAssignments(periodId),
      this.shifts.hoursMap(period.facilityId),
      this.facilities.findOne(period.facilityId),
      this.holidays.findByYear(period.year),
    ]);
    const holidaySet = new Set(holidays.map((h) => h.date));
    const scheme = facility.workWeekScheme ?? WorkWeekScheme.SIX_DAY;

    // Per nurse: total hours, hours-per-week, holiday-shift hours + pay units.
    const byNurse = new Map<
      string,
      { total: number; perWeek: Map<string, number>; holiday: number; units: number }
    >();

    for (const a of assignments) {
      const dur = durationHours(a.shiftType, hours);
      if (dur === 0) continue;
      const rec =
        byNurse.get(a.nurseId) ??
        { total: 0, perWeek: new Map<string, number>(), holiday: 0, units: 0 };
      rec.total += dur;
      const wk = isoWeekKey(a.date);
      rec.perWeek.set(wk, (rec.perWeek.get(wk) ?? 0) + dur);
      if (holidaySet.has(a.date)) {
        rec.holiday += dur;
        rec.units += holidayOvertimeUnits(dur, scheme);
      }
      byNurse.set(a.nurseId, rec);
    }

    return [...byNurse.entries()].map(([nurseId, rec]) => ({
      nurseId,
      totalHours: round(rec.total),
      weeklyOvertimeHours: round(
        [...rec.perWeek.values()].reduce(
          (sum, wkHours) => sum + weeklyOvertimeHours(wkHours),
          0,
        ),
      ),
      holidayShiftHours: round(rec.holiday),
      holidayPayUnits: round(rec.units),
    }));
  }

  /** Roster as CSV (nurse, date, shift) for payroll/spreadsheet import. */
  async rosterCsv(periodId: string): Promise<string> {
    const period = await this.roster.getPeriod(periodId);
    const [assignments, nurses] = await Promise.all([
      this.roster.getAssignments(periodId),
      this.nurses.findByFacility(period.facilityId),
    ]);
    const nameById = new Map(nurses.map((n) => [n.id, n.fullName]));

    const rows = [['nurse', 'date', 'shift']];
    for (const a of assignments) {
      rows.push([nameById.get(a.nurseId) ?? a.nurseId, a.date, a.shiftType]);
    }
    return rows.map((r) => r.map(csvCell).join(',')).join('\n');
  }
}

function round(n: number): number {
  return Math.round(n * 100) / 100;
}

function csvCell(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}
