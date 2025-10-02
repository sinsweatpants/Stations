import type { Express } from 'express';
import { createServer, type Server } from 'http';
import { z } from 'zod';
import { GeminiService, GeminiModel } from './services/ai/gemini-service';
import { Station1TextAnalysis } from './stations/station1/station1-text-analysis';
import { Station2ConceptualAnalysis } from './stations/station2/station2-conceptual-analysis';
import { Station3NetworkBuilder } from './stations/station3/station3-network-builder';
import { analyzeTextSchema, type Station1Response } from '@shared/schema';
import { AnalysisPipeline } from './run-all-stations';
import { apiKeyAuth, optionalAuth } from './middleware/auth';
import { sanitizeInput, requireJsonContent } from './middleware/sanitize';
import { aiAnalysisLimiter, readLimiter } from './middleware/rate-limit';
import healthRoutes from './routes/health';
import logger from './utils/logger';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

if (!GEMINI_API_KEY) {
  logger.warn('GEMINI_API_KEY is not set. Text analysis will fail.');
  logger.warn('Please set GEMINI_API_KEY in your environment variables.');
}

const geminiService = new GeminiService({
  apiKey: GEMINI_API_KEY,
  defaultModel: GeminiModel.PRO,
  maxRetries: 3,
  timeout: 60000,
  fallbackModel: GeminiModel.FLASH
});

const station1 = new Station1TextAnalysis({
  stationNumber: 1,
  stationName: 'Text Analysis',
  inputValidation: input => Boolean(input.fullText?.length >= 100),
  outputValidation: output => Boolean(output.majorCharacters?.length),
  cacheEnabled: false,
  performanceTracking: true
}, geminiService);

const station2 = new Station2ConceptualAnalysis({
  stationNumber: 2,
  stationName: 'Conceptual Analysis',
  inputValidation: input => Boolean(input.station1Output && input.fullText.length >= 100),
  outputValidation: output => Boolean(output.storyStatement),
  cacheEnabled: false,
  performanceTracking: true
}, geminiService);

const station3 = new Station3NetworkBuilder({
  stationNumber: 3,
  stationName: 'Network Builder',
  inputValidation: input => Boolean(input.station1Output && input.station2Output),
  outputValidation: output => Boolean(output.conflictNetwork),
  cacheEnabled: false,
  performanceTracking: true
}, geminiService);

const analysisPipeline = new AnalysisPipeline(GEMINI_API_KEY);

export async function registerRoutes(app: Express): Promise<Server> {
  app.use('/', healthRoutes);

  app.post(
    '/api/analyze-text',
    requireJsonContent,
    sanitizeInput,
    aiAnalysisLimiter,
    apiKeyAuth,
    async (req, res) => {
      try {
        const validatedData = analyzeTextSchema.parse(req.body);

        const station1Result = await station1.execute({
          fullText: validatedData.fullText,
          projectName: validatedData.projectName,
          proseFilePath: validatedData.proseFilePath
        });

        const station2Result = await station2.execute({
          station1Output: station1Result.output,
          fullText: validatedData.fullText
        });

        const station3Result = await station3.execute({
          station1Output: station1Result.output,
          station2Output: station2Result.output,
          fullText: validatedData.fullText
        });

        const response: Station1Response = {
          majorCharacters: station1Result.output.majorCharacters,
          characterAnalysis: Object.fromEntries(station1Result.output.characterAnalysis),
          relationshipAnalysis: station1Result.output.relationshipAnalysis,
          narrativeStyleAnalysis: station1Result.output.narrativeStyleAnalysis,
          metadata: {
            analysisTimestamp: station1Result.output.metadata.analysisTimestamp.toISOString(),
            status: station1Result.output.metadata.status
          }
        };

        res.json({
          station1: response,
          station2: {
            storyStatement: station2Result.output.storyStatement,
            elevatorPitch: station2Result.output.elevatorPitch,
            hybridGenre: station2Result.output.hybridGenre
          },
          station3: {
            networkSummary: station3Result.output.networkSummary
          }
        });
      } catch (error: unknown) {
        if (error instanceof z.ZodError) {
          res.status(400).json({
            error: 'Validation failed',
            message: 'Invalid input data',
            details: error.errors
          });
          return;
        }

        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logger.error('Error analyzing text', { error: errorMessage });
        res.status(500).json({
          error: 'فشل تحليل النص',
          message: errorMessage
        });
      }
    }
  );

  app.post(
    '/api/analyze-full-pipeline',
    requireJsonContent,
    sanitizeInput,
    aiAnalysisLimiter,
    apiKeyAuth,
    async (req, res) => {
      try {
        const validatedData = analyzeTextSchema.parse(req.body);
        logger.info('Starting full pipeline analysis');

        const result = await analysisPipeline.runFullAnalysis({
          fullText: validatedData.fullText,
          projectName: validatedData.projectName,
          proseFilePath: validatedData.proseFilePath
        });

        res.json({
          success: true,
          data: result,
          message: `تم إنجاز ${result.pipelineMetadata.stationsCompleted} محطات من أصل 7`,
          executionTime: `${(result.pipelineMetadata.totalExecutionTime / 1000).toFixed(1)} ثانية`
        });
      } catch (error: unknown) {
        if (error instanceof z.ZodError) {
          res.status(400).json({
            success: false,
            error: 'Validation failed',
            message: 'Invalid input data',
            details: error.errors
          });
          return;
        }

        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logger.error('Error in full pipeline', { error: errorMessage });
        res.status(500).json({
          success: false,
          error: 'فشل تشغيل Pipeline الشامل',
          message: errorMessage
        });
      }
    }
  );

  app.get('/api/stations-status', readLimiter, optionalAuth, (_req, res) => {
    const status = analysisPipeline.getStationStatus();
    res.json({
      success: true,
      stations: status,
      totalStations: Object.keys(status).length,
      availableStations: Object.values(status).filter(s => s.includes('متاح')).length
    });
  });

  const httpServer = createServer(app);

  return httpServer;
}
