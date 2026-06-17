import { Column, Entity, Index } from 'typeorm';
import { PkLevel, WardType } from '@nurses/shared';
import { BaseEntity } from '../../../common/entities/base.entity';

/** Minimum nurses required per shift (the staffing demand the roster must meet). */
export interface ShiftDemand {
  pagi: number;
  siang: number;
  malam: number;
}

@Entity('wards')
@Index(['facilityId'])
export class Ward extends BaseEntity {
  @Column({ type: 'uuid' })
  facilityId: string;

  @Column({ type: 'varchar', length: 150 })
  name: string;

  @Column({ type: 'enum', enum: WardType })
  type: WardType;

  @Column({ type: 'int', default: 0 })
  bedCount: number;

  @Column({ type: 'jsonb', default: { pagi: 1, siang: 1, malam: 1 } })
  shiftDemand: ShiftDemand;

  /** Optional minimum competency required on each shift (skill-mix policy). */
  @Column({ type: 'enum', enum: PkLevel, nullable: true })
  minPkLevelOnShift: PkLevel | null;
}
