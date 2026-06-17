import { Global, Module } from '@nestjs/common';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RabbitMqConfig } from '../config/configuration';
import { ROSTER_EXCHANGE } from './messaging.constants';

/**
 * Configures the RabbitMQ connection once and exposes AmqpConnection app-wide.
 * `wait: false` lets the API boot even if the broker is temporarily down
 * (publishing/consuming resumes once it reconnects).
 */
@Global()
@Module({
  imports: [
    RabbitMQModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.getOrThrow<RabbitMqConfig>('rabbitmq').url,
        exchanges: [{ name: ROSTER_EXCHANGE, type: 'topic' }],
        connectionInitOptions: { wait: false },
        enableControllerDiscovery: true,
      }),
    }),
  ],
  exports: [RabbitMQModule],
})
export class MessagingModule {}
