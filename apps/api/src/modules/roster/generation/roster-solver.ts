import { Injectable } from '@nestjs/common';
import { ShiftType } from '@nurses/shared';
import { RuleEngineService } from '../../rules/rule-engine.service';
import { ResolvedRule } from '../../rules/evaluation/resolved-rule';
import {
  Assignment as EngineAssignment,
  NurseProfile,
} from '../../rules/evaluation/types';
import { toEngineAssignment, ShiftHoursMap } from '../schedule-context.builder';

export interface PlacedAssignment {
  nurseId: string;
  date: string;
  shiftType: ShiftType;
}

export interface SolveInput {
  dates: string[];
  /** Nurses needed per shift type each day. */
  demand: Record<Exclude<ShiftType, ShiftType.LIBUR>, number>;
  nurses: NurseProfile[];
  hours: ShiftHoursMap;
  rules: ResolvedRule[];
  /** Already-fixed assignments (kept; the solver fills around them). */
  preassigned?: PlacedAssignment[];
}

export interface NurseFairness {
  total: number;
  nights: number;
  weekends: number;
}

export interface SolveResult {
  /** Newly created assignments (excludes preassigned). */
  assignments: PlacedAssignment[];
  unfilled: { date: string; shiftType: ShiftType; missing: number }[];
  fairness: Record<string, NurseFairness>;
}

const SCHEDULABLE: Exclude<ShiftType, ShiftType.LIBUR>[] = [
  ShiftType.PAGI,
  ShiftType.SIANG,
  ShiftType.MALAM,
];

function isWeekend(dateIso: string): boolean {
  const day = new Date(`${dateIso}T00:00:00Z`).getUTCDay();
  return day === 0 || day === 6;
}

/**
 * Greedy roster generator. Honors all HARD rules (delegated to the rule
 * engine) and spreads nights/weekends/total load fairly by always picking
 * the least-loaded eligible nurse. Soft preferences enter via candidate
 * ordering; the engine guarantees hard-rule legality.
 */
@Injectable()
export class RosterSolver {
  constructor(private readonly engine: RuleEngineService) {}

  solve(input: SolveInput): SolveResult {
    const { dates, demand, nurses, hours, rules } = input;

    const engineByNurse = new Map<string, EngineAssignment[]>();
    const datesByNurse = new Map<string, Set<string>>();
    const fairness = new Map<string, NurseFairness>();
    for (const n of nurses) {
      engineByNurse.set(n.id, []);
      datesByNurse.set(n.id, new Set());
      fairness.set(n.id, { total: 0, nights: 0, weekends: 0 });
    }

    // Seed state from preassigned shifts so the solver fills around them.
    for (const p of input.preassigned ?? []) {
      this.record(p, hours, engineByNurse, datesByNurse, fairness);
    }

    const created: PlacedAssignment[] = [];
    const unfilled: SolveResult['unfilled'] = [];

    for (const date of dates) {
      const weekend = isWeekend(date);
      for (const shiftType of SCHEDULABLE) {
        const preCount = (input.preassigned ?? []).filter(
          (p) => p.date === date && p.shiftType === shiftType,
        ).length;
        let need = (demand[shiftType] ?? 0) - preCount;

        while (need > 0) {
          const nurse = this.pickBest(
            nurses,
            shiftType,
            weekend,
            date,
            datesByNurse,
            fairness,
            engineByNurse,
            hours,
            rules,
          );
          if (!nurse) {
            unfilled.push({ date, shiftType, missing: need });
            break;
          }
          const placed: PlacedAssignment = { nurseId: nurse.id, date, shiftType };
          this.record(placed, hours, engineByNurse, datesByNurse, fairness);
          created.push(placed);
          need--;
        }
      }
    }

    return {
      assignments: created,
      unfilled,
      fairness: Object.fromEntries(fairness),
    };
  }

  /** Best eligible nurse = passes HARD rules and is least loaded for this shift. */
  private pickBest(
    nurses: NurseProfile[],
    shiftType: Exclude<ShiftType, ShiftType.LIBUR>,
    weekend: boolean,
    date: string,
    datesByNurse: Map<string, Set<string>>,
    fairness: Map<string, NurseFairness>,
    engineByNurse: Map<string, EngineAssignment[]>,
    hours: ShiftHoursMap,
    rules: ResolvedRule[],
  ): NurseProfile | null {
    const candidates = nurses
      .filter((n) => !datesByNurse.get(n.id)!.has(date)) // one shift/day
      .sort((a, b) => this.loadKey(a, shiftType, weekend, fairness) -
        this.loadKey(b, shiftType, weekend, fairness));

    for (const nurse of candidates) {
      const proposed = toEngineAssignment({ nurseId: nurse.id, date, shiftType }, hours);
      if (!proposed) continue;
      const result = this.engine.evaluate(rules, {
        nurse,
        proposed,
        existing: engineByNurse.get(nurse.id)!,
      });
      if (result.allowed) return nurse;
    }
    return null;
  }

  /** Lower = preferred. Prioritises the scarce dimension (nights/weekends). */
  private loadKey(
    nurse: NurseProfile,
    shiftType: ShiftType,
    weekend: boolean,
    fairness: Map<string, NurseFairness>,
  ): number {
    const f = fairness.get(nurse.id)!;
    if (shiftType === ShiftType.MALAM) return f.nights * 100 + f.total;
    if (weekend) return f.weekends * 100 + f.total;
    return f.total;
  }

  private record(
    p: PlacedAssignment,
    hours: ShiftHoursMap,
    engineByNurse: Map<string, EngineAssignment[]>,
    datesByNurse: Map<string, Set<string>>,
    fairness: Map<string, NurseFairness>,
  ): void {
    if (!engineByNurse.has(p.nurseId)) {
      engineByNurse.set(p.nurseId, []);
      datesByNurse.set(p.nurseId, new Set());
      fairness.set(p.nurseId, { total: 0, nights: 0, weekends: 0 });
    }
    const engine = toEngineAssignment(p, hours);
    if (engine) engineByNurse.get(p.nurseId)!.push(engine);
    datesByNurse.get(p.nurseId)!.add(p.date);
    const f = fairness.get(p.nurseId)!;
    f.total++;
    if (p.shiftType === ShiftType.MALAM) f.nights++;
    if (isWeekend(p.date)) f.weekends++;
  }
}
