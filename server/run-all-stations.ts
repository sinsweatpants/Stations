import * as dotenv from 'dotenv';
dotenv.config(); // Load environment variables from .env file

import { Station1TextAnalysis } from './stations/station1/station1-text-analysis';
import { Station2ConceptualAnalysis } from './stations/station2/station2-conceptual-analysis';
import { Station3NetworkBuilder } from './stations/station3/station3-network-builder';
import { Station4EfficiencyMetrics } from './stations/station4/station4-efficiency-metrics';
import { Station5DynamicSymbolicStylistic } from './stations/station5/station5-dynamic-symbolic-stylistic';
import { Station6DiagnosticsAndTreatment } from './stations/station6/station6-diagnostics-treatment';
import {
  Station7Finalization,
  Station7Input,
  Station7Output
} from './stations/station7/station7-finalization';
import { GeminiService, GeminiModel } from './services/ai/gemini-service';
import * as fs from 'fs';
import * as path from 'path';
import logger from './utils/logger';

async function runAllStations() {
  logger.info('================================================');
  logger.info('Starting Full Dramatic Text Analysis Pipeline');
  logger.info('================================================');

  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_api_key_here') {
    logger.error('GEMINI_API_KEY is not set or is invalid. Please create a .env file and add your API key.');
    return;
  }

  // --- Configuration ---
  const outputDir = path.join(process.cwd(), 'analysis_output');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Dummy text for analysis
  const fullText = "The king, a man of great pride, faced a dilemma. His daughter, the princess, loved a humble knight. The queen, ever the pragmatist, saw an opportunity. A rival kingdom threatened their borders, and the knight was their best warrior. The king's advisor, a treacherous man, plotted to use this situation to his advantage. A great conflict was brewing, not just on the battlefield, but within the castle walls.";
  
  // --- Service Initialization ---
  const geminiService = new GeminiService({
    apiKey: process.env.GEMINI_API_KEY,
    defaultModel: GeminiModel.PRO,
    maxRetries: 3,
    timeout: 60000,
  });

  // --- Station Initialization ---
  const station1Config = { stationNumber: 1, stationName: 'Text Analysis', inputValidation: () => true, outputValidation: () => true, cacheEnabled: false, performanceTracking: true };
  const station1 = new Station1TextAnalysis(station1Config, geminiService);

  const station2Config = { stationNumber: 2, stationName: 'Conceptual Analysis', inputValidation: () => true, outputValidation: () => true, cacheEnabled: false, performanceTracking: true };
  const station2 = new Station2ConceptualAnalysis(station2Config, geminiService);

  const station3Config = { stationNumber: 3, stationName: 'Network Builder', inputValidation: () => true, outputValidation: () => true, cacheEnabled: false, performanceTracking: true };
  const station3 = new Station3NetworkBuilder(station3Config, geminiService);

  const station4Config = { stationNumber: 4, stationName: 'Efficiency Metrics', inputValidation: () => true, outputValidation: () => true, cacheEnabled: false, performanceTracking: true };
  const station4 = new Station4EfficiencyMetrics(station4Config, geminiService);

  const station5Config = { stationNumber: 5, stationName: 'Dynamic, Symbolic & Stylistic Analysis', inputValidation: () => true, outputValidation: () => true, cacheEnabled: false, performanceTracking: true };
  const station5 = new Station5DynamicSymbolicStylistic(station5Config, geminiService);

  const station6Config = { stationNumber: 6, stationName: 'Diagnostics & Treatment', inputValidation: () => true, outputValidation: () => true, cacheEnabled: false, performanceTracking: true };
  const station6 = new Station6DiagnosticsAndTreatment(station6Config, geminiService);
  
  const station7Config: import('./core/pipeline/base-station').StationConfig<
    Station7Input,
    Station7Output
  > = {
    stationNumber: 7,
    stationName: 'Finalization & Visualization',
    inputValidation: (input) => Boolean(input.conflictNetwork && input.station6Output),
    outputValidation: (output) => Boolean(output.finalReport && output.visualizationResults),
    cacheEnabled: false,
    performanceTracking: true,
  };
  const station7 = new Station7Finalization(station7Config, geminiService, outputDir);

  const allStationsData = new Map<number, any>();

  try {
    // --- Station 1: Text Analysis ---
    logger.info('--- Running Station 1: Text Analysis ---');
    const s1Input = { fullText, projectName: 'MyProject', proseFilePath: 'dummy.txt' };
    const { output: s1Output } = await station1.execute(s1Input);
    allStationsData.set(1, s1Output);
    logger.info('Station 1 finished.');

    // --- Station 2: Conceptual Analysis ---
    logger.info('--- Running Station 2: Conceptual Analysis ---');
    const s2Input = { station1Output: s1Output, fullText };
    const { output: s2Output } = await station2.execute(s2Input);
    allStationsData.set(2, s2Output);
    logger.info('Station 2 finished.');

    // --- Station 3: Network Builder ---
    logger.info('--- Running Station 3: Network Builder ---');
    const s3Input = { station1Output: s1Output, station2Output: s2Output, fullText };
    const { output: s3Output } = await station3.execute(s3Input);
    allStationsData.set(3, s3Output);
    logger.info('Station 3 finished.');

    // --- Station 4: Efficiency Metrics ---
    logger.info('--- Running Station 4: Efficiency Metrics ---');
    const s4Input = { conflictNetwork: s3Output.conflictNetwork, station3Output: s3Output };
    const { output: s4Output } = await station4.execute(s4Input);
    allStationsData.set(4, s4Output);
    logger.info('Station 4 finished.');

    // --- Station 5: Dynamic, Symbolic & Stylistic Analysis ---
    logger.info('--- Running Station 5: Dynamic, Symbolic & Stylistic Analysis ---');
    const s5Input = { conflictNetwork: s3Output.conflictNetwork, station4Output: s4Output, fullText };
    const { output: s5Output } = await station5.execute(s5Input);
    allStationsData.set(5, s5Output);
    logger.info('Station 5 finished.');

    // --- Station 6: Diagnostics & Treatment ---
    logger.info('--- Running Station 6: Diagnostics & Treatment ---');
    const s6Input = { conflictNetwork: s3Output.conflictNetwork, station5Output: s5Output };
    const { output: s6Output } = await station6.execute(s6Input);
    allStationsData.set(6, s6Output);
    logger.info('Station 6 finished.');

    // --- Station 7: Finalization & Visualization ---
    logger.info('--- Running Station 7: Finalization & Visualization ---');
    const s7Input = { conflictNetwork: s3Output.conflictNetwork, station6Output: s6Output, allPreviousStationsData: allStationsData };
    const { output: s7Output } = await station7.execute(s7Input);
    allStationsData.set(7, s7Output);
    logger.info('Station 7 finished.');

    logger.info('================================================');
    logger.info('Full Analysis Pipeline Completed Successfully!');
    logger.info(`Final report and visualizations are available in: ${outputDir}`);
    logger.info('================================================');

  } catch (error) {
    logger.error('An error occurred during the pipeline execution:');
    logger.error(error.message);
    logger.error(error.stack);
  }
}

// Run the pipeline
runAllStations().catch(e => logger.error(`Unhandled error in pipeline: ${e.message}`));