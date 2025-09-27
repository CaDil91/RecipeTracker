export const preset = 'jest-expo';
export const testEnvironment = 'jsdom';
export const testEnvironmentOptions = {
  customExportConditions: [''],
  url: 'http://localhost',
};
export const transformIgnorePatterns = [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|react-native-paper|react-native-vector-icons|@callstack/react-theme-provider|color|react-native-safe-area-context|msw)'
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
    '/src/navigation/AppNavigator\\.tsx$',
    '/src/test/.*\\.(ts|tsx)$'
];