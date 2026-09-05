import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { FraudFeatureEngineeringService } from './fraud-feature-engineering.service';
import { TransactionType } from 'src/modules/transaction/entities/transaction.entity';

@Controller('fraud-features')
export class FraudFeatureEngineeringController {
  constructor(
    private readonly featureEngineeringService: FraudFeatureEngineeringService,
  ) {}

  @Get('/velocity')
  async getVelocity(
    @Query('customerId') customerId: string,
    @Query('transactionTime') transactionTime: string,
  ) {
    const time = new Date(transactionTime);

    return {
      transactionsLast10Min:
        await this.featureEngineeringService.transactionsLast10Min(
          customerId,
          time,
        ),

      transactionsLast1Hour:
        await this.featureEngineeringService.transactionsLast1Hour(
          customerId,
          time,
        ),

      transactionsLast24h:
        await this.featureEngineeringService.transactionsLast24h(
          customerId,
          time,
        ),
    };
  }

  @Get('/amount')
  async getAmountFeatures(
    @Query('customerId') customerId: string,
    @Query('transactionTime') transactionTime: string,
    @Query('amount') amount: string,
  ) {
    return this.featureEngineeringService.getAmountFeatures(
      customerId,
      new Date(transactionTime),
      Number(amount),
    );
  }

  @Get('/time')
  getTransactionTimeFeature(@Query('transactionTime') transactionTime: string) {
    const parsedTransactionTime = new Date(transactionTime);

    if (Number.isNaN(parsedTransactionTime.getTime())) {
      throw new BadRequestException('transactionTime must be a valid ISO date');
    }

    return {
      unusualTransactionTime:
        this.featureEngineeringService.isUnusualTransactionTime(
          parsedTransactionTime,
        ),
    };
  }

  @Get('/behavioral')
  async getBehavioralFeatures(
    @Query('customerId') customerId: string,
    @Query('transactionTime') transactionTime: string,
    @Query('merchantId') merchantId: string,
    @Query('merchantCategory') merchantCategory: string,
    @Query('transactionType') transactionType: TransactionType,
  ) {
    const parsedTransactionTime = new Date(transactionTime);

    if (Number.isNaN(parsedTransactionTime.getTime())) {
      throw new BadRequestException('transactionTime must be a valid ISO date');
    }

    return this.featureEngineeringService.getBehavioralFeatures(
      customerId,
      parsedTransactionTime,
      merchantId,
      merchantCategory,
      transactionType,
    );
  }
}
