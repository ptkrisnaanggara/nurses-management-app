import { Column, Entity, Index } from 'typeorm';
import { RequestStatus } from '@nurses/shared';
import { BaseEntity } from '../../../../common/entities/base.entity';

/** A tukar shift: two nurses exchange the shifts of two assignments. */
@Entity('swap_requests')
@Index(['status'])
export class SwapRequest extends BaseEntity {
  @Column({ type: 'uuid' })
  rosterPeriodId: string;

  @Column({ type: 'uuid' })
  requesterAssignmentId: string;

  @Column({ type: 'uuid' })
  targetAssignmentId: string;

  @Column({ type: 'enum', enum: RequestStatus, default: RequestStatus.PENDING })
  status: RequestStatus;

  @Column({ type: 'uuid', nullable: true })
  reviewedByUserId: string | null;
}
