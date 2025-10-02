import { GoogleGenerativeAI } from '@google/generative-ai';
import logger from '../../utils/logger';

export enum GeminiModel {
  PRO = 'gemini-2.5-pro',
  FLASH = 'gemini-1.5-flash'
}

export interface GeminiConfig {
  apiKey: string;
  defaultModel: GeminiModel;
  maxRetries: number;
  timeout: number;
  fallbackModel?: GeminiModel;
}

export interface GeminiRequest {
  prompt: string;
  model: GeminiModel;
  context?: string;
  systemInstruction?: string;
  temperature?: number;
  maxTokens?: number;
}

export function isValidJSONResponse<T>(obj: unknown): obj is T {
  return typeof obj === 'object' && obj !== null;
}

export function hasRequiredFields<T extends Record<string, unknown>>(
  obj: unknown,
  fields: (keyof T)[]
): obj is T {
  if (!isValidJSONResponse<T>(obj)) {
    return false;
  }

  return fields.every(field => Object.prototype.hasOwnProperty.call(obj, field));
}

export interface GeminiResponse<T = unknown> {
  model: GeminiModel;
  content: T;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  metadata: {
    timestamp: Date;
    latency: number;
  };
}

export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private config: GeminiConfig;

  constructor(config: GeminiConfig) {
    this.config = config;
    this.genAI = new GoogleGenerativeAI(config.apiKey);
    this.validateModels();
  }

  private validateModels(): void {
    const allowedModels = Object.values(GeminiModel);
    if (!allowedModels.includes(this.config.defaultModel)) {
      throw new Error(
        `Invalid model: ${this.config.defaultModel}. ` +
        `Only ${allowedModels.join(', ')} are allowed.`
      );
    }
  }

  async generate<T>(request: GeminiRequest): Promise<GeminiResponse<T>> {
    this.validateModels();
    
    try {
      const startTime = Date.now();
      const model = this.genAI.getGenerativeModel({ model: request.model });
      
      const fullPrompt = `${request.systemInstruction || ''}\n\nContext: ${request.context || 'N/A'}\n\nPrompt: ${request.prompt}`;
      
      const result = await model.generateContent(fullPrompt);
      const response = result.response;
      const text = response.text();

      // Dummy usage data as the API v1 doesn't provide it directly in this call
      const usage = {
        promptTokens: fullPrompt.length / 4, // Rough estimation
        completionTokens: text.length / 4, // Rough estimation
        totalTokens: (fullPrompt.length + text.length) / 4,
      };

      return {
        model: request.model,
        content: this.parseResponse<T>(text),
        usage,
        metadata: {
          timestamp: new Date(),
          latency: Date.now() - startTime
        }
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`Error calling Gemini API for model ${request.model}`, { error: errorMessage });
      return this.handleError(error, request);
    }
  }

  private parseResponse<T>(responseText: string): T {
    try {
      // Clean the response to extract only the JSON part
      const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/);
      let parsed: unknown;

      if (jsonMatch && jsonMatch[1]) {
        parsed = JSON.parse(jsonMatch[1]);
      } else {
        // Fallback for responses that might just be JSON without markdown
        parsed = JSON.parse(responseText);
      }
      if (!isValidJSONResponse(parsed)) {
        logger.warn('Parsed response is not a valid object');
        return { raw: responseText, error: 'Invalid response format' } as unknown as T;
      }

      return parsed as T;
    } catch (error) {
      logger.warn('Failed to parse JSON from response. Returning raw text.');
      return { raw: responseText, error: 'JSON parse failed' } as unknown as T;
    }
  }

  private async handleError(
    error: unknown,
    request: GeminiRequest
  ): Promise<GeminiResponse<unknown>> {
    // In a real app, you'd have more sophisticated retry/fallback logic
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error(`Failed to generate content with model ${request.model}`, {
      error: errorMessage
    });
    throw error;
  }
}