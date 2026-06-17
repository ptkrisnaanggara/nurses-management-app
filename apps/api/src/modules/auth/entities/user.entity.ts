import { Column, Entity, Index } from 'typeorm';
import { UserRole } from '@nurses/shared';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('users')
export class User extends BaseEntity {
  @Index({ unique: true })
  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Column({ type: 'varchar', length: 255, select: false })
  passwordHash: string;

  @Column({ type: 'varchar', length: 150 })
  displayName: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.STAFF_NURSE })
  role: UserRole;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;
}
