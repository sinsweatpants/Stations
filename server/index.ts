import express, { type Request, type Response, type NextFunction } from 'express';
import helmet from 'helmet';
import cors, { type CorsOptions } from 'cors';
import morgan from 'morgan';
import { registerRoutes } from './routes';
import { setupVite, serveStatic } from './vite';
import logger, { stream } from './utils/logger';
import { apiLimiter } from './middleware/rate-limit';

const app = express();

const corsOptions: CorsOptions = {
  origin(origin, callback) {
    if (!origin) {
      callback(null, true);
      return;
    }

    if (process.env.NODE_ENV === 'development') {
      callback(null, true);
      return;
    }

    const whitelist = (process.env.ALLOWED_ORIGINS || '').split(',').filter(Boolean);

    if (whitelist.length === 0) {
      logger.warn('No CORS origins configured. Allowing all origins.');
      callback(null, true);
      return;
    }

    if (whitelist.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:']
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));
app.use(cors(corsOptions));
app.use(morgan('combined', { stream }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false }));
app.use('/api', apiLimiter);

(async () => {
  const server = await registerRoutes(app);

  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    const status = typeof (err as { status?: number }).status === 'number'
      ? (err as { status: number }).status
      : 500;
    const message = err instanceof Error ? err.message : 'Internal Server Error';

    logger.error('Unhandled application error', {
      error: message,
      stack: err instanceof Error ? err.stack : undefined
    });

    res.status(status).json({ message });
  });

  if (app.get('env') === 'development') {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const port = Number.parseInt(process.env.PORT || '5000', 10);
  server.listen(
    {
      port,
      host: '0.0.0.0',
      reusePort: true
    },
    () => {
      logger.info(`Server started on port ${port}`);
    }
  );
})();
