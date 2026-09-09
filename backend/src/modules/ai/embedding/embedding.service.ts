import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI } from '@google/genai';

@Injectable()
export class EmbeddingService {
  private readonly ai: GoogleGenAI;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('gemini.apiKey');

    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    this.ai = new GoogleGenAI({
      apiKey,
    });
  }

  async generateEmbedding(text: string): Promise<number[]> {
    const response = await this.ai.models.embedContent({
      model: 'gemini-embedding-001',
      contents: text,
    });

    const values = response.embeddings?.[0]?.values;

    if (!values) {
      throw new Error('Embedding API returned no vector');
    }

    return values;
  }

  async testEmbedding(): Promise<void> {
    const text = 'HIGH risk transactions require human fraud analyst review.';

    const embedding = await this.generateEmbedding(text);

    console.log('Embedding dimensions:', embedding.length);
    console.log('First 10 values:', embedding.slice(0, 10));
  }

  async testSimilarity(): Promise<{
    similarityAB: number;
    similarityAC: number;
  }> {
    const textA = 'High risk transactions require human fraud analyst review.';

    const textB =
      'Transactions with high risk must be reviewed by a fraud investigator.';

    const textC =
      'Customers can update their mailing address through the banking application.';

    const [embeddingA, embeddingB, embeddingC] = await Promise.all([
      this.generateEmbedding(textA),
      this.generateEmbedding(textB),
      this.generateEmbedding(textC),
    ]);

    const cosineSimilarity = (vectorA: number[], vectorB: number[]): number => {
      let dotProduct = 0;
      let magnitudeA = 0;
      let magnitudeB = 0;

      for (let i = 0; i < vectorA.length; i++) {
        dotProduct += vectorA[i] * vectorB[i];
        magnitudeA += vectorA[i] * vectorA[i];
        magnitudeB += vectorB[i] * vectorB[i];
      }

      return dotProduct / (Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB));
    };

    return {
      similarityAB: cosineSimilarity(embeddingA, embeddingB),
      similarityAC: cosineSimilarity(embeddingA, embeddingC),
    };
  }
}
