const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

// Create an async function to get the final config
const configureMetro = async () => {
  // Get base config from Expo
  const config = getDefaultConfig(__dirname);

  // Get the existing extensions
  const { resolver } = config;
  const { sourceExts, assetExts } = resolver;

  // Apply SVG transformer configuration
  const svgConfig = {
    transformer: {
      babelTransformerPath: require.resolve('react-native-svg-transformer'),
    },
    resolver: {
      assetExts: assetExts.filter((ext) => ext !== 'svg'),
      sourceExts: [...sourceExts, 'svg'],
    },
  };

  // Merge configs
  const mergedConfig = {
    ...config,
    transformer: {
      ...config.transformer,
      ...svgConfig.transformer,
    },
    resolver: {
      ...config.resolver,
      ...svgConfig.resolver,
    },
  };

  // Apply NativeWind
  return withNativeWind(mergedConfig, { input: './global.css' });
};

// Export the final configuration
module.exports = configureMetro();
