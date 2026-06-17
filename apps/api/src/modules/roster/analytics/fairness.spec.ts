import { ShiftType } from '@nurses/shared';
import { computeFairness, PlacedShift } from './fairness';
import { computeNightCompliance } from './night-compliance';

const HOURS = {
  [ShiftType.PAGI]: { start: '07:00', end: '14:00' }, // 7h
  [ShiftType.MALAM]: { start: '21:00', end: '07:00' }, // 10h, crosses midnight
};

describe('computeFairness', () => {
  it('counts nights, weekends, holidays and hours per nurse', () => {
    const assignments: PlacedShift[] = [
      { nurseId: 'a', date: '2026-07-20', shiftType: ShiftType.MALAM }, // Mon night
      { nurseId: 'a', date: '2026-07-25', shiftType: ShiftType.PAGI }, // Sat (weekend)
      { nurseId: 'b', date: '2026-07-20', shiftType: ShiftType.PAGI },
    ];
    const report = computeFairness(
      assignments,
      ['a', 'b'],
      HOURS,
      new Set(['2026-07-20']), // holiday
    );
    expect(report.perNurse.a).toMatchObject({
      total: 2,
      nights: 1,
      weekends: 1,
      holidays: 1,
    });
    expect(report.perNurse.a.hours).toBeCloseTo(17, 5); // 10 + 7
    expect(report.summary.nights.spread).toBe(1); // a=1, b=0
  });
});

describe('computeNightCompliance', () => {
  it('flags female night shifts for transport + meal duties', () => {
    const report = computeNightCompliance(
      [
        { nurseId: 'f', date: '2026-07-20', shiftType: ShiftType.MALAM },
        { nurseId: 'm', date: '2026-07-20', shiftType: ShiftType.MALAM },
        { nurseId: 'f', date: '2026-07-21', shiftType: ShiftType.PAGI },
      ],
      new Map([
        ['f', 'F'],
        ['m', 'M'],
      ]),
    );
    expect(report.femaleNightShifts).toBe(1);
    expect(report.flags[0]).toMatchObject({
      nurseId: 'f',
      requiresTransport: true,
      requiresMeal: true,
    });
  });
});
