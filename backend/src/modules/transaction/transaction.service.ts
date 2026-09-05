import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

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

    return this.transactionRepository.save(transaction);
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
}
