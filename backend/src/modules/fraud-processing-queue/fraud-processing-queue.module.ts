import { Module } from '@nestjs/common';
import { FraudProcessingQueueService } from './fraud-processing-queue.service';
import { FraudProcessingQueueController } from './fraud-processing-queue.controller';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [RedisModule],
  controllers: [FraudProcessingQueueController],

  providers: [FraudProcessingQueueService],
  exports: [FraudProcessingQueueService],
})
export class FraudProcessingQueueModule {}
