// babel.config.js
module.exports = {
  presets: ['@react-native/babel-preset'],
  plugins: [
    // otros plugins si tienes...
    'react-native-reanimated/plugin', // ← siempre el ÚLTIMO
  ],
};
