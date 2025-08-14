import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import MainTabNavigator from './MainTabNavigator';

import LoginScreen from '../../screens/LoginScreen';
import RegisterScreen from '../../screens/RegisterScreen';
import ReportScreen from '../../screens/ReportScreen';
import ReportsScreen from '../../screens/ListaReportesScreen';
import ProfileScreen from '../../screens/ProfileScreen';
import WelcomeScreen from '../../screens/WelcomeScreen';
import RewardsScreen from '../../screens/RewardsScreen';

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Tabs: undefined;
  Welcome: undefined;
  Report: undefined;
  Reports: undefined;
  Reportar: { imageUri?: string } | undefined; // 👈 agrega esto
  Rewards: undefined;
  Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const RootNavigator: React.FC = () => (
  <Stack.Navigator
    screenOptions={{ headerShown: false }}
    initialRouteName="Login"  // <- ahora inicia en Login
  >
    {/* Flujo de autenticación */}
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
    <Stack.Screen name="Welcome" component={WelcomeScreen} />

    {/* App autenticada */}
    <Stack.Screen name="Tabs" component={MainTabNavigator} />

    {/* Rutas accesibles directo si las navegas */}
    <Stack.Screen name="Report" component={ReportScreen} />
    <Stack.Screen name="Reports" component={ReportsScreen} />
    <Stack.Screen name="Profile" component={ProfileScreen} />
    <Stack.Screen name="Reportar" component={ReportScreen} />
    <Stack.Screen name="Rewards" component={RewardsScreen} />

  </Stack.Navigator>
);

export default RootNavigator;
