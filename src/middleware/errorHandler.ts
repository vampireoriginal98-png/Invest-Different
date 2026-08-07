import type { Request, Response, NextFunction } from 'express';

export default function createErrorHandler(options?: { logger?: Console }) {
  const logger = (options && options.logger) || console;
  return function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
    try {
      // Defensive logging
      try { logger.error('[Express][error]', err && (err.stack || err.message) || err); } catch (_) {}

      if (res.headersSent) {
        // Let default express behavior continue
        return next(err);
      }

      const status = err && (err.status || err.statusCode) ? (err.status || err.statusCode) : 500;
      const safeMessage = process.env.NODE_ENV === 'production' ? 'Internal error' : (err && (err.message || JSON.stringify(err)) || 'Internal error');

      // Minimal, safe JSON response
      res.status(status).json({ error: safeMessage });
    } catch (handlerErr) {
      // If the error handler itself throws, isolate and respond with 500 without leaking details
      try { logger.error('[Express][errorHandler] failed', handlerErr); } catch (_) {}
      try {
        if (!res.headersSent) res.status(500).json({ error: 'Internal error' });
      } catch (_) { /* nothing else we can do */ }
    }
  };
}
