import { Column, Entity, Index, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Nurse } from './nurse.entity';

/**
 * SIP/SIPP — a nurse's practice licence, one per workplace, renewed every
 * 5 years (PRD §3.5). STR itself is lifetime, so the SIP expiry is the
 * recurring compliance gate.
 */
@Entity('sip_licenses')
@Index(['nurseId'])
export class SipLicense extends BaseEntity {
  @Column({ type: 'uuid' })
  nurseId: string;

  @ManyToOne(() => Nurse, (nurse) => nurse.sipLicenses, { onDelete: 'CASCADE' })
  nurse: Nurse;

  @Column({ type: 'varchar', length: 100 })
  sipNumber: string;

  /** Free-text workplace/facility this SIP authorises practice at. */
  @Column({ type: 'varchar', length: 200 })
  workplace: string;

  @Column({ type: 'date' })
  issuedAt: string;

  @Column({ type: 'date' })
  expiresAt: string;
}
