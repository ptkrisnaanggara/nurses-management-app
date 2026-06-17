import { Column, Entity, Index, Unique } from 'typeorm';
import { ShiftType } from '@nurses/shared';
import { BaseEntity } from '../../../common/entities/base.entity';

/** One nurse on one shift on one date within a roster period. */
@Entity('assignments')
@Index(['rosterPeriodId'])
@Index(['nurseId'])
@Unique(['rosterPeriodId', 'nurseId', 'date'])
export class Assignment extends BaseEntity {
  @Column({ type: 'uuid' })
  rosterPeriodId: string;

  @Column({ type: 'uuid' })
  nurseId: string;

  @Column({ type: 'date' })
  date: string;

  @Column({ type: 'enum', enum: ShiftType })
  shiftType: ShiftType;
}
