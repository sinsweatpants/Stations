import { GoogleGenerativeAI } from '@google/generative-ai';

// Basic logger
const logger = {
  info: (message: string) => console.log(`[INFO] ${message}`),
  error: (message: string) => console.error(`[ERROR] ${message}`),
  warn: (message: string) => console.warn(`[WARN] ${message}`),
};

export enum GeminiModel {
  PRO = 'gemini-2.5-pro',
}

export interface GeminiConfig {
  apiKey: string;
  defaultModel: GeminiModel;
  maxRetries: number;
  timeout: number;
}

export interface GeminiRequest {
  prompt: string;
  model: GeminiModel;
  context?: string;
  systemInstruction?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface GeminiResponse<T = any> {
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
        usage: usage,
        metadata: {
          timestamp: new Date(),
          latency: Date.now() - startTime
        }
      };
    } catch (error) {
      logger.error(`Error calling Gemini API for model ${request.model}: ${error.message}`);
      return this.handleError(error, request);
    }
  }

  private parseResponse<T>(responseText: string): T {
    try {
      // Clean the response to extract only the JSON part
      const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/);
      if (jsonMatch && jsonMatch) {
        return JSON.parse(jsonMatch);
      }
      // Fallback for responses that might just be JSON without markdown
      return JSON.parse(responseText);
    } catch (error) {
      logger.warn('Failed to parse JSON from response. Returning raw text.');
      // If parsing fails, we return the raw text wrapped in a simple object
      // This might not match type T, but it prevents a crash.
      return { raw: responseText } as unknown as T;
    }
  }

  private async handleError(
    error: any,
    request: GeminiRequest
  ): Promise<GeminiResponse<any>> {
    // In a real app, you'd have more sophisticated retry/fallback logic
    logger.error(`Failed to generate content with model ${request.model}. Error: ${error.message}`);
    throw error; // Re-throw the error to be handled by the calling station
  }
}