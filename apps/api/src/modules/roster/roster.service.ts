import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { RosterStatus, ShiftType } from '@nurses/shared';
import { NursesService } from '../nurses/nurses.service';
import { ShiftsService } from '../shifts/shifts.service';
import { RuleEngineService } from '../rules/rule-engine.service';
import { RuleResolverService } from '../rules/rule-resolver.service';
import { EvaluationResult } from '../rules/evaluation/types';
import { Assignment } from './entities/assignment.entity';
import { RosterPeriod } from './entities/roster-period.entity';
import { ROSTER_REPOSITORY, RosterRepository } from './roster.repository';
import { buildScheduleContext } from './schedule-context.builder';

export interface PeriodValidation {
  allowed: boolean;
  hardViolations: number;
  results: { assignmentId: string; result: EvaluationResult }[];
}

@Injectable()
export class RosterService {
  constructor(
    @Inject(ROSTER_REPOSITORY) private readonly repo: RosterRepository,
    private readonly nurses: NursesService,
    private readonly shifts: ShiftsService,
    private readonly resolver: RuleResolverService,
    private readonly engine: RuleEngineService,
  ) {}

  createPeriod(data: Partial<RosterPeriod>): Promise<RosterPeriod> {
    return this.repo.createPeriod(data);
  }

  listByWard(wardId: string): Promise<RosterPeriod[]> {
    return this.repo.findPeriodsByWard(wardId);
  }

  async getPeriod(id: string): Promise<RosterPeriod> {
    const period = await this.repo.findPeriodById(id);
    if (!period) throw new NotFoundException(`Roster period ${id} not found`);
    return period;
  }

  getAssignments(periodId: string): Promise<Assignment[]> {
    return this.repo.findAssignmentsByPeriod(periodId);
  }

  /** Add an assignment, blocking it if any HARD rule is violated. */
  async addAssignment(
    periodId: string,
    nurseId: string,
    date: string,
    shiftType: ShiftType,
  ): Promise<{ assignment: Assignment; evaluation: EvaluationResult }> {
    const period = await this.getPeriod(periodId);
    if (period.status !== RosterStatus.DRAFT) {
      throw new ConflictException('Roster is not editable (not in DRAFT)');
    }

    const proposed = { rosterPeriodId: periodId, nurseId, date, shiftType } as Assignment;
    const evaluation = await this.validateAssignment(period, proposed);

    if (!evaluation.allowed) {
      throw new ConflictException({
        message: 'Assignment violates one or more hard rules',
        violations: evaluation.violations,
      });
    }

    const assignment = await this.repo.addAssignment(proposed);
    return { assignment, evaluation };
  }

  removeAssignment(id: string): Promise<boolean> {
    return this.repo.removeAssignment(id);
  }

  /** Evaluate a single (possibly hypothetical) assignment — used live + what-if. */
  async validateAssignment(
    period: RosterPeriod,
    proposed: Assignment,
  ): Promise<EvaluationResult> {
    const nurse = await this.nurses.findOne(proposed.nurseId, true);
    const profile = this.nurses.toRuleProfile(nurse);
    const hours = await this.shifts.hoursMap(period.facilityId);
    const nurseAssignments = await this.repo.findAssignmentsByNurse(
      period.id,
      proposed.nurseId,
    );

    const ctx = buildScheduleContext(profile, proposed, nurseAssignments, hours);
    if (!ctx) {
      return { violations: [], allowed: true, softScore: 0 }; // LIBUR / no hours
    }

    const rules = await this.resolver.resolve({
      facilityId: period.facilityId,
      wardId: period.wardId,
      nurseId: proposed.nurseId,
    });
    return this.engine.evaluate(rules, ctx);
  }

  /** Validate every assignment on a period (pre-publish compliance report). */
  async validatePeriod(periodId: string): Promise<PeriodValidation> {
    const period = await this.getPeriod(periodId);
    const assignments = await this.repo.findAssignmentsByPeriod(periodId);

    const results = [];
    for (const a of assignments) {
      const result = await this.validateAssignment(period, a);
      results.push({ assignmentId: a.id, result });
    }

    const hardViolations = results.reduce(
      (n, r) => n + (r.result.allowed ? 0 : 1),
      0,
    );
    return { allowed: hardViolations === 0, hardViolations, results };
  }

  async publish(periodId: string): Promise<RosterPeriod> {
    const period = await this.getPeriod(periodId);
    if (period.status === RosterStatus.LOCKED) {
      throw new ConflictException('Roster is locked');
    }
    const validation = await this.validatePeriod(periodId);
    if (!validation.allowed) {
      throw new ConflictException({
        message: 'Cannot publish: hard-rule violations remain',
        hardViolations: validation.hardViolations,
      });
    }
    return this.updateStatus(periodId, RosterStatus.PUBLISHED, new Date());
  }

  async lock(periodId: string): Promise<RosterPeriod> {
    return this.updateStatus(periodId, RosterStatus.LOCKED);
  }

  private async updateStatus(
    periodId: string,
    status: RosterStatus,
    publishedAt?: Date,
  ): Promise<RosterPeriod> {
    const updated = await this.repo.updatePeriod(periodId, {
      status,
      ...(publishedAt ? { publishedAt } : {}),
    });
    if (!updated) throw new NotFoundException(`Roster period ${periodId} not found`);
    return updated;
  }
}
