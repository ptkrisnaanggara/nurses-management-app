import { WorkWeekScheme } from '@nurses/shared';

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

/**
 * PP 35/2021 Pasal 31 overtime pay, expressed in "wage units" (multiples of
 * the hourly wage). Callers multiply by the hourly wage (= monthly/173).
 */

/**
 * Overtime on a NORMAL working day: 1st hour ×1.5, each subsequent hour ×2
 * (statutory daily cap is 4h). Supports fractional hours.
 */
export function normalDayOvertimeUnits(overtimeHours: number): number {
  const ot = Math.max(0, overtimeHours);
  return clamp(ot, 0, 1) * 1.5 + Math.max(0, ot - 1) * 2;
}

/**
 * Work on a weekly rest day / public holiday. Multipliers differ by work-week
 * scheme (PP 35/2021 Pasal 31):
 *  - 6-day week: hours 1–7 ×2, hour 8 ×3, hours 9–11 ×4
 *  - 5-day week: hours 1–8 ×2, hour 9 ×3, hours 10–12 ×4
 */
export function holidayOvertimeUnits(
  hoursWorked: number,
  scheme: WorkWeekScheme,
): number {
  const h = Math.max(0, hoursWorked);
  if (scheme === WorkWeekScheme.FIVE_DAY) {
    return clamp(h, 0, 8) * 2 + clamp(h - 8, 0, 1) * 3 + clamp(h - 9, 0, 3) * 4;
  }
  return clamp(h, 0, 7) * 2 + clamp(h - 7, 0, 1) * 3 + clamp(h - 8, 0, 3) * 4;
}

/** Hours beyond the weekly cap (default 40h) count as overtime. */
export function weeklyOvertimeHours(weekHours: number, cap = 40): number {
  return Math.max(0, weekHours - cap);
}
