// index.js

import 'react-native-gesture-handler';
import { AppRegistry } from 'react-native';
import { enableScreens } from 'react-native-screens';
import App from './src/CIUDAMOS';
import { name as appName } from './app.json';

// Activa las pantallas nativas para animaciones 60 fps
enableScreens();

AppRegistry.registerComponent(appName, () => App);
