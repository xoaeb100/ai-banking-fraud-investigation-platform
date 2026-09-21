import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly client: Redis;
  private readonly blockingClient: Redis;

  constructor(private readonly configService: ConfigService) {
    const host = this.configService.getOrThrow<string>('redis.host');
    const port = this.configService.getOrThrow<number>('redis.port');

    this.client = new Redis({
      host,
      port,
    });

    this.blockingClient = this.client.duplicate();
  }

  getClient(): Redis {
    return this.client;
  }

  getBlockingClient(): Redis {
    return this.blockingClient;
  }

  async onModuleDestroy(): Promise<void> {
    await Promise.all([this.client.quit(), this.blockingClient.quit()]);
  }
}
