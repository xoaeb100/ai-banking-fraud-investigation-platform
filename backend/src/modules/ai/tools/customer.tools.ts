import { TransactionService } from '../../transaction/transaction.service';

export function createCustomerTools(transactionService: TransactionService) {
  return {
    get_customer_history: async (args: {
      customerId: string;
      limit?: number;
    }) => {
      if (!args || typeof args.customerId !== 'string') {
        throw new Error('Invalid customerId supplied to get_customer_history');
      }

      const limit =
        typeof args.limit === 'number' && args.limit > 0 && args.limit <= 50
          ? args.limit
          : 10;

      return transactionService.getCustomerHistory(args.customerId, limit);
    },
  };
}
