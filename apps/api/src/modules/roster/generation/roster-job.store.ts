import { Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { REDIS_CLIENT } from '../../../redis/redis.constants';

export type JobStatus = 'PENDING' | 'RUNNING' | 'DONE' | 'FAILED';

export interface RosterJob {
  jobId: string;
  periodId: string;
  status: JobStatus;
  createdCount?: number;
  unfilledCount?: number;
  error?: string;
  updatedAt: string;
}

const TTL_SECONDS = 60 * 60 * 24; // keep job status for a day

/** Redis-backed status store for async roster-generation jobs. */
@Injectable()
export class RosterJobStore {
  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  private key(jobId: string): string {
    return `roster:job:${jobId}`;
  }

  async set(job: RosterJob): Promise<void> {
    await this.redis.set(
      this.key(job.jobId),
      JSON.stringify({ ...job, updatedAt: new Date().toISOString() }),
      'EX',
      TTL_SECONDS,
    );
  }

  async get(jobId: string): Promise<RosterJob | null> {
    const raw = await this.redis.get(this.key(jobId));
    return raw ? (JSON.parse(raw) as RosterJob) : null;
  }
}
