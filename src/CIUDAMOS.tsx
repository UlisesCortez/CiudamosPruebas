// src/CIUDAMOS.tsx

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { MarkersProvider } from './context/MarkersContext';
import RootNavigator      from './presentation/navigator/RootNavigator';

// Ya no necesitas llamar enableScreens aquí porque lo hicimos en index.js

const CIUDAMOS: React.FC = () => (
  <MarkersProvider>
    <NavigationContainer>
      <RootNavigator />
    </NavigationContainer>
  </MarkersProvider>
);

export default CIUDAMOS;
