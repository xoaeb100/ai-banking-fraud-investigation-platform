import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { InvestigationCaseStatus } from '../enums/investigation-case-status.enum';

@Entity('investigation_cases')
export class InvestigationCase {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  alertId!: string;

  @Column({ type: 'uuid' })
  transactionId!: string;

  @Column({ type: 'uuid' })
  customerId!: string;

  @Column({
    type: 'enum',
    enum: InvestigationCaseStatus,
    default: InvestigationCaseStatus.OPEN,
  })
  status!: InvestigationCaseStatus;

  @Column({ type: 'uuid', nullable: true })
  assignedTo!: string | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
