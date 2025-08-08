import { Application, Request, Response, NextFunction } from 'express';
import { logger } from '../utility/logger';

export function setupErrorHandling(app: Application): void {
    // 404 handler for unmatched routes
    app.use((req: Request, res: Response, _next: NextFunction) => {
        res.status(404).json({
            error: 'Not Found',
            message: `Route ${req.method} ${req.originalUrl} not found`,
            timestamp: new Date().toISOString()
        });
    });

    // Global error handler
    app.use((error: Error, req: Request, res: Response, _next: NextFunction) => {
        logger.error('Application error:', {
            error: error.message,
            stack: error.stack,
            url: req.originalUrl,
            method: req.method
        });

        const isDevelopment = process.env.NODE_ENV === 'development';

        res.status(500).json({
            error: 'Internal Server Error',
            message: isDevelopment ? error.message : 'Something went wrong',
            timestamp: new Date().toISOString(),
            ...(isDevelopment && { stack: error.stack })
        });
    });
}
