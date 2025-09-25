// src/presentation/navigator/RootNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import MainTabNavigator from './MainTabNavigator';
import type { Marker } from '../../context/MarkersContext';

// Screens
import LoginScreen from '../../screens/LoginScreen';
import RegisterScreen from '../../screens/RegisterScreen';
import ReportScreen from '../../screens/ReportScreen';
import ReportsScreen from '../../screens/ListaReportesScreen';
import ProfileScreen from '../../screens/ProfileScreen';
import WelcomeScreen from '../../screens/WelcomeScreen';
import RewardsScreen from '../../screens/RewardsScreen';
import DealsScreen from '../../screens/DealScreen';
import AuthorityReportsScreen from '../../screens/AuthorityReportsScreen'; // ⬅️ IMPORTANTE

export type RootStackParamList = {
  // Auth
  Login: undefined;
  Register: undefined;

  // App
  Tabs: undefined;
  Welcome: undefined;

  // Reportes / Perfil / Otros
  Report: undefined;
  Reports: undefined;
  Reportar: { imageUri?: string } | undefined;
  Rewards: undefined;
  Profile: undefined;
  DetalleReporte: { marker: Marker };
  Descuentos: undefined;

  // Autoridad
  AuthorityReports: undefined; // ⬅️ NUEVO: para la vista de autoridad
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const RootNavigator: React.FC = () => (
  <Stack.Navigator
    screenOptions={{ headerShown: false }}
    initialRouteName="Login"
  >
    {/* Flujo de autenticación */}
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />

    {/* App autenticada */}
    <Stack.Screen name="Tabs" component={MainTabNavigator} />
    <Stack.Screen name="Welcome" component={WelcomeScreen} />

    {/* Rutas adicionales */}
    <Stack.Screen name="Report" component={ReportScreen} />
    <Stack.Screen name="Reports" component={ReportsScreen} />
    <Stack.Screen name="Profile" component={ProfileScreen} />
    <Stack.Screen name="Reportar" component={ReportScreen} />
    <Stack.Screen name="Rewards" component={RewardsScreen} />
    <Stack.Screen
      name="Descuentos"
      component={DealsScreen}
      options={{ headerShown: true, title: 'Descuentos' }}
    />

    {/* Vista de autoridad */}
    <Stack.Screen
      name="AuthorityReports"
      component={AuthorityReportsScreen}
    />
  </Stack.Navigator>
);

export default RootNavigator;
