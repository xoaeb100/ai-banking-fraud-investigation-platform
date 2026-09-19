export interface Transaction {
  id: string;
  customerId: string;
  amount: string;
  currency: string;
  merchantId: string;
  merchantCategory: string;
  transactionType: string;
  status: string;
  transactionTime: string;
  fraudDetectionStatus: string;
  createdAt: string;
  updatedAt: string;
  fraudProcessingStartedAt: string | null;
}
