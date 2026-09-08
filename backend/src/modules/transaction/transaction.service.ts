import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FraudProcessingQueueService } from '../fraud-processing-queue/fraud-processing-queue.service';
import {
  FraudDetectionStatus,
  Transaction,
  TransactionStatus,
} from './entities/transaction.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    private readonly fraudProcessingQueueService: FraudProcessingQueueService,
  ) {}

  async create(dto: CreateTransactionDto): Promise<Transaction> {
    const transaction = this.transactionRepository.create({
      customerId: dto.customerId,
      amount: dto.amount.toFixed(2),
      currency: dto.currency.toUpperCase(),
      merchantId: dto.merchantId,
      merchantCategory: dto.merchantCategory,
      transactionType: dto.transactionType,
      transactionTime: new Date(dto.transactionTime),

      // Simplified transaction lifecycle for Day 8
      status: TransactionStatus.COMPLETED,

      // Fraud detection happens separately
      fraudDetectionStatus: FraudDetectionStatus.PENDING,
    });

    const savedTransaction = await this.transactionRepository.save(transaction);

    await this.fraudProcessingQueueService.enqueue(savedTransaction.id);

    return savedTransaction;
  }

  async findOne(id: string): Promise<Transaction> {
    const transaction = await this.transactionRepository.findOne({
      where: { id },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    return transaction;
  }

  async findAll(): Promise<Transaction[]> {
    return this.transactionRepository.find({
      order: {
        transactionTime: 'DESC',
      },
    });
  }
  async claimForFraudProcessing(transactionId: string): Promise<boolean> {
    const result = await this.transactionRepository.update(
      {
        id: transactionId,
        fraudDetectionStatus: FraudDetectionStatus.PENDING,
      },
      {
        fraudDetectionStatus: FraudDetectionStatus.PROCESSING,
        fraudProcessingStartedAt: new Date(),
      },
    );

    return result.affected === 1;
  }

  async getTransactionForProcessing(
    transactionId: string,
  ): Promise<Transaction | null> {
    return this.transactionRepository.findOne({
      where: {
        id: transactionId,
      },
    });
  }

  async markFraudProcessingForRetry(transactionId: string): Promise<void> {
    await this.transactionRepository.update(
      {
        id: transactionId,
        fraudDetectionStatus: FraudDetectionStatus.PROCESSING,
      },
      {
        fraudDetectionStatus: FraudDetectionStatus.YET_TO_PROCESS,
      },
    );
  }

  async recoverStuckFraudProcessing(timeoutMinutes: number): Promise<number> {
    const cutoff = new Date(Date.now() - timeoutMinutes * 60 * 1000);

    const result = await this.transactionRepository
      .createQueryBuilder()
      .update(Transaction)
      .set({
        fraudDetectionStatus: FraudDetectionStatus.YET_TO_PROCESS,
        fraudProcessingStartedAt: null,
      })
      .where('"fraudDetectionStatus" = :status', {
        status: FraudDetectionStatus.PROCESSING,
      })
      .andWhere('"fraudProcessingStartedAt" < :cutoff', {
        cutoff,
      })
      .execute();

    return result.affected ?? 0;
  }

  async markFraudProcessingCompleted(transactionId: string): Promise<void> {
    await this.transactionRepository.update(
      {
        id: transactionId,
        fraudDetectionStatus: FraudDetectionStatus.PROCESSING,
      },
      {
        fraudDetectionStatus: FraudDetectionStatus.COMPLETED,
        fraudProcessingStartedAt: null,
      },
    );
  }
}
