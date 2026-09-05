import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Transaction } from '../modules/transaction/entities/transaction.entity';
import { FraudFeatureEngineeringService } from './fraud-feature-engineering.service';
import { FraudFeatureEngineeringController } from './fraud-feature-engineering.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Transaction])],
  controllers: [FraudFeatureEngineeringController],
  providers: [FraudFeatureEngineeringService],
  exports: [FraudFeatureEngineeringService],
})
export class FraudFeatureEngineeringModule {}
