import { Column, Entity } from 'typeorm';
import { WorkWeekScheme } from '@nurses/shared';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('facilities')
export class Facility extends BaseEntity {
  @Column({ type: 'varchar', length: 200 })
  name: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  city: string | null;

  @Column({
    type: 'enum',
    enum: WorkWeekScheme,
    default: WorkWeekScheme.SIX_DAY,
  })
  workWeekScheme: WorkWeekScheme;

  /** IANA time zone, e.g. Asia/Jakarta (WIB), Asia/Makassar (WITA). */
  @Column({ type: 'varchar', length: 64, default: 'Asia/Jakarta' })
  timeZone: string;
}
