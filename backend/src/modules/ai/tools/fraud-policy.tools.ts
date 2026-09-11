import { RagRetrievalService } from '../rag/rag-retrieval.service';

export function createFraudPolicyTools(
  ragRetrievalService: RagRetrievalService,
) {
  return {
    search_fraud_policy: async (args: { query: string; limit?: number }) => {
      if (
        !args ||
        typeof args.query !== 'string' ||
        args.query.trim().length === 0
      ) {
        throw new Error('query is required');
      }

      const limit =
        typeof args.limit === 'number' &&
        Number.isInteger(args.limit) &&
        args.limit >= 1 &&
        args.limit <= 5
          ? args.limit
          : 3;

      const results = await ragRetrievalService.search(
        args.query.trim(),
        limit,
        0.7,
      );

      return results;
    },
  };
}
