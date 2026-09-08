import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { AlertStatus } from '../enums/alert-status.enum';
import { RiskLevel } from '../../../modules/risk-engine/enums/risk-level.enum';

@Entity('alerts')
export class Alert {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  transactionId!: string;

  @Column({ type: 'uuid' })
  customerId!: string;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  riskScore!: number;

  @Column({
    type: 'enum',
    enum: RiskLevel,
  })
  riskLevel!: RiskLevel;

  @Column({ type: 'decimal', precision: 5, scale: 4 })
  mlFraudProbability!: number;

  @Column({ type: 'int' })
  transactionsLast10Min!: number;

  @Column({ type: 'int' })
  transactionsLast1Hour!: number;

  @Column({ type: 'int' })
  transactionsLast24h!: number;

  @Column({ type: 'decimal', nullable: true })
  amountDeviation!: number | null;

  @Column({ type: 'decimal', nullable: true })
  amountRatio!: number | null;

  @Column({ type: 'boolean' })
  isUnusualTransactionTime!: boolean;

  @Column({ type: 'boolean' })
  isNewMerchant!: boolean;

  @Column({ type: 'boolean' })
  isNewMerchantCategory!: boolean;

  @Column({ type: 'boolean' })
  isNewTransactionType!: boolean;

  @Column({ type: 'jsonb' })
  reasons!: string[];

  @Column({
    type: 'enum',
    enum: AlertStatus,
    default: AlertStatus.OPEN,
  })
  status!: AlertStatus;

  @Column({ type: 'uuid', nullable: true })
  assignedTo!: string | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
