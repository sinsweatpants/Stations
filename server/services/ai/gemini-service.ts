import { GoogleGenerativeAI } from '@google/generative-ai';
import logger from '../../utils/logger';

export enum GeminiModel {
  PRO = 'gemini-2.5-pro',
  FLASH = 'gemini-2.0-flash-lite',
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

export interface GeminiResponse<T> {
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

    if (this.config.fallbackModel && !allowedModels.includes(this.config.fallbackModel)) {
      throw new Error(
        `Invalid fallback model: ${this.config.fallbackModel}. ` +
        `Only ${allowedModels.join(', ')} are allowed.`
      );
    }
  }

  async generate<T>(request: GeminiRequest): Promise<GeminiResponse<T>> {
    this.validateModels();

    const primaryModel = request.model ?? this.config.defaultModel;

    try {
      return await this.performRequest<T>({ ...request, model: primaryModel });
    } catch (primaryError) {
      if (
        this.config.fallbackModel &&
        this.config.fallbackModel !== primaryModel
      ) {
        logger.warn('Primary Gemini model failed. Falling back to secondary model.', {
          primaryModel,
          fallbackModel: this.config.fallbackModel,
        });

        return this.performRequest<T>({ ...request, model: this.config.fallbackModel });
      }

      return this.handleError<T>(primaryError, request);
    }
  }

  private async performRequest<T>(request: GeminiRequest): Promise<GeminiResponse<T>> {
    const startTime = Date.now();
    const model = this.genAI.getGenerativeModel({ model: request.model });

    const fullPrompt = `${request.systemInstruction || ''}\n\nContext: ${request.context || 'N/A'}\n\nPrompt: ${request.prompt}`;

    const result = await model.generateContent(fullPrompt);
    const response = result.response;
    const text = response.text();

    const usage = {
      promptTokens: fullPrompt.length / 4,
      completionTokens: text.length / 4,
      totalTokens: (fullPrompt.length + text.length) / 4,
    };

    return {
      model: request.model,
      content: this.parseResponse<T>(text),
      usage,
      metadata: {
        timestamp: new Date(),
        latency: Date.now() - startTime,
      },
    };
  }

  private parseResponse<T>(responseText: string): T {
    try {
      // Clean the response to extract only the JSON part
      const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/);
      if (jsonMatch && jsonMatch[1]) {
        return JSON.parse(jsonMatch[1]) as T;
      }
      // Fallback for responses that might just be JSON without markdown
      return JSON.parse(responseText) as T;
    } catch (error) {
      logger.warn('Failed to parse JSON from response. Returning raw text.', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return { raw: responseText } as unknown as T;
    }
  }

  private async handleError<T>(
    error: unknown,
    request: GeminiRequest
  ): Promise<never> {
    const message = error instanceof Error ? error.message : 'Unknown error';
    logger.error(`Failed to generate content with model ${request.model}`, {
      error: message,
    });
    throw error instanceof Error ? error : new Error(message);
  }
}