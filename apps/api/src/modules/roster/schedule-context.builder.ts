import { ShiftType } from '@nurses/shared';
import {
  Assignment as EngineAssignment,
  NurseProfile,
  ScheduleContext,
} from '../rules/evaluation/types';
import { Assignment } from './entities/assignment.entity';

/** Shift hours keyed by shift type, e.g. { PAGI: { start:'07:00', end:'14:00' } }. */
export type ShiftHoursMap = Partial<
  Record<ShiftType, { start: string; end: string }>
>;

/** Convert a persisted assignment + shift hours into the engine's shape. */
export function toEngineAssignment(
  a: Pick<Assignment, 'nurseId' | 'date' | 'shiftType'>,
  hours: ShiftHoursMap,
): EngineAssignment | null {
  if (a.shiftType === ShiftType.LIBUR) return null; // day off, no hours
  const h = hours[a.shiftType];
  if (!h) return null;

  const startsAt = `${a.date}T${h.start}:00Z`;
  // If end <= start, the shift crosses midnight into the next day.
  const crossesMidnight = h.end <= h.start;
  const endDate = crossesMidnight ? addDay(a.date) : a.date;
  const endsAt = `${endDate}T${h.end}:00Z`;

  return { nurseId: a.nurseId, date: a.date, shiftType: a.shiftType, startsAt, endsAt };
}

function addDay(dateIso: string): string {
  const d = new Date(`${dateIso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

/**
 * Build the rule-engine context for evaluating `proposed` against the nurse's
 * other assignments. Only the same nurse's shifts are relevant for the
 * per-nurse rules (hours, rest, consecutive nights, fatigue).
 */
export function buildScheduleContext(
  nurse: NurseProfile,
  proposed: Assignment,
  nurseAssignments: Assignment[],
  hours: ShiftHoursMap,
): ScheduleContext | null {
  const proposedEngine = toEngineAssignment(proposed, hours);
  if (!proposedEngine) return null;

  const existing = nurseAssignments
    .filter((a) => a.id !== proposed.id && a.nurseId === proposed.nurseId)
    .map((a) => toEngineAssignment(a, hours))
    .filter((a): a is EngineAssignment => a !== null);

  return { nurse, proposed: proposedEngine, existing };
}
