// src/presentation/navigator/MainTabNavigator.tsx

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';

import WelcomeScreen from '../../screens/WelcomeScreen';
import ReportScreen  from '../../screens/ReportScreen';
import ListaReportesScreen from '../../screens/ListaReportesScreen.tsx';

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
        let iconName = 'alert-circle-outline';
        if (route.name === 'Mapa')     iconName = focused ? 'map'     : 'map-outline';
        if (route.name === 'Reportar') iconName = focused ? 'add-circle' : 'add-circle-outline';
        if (route.name === 'Reportes') iconName = focused ? 'list'    : 'list-outline';
        return <Icon name={iconName} size={size} color={color} />;
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
