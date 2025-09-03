export const preset = 'jest-expo';
export const transformIgnorePatterns = [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)'
];
// setupFilesAfterEnv not needed - React Native Testing Library v13.3+ has built-in Jest matchers
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