import { Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { REDIS_CLIENT } from '../../redis/redis.constants';
import { RefreshTokenStore } from './refresh-token.store';

/** Redis-backed refresh-token store. Keys auto-expire with the token TTL. */
@Injectable()
export class RefreshTokenRedisStore implements RefreshTokenStore {
  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  private key(userId: string, jti: string): string {
    return `refresh:${userId}:${jti}`;
  }

  async save(userId: string, jti: string, ttlSeconds: number): Promise<void> {
    await this.redis.set(this.key(userId, jti), '1', 'EX', ttlSeconds);
  }

  async exists(userId: string, jti: string): Promise<boolean> {
    return (await this.redis.exists(this.key(userId, jti))) === 1;
  }

  async revoke(userId: string, jti: string): Promise<void> {
    await this.redis.del(this.key(userId, jti));
  }
}
