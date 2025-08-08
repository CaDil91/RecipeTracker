import swaggerJsdoc from 'swagger-jsdoc';
import { env } from './environment';

const swaggerOptions: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'FoodBudget API',
            version: '1.0.0',
            description: 'API documentation for FoodBudget application',
            contact: {
                name: 'API Support',
                email: 'support@foodbudget.com'
            }
        },
        servers: [
            {
                url: `http://localhost:${env.PORT}`,
                description: 'Development server'
            },
            {
                url: 'https://api.foodbudget.com',
                description: 'Production server'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Enter JWT token'
                }
            },
            schemas: {
                Error: {
                    type: 'object',
                    properties: {
                        error: {
                            type: 'string',
                            description: 'Error message'
                        },
                        message: {
                            type: 'string',
                            description: 'Detailed error message'
                        },
                        timestamp: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Timestamp of the error'
                        }
                    }
                },
                Recipe: {
                    type: 'object',
                    required: ['title', 'instructions', 'servings'],
                    properties: {
                        id: {
                            type: 'string',
                            description: 'Recipe ID'
                        },
                        title: {
                            type: 'string',
                            description: 'Recipe title'
                        },
                        instructions: {
                            type: 'string',
                            description: 'Cooking instructions'
                        },
                        servings: {
                            type: 'integer',
                            minimum: 1,
                            description: 'Number of servings'
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Creation timestamp'
                        },
                        updatedAt: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Last update timestamp'
                        }
                    }
                },
                HealthCheck: {
                    type: 'object',
                    properties: {
                        status: {
                            type: 'string',
                            enum: ['healthy', 'unhealthy'],
                            description: 'Health status'
                        },
                        service: {
                            type: 'string',
                            description: 'Service name'
                        },
                        timestamp: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Check timestamp'
                        },
                        uptime: {
                            type: 'number',
                            description: 'Uptime in seconds'
                        },
                        environment: {
                            type: 'string',
                            description: 'Environment (development, production, test)'
                        },
                        version: {
                            type: 'string',
                            description: 'API version'
                        }
                    }
                },
                ReadinessCheck: {
                    type: 'object',
                    properties: {
                        status: {
                            type: 'string',
                            enum: ['ready', 'not_ready'],
                            description: 'Readiness status'
                        },
                        timestamp: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Check timestamp'
                        },
                        uptime: {
                            type: 'number',
                            description: 'Uptime in seconds'
                        },
                        checks: {
                            type: 'object',
                            properties: {
                                memory: {
                                    type: 'object',
                                    properties: {
                                        status: {
                                            type: 'string',
                                            enum: ['healthy', 'unhealthy']
                                        },
                                        details: {
                                            type: 'object'
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        tags: [
            {
                name: 'Health',
                description: 'Health check endpoints'
            },
            {
                name: 'Recipes',
                description: 'Recipe management endpoints'
            }
        ]
    },
    apis: ['./routes/**/*.ts'] // Path to the API routes
};

export const swaggerSpec = swaggerJsdoc(swaggerOptions);
