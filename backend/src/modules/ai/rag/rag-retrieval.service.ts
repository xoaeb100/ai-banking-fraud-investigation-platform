import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

import { EmbeddingService } from '../embedding/embedding.service';

@Injectable()
export class RagRetrievalService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly embeddingService: EmbeddingService,
  ) {}

  async search(
    query: string,
    topK = 3,
    minSimilarity = 0.7,
  ): Promise<
    {
      id: string;
      documentName: string;
      section: string | null;
      content: string;
      similarity: number;
    }[]
  > {
    const queryEmbedding = await this.embeddingService.generateEmbedding(query);

    const vector = `[${queryEmbedding.join(',')}]`;

    const results = await this.dataSource.query(
      `
  SELECT
    "id",
    "documentName",
    "section",
    "content",
    1 - ("embedding" <=> $1::vector) AS "similarity"
  FROM "policy_chunks"
  WHERE 1 - ("embedding" <=> $1::vector) >= $3
  ORDER BY "embedding" <=> $1::vector
  LIMIT $2
  `,
      [vector, topK, minSimilarity],
    );

    return results;
  }
}
