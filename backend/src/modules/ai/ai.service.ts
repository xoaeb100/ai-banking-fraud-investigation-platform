import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { GoogleGenAI, Type, FunctionDeclaration } from '@google/genai';
import { InvestigationInput } from './dto/investigation-input.dto';
import {
  InvestigationOutput,
  InvestigationOutputSchema,
} from './schemas/investigation-output.schema';
import { ConfigService } from '@nestjs/config';
import { InvestigationAgent } from './agents/investigation.agent';
@Injectable()
export class AiService {
  private readonly ai: GoogleGenAI;
  private readonly model: string;
  constructor(
    private readonly configService: ConfigService,
    private readonly investigationAgent: InvestigationAgent,
  ) {
    const apiKey = this.configService.get<string>('gemini.apiKey');

    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured');
    }
    const model = this.configService.get<string>('gemini.model');

    if (!model) {
      throw new Error('GEMINI_MODEL is not configured');
    }

    this.model = model;
    this.ai = new GoogleGenAI({
      apiKey,
    });
  }

  async generateInvestigationSummary(
    input: InvestigationInput,
  ): Promise<InvestigationOutput> {
    const prompt = `
You are assisting a human fraud analyst investigating a banking transaction.

Transaction ID: ${input.transactionId}

The backend has provided the following risk information:

Risk Score: ${input.riskScore}
Risk Level: ${input.riskLevel}

Risk Reasons:
${input.reasons.map((reason) => `- ${reason}`).join('\n')}

Available tools:

1. get_transaction
   Use this to retrieve the transaction details.

2. get_customer_history
   Use this to retrieve recent transactions belonging to the customer.

3. search_fraud_policy
   Use this when you need fraud-policy guidance to interpret the evidence or determine the appropriate investigation procedure.

Investigation requirements:

- Start by retrieving the investigated transaction using get_transaction.
- After receiving the transaction, decide what additional information is necessary to investigate it.
- Use get_customer_history when customer behavior or recent transaction activity is relevant to the investigation.
- You may call available tools sequentially when one tool's result provides information needed for another tool.
- Do not call a tool if its information is not needed.
- Stop gathering information when you have sufficient evidence to produce the investigation report.
- Use tool results as evidence for your investigation.
- Use search_fraud_policy when policy guidance is relevant to the investigation.
- Prefer retrieved policy content over assumptions about internal fraud procedures.

IMPORTANT:
- Treat transaction timestamps carefully.
- Do not use transactions that occurred after the investigated transaction as evidence for what was known at the time of that transaction.
- If later transactions are relevant, explicitly identify them as subsequent activity.
- Distinguish observed facts from your interpretation. Do not present speculative fraud patterns as confirmed facts.

- Do NOT calculate or modify the risk score.
- Do NOT change the risk level supplied by the backend.
- Do NOT invent transaction information.
- Do NOT claim that the transaction is confirmed fraud.
- The final fraud decision belongs to a human fraud analyst.
`;
    const functionDeclarations: FunctionDeclaration[] = [
      {
        name: 'get_transaction',
        description: 'Retrieve a transaction by its transaction ID.',
        parameters: {
          type: Type.OBJECT,
          properties: {
            transactionId: {
              type: Type.STRING,
              description: 'The unique ID of the transaction.',
            },
          },
          required: ['transactionId'],
        },
      },
      {
        name: 'get_customer_history',
        description: 'Retrieve recent transactions belonging to a customer.',
        parameters: {
          type: Type.OBJECT,
          properties: {
            customerId: {
              type: Type.STRING,
              description:
                'The unique ID of the customer whose transaction history should be retrieved.',
            },
            limit: {
              type: Type.NUMBER,
              description:
                'Maximum number of recent transactions to return. Maximum allowed is 50.',
            },
          },
          required: ['customerId'],
        },
      },

      {
        name: 'search_fraud_policy',
        description:
          'Search the fraud policy knowledge base for guidance relevant to the current investigation.',
        parameters: {
          type: Type.OBJECT,
          properties: {
            query: {
              type: Type.STRING,
              description:
                'The fraud investigation question or policy topic to search for.',
            },
            limit: {
              type: Type.NUMBER,
              description:
                'Maximum number of relevant policy chunks to return. Maximum allowed is 5.',
            },
          },
          required: ['query'],
        },
      },
    ];

    const tools = [
      {
        functionDeclarations,
      },
    ];
    try {
      // =========================================================
      // STEP 1
      // Ask Gemini to investigate and request the required tool.
      // =========================================================

      const contents: any[] = [
        {
          role: 'user',
          parts: [{ text: prompt }],
        },
      ];

      await this.investigationAgent.investigate(this.ai, contents, tools);
      // =========================================================
      // STEP 6
      // Ask Gemini for the final structured investigation report.
      // =========================================================

      const finalResponse = await this.withRetryAndTimeout(
        () =>
          this.ai.models.generateContent({
            model: this.model,
            contents,
            config: {
              temperature: 0.1,
              responseMimeType: 'application/json',
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  riskAssessment: {
                    type: Type.STRING,
                    enum: ['LOW', 'MEDIUM', 'HIGH'],
                  },

                  summary: {
                    type: Type.STRING,
                  },

                  evidence: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.STRING,
                    },
                  },

                  policyReferences: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.STRING,
                    },
                  },

                  recommendedAction: {
                    type: Type.STRING,
                    enum: ['MONITOR', 'REVIEW', 'ESCALATE'],
                  },

                  confidence: {
                    type: Type.NUMBER,
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
        20000,
      );

      const finalText = finalResponse.text;

      if (!finalText) {
        throw new Error('LLM returned an empty final investigation response');
      }

      console.log('FINAL LLM RESPONSE:', finalText);

      // =========================================================
      // STEP 7
      // Validate Gemini's structured output with Zod.
      // =========================================================

      const parsed = JSON.parse(finalText);

      return InvestigationOutputSchema.parse(parsed);
    } catch (error) {
      console.error('LLM investigation failed', error);

      throw new InternalServerErrorException(
        'Failed to generate investigation summary',
      );
    }
  }

  private async withRetryAndTimeout<T>(
    operation: () => Promise<T>,
    timeoutMs: number,
    maxRetries: number = 2,
  ): Promise<T> {
    let lastError: unknown;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await this.withTimeout(operation(), timeoutMs);
      } catch (error) {
        lastError = error;
        const status =
          typeof error === 'object' && error !== null && 'status' in error
            ? (error as { status?: number }).status
            : undefined;
        const isTimeout =
          error instanceof Error && error.message.includes('timed out');
        const isRetryable = status === 503 || isTimeout;
        if (!isRetryable || attempt === maxRetries) {
          throw error;
        }
        const delayMs = 1000 * (attempt + 1);
        console.log(
          `Gemini request failed temporarily. Retrying in ${delayMs}ms...`,
        );
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
    throw lastError;
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
