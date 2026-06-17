import { Injectable, Logger } from '@nestjs/common';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import {
  ROSTER_EXCHANGE,
  ROSTER_GENERATE_QUEUE,
  ROSTER_GENERATE_ROUTING_KEY,
  RosterGenerateMessage,
} from '../../../messaging/messaging.constants';
import { GenerationService } from './generation.service';
import { RosterJobStore } from './roster-job.store';

/** Consumes roster-generation jobs and runs the (CPU-heavy) solver off-thread. */
@Injectable()
export class RosterGenerationConsumer {
  private readonly logger = new Logger(RosterGenerationConsumer.name);

  constructor(
    private readonly generation: GenerationService,
    private readonly jobs: RosterJobStore,
  ) {}

  @RabbitSubscribe({
    exchange: ROSTER_EXCHANGE,
    routingKey: ROSTER_GENERATE_ROUTING_KEY,
    queue: ROSTER_GENERATE_QUEUE,
    queueOptions: { durable: true },
  })
  async handle(msg: RosterGenerateMessage): Promise<void> {
    const { jobId, periodId } = msg;
    await this.jobs.set({ jobId, periodId, status: 'RUNNING', updatedAt: '' });
    try {
      const result = await this.generation.generate(periodId);
      await this.jobs.set({
        jobId,
        periodId,
        status: 'DONE',
        createdCount: result.assignments.length,
        unfilledCount: result.unfilled.length,
        updatedAt: '',
      });
    } catch (err) {
      this.logger.error(`Generation failed for period ${periodId}`, err as Error);
      await this.jobs.set({
        jobId,
        periodId,
        status: 'FAILED',
        error: (err as Error).message,
        updatedAt: '',
      });
    }
  }
}
