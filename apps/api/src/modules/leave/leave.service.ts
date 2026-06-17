import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LeaveType, RequestStatus } from '@nurses/shared';
import { Repository } from 'typeorm';
import { CreateLeaveDto } from './dto/leave.dto';
import { LeaveRequest } from './entities/leave-request.entity';

function inclusiveDays(start: string, end: string): number {
  const ms =
    new Date(`${end}T00:00:00Z`).getTime() -
    new Date(`${start}T00:00:00Z`).getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24)) + 1;
}

@Injectable()
export class LeaveService {
  constructor(
    @InjectRepository(LeaveRequest)
    private readonly repo: Repository<LeaveRequest>,
  ) {}

  async create(dto: CreateLeaveDto): Promise<LeaveRequest> {
    if (dto.endDate < dto.startDate) {
      throw new BadRequestException('endDate must be on or after startDate');
    }
    // UU 13/2003 Pasal 81: menstrual leave is for day 1 & 2 only.
    if (
      dto.type === LeaveType.CUTI_HAID &&
      inclusiveDays(dto.startDate, dto.endDate) > 2
    ) {
      throw new BadRequestException('Cuti haid is limited to a maximum of 2 days');
    }
    return this.repo.save(this.repo.create({ ...dto, status: RequestStatus.PENDING }));
  }

  listByNurse(nurseId: string): Promise<LeaveRequest[]> {
    return this.repo.find({
      where: { nurseId },
      order: { startDate: 'DESC' },
    });
  }

  listPending(): Promise<LeaveRequest[]> {
    return this.repo.find({
      where: { status: RequestStatus.PENDING },
      order: { createdAt: 'ASC' },
    });
  }

  approve(id: string, reviewerUserId: string): Promise<LeaveRequest> {
    return this.transition(id, RequestStatus.APPROVED, reviewerUserId);
  }

  reject(id: string, reviewerUserId: string): Promise<LeaveRequest> {
    return this.transition(id, RequestStatus.REJECTED, reviewerUserId);
  }

  cancel(id: string): Promise<LeaveRequest> {
    return this.transition(id, RequestStatus.CANCELLED, null);
  }

  private async transition(
    id: string,
    status: RequestStatus,
    reviewerUserId: string | null,
  ): Promise<LeaveRequest> {
    const request = await this.repo.findOne({ where: { id } });
    if (!request) throw new NotFoundException(`Leave request ${id} not found`);
    if (request.status !== RequestStatus.PENDING) {
      throw new BadRequestException(
        `Cannot change a request already ${request.status}`,
      );
    }
    request.status = status;
    request.reviewedByUserId = reviewerUserId;
    return this.repo.save(request);
  }
}
