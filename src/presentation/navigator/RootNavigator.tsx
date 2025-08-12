// src/presentation/navigator/RootNavigator.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from '../../screens/LoginScreen';
import RegisterScreen from '../../screens/RegisterScreen';
import WelcomeScreen from '../../screens/WelcomeScreen';

// OJO: ajusta estas rutas a tus componentes reales de Reportar/Reportes
import ReportScreen from '../../screens/ReportScreen';
import ReportsScreen from '../../screens/ListaReportesScreen';

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Welcome: undefined;
  Report: undefined;
  Reports: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Report" component={ReportScreen} />
        <Stack.Screen name="Reports" component={ReportsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
