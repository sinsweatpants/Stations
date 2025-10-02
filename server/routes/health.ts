import { Router, type Request, type Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import logger from '../utils/logger';

const router = Router();

router.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

router.get('/ready', async (req: Request, res: Response) => {
  const checks: Record<string, boolean> = {};
  let isReady = true;

  checks.geminiApiKey = Boolean(process.env.GEMINI_API_KEY);
  if (!checks.geminiApiKey) {
    isReady = false;
    logger.warn('Readiness check failed: Gemini API key not configured');
  }

  try {
    const testFile = path.join(process.cwd(), '.health-check-test');
    fs.writeFileSync(testFile, 'test');
    fs.unlinkSync(testFile);
    checks.fileSystem = true;
  } catch (error) {
    checks.fileSystem = false;
    isReady = false;
    logger.warn('Readiness check failed: File system not writable');
  }

  const status = isReady ? 200 : 503;
  res.status(status).json({
    status: isReady ? 'ready' : 'not ready',
    checks,
    timestamp: new Date().toISOString()
  });
});

router.get('/live', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString()
  });
});

export default router;
