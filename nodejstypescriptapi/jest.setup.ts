// Jest setup file for global test configuration
// This file runs before each test suite

// Set test environment
process.env.NODE_ENV = 'test';
process.env.PORT = '3001';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/testdb';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.LOG_LEVEL = 'error'; // Reduce noise during tests

// Global test timeout
jest.setTimeout(10000);