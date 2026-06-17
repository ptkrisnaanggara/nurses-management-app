import { Column, Entity, Index, Unique } from 'typeorm';
import { RosterStatus } from '@nurses/shared';
import { BaseEntity } from '../../../common/entities/base.entity';

/** A monthly roster for one ward (the unit a head nurse builds and publishes). */
@Entity('roster_periods')
@Index(['wardId'])
@Unique(['wardId', 'year', 'month'])
export class RosterPeriod extends BaseEntity {
  @Column({ type: 'uuid' })
  facilityId: string;

  @Column({ type: 'uuid' })
  wardId: string;

  @Column({ type: 'int' })
  year: number;

  @Column({ type: 'int' })
  month: number; // 1-12

  @Column({ type: 'enum', enum: RosterStatus, default: RosterStatus.DRAFT })
  status: RosterStatus;

  @Column({ type: 'timestamptz', nullable: true })
  publishedAt: Date | null;
}
