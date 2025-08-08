describe('Logger', () => {
    // Simple smoke test to verify logger exists and has expected methods
    // Full testing would require complex winston mocking

    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
    });

    describe('logger exports', () => {
        it('should export logger and configureLogger', () => {
            const loggerModule = require('./logger');

            expect(loggerModule.logger).toBeDefined();
            expect(loggerModule.configureLogger).toBeDefined();
            expect(typeof loggerModule.configureLogger).toBe('function');
        });

        it('should have winston logger methods', () => {
            const { logger } = require('./logger');

            expect(typeof logger.info).toBe('function');
            expect(typeof logger.error).toBe('function');
            expect(typeof logger.warn).toBe('function');
            expect(typeof logger.debug).toBe('function');
        });
    });

    describe('logger singleton', () => {
        it('should return same instance across imports', () => {
            const { logger: logger1 } = require('./logger');
            const { logger: logger2 } = require('./logger');

            expect(logger1).toBe(logger2);
        });
    });
});
