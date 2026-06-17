import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

/** Immutable record of a significant action (who did what, when, to which entity). */
@Entity('audit_logs')
@Index(['entityType', 'entityId'])
@Index(['createdAt'])
export class AuditLog extends BaseEntity {
  @Column({ type: 'uuid', nullable: true })
  userId: string | null;

  @Column({ type: 'varchar', length: 80 })
  action: string;

  @Column({ type: 'varchar', length: 80 })
  entityType: string;

  @Column({ type: 'uuid', nullable: true })
  entityId: string | null;

  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, unknown>;
}
