export const preset = 'jest-expo';
export const transformIgnorePatterns = [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)'
];
export const setupFilesAfterEnv = [
    '@testing-library/jest-native/extend-expect'
];
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