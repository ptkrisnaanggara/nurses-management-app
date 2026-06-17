import { ShiftType } from '@nurses/shared';
import { ShiftHoursMap } from '../schedule-context.builder';

export interface PlacedShift {
  nurseId: string;
  date: string;
  shiftType: ShiftType;
}

export interface NurseStats {
  total: number;
  nights: number;
  weekends: number;
  holidays: number;
  hours: number;
}

export interface Spread {
  min: number;
  max: number;
  /** max − min: 0 means perfectly even. */
  spread: number;
}

export interface FairnessReport {
  perNurse: Record<string, NurseStats>;
  summary: { nights: Spread; weekends: Spread; hours: Spread };
}

function isWeekend(dateIso: string): boolean {
  const day = new Date(`${dateIso}T00:00:00Z`).getUTCDay();
  return day === 0 || day === 6;
}

function shiftHours(shiftType: ShiftType, hours: ShiftHoursMap): number {
  if (shiftType === ShiftType.LIBUR) return 0;
  const h = hours[shiftType];
  if (!h) return 0;
  const [sh, sm] = h.start.split(':').map(Number);
  const [eh, em] = h.end.split(':').map(Number);
  let mins = eh * 60 + em - (sh * 60 + sm);
  if (mins <= 0) mins += 24 * 60; // crosses midnight
  return mins / 60;
}

function spread(values: number[]): Spread {
  if (values.length === 0) return { min: 0, max: 0, spread: 0 };
  const min = Math.min(...values);
  const max = Math.max(...values);
  return { min, max, spread: max - min };
}

/**
 * Per-nurse distribution of load (nights, weekends, holidays, hours) plus the
 * max−min spread for the dimensions staff care most about (fairness). Pure.
 */
export function computeFairness(
  assignments: PlacedShift[],
  nurseIds: string[],
  hours: ShiftHoursMap,
  holidayDates: Set<string>,
): FairnessReport {
  const perNurse: Record<string, NurseStats> = {};
  for (const id of nurseIds) {
    perNurse[id] = { total: 0, nights: 0, weekends: 0, holidays: 0, hours: 0 };
  }

  for (const a of assignments) {
    const s = (perNurse[a.nurseId] ??= {
      total: 0,
      nights: 0,
      weekends: 0,
      holidays: 0,
      hours: 0,
    });
    if (a.shiftType === ShiftType.LIBUR) continue;
    s.total++;
    if (a.shiftType === ShiftType.MALAM) s.nights++;
    if (isWeekend(a.date)) s.weekends++;
    if (holidayDates.has(a.date)) s.holidays++;
    s.hours += shiftHours(a.shiftType, hours);
  }

  const stats = Object.values(perNurse);
  return {
    perNurse,
    summary: {
      nights: spread(stats.map((s) => s.nights)),
      weekends: spread(stats.map((s) => s.weekends)),
      hours: spread(stats.map((s) => s.hours)),
    },
  };
}
