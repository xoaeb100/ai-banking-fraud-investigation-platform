import { Injectable, OnModuleInit } from '@nestjs/common';

import { FraudProcessingQueueService } from '../fraud-processing-queue/fraud-processing-queue.service';
import { TransactionService } from '../transaction/transaction.service';
import { FraudFeatureEngineeringService } from 'src/feature-engineering/fraud-feature-engineering.service';
import { MlService } from '../ml/ml.service';
import { RiskEngineService } from '../risk-engine/risk-engine.service';
import { AlertService } from '../alert/alert.service';
@Injectable()
export class FraudProcessingService implements OnModuleInit {
  constructor(
    private readonly queueService: FraudProcessingQueueService,
    private readonly transactionService: TransactionService,
    private readonly featureEngineeringService: FraudFeatureEngineeringService,
    private readonly mlService: MlService,
    private readonly riskEngineService: RiskEngineService,
    private readonly alertService: AlertService,
  ) {}
  async onModuleInit(): Promise<void> {
    void this.startWorker();
    void this.startRecovery();
  }

  private async startWorker(): Promise<void> {
    while (true) {
      const transactionId = await this.queueService.dequeue();

      if (!transactionId) {
        continue;
      }

      const claimed =
        await this.transactionService.claimForFraudProcessing(transactionId);

      if (!claimed) {
        console.log(
          `Skipping transaction ${transactionId}: already claimed or not pending`,
        );

        continue;
      }
      try {
        const transaction =
          await this.transactionService.getTransactionForProcessing(
            transactionId,
          );

        if (!transaction) {
          console.error(`Transaction ${transactionId} not found`);
          continue;
        }

        const features = await this.featureEngineeringService.getFraudFeatures(
          transaction.customerId,
          transaction.transactionTime,
          parseInt(transaction.amount, 10),
          transaction.merchantId,
          transaction.merchantCategory,
          transaction.transactionType,
        );

        console.log('Fraud features:', features);

        const mlPrediction = await this.mlService.predict({
          Time: 0,
          V1: 0,
          V2: 0,
          V3: 0,
          V4: 0,
          V5: 0,
          V6: 0,
          V7: 0,
          V8: 0,
          V9: 0,
          V10: 0,
          V11: 0,
          V12: 0,
          V13: 0,
          V14: 0,
          V15: 0,
          V16: 0,
          V17: 0,
          V18: 0,
          V19: 0,
          V20: 0,
          V21: 0,
          V22: 0,
          V23: 0,
          V24: 0,
          V25: 0,
          V26: 0,
          V27: 0,
          V28: 0,
          Amount: Number(transaction.amount),
        });

        console.log('ML prediction:', mlPrediction);

        const riskAssessment = this.riskEngineService.calculateRiskScore({
          transactionsLast10Min: features.transactionsLast10Min,
          amountRatio: features.amountRatio ?? 0,
          isNewMerchant: features.isNewMerchant,
          isUnusualTransactionTime: features.isUnusualTransactionTime,
          mlFraudProbability: mlPrediction.fraudProbability,
        });

        console.log('Risk assessment:', riskAssessment);
        if (
          riskAssessment.riskLevel === 'HIGH' ||
          riskAssessment.riskLevel === 'MEDIUM'
        ) {
          const alert = await this.alertService.createAlert(
            transaction.id,
            transaction.customerId,
            riskAssessment,
            features,
          );

          console.log(`Alert created: ${alert.id}`);

          await this.transactionService.markFraudProcessingCompleted(
            transactionId,
          );

          console.log(`Fraud processing completed for ${transactionId}`);
        }
      } catch (error) {
        console.error(
          `Fraud processing failed for transaction ${transactionId}`,
          error,
        );

        await this.transactionService.markFraudProcessingForRetry(
          transactionId,
        );
      }
    }
  }

  private async startRecovery(): Promise<void> {
    while (true) {
      await new Promise((resolve) => setTimeout(resolve, 60_000));

      const recovered =
        await this.transactionService.recoverStuckFraudProcessing(5);

      if (recovered > 0) {
        console.log(`Recovered ${recovered} stuck fraud transaction(s)`);
      }
    }
  }
}
