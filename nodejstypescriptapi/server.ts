import express, { Application } from 'express';
import {logger} from "./utility/logger";
import {env} from "./config/environment";
import {configureApp} from "./app";

async function startServer(): Promise<void> {
    try {
        const app: Application = express();

        await configureApp(app);

        const server = app.listen(env.PORT, () => {
            logger.info(`Server is running on port ${env.PORT}`);
            logger.info(`Environment: ${env.NODE_ENV}`);
        });

        setupGracefulShutdown(server);
    }
    catch (error) {
        logger.error('❌ Failed to start the server:', error);
        process.exit(1);
    }
}

function setupGracefulShutdown(server: any): void {
    const gracefulShutdown = (signal: string) => {
        logger.info(`Received ${signal}, shutting down gracefully...`);
        server.close(() => {
            logger.info('Server closed');
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