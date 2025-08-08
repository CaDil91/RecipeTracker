const js = require('@eslint/js');
const typescript = require('@typescript-eslint/eslint-plugin');
const typescriptParser = require('@typescript-eslint/parser');

module.exports = [
    js.configs.recommended,
    {
        files: ['**/*.ts', '**/*.tsx'],
        languageOptions: {
            parser: typescriptParser,
            parserOptions: {
                ecmaVersion: 2020,
                sourceType: 'module'
            },
            globals: {
                // Node.js globals
                process: 'readonly',
                Buffer: 'readonly',
                __dirname: 'readonly',
                __filename: 'readonly',
                global: 'readonly',
                require: 'readonly',
                module: 'readonly',
                exports: 'readonly',
                console: 'readonly'
            }
        },
        plugins: {
            '@typescript-eslint': typescript
        },
        rules: {
            // TypeScript specific rules
            'no-unused-vars': 'off', // Turn off base rule as it can report incorrect errors
            '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
            '@typescript-eslint/no-explicit-any': 'warn',
            '@typescript-eslint/no-var-requires': 'error',

            // General ESLint rules
            'no-console': 'warn',
            'no-debugger': 'error',
            'prefer-const': 'error',
            'no-var': 'error',
            eqeqeq: 'error',
            curly: 'error',

            // Code style
            semi: ['error', 'always'],
            quotes: ['error', 'single', { avoidEscape: true }],
            'comma-dangle': ['error', 'never'],
            'object-curly-spacing': ['error', 'always'],
            'array-bracket-spacing': ['error', 'never'],

            // Import/Export
            'no-duplicate-imports': 'error'
        }
    },
    {
        files: ['**/*.test.ts', '**/*.spec.ts', 'jest.setup.ts'],
        languageOptions: {
            globals: {
                // Jest globals
                describe: 'readonly',
                it: 'readonly',
                test: 'readonly',
                expect: 'readonly',
                beforeEach: 'readonly',
                afterEach: 'readonly',
                beforeAll: 'readonly',
                afterAll: 'readonly',
                jest: 'readonly',
                // Node.js globals
                process: 'readonly',
                require: 'readonly',
                module: 'readonly'
            }
        },
        rules: {
            // Allow console in tests
            'no-console': 'off',
            // Allow any types in tests for mocking
            '@typescript-eslint/no-explicit-any': 'off',
            // Allow require in test setup
            '@typescript-eslint/no-var-requires': 'off'
        }
    },
    {
        files: ['jest.config.js', 'eslint.config.js'],
        languageOptions: {
            sourceType: 'script',
            globals: {
                module: 'readonly',
                require: 'readonly',
                __dirname: 'readonly'
            }
        },
        rules: {
            '@typescript-eslint/no-var-requires': 'off'
        }
    },
    {
        ignores: ['dist/', 'node_modules/', 'coverage/', 'logs/']
    }
];
