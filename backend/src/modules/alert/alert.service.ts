import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Alert } from './entities/alert.entity';
import { InvestigationCaseService } from '../investigation-case/investigation-case.service';
import { RiskLevel } from '../risk-engine/enums/risk-level.enum';

@Injectable()
export class AlertService {
  constructor(
    @InjectRepository(Alert)
    private readonly alertRepository: Repository<Alert>,
    private readonly investigationCaseService: InvestigationCaseService,
  ) {}

  async createAlert(
    transactionId: string,
    customerId: string,
    riskAssessment: {
      riskScore: number;
      riskLevel: RiskLevel;
      reasons: string[];
      mlFraudProbability: number;
    },
    features: {
      transactionsLast10Min: number;
      transactionsLast1Hour: number;
      transactionsLast24h: number;
      amountDeviation: number | null;
      amountRatio: number | null;
      isUnusualTransactionTime: boolean;
      isNewMerchant: boolean;
      isNewMerchantCategory: boolean;
      isNewTransactionType: boolean;
    },
  ): Promise<Alert> {
    const alert = this.alertRepository.create({
      transactionId,
      customerId,

      riskScore: riskAssessment.riskScore,
      riskLevel: riskAssessment.riskLevel,
      mlFraudProbability: riskAssessment.mlFraudProbability,

      transactionsLast10Min: features.transactionsLast10Min,
      transactionsLast1Hour: features.transactionsLast1Hour,
      transactionsLast24h: features.transactionsLast24h,

      amountDeviation: features.amountDeviation,
      amountRatio: features.amountRatio,

      isUnusualTransactionTime: features.isUnusualTransactionTime,
      isNewMerchant: features.isNewMerchant,
      isNewMerchantCategory: features.isNewMerchantCategory,
      isNewTransactionType: features.isNewTransactionType,

      reasons: riskAssessment.reasons,
    });

    const savedAlert = await this.alertRepository.save(alert);

    if (savedAlert.riskLevel === RiskLevel.HIGH) {
      const investigationCase = await this.investigationCaseService.createCase(
        savedAlert.id,
        transactionId,
        customerId,
      );

      console.log(`Investigation case created: ${investigationCase.id}`);
    }

    return savedAlert;
  }
}
