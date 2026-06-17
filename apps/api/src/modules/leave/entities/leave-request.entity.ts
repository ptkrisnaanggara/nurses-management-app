import { Column, Entity, Index } from 'typeorm';
import { LeaveType, RequestStatus } from '@nurses/shared';
import { BaseEntity } from '../../../common/entities/base.entity';

/** A nurse's request for leave/izin (incl. women's-protection leave types). */
@Entity('leave_requests')
@Index(['nurseId'])
@Index(['status'])
export class LeaveRequest extends BaseEntity {
  @Column({ type: 'uuid' })
  nurseId: string;

  @Column({ type: 'enum', enum: LeaveType })
  type: LeaveType;

  @Column({ type: 'date' })
  startDate: string;

  @Column({ type: 'date' })
  endDate: string;

  @Column({ type: 'text', nullable: true })
  reason: string | null;

  @Column({ type: 'enum', enum: RequestStatus, default: RequestStatus.PENDING })
  status: RequestStatus;

  @Column({ type: 'uuid', nullable: true })
  reviewedByUserId: string | null;
}
