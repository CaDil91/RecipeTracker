import { Router, Request, Response } from 'express';
import { logger } from '../utility/logger';

// Type definitions for health checks
interface HealthCheckResult {
    status: 'healthy' | 'unhealthy';
    details?: any;
    responseTime?: number;
    error?: string;
}

interface ReadinessChecks {
    memory: HealthCheckResult;
    // database?: HealthCheckResult;
    // externalServices?: Record<string, HealthCheckResult>;
}

const router = Router();

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint (Liveness probe)
 *     description: Checks if the application is running
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is healthy
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthCheck'
 */
router.get('/health', (req: Request, res: Response) => {
    res.json({
        status: 'healthy',
        service: 'FoodBudget API',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        version: process.env.npm_package_version || '1.0.0'
    });
});

/**
 * @swagger
 * /readiness:
 *   get:
 *     summary: Readiness probe
 *     description: Checks if the application is ready to accept traffic
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is ready
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReadinessCheck'
 *       503:
 *         description: Service is not ready
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReadinessCheck'
 */
router.get('/readiness', async (req: Request, res: Response) => {
    const healthChecks: ReadinessChecks = {
        memory: checkMemory(),
        // TODO: Add database check when database is configured
        // database: await checkDatabase(),
        // TODO: Add external service checks if needed
        // externalServices: await checkExternalServices()
    };

    const checks = {
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        checks: healthChecks
    };

    // Determine overall readiness
    const isReady = Object.values(healthChecks).every((check: HealthCheckResult) => 
        check.status === 'healthy'
    );

    if (isReady) {
        res.json({
            status: 'ready',
            ...checks
        });
    } else {
        logger.warn('Readiness check failed', checks);
        res.status(503).json({
            status: 'not_ready',
            ...checks
        });
    }
});

// GET /health/detailed - Detailed health information
router.get('/health/detailed', (req: Request, res: Response) => {
    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    
    res.json({
        status: 'healthy',
        service: 'FoodBudget API',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        version: process.env.npm_package_version || '1.0.0',
        process: {
            pid: process.pid,
            platform: process.platform,
            nodeVersion: process.version,
            memory: {
                rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
                heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
                heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
                external: `${Math.round(memoryUsage.external / 1024 / 1024)} MB`
            },
            cpu: {
                user: `${Math.round(cpuUsage.user / 1000)} ms`,
                system: `${Math.round(cpuUsage.system / 1000)} ms`
            }
        }
    });
});

// Helper function to check memory usage
function checkMemory(): HealthCheckResult {
    const memoryUsage = process.memoryUsage();
    const heapUsedPercentage = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;
    
    return {
        status: heapUsedPercentage < 90 ? 'healthy' : 'unhealthy',
        details: {
            heapUsedPercentage: Math.round(heapUsedPercentage),
            heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
            heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
            unit: 'MB'
        }
    };
}

// TODO: Implement database connectivity check
// async function checkDatabase(): Promise<HealthCheckResult> {
//     try {
//         const startTime = Date.now();
//         // Perform a simple database query
//         // await db.query('SELECT 1');
//         const responseTime = Date.now() - startTime;
//         
//         return {
//             status: 'healthy',
//             responseTime
//         };
//     } catch (error) {
//         logger.error('Database health check failed:', error);
//         return {
//             status: 'unhealthy',
//             error: error instanceof Error ? error.message : 'Unknown error'
//         };
//     }
// }

// TODO: Implement external service checks if needed
// async function checkExternalServices(): Promise<Record<string, any>> {
//     // Add checks for any external services your API depends on
//     return {};
// }

export { router as healthRoutes };