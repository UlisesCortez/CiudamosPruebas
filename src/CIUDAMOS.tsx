// src/CIUDAMOS.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import RNBootSplash from 'react-native-bootsplash';
import Toast from 'react-native-toast-message';

import { MarkersProvider } from './context/MarkersContext';
import RootNavigator from './presentation/navigator/RootNavigator';

const CIUDAMOS: React.FC = () => (
  <GestureHandlerRootView style={{ flex: 1 }}>
    <MarkersProvider>
      <NavigationContainer onReady={() => RNBootSplash.hide({ fade: true })}>
        <RootNavigator />
      </NavigationContainer>

      {/* Toast global por encima de todo */}
      <Toast />
    </MarkersProvider>
  </GestureHandlerRootView>
);

export default CIUDAMOS;
