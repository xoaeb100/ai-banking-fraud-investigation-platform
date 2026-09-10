import { Injectable } from '@nestjs/common';

import { RagRetrievalService } from './rag-retrieval.service';
import { RAG_EVALUATION_CASES } from './rag-evaluation';

@Injectable()
export class RagEvaluationService {
  constructor(private readonly ragRetrievalService: RagRetrievalService) {}

  async evaluate() {
    const results: any[] = [];

    for (const testCase of RAG_EVALUATION_CASES) {
      const retrieved = await this.ragRetrievalService.search(
        testCase.query,
        3,
      );

      const hit = retrieved.some(
        (result) =>
          result.documentName === testCase.expectedDocument &&
          result.section === testCase.expectedSection,
      );

      results.push({
        query: testCase.query,
        expectedDocument: testCase.expectedDocument,
        expectedSection: testCase.expectedSection,
        hit,
        results: retrieved.map((result) => ({
          documentName: result.documentName,
          section: result.section,
          similarity: result.similarity,
        })),
      });
    }

    const successfulQueries = results.filter((result) => result.hit).length;

    const totalQueries = results.length;

    return {
      metric: 'Hit@3',
      successfulQueries,
      totalQueries,
      score: successfulQueries / totalQueries,
      results,
    };
  }
}
