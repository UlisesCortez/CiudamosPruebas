// index.js

import 'react-native-gesture-handler';      // <-- debe ir **antes** de cualquier otro import
import { enableScreens } from 'react-native-screens';
enableScreens();

import { AppRegistry } from 'react-native';
import CIUDAMOS from './src/CIUDAMOS';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => CIUDAMOS);
