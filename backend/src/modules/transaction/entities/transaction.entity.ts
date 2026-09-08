import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum TransactionStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export enum FraudDetectionStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  YET_TO_PROCESS = 'YET_TO_PROCESS',
  FAILED = 'FAILED',
}

export enum TransactionType {
  PURCHASE = 'PURCHASE',
  TRANSFER = 'TRANSFER',
  WITHDRAWAL = 'WITHDRAWAL',
  DEPOSIT = 'DEPOSIT',
}

@Entity('transactions')
@Index('idx_transactions_customer_time', ['customerId', 'transactionTime'])
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  customerId!: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount!: string;

  @Column({ type: 'varchar', length: 3 })
  currency!: string;

  @Column({ type: 'varchar', length: 100 })
  merchantId!: string;

  @Column({ type: 'varchar', length: 100 })
  merchantCategory!: string;

  @Column({
    type: 'enum',
    enum: TransactionType,
  })
  transactionType!: TransactionType;

  @Column({
    type: 'enum',
    enum: TransactionStatus,
    default: TransactionStatus.PENDING,
  })
  status!: TransactionStatus;

  @Column({ type: 'timestamptz' })
  transactionTime!: Date;

  @Column({
    type: 'enum',
    enum: FraudDetectionStatus,
    default: FraudDetectionStatus.PENDING,
  })
  fraudDetectionStatus!: FraudDetectionStatus;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;

  @Column({ type: 'timestamp', nullable: true })
  fraudProcessingStartedAt!: Date | null;
}
