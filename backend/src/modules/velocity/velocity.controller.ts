import { Controller, Post } from '@nestjs/common';
import { VelocityService } from './velocity.service';

@Controller('velocity')
export class VelocityController {
  constructor(private readonly velocityService: VelocityService) {}
  @Post('test')
  async testRedis() {
    const now = new Date();

    await this.velocityService.recordTransaction(
      'customer-123',
      'tx-001',
      new Date(now.getTime() - 5 * 60 * 1000),
    );

    await this.velocityService.recordTransaction(
      'customer-123',
      'tx-002',
      new Date(now.getTime() - 8 * 60 * 1000),
    );

    await this.velocityService.recordTransaction(
      'customer-123',
      'tx-003',
      new Date(now.getTime() - 15 * 60 * 1000),
    );

    const count = await this.velocityService.getTransactionCount(
      'customer-123',
      10 * 60,
      now,
    );

    return {
      count,
    };
  }
}
