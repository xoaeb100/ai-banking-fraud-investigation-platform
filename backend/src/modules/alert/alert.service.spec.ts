import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { Alert } from './entities/alert.entity';
import { AlertService } from './alert.service';
import { InvestigationCaseService } from '../investigation-case/investigation-case.service';
import { RiskLevel } from '../risk-engine/enums/risk-level.enum';

describe('AlertService', () => {
  let service: AlertService;
  const alertRepository = { create: jest.fn(), save: jest.fn() };
  const investigationCaseService = { createCase: jest.fn() };
  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AlertService,
        { provide: getRepositoryToken(Alert), useValue: alertRepository },
        {
          provide: InvestigationCaseService,
          useValue: investigationCaseService,
        },
      ],
    }).compile();
    service = module.get<AlertService>(AlertService);
  });
  it('should create an investigation case for a HIGH-risk alert', async () => {
    const transactionId = '550e8400-e29b-41d4-a716-446655440000';
    const customerId = '550e8400-e29b-41d4-a716-446655440001';
    const alert = {
      id: 'alert-123',
      transactionId,
      customerId,
      riskScore: 90,
      riskLevel: RiskLevel.HIGH,
      mlFraudProbability: 0.85,
      reasons: ['High transaction velocity'],
    };
    const investigationCase = { id: 'case-123' };
    alertRepository.create.mockReturnValue(alert);
    (alertRepository.save as any).mockResolvedValue(alert);
    (investigationCaseService.createCase as any).mockResolvedValue(
      investigationCase,
    );
    const result = await service.createAlert(
      transactionId,
      customerId,
      {
        riskScore: 90,
        riskLevel: RiskLevel.HIGH,
        reasons: ['High transaction velocity'],
        mlFraudProbability: 0.85,
      },
      {
        transactionsLast10Min: 6,
        transactionsLast1Hour: 8,
        transactionsLast24h: 15,
        amountDeviation: 9000,
        amountRatio: 6,
        isUnusualTransactionTime: true,
        isNewMerchant: true,
        isNewMerchantCategory: false,
        isNewTransactionType: false,
      },
    );
    expect(result).toEqual(alert);
    expect(alertRepository.save).toHaveBeenCalledWith(alert);
    expect(investigationCaseService.createCase).toHaveBeenCalledWith(
      'alert-123',
      transactionId,
      customerId,
    );
  });

  it('should not create an investigation case for a LOW-risk alert', async () => {
    const transactionId = '550e8400-e29b-41d4-a716-446655440000';
    const customerId = '550e8400-e29b-41d4-a716-446655440001';

    const alert = {
      id: 'alert-low-123',
      transactionId,
      customerId,
      riskScore: 20,
      riskLevel: RiskLevel.LOW,
      mlFraudProbability: 0.15,
      reasons: [],
    };

    alertRepository.create.mockReturnValue(alert);
    (alertRepository.save as any).mockResolvedValue(alert);

    const result = await service.createAlert(
      transactionId,
      customerId,
      {
        riskScore: 20,
        riskLevel: RiskLevel.LOW,
        reasons: [],
        mlFraudProbability: 0.15,
      },
      {
        transactionsLast10Min: 1,
        transactionsLast1Hour: 2,
        transactionsLast24h: 3,
        amountDeviation: 100,
        amountRatio: 1.1,
        isUnusualTransactionTime: false,
        isNewMerchant: false,
        isNewMerchantCategory: false,
        isNewTransactionType: false,
      },
    );

    expect(result).toEqual(alert);

    expect(investigationCaseService.createCase).not.toHaveBeenCalled();
  });
});
