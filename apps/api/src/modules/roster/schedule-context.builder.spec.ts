import { ShiftType } from '@nurses/shared';
import { Assignment } from './entities/assignment.entity';
import { NurseProfile } from '../rules/evaluation/types';
import {
  buildScheduleContext,
  toEngineAssignment,
} from './schedule-context.builder';

const HOURS = {
  [ShiftType.PAGI]: { start: '07:00', end: '14:00' },
  [ShiftType.MALAM]: { start: '21:00', end: '07:00' },
};

const nurse: NurseProfile = { id: 'n1', gender: 'F' };

const a = (over: Partial<Assignment>): Assignment =>
  ({ id: Math.random().toString(), nurseId: 'n1', ...over }) as Assignment;

describe('toEngineAssignment', () => {
  it('keeps a same-day shift on the same date', () => {
    const e = toEngineAssignment(
      { nurseId: 'n1', date: '2026-07-20', shiftType: ShiftType.PAGI },
      HOURS,
    );
    expect(e?.startsAt).toBe('2026-07-20T07:00:00Z');
    expect(e?.endsAt).toBe('2026-07-20T14:00:00Z');
  });

  it('rolls a night shift end into the next day', () => {
    const e = toEngineAssignment(
      { nurseId: 'n1', date: '2026-07-20', shiftType: ShiftType.MALAM },
      HOURS,
    );
    expect(e?.startsAt).toBe('2026-07-20T21:00:00Z');
    expect(e?.endsAt).toBe('2026-07-21T07:00:00Z');
  });

  it('returns null for a day off (LIBUR)', () => {
    expect(
      toEngineAssignment(
        { nurseId: 'n1', date: '2026-07-20', shiftType: ShiftType.LIBUR },
        HOURS,
      ),
    ).toBeNull();
  });
});

describe('buildScheduleContext', () => {
  it('includes the nurse other shifts and excludes the proposed itself', () => {
    const proposed = a({ date: '2026-07-21', shiftType: ShiftType.PAGI });
    const existing = [
      a({ date: '2026-07-20', shiftType: ShiftType.MALAM }),
      proposed,
    ];
    const ctx = buildScheduleContext(nurse, proposed, existing, HOURS);
    expect(ctx?.existing).toHaveLength(1);
    expect(ctx?.existing[0].shiftType).toBe(ShiftType.MALAM);
  });
});
