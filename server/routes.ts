import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { GeminiService, GeminiModel } from "./services/ai/gemini-service";
import { AIResultSelector } from "./services/ai/result-selector";
import { Station1TextAnalysis } from "./stations/station1/station1-text-analysis";
import { Station2ConceptualAnalysis } from "./stations/station2/station2-conceptual-analysis";
import { Station3NetworkBuilder } from "./stations/station3/station3-network-builder";
import { analyzeTextSchema, type Station1Response } from "@shared/schema";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

if (!GEMINI_API_KEY) {
  console.warn('⚠️  WARNING: GEMINI_API_KEY is not set. Text analysis will fail.');
  console.warn('Please set GEMINI_API_KEY in your environment variables or Replit Secrets.');
}

const geminiService = new GeminiService({
  apiKey: GEMINI_API_KEY,
  defaultModel: GeminiModel.PRO,
  maxRetries: 3,
  timeout: 60000,
  fallbackModel: GeminiModel.FLASH
});

const resultSelector = new AIResultSelector();
const station1 = new Station1TextAnalysis(geminiService, resultSelector);
const station2 = new Station2ConceptualAnalysis(geminiService, resultSelector);
const station3 = new Station3NetworkBuilder(geminiService, resultSelector);

// استيراد Pipeline الشامل
import { AnalysisPipeline } from './run-all-stations';
const analysisPipeline = new AnalysisPipeline(GEMINI_API_KEY);

export async function registerRoutes(app: Express): Promise<Server> {
  
  app.post('/api/analyze-text', async (req, res) => {
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
    } catch (error: any) {
      console.error('Error analyzing text:', error);
      res.status(500).json({ 
        error: 'فشل تحليل النص',
        message: error.message 
      });
    }
  });

  // نقطة نهاية لتشغيل جميع المحطات
  app.post('/api/analyze-full-pipeline', async (req, res) => {
    try {
      const validatedData = analyzeTextSchema.parse(req.body);
      
      console.log('🚀 بدء تشغيل Pipeline الشامل...');
      
      const result = await analysisPipeline.runFullAnalysis({
        fullText: validatedData.fullText,
        projectName: validatedData.projectName,
        proseFilePath: validatedData.proseFilePath
      });

      res.json({
        success: true,
        data: result,
        message: `تم إنجاز ${result.pipelineMetadata.stationsCompleted} محطات من أصل 5`,
        executionTime: `${(result.pipelineMetadata.totalExecutionTime / 1000).toFixed(1)} ثانية`
      });
    } catch (error: any) {
      console.error('Error in full pipeline:', error);
      res.status(500).json({ 
        success: false,
        error: 'فشل تشغيل Pipeline الشامل',
        message: error.message 
      });
    }
  });

  // نقطة نهاية للحصول على حالة المحطات
  app.get('/api/stations-status', (req, res) => {
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
