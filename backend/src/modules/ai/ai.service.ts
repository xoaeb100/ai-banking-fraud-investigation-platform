import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';

import { InvestigationInput } from './dto/investigation-input.dto';
import {
  InvestigationOutput,
  InvestigationOutputSchema,
} from './schemas/investigation-output.schema';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AiService {
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

  async generateInvestigationSummary(
    input: InvestigationInput,
  ): Promise<InvestigationOutput> {
    const prompt = `
You are assisting a human fraud analyst.

Your job is to summarize and interpret the fraud evidence provided by the backend.

IMPORTANT RULES:
- Do NOT calculate or modify the risk score.
- Do NOT change the risk level.
- Do NOT invent evidence.
- Do NOT claim that the transaction is confirmed fraud.
- Use only the evidence provided.
- The final fraud decision belongs to a human fraud analyst.

Transaction evidence:

Transaction ID: ${input.transactionId}
Risk Score: ${input.riskScore}
Risk Level: ${input.riskLevel}

Risk reasons:
${input.reasons.map((reason) => `- ${reason}`).join('\n')}

Return the investigation assessment using exactly the requested structured output fields.

The riskAssessment must reflect the riskLevel supplied by the backend.
Do not calculate a new risk score.
`;

    try {
      const response = await this.withTimeout(
        this.ai.models.generateContent({
          model: 'gemini-3.6-flash',
          contents: prompt,
          config: {
            temperature: 0.1,
            responseMimeType: 'application/json',
            responseSchema: {
              type: 'object',
              properties: {
                riskAssessment: {
                  type: 'string',
                  enum: ['LOW', 'MEDIUM', 'HIGH'],
                },
                summary: {
                  type: 'string',
                },
                evidence: {
                  type: 'array',
                  items: {
                    type: 'string',
                  },
                },
                policyReferences: {
                  type: 'array',
                  items: {
                    type: 'string',
                  },
                },
                recommendedAction: {
                  type: 'string',
                  enum: ['MONITOR', 'REVIEW', 'ESCALATE'],
                },
                confidence: {
                  type: 'number',
                },
              },
              required: [
                'riskAssessment',
                'summary',
                'evidence',
                'policyReferences',
                'recommendedAction',
                'confidence',
              ],
            },
          },
        }),
        10000,
      );

      const text = response.text;

      if (!text) {
        throw new Error('LLM returned an empty response');
      }

      console.log('RAW LLM RESPONSE:', text);
      const parsed = JSON.parse(text);

      return InvestigationOutputSchema.parse(parsed);
    } catch (error) {
      console.error('LLM investigation failed', error);

      throw new InternalServerErrorException(
        'Failed to generate investigation summary',
      );
    }
  }

  private withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        setTimeout(() => {
          reject(new Error(`LLM request timed out after ${timeoutMs}ms`));
        }, timeoutMs);
      }),
    ]);
  }
}
