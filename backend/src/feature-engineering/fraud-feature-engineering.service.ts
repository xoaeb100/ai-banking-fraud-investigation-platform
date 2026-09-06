import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Transaction,
  TransactionType,
} from 'src/modules/transaction/entities/transaction.entity';
import { Repository } from 'typeorm';

@Injectable()
export class FraudFeatureEngineeringService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
  ) {}

  transactionsLast10Min(
    customerId: string,
    transactionTime: Date,
  ): Promise<number> {
    return this.countPreviousTransactions(customerId, transactionTime, 10);
  }

  transactionsLast1Hour(
    customerId: string,
    transactionTime: Date,
  ): Promise<number> {
    return this.countPreviousTransactions(customerId, transactionTime, 60);
  }

  transactionsLast24h(
    customerId: string,
    transactionTime: Date,
  ): Promise<number> {
    return this.countPreviousTransactions(customerId, transactionTime, 1440);
  }

  async countPreviousTransactions(
    customerId: string,
    transactionTime: Date,
    windowMinutes: number,
  ): Promise<number> {
    const windowStart = new Date(
      transactionTime.getTime() - windowMinutes * 60 * 1000,
    );

    return this.transactionRepository
      .createQueryBuilder('transaction')
      .where('transaction.customerId = :customerId', { customerId })
      .andWhere('transaction.transactionTime >= :windowStart', {
        windowStart,
      })
      .andWhere('transaction.transactionTime < :transactionTime', {
        transactionTime,
      })
      .getCount();
  }

  async averageTransactionAmount(
    customerId: string,
    transactionTime: Date,
  ): Promise<number | null> {
    const result = await this.transactionRepository
      .createQueryBuilder('transaction')
      .select('AVG(transaction.amount)', 'average')
      .where('transaction.customerId = :customerId', { customerId })
      .andWhere('transaction.transactionTime < :transactionTime', {
        transactionTime,
      })
      .getRawOne();

    if (result.average === null) {
      return null;
    }

    return Number(result.average);
  }

  async getAmountFeatures(
    customerId: string,
    transactionTime: Date,
    currentAmount: number,
  ) {
    const averageTransactionAmount = await this.averageTransactionAmount(
      customerId,
      transactionTime,
    );

    if (averageTransactionAmount === null) {
      return {
        averageTransactionAmount: null,
        amountDeviation: null,
        amountRatio: null,
      };
    }

    const amountDeviation = currentAmount - averageTransactionAmount;

    const amountRatio = currentAmount / averageTransactionAmount;

    return {
      averageTransactionAmount,
      amountDeviation,
      amountRatio,
    };
  }
  isUnusualTransactionTime(transactionTime: Date): boolean {
    const hour = transactionTime.getUTCHours();

    return hour >= 0 && hour < 5;
  }
  async hasPreviousMerchantCategory(
    customerId: string,
    transactionTime: Date,
    merchantCategory: string,
  ): Promise<boolean> {
    const count = await this.transactionRepository
      .createQueryBuilder('transaction')
      .where('transaction.customerId = :customerId', { customerId })
      .andWhere('transaction.transactionTime < :transactionTime', {
        transactionTime,
      })
      .andWhere('transaction.merchantCategory = :merchantCategory', {
        merchantCategory,
      })
      .getCount();

    return count > 0;
  }
  async hasPreviousMerchant(
    customerId: string,
    transactionTime: Date,
    merchantId: string,
  ): Promise<boolean> {
    const count = await this.transactionRepository
      .createQueryBuilder('transaction')
      .where('transaction.customerId = :customerId', { customerId })
      .andWhere('transaction.transactionTime < :transactionTime', {
        transactionTime,
      })
      .andWhere('transaction.merchantId = :merchantId', {
        merchantId,
      })
      .getCount();

    return count > 0;
  }

  async hasPreviousTransactionType(
    customerId: string,
    transactionTime: Date,
    transactionType: TransactionType,
  ): Promise<boolean> {
    const count = await this.transactionRepository
      .createQueryBuilder('transaction')
      .where('transaction.customerId = :customerId', { customerId })
      .andWhere('transaction.transactionTime < :transactionTime', {
        transactionTime,
      })
      .andWhere('transaction.transactionType = :transactionType', {
        transactionType,
      })
      .getCount();

    return count > 0;
  }

  async getBehavioralFeatures(
    customerId: string,
    transactionTime: Date,
    merchantId: string,
    merchantCategory: string,
    transactionType: TransactionType,
  ) {
    const [
      hasPreviousMerchant,
      hasPreviousMerchantCategory,
      hasPreviousTransactionType,
    ] = await Promise.all([
      this.hasPreviousMerchant(customerId, transactionTime, merchantId),
      this.hasPreviousMerchantCategory(
        customerId,
        transactionTime,
        merchantCategory,
      ),
      this.hasPreviousTransactionType(
        customerId,
        transactionTime,
        transactionType,
      ),
    ]);

    return {
      isNewMerchant: !hasPreviousMerchant,
      isNewMerchantCategory: !hasPreviousMerchantCategory,
      isNewTransactionType: !hasPreviousTransactionType,
    };
  }
  async getFraudFeatures(
    customerId: string,
    transactionTime: Date,
    currentAmount: number,
    merchantId: string,
    merchantCategory: string,
    transactionType: TransactionType,
  ) {
    const [
      transactionsLast10Min,
      transactionsLast1Hour,
      transactionsLast24h,
      amountFeatures,
      behavioralFeatures,
    ] = await Promise.all([
      this.transactionsLast10Min(customerId, transactionTime),
      this.transactionsLast1Hour(customerId, transactionTime),
      this.transactionsLast24h(customerId, transactionTime),
      this.getAmountFeatures(customerId, transactionTime, currentAmount),
      this.getBehavioralFeatures(
        customerId,
        transactionTime,
        merchantId,
        merchantCategory,
        transactionType,
      ),
    ]);

    return {
      transactionsLast10Min,
      transactionsLast1Hour,
      transactionsLast24h,

      ...amountFeatures,

      isUnusualTransactionTime: this.isUnusualTransactionTime(transactionTime),

      ...behavioralFeatures,
    };
  }
}
