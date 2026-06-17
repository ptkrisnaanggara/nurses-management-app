import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

/**
 * A public holiday or cuti bersama (set yearly by SKB 3 Menteri). Hospitals
 * operate on holidays, so these drive holiday-rate pay flags and fair
 * distribution rather than days off.
 */
@Entity('holidays')
@Index(['date'])
export class Holiday extends BaseEntity {
  @Column({ type: 'date' })
  date: string;

  @Column({ type: 'varchar', length: 200 })
  name: string;

  /** True for cuti bersama (collective leave) vs a national holiday. */
  @Column({ type: 'boolean', default: false })
  isCutiBersama: boolean;
}
