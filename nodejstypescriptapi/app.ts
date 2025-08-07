import {Application} from "express";
import {logger} from "./utility/logger";
import {setupRoutes} from "./routes";
import {setupMiddleware} from "./config/middleware";
import { setupErrorHandling } from './middleware/error.middleware';

export async function configureApp(app: Application) {
    try {
        await setupMiddleware(app);

        setupRoutes(app);

        setupErrorHandling(app);

        logger.info('App configured');
        return app;
    } catch (error) {
        logger.error('Error configuring app:', error);
        throw error;
    }
}