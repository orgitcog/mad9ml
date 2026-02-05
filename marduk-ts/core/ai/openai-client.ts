import OpenAI from 'openai';
import { AiResponse, AiRequest } from './types/ai-types.js';

export class OpenAIClient {
  private static instance: OpenAIClient;
  private openai: OpenAI;
  private model = 'gpt-4-1106-preview';

  private constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  static getInstance(): OpenAIClient {
    if (!OpenAIClient.instance) {
      OpenAIClient.instance = new OpenAIClient();
    }
    return OpenAIClient.instance;
  }

  async generateResponse(request: AiRequest): Promise<AiResponse> {
    try {
      const completion = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: request.systemPrompt || this.getDefaultSystemPrompt() },
          ...request.context.map(msg => ({ role: 'assistant', content: msg })),
          { role: 'user', content: request.prompt }
        ],
        temperature: request.temperature || 0.7,
        max_tokens: request.maxTokens || 1000,
        top_p: request.topP || 1,
        frequency_penalty: request.frequencyPenalty || 0,
        presence_penalty: request.presencePenalty || 0
      });

      return {
        content: completion.choices[0].message?.content || '',
        usage: completion.usage || { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
        model: completion.model,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error generating OpenAI response:', error);
      throw new Error('Failed to generate AI response');
    }
  }

  private getDefaultSystemPrompt(): string {
    return `You are O1-mini, an advanced AI assistant integrated with the Marduk framework.
Your role is to assist with cognitive tasks, memory management, and knowledge synthesis.
Always provide clear, concise, and accurate responses.
When dealing with technical content, include relevant examples and explanations.`;
  }
}