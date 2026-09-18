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
      const expectedMatch = (result: any) =>
        result.documentName === testCase.expectedDocument &&
        result.section === testCase.expectedSection;

      const hitAt1 = retrieved.length > 0 && expectedMatch(retrieved[0]);

      const hitAt3 = retrieved.some(expectedMatch);

      // const hit = retrieved.some(
      //   (result) =>
      //     result.documentName === testCase.expectedDocument &&
      //     result.section === testCase.expectedSection,
      // );

      results.push({
        query: testCase.query,
        expectedDocument: testCase.expectedDocument,
        expectedSection: testCase.expectedSection,
        hitAt1,
        hitAt3,
        results: retrieved.map((result) => ({
          documentName: result.documentName,
          section: result.section,
          similarity: result.similarity,
        })),
      });
    }

    const hitAt1Count = results.filter((result) => result.hitAt1).length;
    const hitAt3Count = results.filter((result) => result.hitAt3).length;
    const totalQueries = results.length;

    return {
      metrics: {
        hitAt1: {
          successfulQueries: hitAt1Count,
          totalQueries,
          score: totalQueries > 0 ? hitAt1Count / totalQueries : 0,
        },
        hitAt3: {
          successfulQueries: hitAt3Count,
          totalQueries,
          score: totalQueries > 0 ? hitAt3Count / totalQueries : 0,
        },
      },
      results,
    };
  }
}
