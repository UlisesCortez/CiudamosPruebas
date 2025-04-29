// src/CIUDAMOS.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import Toast from 'react-native-toast-message';

import { MarkersProvider } from './context/MarkersContext';
import RootNavigator      from './presentation/navigator/RootNavigator';

const CIUDAMOS: React.FC = () => (
  <MarkersProvider>
    <NavigationContainer>
      <RootNavigator />
    </NavigationContainer>
    {/* Este Toast se monta “por encima” de todo */}
    <Toast />
  </MarkersProvider>
);

export default CIUDAMOS;
