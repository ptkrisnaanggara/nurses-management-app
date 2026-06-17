import { Column, Entity, Index } from 'typeorm';
import { RuleCategory, RuleScope, RuleType } from '@nurses/shared';
import { BaseEntity } from '../../../common/entities/base.entity';

/**
 * A configurable scheduling rule. Statutory defaults ship as seed rows; every
 * value is editable, so legal changes are data changes — not code changes.
 */
@Entity('rules')
@Index(['scope', 'scopeRefId', 'enabled'])
export class Rule extends BaseEntity {
  /** Maps to exactly one evaluator (see RuleKey). */
  @Column({ type: 'varchar', length: 64 })
  key: string;

  @Column({ type: 'varchar', length: 200 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'enum', enum: RuleScope, default: RuleScope.GLOBAL })
  scope: RuleScope;

  /** ID of the facility/ward/role/etc this rule is scoped to (null for GLOBAL). */
  @Column({ type: 'uuid', nullable: true })
  scopeRefId: string | null;

  @Column({ type: 'enum', enum: RuleType, default: RuleType.HARD })
  type: RuleType;

  @Column({ type: 'enum', enum: RuleCategory })
  category: RuleCategory;

  /** Weight for SOFT rules (ignored for HARD). */
  @Column({ type: 'int', default: 0 })
  weight: number;

  @Column({ type: 'jsonb', default: {} })
  params: Record<string, unknown>;

  @Column({ type: 'varchar', length: 200, nullable: true })
  legalReference: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  effectiveFrom: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  effectiveTo: Date | null;

  @Column({ type: 'boolean', default: true })
  enabled: boolean;

  /** Whether a more specific scope may override this rule. */
  @Column({ type: 'boolean', default: true })
  overridable: boolean;
}
