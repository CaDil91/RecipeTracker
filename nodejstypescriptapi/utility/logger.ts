import winston from 'winston';

class Logger {
    private static instance: winston.Logger;

    public static getInstance(): winston.Logger {
        if (!Logger.instance) {
            Logger.instance = Logger.createBootstrapLogger();
        }
        return Logger.instance;
    }

    private static createBootstrapLogger(): winston.Logger {
        return winston.createLogger({
            level: 'info',
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.errors({ stack: true }),
                winston.format.simple()
            ),
            transports: [
                new winston.transports.Console({
                    format: winston.format.combine(
                        winston.format.colorize(),
                        winston.format.printf(({ timestamp, level, message, ...rest }) => {
                            return `[${timestamp}] ${level}: ${message} ${Object.keys(rest).length ? JSON.stringify(rest) : ''}`;
                        })
                    )
                })
            ]
        });
    }

    public static configure(logLevel: string = 'info'): void {
        const isDevelopment = process.env.NODE_ENV !== 'production';

        Logger.instance = winston.createLogger({
            level: logLevel,
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.errors({ stack: true }),
                isDevelopment ? winston.format.simple() : winston.format.json()
            ),
            transports: [
                new winston.transports.Console({
                    format: isDevelopment
                        ? winston.format.combine(
                              winston.format.colorize(),
                              winston.format.printf(({ timestamp, level, message, ...rest }) => {
                                  return `[${timestamp}] ${level}: ${message} ${Object.keys(rest).length ? JSON.stringify(rest) : ''}`;
                              })
                          )
                        : winston.format.json()
                }),
                new winston.transports.File({
                    filename: 'logs/error.log',
                    level: 'error'
                }),
                new winston.transports.File({
                    filename: 'logs/combined.log'
                })
            ]
        });

        Logger.instance.info('Logger reconfigured', {
            level: logLevel,
            environment: process.env.NODE_ENV
        });
    }
}

export const logger = Logger.getInstance();
export const configureLogger = Logger.configure;
