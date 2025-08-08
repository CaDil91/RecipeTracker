import request from 'supertest';
import express, { Application } from 'express';
import { healthRoutes } from './health.routes';

jest.mock('../utility/logger', () => ({
    logger: {
        info: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
        debug: jest.fn()
    },
    configureLogger: jest.fn()
}));

describe('Health Routes', () => {
    let app: Application;

    beforeEach(() => {
        app = express();
        app.use(express.json());
        app.use(healthRoutes);
    });

    describe('GET /health', () => {
        it('should return 200 with status healthy', async () => {
            const response = await request(app).get('/health').expect(200);

            expect(response.body).toMatchObject({
                status: 'healthy',
                service: 'FoodBudget API',
                timestamp: expect.any(String),
                uptime: expect.any(Number),
                environment: 'test',
                version: expect.any(String)
            });
        });

        it('should include valid ISO timestamp', async () => {
            const response = await request(app).get('/health');

            const timestamp = new Date(response.body.timestamp);
            expect(timestamp.toISOString()).toBe(response.body.timestamp);
        });
    });

    describe('GET /readiness', () => {
        it('should return 200 when ready', async () => {
            const response = await request(app).get('/readiness').expect(200);

            expect(response.body).toMatchObject({
                status: 'ready',
                checks: expect.any(Object)
            });
        });

        it('should include memory check', async () => {
            const response = await request(app).get('/readiness');

            expect(response.body.checks).toHaveProperty('memory');
            expect(response.body.checks.memory).toMatchObject({
                status: 'healthy',
                details: expect.objectContaining({
                    usedMB: expect.any(Number),
                    totalMB: expect.any(Number),
                    percentage: expect.any(Number)
                })
            });
        });

        it('should return 503 when memory usage is critical', async () => {
            // Mock process.memoryUsage to simulate high memory
            const originalMemoryUsage = process.memoryUsage;
            process.memoryUsage = jest.fn().mockReturnValue({
                rss: 1024 * 1024 * 1024 * 10, // 10GB (above 90% threshold)
                heapTotal: 1024 * 1024 * 1024 * 8,
                heapUsed: 1024 * 1024 * 1024 * 7.5,
                external: 0,
                arrayBuffers: 0
            }) as any;

            const response = await request(app).get('/readiness').expect(503);

            expect(response.body.status).toBe('not ready');
            expect(response.body.checks.memory.status).toBe('unhealthy');

            // Restore original
            process.memoryUsage = originalMemoryUsage;
        });
    });

    describe('GET /liveness', () => {
        it('should return 200 with liveness status', async () => {
            const response = await request(app).get('/liveness').expect(200);

            expect(response.body).toMatchObject({
                status: 'alive',
                uptime: expect.any(Number),
                pid: expect.any(Number),
                timestamp: expect.any(String)
            });
        });
    });

    describe('GET /startup', () => {
        it('should return 200 when application has started', async () => {
            const response = await request(app).get('/startup').expect(200);

            expect(response.body).toMatchObject({
                status: 'started',
                uptime: expect.any(Number),
                timestamp: expect.any(String)
            });
        });
    });
});
