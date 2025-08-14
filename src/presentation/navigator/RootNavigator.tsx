import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import MainTabNavigator from './MainTabNavigator';

import LoginScreen from '../../screens/LoginScreen';
import RegisterScreen from '../../screens/RegisterScreen';
import ReportScreen from '../../screens/ReportScreen';
import ReportsScreen from '../../screens/ListaReportesScreen';
import ProfileScreen from '../../screens/ProfileScreen';
import WelcomeScreen from '../../screens/WelcomeScreen';

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Tabs: undefined;
  Welcome: undefined;
  Report: undefined;
  Reports: undefined;
  Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const RootNavigator: React.FC = () => (
  <Stack.Navigator initialRouteName="Tabs" screenOptions={{ headerShown: false }}>
    {/* Para desarrollo dejamos Tabs como inicial para que veas la barra */}
    <Stack.Screen name="Tabs" component={MainTabNavigator} />

    {/* Rutas del flujo fuera de tabs (cuando toque) */}
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />

    {/* Estas existen por si las navegas directo, pero dentro de Tabs ya están */}
    <Stack.Screen name="Welcome" component={WelcomeScreen} />
    <Stack.Screen name="Report" component={ReportScreen} />
    <Stack.Screen name="Reports" component={ReportsScreen} />
    <Stack.Screen name="Profile" component={ProfileScreen} />
  </Stack.Navigator>
);

export default RootNavigator;
