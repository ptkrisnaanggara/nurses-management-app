import { describe, expect, it } from 'vitest';
import { DEFAULT_SHIFT_HOURS, ShiftType } from '@nurses/shared';

describe('shared constants', () => {
  it('exposes the default Indonesian 3-shift hours', () => {
    expect(DEFAULT_SHIFT_HOURS[ShiftType.PAGI]).toEqual({
      start: '07:00',
      end: '14:00',
    });
    expect(DEFAULT_SHIFT_HOURS[ShiftType.MALAM].end).toBe('07:00');
  });
});
