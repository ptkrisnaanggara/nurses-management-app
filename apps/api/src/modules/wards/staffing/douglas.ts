import { CareLevel, DOUGLAS_COEFFICIENTS, ShiftType } from '@nurses/shared';

export type PatientCensus = Record<CareLevel, number>;

/**
 * Douglas method: nurses needed per shift = Σ (patients in care level ×
 * the level's per-shift coefficient). Returns a fractional count; callers
 * round up. See PRD §3.6 (this is the 9-cell table, NOT the 47/36/17 split).
 */
export function douglasDemand(
  census: PatientCensus,
): Record<Exclude<ShiftType, ShiftType.LIBUR>, number> {
  const shifts = [ShiftType.PAGI, ShiftType.SIANG, ShiftType.MALAM] as const;
  const result = { [ShiftType.PAGI]: 0, [ShiftType.SIANG]: 0, [ShiftType.MALAM]: 0 };

  for (const shift of shifts) {
    result[shift] = (Object.keys(census) as CareLevel[]).reduce(
      (sum, level) => sum + census[level] * DOUGLAS_COEFFICIENTS[level][shift],
      0,
    );
  }
  return result;
}
