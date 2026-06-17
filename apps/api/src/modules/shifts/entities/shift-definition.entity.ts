import { Column, Entity, Index, Unique } from 'typeorm';
import { ShiftType } from '@nurses/shared';
import { BaseEntity } from '../../../common/entities/base.entity';

/** A facility's hours for one shift type (configurable; defaults from PRD §3.7). */
@Entity('shift_definitions')
@Index(['facilityId'])
@Unique(['facilityId', 'shiftType'])
export class ShiftDefinition extends BaseEntity {
  @Column({ type: 'uuid' })
  facilityId: string;

  @Column({ type: 'enum', enum: ShiftType })
  shiftType: ShiftType;

  /** 'HH:MM' local time. */
  @Column({ type: 'varchar', length: 5 })
  startTime: string;

  /** 'HH:MM' local time; may be earlier than start (crosses midnight). */
  @Column({ type: 'varchar', length: 5 })
  endTime: string;

  @Column({ type: 'varchar', length: 5, nullable: true })
  breakStart: string | null;

  @Column({ type: 'varchar', length: 5, nullable: true })
  breakEnd: string | null;

  @Column({ type: 'boolean', default: true })
  active: boolean;
}
