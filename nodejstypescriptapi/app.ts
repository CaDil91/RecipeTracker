import { Application } from 'express';
import { logger } from './utility/logger';
import { setupRoutes } from './routes';
import { setupMiddleware } from './config/middleware';
import { setupErrorHandling } from './middleware/error.middleware';

export async function configureApp(app: Application) {
    try {
        // Configure middleware stack (security, cors, logging, parsing)
        await setupMiddleware(app);
        logger.info('✅ Middleware stack configured');

        // Setup API routes
        setupRoutes(app);
        logger.info('🚀 Routes configured');

        // Error handling MUST be last - catches all errors
        setupErrorHandling(app);
        logger.info('🛡️ Error handling configured');

        return app;
    } catch (error) {
        logger.error('❌ Failed to configure application:', error);
        throw error;
    }
}
