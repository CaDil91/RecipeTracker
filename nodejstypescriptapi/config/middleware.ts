import express, {Application} from "express";
import {env} from "./environment";
import {logger} from "../utility/logger";
import helmet from 'helmet';
import compression from 'compression';
import cors from 'cors';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './swagger';

export async function setupMiddleware(app: Application): Promise<void> {
    // 1. SECURITY - First line of defense (C#: app.UseHsts() + UseSecurityHeaders())
    app.use(helmet());

    // 2. CORS - Handle cross-origin requests early (C#: app.UseCors())
    app.use(cors({
        origin: env.CORS_ORIGIN?.split(',') || true,
        credentials: true,
    }));

    // 3. HTTP REQUEST LOGGING - Log all requests, even failed parsing (C#: app.UseHttpLogging())
    app.use(morgan('combined', {
        stream: { write: message => logger.info(message.trim()) }
    }));

    // 4. COMPRESSION - Before response generation (C#: app.UseResponseCompression())
    app.use(compression());

    // 5. BODY PARSING - Parse request bodies (C#: Built into controller binding)
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // 6. API DOCUMENTATION - Static content before routes (C#: app.UseSwagger())
    try {
        app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
            customCss: '.swagger-ui .topbar { display: none }',
            customSiteTitle: 'FoodBudget API Documentation'
        }));
        logger.info(`📚 Swagger docs available at http://localhost:${env.PORT}/api-docs`);
    } catch (error) {
        logger.warn('Failed to setup Swagger documentation:', error);
    }
}