import { Assignment } from './types';

const MS_PER_HOUR = 1000 * 60 * 60;

/** Duration of an assignment in hours. */
export function assignmentHours(a: Assignment): number {
  return (
    (new Date(a.endsAt).getTime() - new Date(a.startsAt).getTime()) / MS_PER_HOUR
  );
}

/** ISO-week key (e.g. "2026-W25") for grouping weekly hours. */
export function isoWeekKey(dateIso: string): string {
  const d = new Date(`${dateIso}T00:00:00Z`);
  const day = (d.getUTCDay() + 6) % 7; // Mon=0..Sun=6
  d.setUTCDate(d.getUTCDate() - day + 3); // nearest Thursday
  const firstThursday = new Date(Date.UTC(d.getUTCFullYear(), 0, 4));
  const week =
    1 +
    Math.round(
      ((d.getTime() - firstThursday.getTime()) / (MS_PER_HOUR * 24) -
        3 +
        ((firstThursday.getUTCDay() + 6) % 7)) /
        7,
    );
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}

/** Rest gap in hours between two assignments (absolute, edge-to-edge). */
export function restGapHours(a: Assignment, b: Assignment): number {
  const aStart = new Date(a.startsAt).getTime();
  const aEnd = new Date(a.endsAt).getTime();
  const bStart = new Date(b.startsAt).getTime();
  const bEnd = new Date(b.endsAt).getTime();
  if (aEnd <= bStart) return (bStart - aEnd) / MS_PER_HOUR; // a before b
  if (bEnd <= aStart) return (aStart - bEnd) / MS_PER_HOUR; // b before a
  return 0; // overlapping
}

/** Whole years of age on a given date. */
export function ageOn(birthDateIso: string, onDateIso: string): number {
  const birth = new Date(birthDateIso);
  const on = new Date(onDateIso);
  let age = on.getUTCFullYear() - birth.getUTCFullYear();
  const m = on.getUTCMonth() - birth.getUTCMonth();
  if (m < 0 || (m === 0 && on.getUTCDate() < birth.getUTCDate())) age--;
  return age;
}

/** Add/subtract whole days from an ISO date, returning `YYYY-MM-DD`. */
export function addDays(dateIso: string, days: number): string {
  const d = new Date(`${dateIso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}
