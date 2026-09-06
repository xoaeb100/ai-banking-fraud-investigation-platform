import { Test, TestingModule } from '@nestjs/testing';
import { describe, expect, it, beforeEach } from '@jest/globals';

import { RiskEngineService } from './risk-engine.service';
import { VelocityRule } from './rules/velocity.rule';
import { AmountAnomalyRule } from './rules/amount-anomaly.rule';
import { NewMerchantRule } from './rules/new-merchant.rule';
import { UnusualTimeRule } from './rules/unusual-time.rule';
import { RiskLevel } from './enums/risk-level.enum';
describe('RiskEngineService', () => {
  let service: RiskEngineService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RiskEngineService,
        VelocityRule,
        AmountAnomalyRule,
        NewMerchantRule,
        UnusualTimeRule,
      ],
    }).compile();

    service = module.get<RiskEngineService>(RiskEngineService);
  });

  it('should classify a low-risk transaction', () => {
    const result = service.calculateRiskScore({
      transactionsLast10Min: 1,
      amountRatio: 1.2,
      isNewMerchant: false,
      isUnusualTransactionTime: false,
      mlFraudProbability: 0.1,
    });

    expect(result.riskScore).toBe(6);
    expect(result.riskLevel).toBe(RiskLevel.LOW);
    expect(result.reasons).toEqual([]);
  });

  it('should calculate the combined ML + rule risk score', () => {
    const result = service.calculateRiskScore({
      transactionsLast10Min: 7,
      amountRatio: 8.2,
      isNewMerchant: true,
      isUnusualTransactionTime: true,
      mlFraudProbability: 0.9,
    });

    // expect(result.ruleScore).toBe(65);
    // expect(result.ruleRiskScore).toBe(100);
    // expect(result.mlRiskScore).toBe(90);
    // expect(result.finalRiskScore).toBe(94);

    expect(result.riskScore).toBe(94);
    expect(result.riskLevel).toBe(RiskLevel.HIGH);
    expect(result.mlFraudProbability).toBe(0.9);

    expect(result.reasons).toEqual([
      'High transaction velocity',
      'Transaction amount significantly exceeds customer baseline',
      'New merchant',
      'Unusual transaction time',
    ]);
  });
});
