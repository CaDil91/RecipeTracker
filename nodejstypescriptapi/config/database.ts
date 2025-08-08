import { PrismaClient } from '@prisma/client';
import { logger } from '../utility/logger';

class DatabaseService {
    private prisma: PrismaClient;
    private static instance: DatabaseService;

    private constructor() {
        this.prisma = new PrismaClient({
            log: [
                { level: 'query', emit: 'event' },
                { level: 'error', emit: 'event' },
                { level: 'warn', emit: 'event' }
            ]
        });

        this.setupLogging();
    }

    private setupLogging(): void {
        this.prisma.$on('query' as never, (e: any) => {
            if (process.env.NODE_ENV === 'development') {
                logger.debug('Query: ' + e.query);
            }
        });

        this.prisma.$on('error' as never, (e: any) => {
            logger.error('Database error:', e);
        });

        this.prisma.$on('warn' as never, (e: any) => {
            logger.warn('Database warning:', e);
        });
    }

    public static getInstance(): DatabaseService {
        if (!DatabaseService.instance) {
            DatabaseService.instance = new DatabaseService();
        }
        return DatabaseService.instance;
    }

    public getClient(): PrismaClient {
        return this.prisma;
    }

    public async connect(): Promise<void> {
        try {
            await this.prisma.$connect();
            logger.info('✅ Database connected successfully');
        } catch (error) {
            logger.error('❌ Failed to connect to database:', error);
            throw error;
        }
    }

    public async disconnect(): Promise<void> {
        try {
            await this.prisma.$disconnect();
            logger.info('Database disconnected');
        } catch (error) {
            logger.error('Error disconnecting from database:', error);
            throw error;
        }
    }

    public async healthCheck(): Promise<boolean> {
        try {
            await this.prisma.$queryRaw`SELECT 1`;
            return true;
        } catch {
            return false;
        }
    }
}

export const db = DatabaseService.getInstance();
export const prisma = db.getClient();