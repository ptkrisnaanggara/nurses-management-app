import { WorkWeekScheme } from '@nurses/shared';
import {
  holidayOvertimeUnits,
  normalDayOvertimeUnits,
  weeklyOvertimeHours,
} from './overtime';

describe('overtime (PP 35/2021)', () => {
  it('normal day: 1st hour x1.5, rest x2', () => {
    expect(normalDayOvertimeUnits(1)).toBeCloseTo(1.5);
    expect(normalDayOvertimeUnits(4)).toBeCloseTo(1.5 + 3 * 2); // 7.5
    expect(normalDayOvertimeUnits(0)).toBe(0);
  });

  it('holiday 6-day scheme: 1-7 x2, 8th x3, 9-11 x4', () => {
    expect(holidayOvertimeUnits(7, WorkWeekScheme.SIX_DAY)).toBe(14);
    expect(holidayOvertimeUnits(8, WorkWeekScheme.SIX_DAY)).toBe(17); // 14 + 3
    expect(holidayOvertimeUnits(10, WorkWeekScheme.SIX_DAY)).toBe(25); // 14+3+8
  });

  it('holiday 5-day scheme: 1-8 x2, 9th x3, 10-12 x4', () => {
    expect(holidayOvertimeUnits(8, WorkWeekScheme.FIVE_DAY)).toBe(16);
    expect(holidayOvertimeUnits(12, WorkWeekScheme.FIVE_DAY)).toBe(31); // 16+3+12
  });

  it('weekly overtime is hours beyond the cap', () => {
    expect(weeklyOvertimeHours(42)).toBe(2);
    expect(weeklyOvertimeHours(38)).toBe(0);
  });
});
