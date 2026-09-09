import { describe, expect, it, beforeAll, afterAll } from '@jest/globals';
import { DataSource } from 'typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EmbeddingService } from '../embedding/embedding.service';
import { RagRetrievalService } from './rag-retrieval.service';

describe('RAG Retrieval Evaluation', () => {
  let dataSource: DataSource;
  let retrievalService: RagRetrievalService;

  beforeAll(async () => {
    const configModule = await ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    });

    const configService = new ConfigService();

    const embeddingService = new EmbeddingService(configService);

    // ...
  });

  afterAll(async () => {
    if (dataSource?.isInitialized) {
      await dataSource.destroy();
    }
  });

  const evaluationCases = [
    {
      query: 'Should multiple transactions in a short period be investigated?',
      expectedDocument: 'Transaction Monitoring Policy',
      expectedSection: 'Transaction Velocity',
    },
    {
      query:
        'Who is responsible for making the final decision about whether a suspicious transaction is fraud?',
      expectedDocument: 'Escalation Policy',
      expectedSection: 'Final Decision',
    },
    {
      query:
        'What information should an investigator review before assessing a suspicious transaction?',
      expectedDocument: 'Investigation Procedures',
      expectedSection: 'Supporting Evidence',
    },
    {
      query:
        'What should happen when a transaction is classified as HIGH risk?',
      expectedDocument: 'Transaction Monitoring Policy',
      expectedSection: 'High Risk Transactions',
    },
  ];

  it.each(evaluationCases)(
    'retrieves the expected policy chunk for: "$query"',
    async ({ query, expectedDocument, expectedSection }) => {
      const results = await retrievalService.search(query, 3);

      expect(results).toHaveLength(3);

      const found = results.some(
        (result) =>
          result.documentName === expectedDocument &&
          result.section === expectedSection,
      );

      expect(found).toBe(true);
    },
  );
});
