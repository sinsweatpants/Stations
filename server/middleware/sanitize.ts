import { Request, Response, NextFunction } from 'express';

export function sanitizeInput(req: Request, res: Response, next: NextFunction): void {
  if (req.body && typeof req.body === 'object') {
    sanitizeObject(req.body);
  }
  next();
}

function sanitizeObject(obj: Record<string, unknown>): void {
  for (const key of Object.keys(obj)) {
    const value = obj[key];

    if (typeof value === 'string') {
      const sanitized = value.replace(/\0/g, '');
      obj[key] = sanitized.length > 500000 ? sanitized.substring(0, 500000) : sanitized;
    } else if (value && typeof value === 'object') {
      sanitizeObject(value as Record<string, unknown>);
    }
  }
}

export function requireJsonContent(req: Request, res: Response, next: NextFunction): void {
  const contentType = req.headers['content-type'];

  if (!contentType || !contentType.includes('application/json')) {
    res.status(415).json({
      error: 'Unsupported Media Type',
      message: 'Content-Type must be application/json'
    });
    return;
  }

  next();
}
