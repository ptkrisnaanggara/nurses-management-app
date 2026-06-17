import { Column, Entity, Index, OneToMany } from 'typeorm';
import { EmploymentClass, PkLevel } from '@nurses/shared';
import { BaseEntity } from '../../../common/entities/base.entity';
import { SipLicense } from './sip-license.entity';

@Entity('nurses')
@Index(['facilityId'])
export class Nurse extends BaseEntity {
  @Column({ type: 'uuid' })
  facilityId: string;

  /** Optional link to a login account. */
  @Column({ type: 'uuid', nullable: true })
  userId: string | null;

  @Column({ type: 'varchar', length: 200 })
  fullName: string;

  @Column({ type: 'char', length: 1 })
  gender: 'M' | 'F';

  @Column({ type: 'date' })
  birthDate: string;

  @Column({ type: 'enum', enum: EmploymentClass, default: EmploymentClass.CONTRACT })
  employmentClass: EmploymentClass;

  @Column({ type: 'enum', enum: PkLevel, nullable: true })
  pkLevel: PkLevel | null;

  /** STR is lifetime (UU 17/2023) — number only, no expiry. */
  @Column({ type: 'varchar', length: 100, nullable: true })
  strNumber: string | null;

  /** Continuing-education credits (PRD §3.5: ~25 SKP / 5 years). */
  @Column({ type: 'int', default: 0 })
  skpCredits: number;

  @Column({ type: 'int', default: 40 })
  weeklyContractHours: number;

  // --- Privacy-sensitive health flags (restricted access) ---
  @Column({ type: 'boolean', default: false, select: false })
  isPregnant: boolean;

  @Column({ type: 'boolean', default: false, select: false })
  isLactating: boolean;

  @Column({ type: 'boolean', default: true })
  active: boolean;

  @OneToMany(() => SipLicense, (sip) => sip.nurse, { cascade: true })
  sipLicenses: SipLicense[];
}
