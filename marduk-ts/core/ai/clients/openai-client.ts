import OpenAI from 'openai';
import { AiRequest, AiResponse, AiAssistant } from '../types/ai-types.js';
import { aiConfig } from '../config/ai-config.js';
import { validateAiRequest, enrichAiRequest } from '../utils/ai-utils.js';
import { env } from '../../../config/env.js';

export class OpenAIClient implements AiAssistant {
  private static instance: OpenAIClient;
  private openai: OpenAI;
  private retryCount = 3;
  private retryDelay = 1000;

  private constructor() {
    this.openai = new OpenAI({
      apiKey: env.openai.apiKey,
      organization: env.openai.organization
    });
  }

  static getInstance(): OpenAIClient {
    if (!OpenAIClient.instance) {
      OpenAIClient.instance = new OpenAIClient();
    }
    return OpenAIClient.instance;
  }

  async generateResponse(request: Partial<AiRequest>): Promise<AiResponse> {
    const enrichedRequest = enrichAiRequest(request);
    const validation = validateAiRequest(enrichedRequest);
    
    if (!validation.valid) {
      throw new Error(`Invalid request: ${validation.errors.join(', ')}`);
    }

    return this.executeWithRetry(() => this.callOpenAI(enrichedRequest));
  }

  private async callOpenAI(request: AiRequest): Promise<AiResponse> {
    try {
      const completion = await this.openai.chat.completions.create({
        model: aiConfig.models.default,
        messages: [
          { role: 'system', content: request.systemPrompt || aiConfig.systemPrompts.default },
          ...request.context.map(msg => ({ role: 'assistant', content: msg })),
          { role: 'user', content: request.prompt }
        ],
        temperature: request.temperature,
        max_tokens: request.maxTokens,
        top_p: request.topP,
        frequency_penalty: request.frequencyPenalty,
        presence_penalty: request.presencePenalty
      });

      return {
        content: completion.choices[0].message?.content || '',
        usage: completion.usage || { 
          prompt_tokens: 0, 
          completion_tokens: 0, 
          total_tokens: 0 
        },
        model: completion.model,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('OpenAI API Error:', error);
      throw new Error('Failed to generate AI response');
    }
  }

  private async executeWithRetry<T>(fn: () => Promise<T>): Promise<T> {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= this.retryCount; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;
        if (attempt < this.retryCount) {
          await new Promise(resolve => 
            setTimeout(resolve, this.retryDelay * attempt)
          );
        }
      }
    }

    throw lastError || new Error('Operation failed after retries');
  }
}