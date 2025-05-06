// src/presentation/navigator/RootNavigator.tsx

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import MainTabNavigator from './MainTabNavigator';
import MenuScreen       from '../../screens/MenuScreen';  
import LoginScreen from '../../screens/LoginScreen';
import RewardsScreen    from '../../screens/RewardsScreen.tsx'; 



export type RootStackParamList = {
    Login: undefined;  
    Tabs: undefined;
    Menu: undefined;
    Profile: undefined;      
    Settings: undefined;     
    Help: undefined;  
    Rewards:  undefined;       
  };

const Stack = createNativeStackNavigator<RootStackParamList>();

const RootNavigator: React.FC = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    {/* 1) LoginScreen */}
    <Stack.Screen name="Login" component={LoginScreen} />

    {/* 2) Tu bottom-tabs sin header */}
    <Stack.Screen name="Tabs" component={MainTabNavigator} />

    {/* 3) Tu pantalla de ajustes */}
    <Stack.Screen
      name="Menu"
      component={MenuScreen}
      options={{
        headerShown: true,
        headerTitle: 'Ajustes',
      }}
    />

    <Stack.Screen 
      name="Rewards"
      component={RewardsScreen}
      options={{
        headerShown: true,
        headerTitle: 'Recompensas',
      }}
      />
  </Stack.Navigator>
);

export default RootNavigator;
