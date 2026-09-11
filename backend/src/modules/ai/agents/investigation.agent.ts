import { Injectable } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';
import { TransactionService } from '../../transaction/transaction.service';
import { createTransactionTools } from '../tools/transaction.tools';
import { createCustomerTools } from '../tools/customer.tools';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class InvestigationAgent {
  private readonly model: string;

  constructor(
    private readonly transactionService: TransactionService,
    private readonly configService: ConfigService,
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
  ): Promise<void> {
    const transactionTools = {
      ...createTransactionTools(this.transactionService),
      ...createCustomerTools(this.transactionService),
    };

    let currentResponse = await ai.models.generateContent({
      model: this.model,
      contents,
      config: {
        temperature: 0.1,
        tools,
      },
    });

    for (let step = 0; step < 5; step++) {
      const modelParts = currentResponse.candidates?.[0]?.content?.parts ?? [];

      const functionCalls = modelParts
        .filter((part) => part.functionCall)
        .map((part) => part.functionCall!);

      if (functionCalls.length === 0) {
        break;
      }

      console.log(`AGENT TOOL STEP ${step + 1}`);

      contents.push({
        role: 'model',
        parts: modelParts,
      });

      const functionResponses: any[] = [];

      const allowedTools = new Set(['get_transaction', 'get_customer_history']);

      for (const functionCall of functionCalls) {
        console.log('TOOL NAME:', functionCall.name);
        console.log('TOOL ARGS:', functionCall.args);

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

      currentResponse = await ai.models.generateContent({
        model: this.model,
        contents,
        config: {
          temperature: 0.1,
          tools,
        },
      });
    }

    return;
  }
}
