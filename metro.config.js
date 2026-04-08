const {
    getDefaultConfig
} = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Fix Windows path resolution for web bundling
config.resolver.unstable_enablePackageExports = false;

module.exports = config;