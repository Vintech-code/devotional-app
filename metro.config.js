// metro.config.js — allows Metro to bundle .db files as static assets
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Treat .db files as assets so expo-asset can load them at runtime
config.resolver.assetExts.push('db');

module.exports = config;
