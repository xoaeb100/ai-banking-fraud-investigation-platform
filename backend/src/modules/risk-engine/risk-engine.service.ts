import { Injectable } from '@nestjs/common';
import { AmountAnomalyRule } from './rules/amount-anomaly.rule';
import { NewMerchantRule } from './rules/new-merchant.rule';
import { UnusualTimeRule } from './rules/unusual-time.rule';
import { VelocityRule } from './rules/velocity.rule';
import { RiskEngineInput } from './dto/risk-engine-input.dto';
import { RiskLevel } from './enums/risk-level.enum';

@Injectable()
export class RiskEngineService {
  constructor(
    private readonly velocityRule: VelocityRule,
    private readonly amountAnomalyRule: AmountAnomalyRule,
    private readonly newMerchantRule: NewMerchantRule,
    private readonly unusualTimeRule: UnusualTimeRule,
  ) {}
  private readonly maxRuleScore = 65;

  calculateRiskScore(input: RiskEngineInput) {
    const velocityResult = this.velocityRule.evaluate(
      input.transactionsLast10Min,
    );

    const amountResult = this.amountAnomalyRule.evaluate(input.amountRatio);

    const newMerchantResult = this.newMerchantRule.evaluate(
      input.isNewMerchant,
    );

    const unusualTimeResult = this.unusualTimeRule.evaluate(
      input.isUnusualTransactionTime,
    );

    const results = [
      velocityResult,
      amountResult,
      newMerchantResult,
      unusualTimeResult,
    ];

    const ruleScore = results.reduce(
      (total, result) => total + result.score,
      0,
    );

    const reasons = results
      .filter((result) => result.triggered)
      .map((result) => result.reason!);

    const ruleRiskScore = (ruleScore / this.maxRuleScore) * 100;

    const mlRiskScore = input.mlFraudProbability * 100;

    const finalRiskScore = mlRiskScore * 0.6 + ruleRiskScore * 0.4;
    const riskLevel = this.determineRiskLevel(finalRiskScore);

    return {
      riskScore: Math.round(finalRiskScore),
      riskLevel,
      reasons,
      mlFraudProbability: input.mlFraudProbability,
    };
  }

  private determineRiskLevel(riskScore: number): RiskLevel {
    if (riskScore >= 70) {
      return RiskLevel.HIGH;
    }

    if (riskScore >= 40) {
      return RiskLevel.MEDIUM;
    }

    return RiskLevel.LOW;
  }
}
