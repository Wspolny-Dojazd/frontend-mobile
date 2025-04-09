const { withMonicon } = require('@monicon/metro');
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

  // Apply Monicon configuration
  const configWithMonicon = withMonicon(mergedConfig, {
    icons: [
      'bx:walk',
      'ion:bus-outline',
      'ic:outline-subway',
      'material-symbols-light:chevron-right',
      'heroicons:home-solid',
      'pajamas:profile',
      'gis:map-users',
      'material-symbols:group',
      'majesticons:map-marker',
      'uil:map-marker',
      'bi:chat-square-text',
      'ph:tram',
      'circum:edit',
      'famicons:calendar-sharp',
      'iconamoon:exit-fill',
    ],
    // Load all icons from the listed collections
    // collections: ['radix-icons'],
  });

  // Apply NativeWind
  return withNativeWind(configWithMonicon, { input: './global.css' });
};

// Export the final configuration
module.exports = configureMetro();
