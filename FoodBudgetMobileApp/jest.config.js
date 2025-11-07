export const preset = 'jest-expo';
export const testEnvironment = 'jest-fixed-jsdom';
export const testEnvironmentOptions = {
  customExportConditions: [''],
  url: 'http://localhost',
};
export const transformIgnorePatterns = [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|react-native-paper|react-native-vector-icons|@callstack/react-theme-provider|color|react-native-safe-area-context|msw|until-async|@mswjs)'
];
export const setupFilesAfterEnv = ['<rootDir>/src/test/setup.ts'];
export const moduleFileExtensions = ['ts', 'tsx', 'js', 'jsx', 'json', 'node'];
export const testPathIgnorePatterns = [
    '/node_modules/',
    '/android/',
    '/ios/'
];
export const collectCoverageFrom = [
    'src/**/*.{ts,tsx}',
    '!**/node_modules/**'
];
export const coveragePathIgnorePatterns = [
    '/node_modules/',
    '/src/.*/index\\.ts$',
    '/src/.*/index\\.tsx$',
    '/src/types/.*\\.ts$',
    '/src/lib/shared/types/.*\\.ts$',
    '/src/lib/auth/authTypes\\.ts$',         // Type-only file (interfaces/types)
    '/src/navigation/AppNavigator\\.tsx$',
    '/src/test/.*\\.(ts|tsx)$',
    '/src/mocks/.*\\.(ts|tsx)$',             // MSW mock setup files
    '/src/data/mockRecipes\\.ts$',           // Test fixtures
    '/src/theme/customTheme\\.ts$',          // Theme configuration/constants
    '/src/theme/typography\\.ts$',           // Theme constants (spacing, fonts)
    '/src/components/WebContainer\\.tsx$',   // Web platform-specific wrapper
    '/src/screens/ErrorFallbackScreen\\.tsx$',  // Error boundary fallback UI
    '/src/lib/shared/api/config\\.ts$',      // API configuration constants
    'App\\.tsx$',                             // Entry point (provider/config setup)
    'app\\.config\\.js$',                    // Expo configuration
    '\\.config\\.js$',                       // Configuration files (babel, metro, jest)
    '/src/navigation/types\\.ts$'            // Navigation type definitions
];