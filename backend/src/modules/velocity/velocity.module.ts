import { Module } from '@nestjs/common';
import { VelocityService } from './velocity.service';
import { VelocityController } from './velocity.controller';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [RedisModule],

  controllers: [VelocityController],
  providers: [VelocityService],
  exports: [VelocityService],
})
export class VelocityModule {}
