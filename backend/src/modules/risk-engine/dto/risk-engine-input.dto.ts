export interface RiskEngineInput {
  transactionsLast10Min: number;
  amountRatio: number;
  isNewMerchant: boolean;
  isUnusualTransactionTime: boolean;

  mlFraudProbability: number;
}
