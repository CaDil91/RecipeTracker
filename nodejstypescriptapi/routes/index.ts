import { Application, Router } from 'express';
import { healthRoutes } from './health.routes';
import { v1Routes } from './v1';

export function setupRoutes(app: Application): void {
    const router = Router();

    // Health check routes (no versioning)
    router.use('/health', healthRoutes);

    // API v1 routes
    router.use('/api/v1', v1Routes);

    // Mount all routes
    app.use(router);
}
