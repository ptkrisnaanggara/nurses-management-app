import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';

export interface AuditEntry {
  userId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  metadata?: Record<string, unknown>;
}

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog) private readonly repo: Repository<AuditLog>,
  ) {}

  /** Record an action. Best-effort: auditing must never break the main flow. */
  async record(entry: AuditEntry): Promise<void> {
    try {
      await this.repo.save(
        this.repo.create({
          userId: entry.userId ?? null,
          action: entry.action,
          entityType: entry.entityType,
          entityId: entry.entityId ?? null,
          metadata: entry.metadata ?? {},
        }),
      );
    } catch {
      // swallow — auditing is non-critical
    }
  }

  list(entityType: string, entityId: string): Promise<AuditLog[]> {
    return this.repo.find({
      where: { entityType, entityId },
      order: { createdAt: 'DESC' },
      take: 200,
    });
  }
}
