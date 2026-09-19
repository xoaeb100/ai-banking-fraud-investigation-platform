export interface InvestigationCase {
  id: string;
  alertId: string;
  transactionId: string;
  customerId: string;
  status: string;
  assignedTo: string | null;
  createdAt: string;
  updatedAt: string;
}
