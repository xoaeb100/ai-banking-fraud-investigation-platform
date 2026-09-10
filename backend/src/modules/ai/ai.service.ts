import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { GoogleGenAI, Type, FunctionDeclaration } from '@google/genai';
import { createCustomerTools } from './tools/customer.tools';
import { InvestigationInput } from './dto/investigation-input.dto';
import {
  InvestigationOutput,
  InvestigationOutputSchema,
} from './schemas/investigation-output.schema';
import { ConfigService } from '@nestjs/config';
import { RagRetrievalService } from './rag/rag-retrieval.service';
import { TransactionService } from '../transaction/transaction.service';
import { createTransactionTools } from './tools/transaction.tools';
@Injectable()
export class AiService {
  private readonly ai: GoogleGenAI;

  constructor(
    private readonly configService: ConfigService,
    private readonly ragRetrievalService: RagRetrievalService,
    private readonly transactionService: TransactionService,
  ) {
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
    const policyQuery = `
Fraud investigation guidance for a ${input.riskLevel} risk transaction.

Risk reasons:
${input.reasons.join('\n')}
`;

    const policyChunks = await this.ragRetrievalService.search(policyQuery, 3);

    const policyContext = policyChunks
      .map(
        (chunk, index) => `
Policy Source ${index + 1}:
Document: ${chunk.documentName}
Similarity: ${chunk.similarity}
Content: ${chunk.content}
`,
      )
      .join('\n');

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

Investigation requirements:

- You MUST call get_transaction using the transaction ID before completing the investigation.
- After receiving the transaction, identify its customer ID.
- You MUST call get_customer_history using the customer ID associated with the transaction.
- Use the tool results as evidence for your investigation.
- You may call the tools sequentially when one tool's result provides information required by another tool.
- After you have gathered the necessary information, produce the structured investigation report.

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

Retrieved fraud policy context:

${policyContext}
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

      const response = await this.withRetryAndTimeout(
        () =>
          this.ai.models.generateContent({
            model: 'gemini-3.5-flash',
            contents,
            config: {
              temperature: 0.1,
              tools,
            },
          }),
        20000,
      );
      const transactionTools = {
        ...createTransactionTools(this.transactionService),
        ...createCustomerTools(this.transactionService),
      };

      let currentResponse = response;

      for (let step = 0; step < 5; step++) {
        const modelParts =
          currentResponse.candidates?.[0]?.content?.parts ?? [];

        const functionCalls = modelParts
          .filter((part) => part.functionCall)
          .map((part) => part.functionCall!);

        // No more tool calls.
        // The model is ready to produce the final investigation.
        if (functionCalls.length === 0) {
          break;
        }

        console.log(`TOOL STEP ${step + 1}`);

        contents.push({
          role: 'model',
          parts: modelParts,
        });

        const functionResponses: any[] = [];

        for (const functionCall of functionCalls) {
          console.log('TOOL NAME:', functionCall.name);
          console.log('TOOL ARGS:', functionCall.args);

          if (!functionCall.name) {
            throw new Error('Tool call is missing a function name');
          }

          const tool = transactionTools[functionCall.name];

          if (!tool) {
            throw new Error(`Unknown tool: ${functionCall.name}`);
          }

          const toolResult = await tool(functionCall.args);

          console.log('TOOL RESULT:', toolResult);

          functionResponses.push({
            functionResponse: {
              name: functionCall.name,
              response: {
                result: toolResult,
              },
            },
          });
        }

        contents.push({
          role: 'user',
          parts: functionResponses,
        });

        currentResponse = await this.withRetryAndTimeout(
          () =>
            this.ai.models.generateContent({
              model: 'gemini-3.6-flash',
              contents,
              config: {
                temperature: 0.1,
                tools,
              },
            }),
          20000,
        );
      }
      // =========================================================
      // STEP 6
      // Ask Gemini for the final structured investigation report.
      // =========================================================

      const finalResponse = await this.withRetryAndTimeout(
        () =>
          this.ai.models.generateContent({
            model: 'gemini-3.5-flash',
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
