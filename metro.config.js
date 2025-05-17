// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);
config.resolver.alias = {
  '@': path.resolve(__dirname),
  '@src': path.resolve(__dirname, 'src'),
  '@enums': path.resolve(__dirname, 'src/enums'),
  '@components': path.resolve(__dirname, 'components'),
  '@utils': path.resolve(__dirname, 'src/utils')
};

const { transformer, resolver } = config;
config.transformer = {
    ...transformer,
    babelTransformerPath: require.resolve("react-native-svg-transformer/expo"),
  };
  config.resolver = {
    ...resolver,
    assetExts: resolver.assetExts.filter((ext) => ext !== "svg"),
    sourceExts: [...resolver.sourceExts, "svg"],
  };

module.exports = config;
