/**
 * The investigation agent is advisory only.
 *
 * It may retrieve evidence and generate an investigation report,
 * but it must never modify investigation case status,
 * risk score, or risk level.
 *
 * Final case decisions remain under human analyst control.
 */
import { Injectable } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';
import { TransactionService } from '../../transaction/transaction.service';
import { createTransactionTools } from '../tools/transaction.tools';
import { createCustomerTools } from '../tools/customer.tools';
import { ConfigService } from '@nestjs/config';
import { RagRetrievalService } from '../rag/rag-retrieval.service';
import { createFraudPolicyTools } from '../tools/fraud-policy.tools';
@Injectable()
export class InvestigationAgent {
  private readonly model: string;

  constructor(
    private readonly transactionService: TransactionService,
    private readonly configService: ConfigService,
    private readonly ragRetrievalService: RagRetrievalService,
  ) {
    const model = this.configService.get<string>('gemini.model');

    if (!model) {
      throw new Error('GEMINI_MODEL is not configured');
    }

    this.model = model;
  }

  async investigate(
    ai: GoogleGenAI,
    contents: any[],
    tools: any[],
    correlationId: string,
    promptVersion: string,
  ): Promise<{
    toolCalls: string[];
    llmCallCount: number;
  }> {
    const toolCalls: string[] = [];
    const transactionTools = {
      ...createTransactionTools(this.transactionService),
      ...createCustomerTools(this.transactionService),
      ...createFraudPolicyTools(this.ragRetrievalService),
    };

    console.log(`[${correlationId}] Agent configuration`, {
      model: this.model,
      promptVersion,
    });
    let llmCallCount = 0;

    llmCallCount++;

    const llmStartedAt = Date.now();

    let currentResponse = await ai.models.generateContent({
      model: this.model,
      contents,
      config: {
        temperature: 0.1,
        tools,
      },
    });

    console.log(`[${correlationId}] LLM CALL ${llmCallCount} completed`, {
      latencyMs: Date.now() - llmStartedAt,
      usage: currentResponse.usageMetadata,
    });

    for (let step = 0; step < 5; step++) {
      const modelParts = currentResponse.candidates?.[0]?.content?.parts ?? [];

      const functionCalls = modelParts
        .filter((part) => part.functionCall)
        .map((part) => part.functionCall!);

      if (functionCalls.length === 0) {
        break;
      }

      console.log(`[${correlationId}] AGENT TOOL STEP ${step + 1}`);
      contents.push({
        role: 'model',
        parts: modelParts,
      });

      const functionResponses: any[] = [];

      const allowedTools = new Set([
        'get_transaction',
        'get_customer_history',
        'search_fraud_policy',
      ]);

      for (const functionCall of functionCalls) {
        console.log(`[${correlationId}] TOOL NAME:`, functionCall.name);
        console.log(`[${correlationId}] TOOL ARGS:`, functionCall.args);

        if (!functionCall.name) {
          throw new Error('Tool call is missing a function name');
        }

        if (!allowedTools.has(functionCall.name)) {
          throw new Error(
            `Tool "${functionCall.name}" is not allowed for fraud investigation`,
          );
        }

        const tool = transactionTools[functionCall.name];

        if (!tool) {
          throw new Error(`Tool "${functionCall.name}" is not registered`);
        }

        const toolStartedAt = Date.now();

        try {
          const toolResult = await tool(functionCall.args);

          console.log(`[${correlationId}] TOOL COMPLETED`, {
            tool: functionCall.name,
            latencyMs: Date.now() - toolStartedAt,
          });

          console.log(`[${correlationId}] TOOL RESULT:`, toolResult);

          functionResponses.push({
            functionResponse: {
              name: functionCall.name,
              response: {
                result: toolResult,
              },
            },
          });

          toolCalls.push(functionCall.name);
        } catch (error) {
          console.error(`[${correlationId}] TOOL FAILED`, {
            tool: functionCall.name,
            latencyMs: Date.now() - toolStartedAt,
            error: error instanceof Error ? error.message : error,
          });

          throw error;
        }
      }
      contents.push({
        role: 'user',
        parts: functionResponses,
      });

      llmCallCount++;

      const llmStartedAt = Date.now();

      currentResponse = await ai.models.generateContent({
        model: this.model,
        contents,
        config: {
          temperature: 0.1,
          tools,
        },
      });
      console.log(`[${correlationId}] LLM CALL ${llmCallCount} completed`, {
        latencyMs: Date.now() - llmStartedAt,
        usage: currentResponse.usageMetadata,
      });
    }
    return {
      toolCalls,
      llmCallCount,
    };
  }
}
