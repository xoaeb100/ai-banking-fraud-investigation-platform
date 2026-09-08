import { Injectable } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class FraudProcessingQueueService {
  private readonly redis;
  private readonly blockingRedis;
  private readonly queueKey = 'fraud-processing';

  constructor(private readonly redisService: RedisService) {
    this.redis = this.redisService.getClient();
    this.blockingRedis = this.redisService.getBlockingClient();
  }

  async enqueue(transactionId: string): Promise<void> {
    await this.redis.rpush(this.queueKey, transactionId);
  }
  //   async startWorker(): Promise<void> {
  //     while (true) {
  //       const result = await this.blockingRedis.blpop(this.queueKey, 0);
  //       if (!result) {
  //         continue;
  //       }

  //       const [, transactionId] = result;

  //       console.log(`Processing fraud transaction: ${transactionId}`);
  //     }
  //   }

  async dequeue(): Promise<string | null> {
    const result = await this.blockingRedis.blpop(this.queueKey, 0);

    if (!result) {
      return null;
    }

    const [, transactionId] = result;

    return transactionId;
  }
}
