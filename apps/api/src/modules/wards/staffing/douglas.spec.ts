import { CareLevel, ShiftType } from '@nurses/shared';
import { douglasDemand } from './douglas';

describe('douglasDemand', () => {
  it('computes the canonical example (5 minimal, 3 partial, 2 total)', () => {
    const demand = douglasDemand({
      [CareLevel.MINIMAL]: 5,
      [CareLevel.PARTIAL]: 3,
      [CareLevel.TOTAL]: 2,
    });
    // pagi = 5*0.17 + 3*0.27 + 2*0.36 = 0.85 + 0.81 + 0.72 = 2.38
    expect(demand[ShiftType.PAGI]).toBeCloseTo(2.38, 2);
    // siang = 5*0.14 + 3*0.15 + 2*0.30 = 0.70 + 0.45 + 0.60 = 1.75
    expect(demand[ShiftType.SIANG]).toBeCloseTo(1.75, 2);
    // malam = 5*0.10 + 3*0.07 + 2*0.20 = 0.50 + 0.21 + 0.40 = 1.11
    expect(demand[ShiftType.MALAM]).toBeCloseTo(1.11, 2);
  });

  it('returns zero demand for an empty ward', () => {
    const demand = douglasDemand({
      [CareLevel.MINIMAL]: 0,
      [CareLevel.PARTIAL]: 0,
      [CareLevel.TOTAL]: 0,
    });
    expect(demand[ShiftType.PAGI]).toBe(0);
  });
});
