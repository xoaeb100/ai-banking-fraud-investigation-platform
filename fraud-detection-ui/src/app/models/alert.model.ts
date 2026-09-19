export interface Alert {
  id: string;
  transactionId: string;
  customerId: string;

  riskScore: number;
  riskLevel: string;
  mlFraudProbability: number;

  transactionsLast10Min: number;
  transactionsLast1Hour: number;
  transactionsLast24h: number;

  amountDeviation: number | null;
  amountRatio: number | null;

  isUnusualTransactionTime: boolean;
  isNewMerchant: boolean;
  isNewMerchantCategory: boolean;
  isNewTransactionType: boolean;

  reasons: string[];

  createdAt: string;
  status: string;
  assignedTo: string | null;
}
