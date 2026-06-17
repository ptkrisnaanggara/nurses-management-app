import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RequestStatus, RosterStatus } from '@nurses/shared';
import { Repository } from 'typeorm';
import { EvaluationResult } from '../../rules/evaluation/types';
import { Assignment } from '../entities/assignment.entity';
import { ROSTER_REPOSITORY, RosterRepository } from '../roster.repository';
import { RosterService } from '../roster.service';
import { SwapRequest } from './entities/swap-request.entity';

export interface SwapValidation {
  allowed: boolean;
  requesterResult: EvaluationResult;
  targetResult: EvaluationResult;
}

/**
 * Tukar shift: nurse A and nurse B exchange two assignments. Approval is only
 * allowed if BOTH nurses still satisfy every HARD rule after the swap — the
 * same rule engine that guards manual edits and generation.
 */
@Injectable()
export class SwapService {
  constructor(
    @InjectRepository(SwapRequest)
    private readonly repo: Repository<SwapRequest>,
    @Inject(ROSTER_REPOSITORY) private readonly roster: RosterRepository,
    private readonly rosterService: RosterService,
  ) {}

  create(
    rosterPeriodId: string,
    requesterAssignmentId: string,
    targetAssignmentId: string,
  ): Promise<SwapRequest> {
    return this.repo.save(
      this.repo.create({
        rosterPeriodId,
        requesterAssignmentId,
        targetAssignmentId,
        status: RequestStatus.PENDING,
      }),
    );
  }

  listPending(): Promise<SwapRequest[]> {
    return this.repo.find({
      where: { status: RequestStatus.PENDING },
      order: { createdAt: 'ASC' },
    });
  }

  /** Re-validate both nurses against their post-swap assignments. */
  async validate(swapId: string): Promise<SwapValidation> {
    const { a, b } = await this.loadPair(swapId);
    const period = await this.rosterService.getPeriod(a.rosterPeriodId);

    // nurse B takes A's slot (and gives up B); nurse A takes B's slot.
    // Using each vacated assignment's id as the proposed id makes the context
    // builder exclude that nurse's outgoing shift automatically.
    const requesterResult = await this.rosterService.validateAssignment(period, {
      ...a,
      id: b.id,
      nurseId: b.nurseId,
    } as Assignment);
    const targetResult = await this.rosterService.validateAssignment(period, {
      ...b,
      id: a.id,
      nurseId: a.nurseId,
    } as Assignment);

    return {
      allowed: requesterResult.allowed && targetResult.allowed,
      requesterResult,
      targetResult,
    };
  }

  async approve(swapId: string, reviewerUserId: string): Promise<SwapRequest> {
    const swap = await this.getPending(swapId);
    const { a, b } = await this.loadPair(swapId);
    const period = await this.rosterService.getPeriod(a.rosterPeriodId);
    if (period.status === RosterStatus.LOCKED) {
      throw new ConflictException('Roster is locked');
    }

    const validation = await this.validate(swapId);
    if (!validation.allowed) {
      throw new ConflictException({
        message: 'Swap violates hard rules for one or both nurses',
        validation,
      });
    }

    // Exchange the nurses on the two assignments.
    await this.roster.updateAssignment(a.id, { nurseId: b.nurseId });
    await this.roster.updateAssignment(b.id, { nurseId: a.nurseId });

    swap.status = RequestStatus.APPROVED;
    swap.reviewedByUserId = reviewerUserId;
    return this.repo.save(swap);
  }

  async reject(swapId: string, reviewerUserId: string): Promise<SwapRequest> {
    const swap = await this.getPending(swapId);
    swap.status = RequestStatus.REJECTED;
    swap.reviewedByUserId = reviewerUserId;
    return this.repo.save(swap);
  }

  private async getPending(swapId: string): Promise<SwapRequest> {
    const swap = await this.repo.findOne({ where: { id: swapId } });
    if (!swap) throw new NotFoundException(`Swap ${swapId} not found`);
    if (swap.status !== RequestStatus.PENDING) {
      throw new BadRequestException(`Swap already ${swap.status}`);
    }
    return swap;
  }

  private async loadPair(
    swapId: string,
  ): Promise<{ a: Assignment; b: Assignment }> {
    const swap = await this.repo.findOne({ where: { id: swapId } });
    if (!swap) throw new NotFoundException(`Swap ${swapId} not found`);
    const a = await this.roster.findAssignmentById(swap.requesterAssignmentId);
    const b = await this.roster.findAssignmentById(swap.targetAssignmentId);
    if (!a || !b) throw new NotFoundException('Swap assignment not found');
    return { a, b };
  }
}
