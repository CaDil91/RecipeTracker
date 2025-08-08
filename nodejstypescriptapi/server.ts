import express, { Application } from 'express';
import { logger, configureLogger } from './utility/logger';
import { configureApp } from './app';
import { db } from './config/database';

async function startServer(): Promise<void> {
    try {
        logger.info('🚀 Starting application...');
        logger.info('📋 Validating environment configuration...');

        const { env } = await import('./config/environment');

        logger.info('✅ Environment validation successful');

        configureLogger(env.LOG_LEVEL);
        logger.info('🔧 Logger reconfigured with environment settings');

        logger.info('🔗 Connecting to database...');
        await db.connect();

        const app: Application = express();
        logger.info('📦 Express application created');

        await configureApp(app);
        logger.info('⚙️ Application middleware and routes configured');

        const server = app.listen(env.PORT, () => {
            logger.info(`✨ Server is running on port ${env.PORT}`);
            logger.info(`📊 Environment: ${env.NODE_ENV}`);
            logger.info(`📝 Log level: ${env.LOG_LEVEL}`);
        });

        setupGracefulShutdown(server);
    } catch (error) {
        logger.error('❌ Failed to start the server:', error);
        process.exit(1);
    }
}

function setupGracefulShutdown(server: any): void {
    const gracefulShutdown = async (signal: string) => {
        logger.info(`Received ${signal}, shutting down gracefully...`);
        server.close(async () => {
            logger.info('Server closed');
            await db.disconnect();
            process.exit(0);
        });
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
}

if (require.main === module) {
    startServer().catch(error => {
        logger.error('Unhandled server error:', error);
        process.exit(1);
    });
}

export { startServer };
