import { TransactionService } from '../../transaction/transaction.service';

export function createTransactionTools(transactionService: TransactionService) {
  return {
    get_transaction: async (args: { transactionId: string }) => {
      if (!args || typeof args.transactionId !== 'string') {
        throw new Error('Invalid transactionId supplied to get_transaction');
      }

      return transactionService.findOne(args.transactionId);
    },
  };
}
