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
    // C#
    // app.UseHsts();
    // app.UseSecurityHeaders();
    app.use(helmet());

    // C#
    // Services.AddResponseCompression(options =>
    // {
    //     options.Providers.Add<GzipCompressionProvider>();
    //     options.Providers.Add<BrotliCompressionProvider>();
    //     options.MimeTypes = ResponseCompressionDefaults.MimeTypes.Concat(
    //         new[] { "application/json" });
    // });
    // app.UseResponseCompression();
    // Compresses HTTP responses to reduce bandwidth
    app.use(compression());

    // CORS
    app.use(cors({
        origin: env.CORS_ORIGIN?.split(',') || true,
        credentials: true,
    }));

    // Request parsing
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true }));

    // Request logging. Morgan is a popular HTTP logging middleware for Express.js
    app.use(morgan('combined', {
        stream: { write: message => logger.info(message.trim()) }
    }));

    // Swagger documentation
    try {
        app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
            customCss: '.swagger-ui .topbar { display: none }',
            customSiteTitle: 'FoodBudget API Documentation'
        }));
        logger.info(`📚 Swagger docs available at http://localhost:${env.PORT}/api-docs`);
    } catch (error) {
        logger.warn('Failed to setup Swagger documentation:', error);
    }

    logger.info('✅ Middleware configured');
}