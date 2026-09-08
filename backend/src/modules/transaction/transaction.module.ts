import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Transaction } from './entities/transaction.entity';
import { TransactionController } from './transaction.controller';
import { TransactionService } from './transaction.service';
import { FraudProcessingQueueModule } from '../fraud-processing-queue/fraud-processing-queue.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Transaction]),
    FraudProcessingQueueModule,
  ],
  controllers: [TransactionController],
  providers: [TransactionService],
  exports: [TransactionService],
})
export class TransactionModule {}
