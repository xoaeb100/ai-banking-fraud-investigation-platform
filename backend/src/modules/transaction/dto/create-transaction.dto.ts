import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUUID,
  Length,
  MaxLength,
  Min,
} from 'class-validator';

import { TransactionType } from '../entities/transaction.entity';

export class CreateTransactionDto {
  @IsUUID()
  @IsNotEmpty()
  customerId!: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  amount!: number;

  @IsString()
  @Length(3, 3)
  currency!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  merchantId!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  merchantCategory!: string;

  @IsEnum(TransactionType)
  transactionType!: TransactionType;

  @IsDateString()
  transactionTime!: string;
}
