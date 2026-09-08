import { Controller, Post } from '@nestjs/common';
import { FraudProcessingQueueService } from './fraud-processing-queue.service';
@Controller('fraud-processing-queue')
export class FraudProcessingQueueController {
  constructor(private readonly queueService: FraudProcessingQueueService) {}

  @Post('test')
  async testQueue() {
    await this.queueService.enqueue('tx-001');

    return {
      message: 'Transaction queued',
    };
  }
}
