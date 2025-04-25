// src/CIUDAMOS.tsx

import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';

import { MarkersProvider } from './context/MarkersContext';
import RootNavigator    from './presentation/navigator/RootNavigator';

const CIUDAMOS: React.FC = () => (
  <MarkersProvider>
    <NavigationContainer>
      <RootNavigator />
    </NavigationContainer>
  </MarkersProvider>
);

export default CIUDAMOS;
