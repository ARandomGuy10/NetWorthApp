const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Configure resolver for React Native 0.79+ compatibility
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Custom resolver function to handle FormData and other modules
const originalResolver = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Handle FormData resolution specifically
  if (moduleName === './FormData' || moduleName === 'FormData') {
    return {
      filePath: path.resolve(__dirname, 'polyfills/FormData.js'),
      type: 'sourceFile',
    };
  }
  
  // Fall back to the original resolver
  if (originalResolver) {
    return originalResolver(context, moduleName, platform);
  }
  
  return context.resolveRequest(context, moduleName, platform);
};

// Add comprehensive aliases as backup
config.resolver.alias = {
  ...config.resolver.alias,
  './FormData': path.resolve(__dirname, 'polyfills/FormData.js'),
  'FormData': path.resolve(__dirname, 'polyfills/FormData.js'),
};

// Ensure proper module resolution
config.resolver.unstable_enableSymlinks = false;

// Add node modules resolution
config.resolver.nodeModulesPaths = [
  path.resolve(__dirname, 'node_modules'),
  path.resolve(__dirname, '../node_modules'),
];

module.exports = config;
