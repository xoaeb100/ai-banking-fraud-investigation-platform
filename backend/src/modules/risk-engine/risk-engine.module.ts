import { Module } from '@nestjs/common';
import { RiskEngineService } from './risk-engine.service';
import { RiskEngineController } from './risk-engine.controller';
import { VelocityRule } from './rules/velocity.rule';
import { AmountAnomalyRule } from './rules/amount-anomaly.rule';
import { NewMerchantRule } from './rules/new-merchant.rule';
import { UnusualTimeRule } from './rules/unusual-time.rule';

@Module({
  controllers: [RiskEngineController],
  providers: [
    RiskEngineService,
    VelocityRule,
    AmountAnomalyRule,
    NewMerchantRule,
    UnusualTimeRule,
  ],
  exports: [RiskEngineService],
})
export class RiskEngineModule {}
