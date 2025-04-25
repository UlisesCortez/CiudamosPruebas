// src/presentation/navigator/MainTabNavigator.tsx

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';

import WelcomeScreen       from '../../screens/WelcomeScreen';
import ReportScreen        from '../../screens/ReportScreen';
import ListaReportesScreen from '../../screens/ListaReportesScreen';

export type TabParamList = {
  Mapa:     undefined;
  Reportar: undefined;
  Reportes: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

const MainTabNavigator: React.FC = () => (
  <Tab.Navigator
    initialRouteName="Mapa"
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarIcon: ({ focused, color, size }) => {
        // Mapeo explícito para que TS sepa que route.name es clave de TabParamList
        const icons: Record<keyof TabParamList, string> = {
          Mapa:     focused ? 'map'           : 'map-outline',
          Reportar: focused ? 'add-circle'    : 'add-circle-outline',
          Reportes: focused ? 'list'          : 'list-outline',
        };
        return <Icon name={icons[route.name]} size={size} color={color} />;
      },
      tabBarActiveTintColor:   '#3b82f6',
      tabBarInactiveTintColor: 'gray',
    })}
  >
    <Tab.Screen name="Mapa"     component={WelcomeScreen} />
    <Tab.Screen name="Reportar" component={ReportScreen} />
    <Tab.Screen name="Reportes" component={ListaReportesScreen} />
  </Tab.Navigator>
);

export default MainTabNavigator;
