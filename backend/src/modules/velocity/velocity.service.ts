import { Injectable } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class VelocityService {
  private readonly redis;

  constructor(private readonly redisService: RedisService) {
    this.redis = this.redisService.getClient();
  }

  async recordTransaction(
    customerId: string,
    transactionId: string,
    transactionTime: Date,
  ): Promise<void> {
    const key = `velocity:${customerId}`;
    const timestamp = transactionTime.getTime();

    await this.redis.zadd(key, timestamp, transactionId);

    const twentyFourHoursAgo = timestamp - 24 * 60 * 60 * 1000;

    await this.redis.zremrangebyscore(key, 0, twentyFourHoursAgo);
  }

  async getTransactionCount(
    customerId: string,
    windowSeconds: number,
    currentTime: Date,
  ): Promise<number> {
    const key = `velocity:${customerId}`;

    const windowStart = currentTime.getTime() - windowSeconds * 1000;

    return this.redis.zcount(key, windowStart, currentTime.getTime());
  }

  async onModuleDestroy(): Promise<void> {
    await this.redis.quit();
  }
}
