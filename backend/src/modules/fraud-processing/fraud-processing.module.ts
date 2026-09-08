import { Module } from '@nestjs/common';

import { FraudProcessingQueueModule } from '../fraud-processing-queue/fraud-processing-queue.module';
import { TransactionModule } from '../transaction/transaction.module';
import { FraudProcessingService } from './fraud-processing.service';
import { FraudFeatureEngineeringModule } from 'src/feature-engineering/fraud-feature-engineering.module';
import { MlModule } from '../ml/ml.module';
import { AlertModule } from '../alert/alert.module';
import { RiskEngineModule } from '../risk-engine/risk-engine.module';
import { InvestigationCaseModule } from '../investigation-case/investigation-case.module';

@Module({
  imports: [
    FraudProcessingQueueModule,
    TransactionModule,
    FraudFeatureEngineeringModule,
    MlModule,
    AlertModule,
    RiskEngineModule,
    InvestigationCaseModule,
  ],
  providers: [FraudProcessingService],
})
export class FraudProcessingModule {}
