// src/presentation/navigator/RootNavigator.tsx

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import MainTabNavigator from './MainTabNavigator';
import MenuScreen       from '../../screens/MenuScreen';  // tu vista de ajustes


export type RootStackParamList = {
    Tabs: undefined;
    Menu: undefined;
    Profile: undefined;      // ← Agregado
    Settings: undefined;     // ← Agregado
    Help: undefined;         // ← Agregado
  };

const Stack = createNativeStackNavigator<RootStackParamList>();

const RootNavigator: React.FC = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    {/* 1) Tu bottom-tabs sin header */}
    <Stack.Screen name="Tabs" component={MainTabNavigator} />

    {/* 2) Tu pantalla de ajustes */}
    <Stack.Screen
      name="Menu"
      component={MenuScreen}
      options={{
        headerShown: true,
        headerTitle: 'Ajustes',
      }}
    />
  </Stack.Navigator>
);

export default RootNavigator;
