import { CareLevel, ShiftType } from './enums';

/**
 * Statutory defaults (UU 6/2023, PP 35/2021, UU 13/2003). These are seed
 * DEFAULTS only — at runtime they live in the configurable rule engine and
 * may be overridden per facility within legal bounds. See docs/PRD.md §3.
 */
export const LABOR_DEFAULTS = {
  MAX_HOURS_PER_WEEK: 40,
  MAX_OVERTIME_HOURS_PER_DAY: 4,
  MAX_OVERTIME_HOURS_PER_WEEK: 18,
  MIN_REST_AFTER_HOURS: 4,
  MIN_REST_BREAK_MINUTES: 30,
  MIN_ANNUAL_LEAVE_DAYS: 12,
  /** International best-practice min rest between shifts (hours). */
  MIN_REST_BETWEEN_SHIFTS_HOURS: 11,
  MAX_CONSECUTIVE_NIGHTS: 2,
  /** Night window per UU 13/2003 Pasal 76. */
  NIGHT_WINDOW_START: '23:00',
  NIGHT_WINDOW_END: '07:00',
  /** Women's transport (antar-jemput) trigger window. */
  WOMEN_TRANSPORT_START: '23:00',
  WOMEN_TRANSPORT_END: '05:00',
} as const;

/** Douglas per-shift coefficients by patient care level (per patient). */
export const DOUGLAS_COEFFICIENTS: Record<
  CareLevel,
  Record<Exclude<ShiftType, ShiftType.LIBUR>, number>
> = {
  [CareLevel.MINIMAL]: {
    [ShiftType.PAGI]: 0.17,
    [ShiftType.SIANG]: 0.14,
    [ShiftType.MALAM]: 0.1,
  },
  [CareLevel.PARTIAL]: {
    [ShiftType.PAGI]: 0.27,
    [ShiftType.SIANG]: 0.15,
    [ShiftType.MALAM]: 0.07,
  },
  [CareLevel.TOTAL]: {
    [ShiftType.PAGI]: 0.36,
    [ShiftType.SIANG]: 0.3,
    [ShiftType.MALAM]: 0.2,
  },
};

/** Default shift hour windows (configurable per facility). */
export const DEFAULT_SHIFT_HOURS = {
  [ShiftType.PAGI]: { start: '07:00', end: '14:00' },
  [ShiftType.SIANG]: { start: '14:00', end: '21:00' },
  [ShiftType.MALAM]: { start: '21:00', end: '07:00' },
} as const;
