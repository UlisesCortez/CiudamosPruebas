// metro.config.js
const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');
const exclusionList = require('metro-config/src/defaults/exclusionList');

const config = {
  resolver: {
    blockList: exclusionList([
      // carpetas temporales de CMake/Gradle que provocan ENOENT en Windows
      /android[\/\\]\.cxx[\/\\].*/,
      /android[\/\\]build[\/\\].*/,
      /ios[\/\\]build[\/\\].*/,
      /node_modules[\/\\]react-native-reanimated[\/\\]android[\/\\]\.cxx[\/\\].*/,
    ]),
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
