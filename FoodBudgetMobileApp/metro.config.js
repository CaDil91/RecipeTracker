const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Handle font assets properly for web
config.resolver.assetExts.push('ttf');

module.exports = config;