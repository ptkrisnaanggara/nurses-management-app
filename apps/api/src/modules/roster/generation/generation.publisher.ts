import { Injectable } from '@nestjs/common';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { randomUUID } from 'node:crypto';
import {
  ROSTER_EXCHANGE,
  ROSTER_GENERATE_ROUTING_KEY,
  RosterGenerateMessage,
} from '../../../messaging/messaging.constants';
import { RosterJobStore } from './roster-job.store';

/** Enqueues a roster-generation job and returns its tracking id. */
@Injectable()
export class GenerationPublisher {
  constructor(
    private readonly amqp: AmqpConnection,
    private readonly jobs: RosterJobStore,
  ) {}

  async enqueue(periodId: string): Promise<string> {
    const jobId = randomUUID();
    await this.jobs.set({ jobId, periodId, status: 'PENDING', updatedAt: '' });
    const message: RosterGenerateMessage = { jobId, periodId };
    await this.amqp.publish(
      ROSTER_EXCHANGE,
      ROSTER_GENERATE_ROUTING_KEY,
      message,
    );
    return jobId;
  }
}
