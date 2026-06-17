import { ShiftType } from '@nurses/shared';
import { PlacedShift } from './fairness';

export interface NightComplianceFlag {
  nurseId: string;
  date: string;
  /** Employer duties triggered for women on night shift (Pasal 76(3)-(4)). */
  requiresTransport: boolean;
  requiresMeal: boolean;
}

export interface NightComplianceReport {
  femaleNightShifts: number;
  flags: NightComplianceFlag[];
}

/**
 * Flags female night-shift assignments that trigger employer obligations:
 * antar-jemput transport (23:00–05:00) and a nutritious meal (≥1,400 cal),
 * per UU 13/2003 Pasal 76(3)-(4) + Kepmenaker 224/2003. (Under-18/pregnant
 * night bans are enforced as HARD rules at assignment time.)
 */
export function computeNightCompliance(
  assignments: PlacedShift[],
  genderByNurse: Map<string, 'M' | 'F'>,
): NightComplianceReport {
  const flags: NightComplianceFlag[] = [];

  for (const a of assignments) {
    if (a.shiftType !== ShiftType.MALAM) continue;
    if (genderByNurse.get(a.nurseId) !== 'F') continue;
    flags.push({
      nurseId: a.nurseId,
      date: a.date,
      requiresTransport: true,
      requiresMeal: true,
    });
  }

  return { femaleNightShifts: flags.length, flags };
}
