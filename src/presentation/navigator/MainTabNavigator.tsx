// src/presentation/navigator/MainTabNavigator.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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

const MainTabNavigator: React.FC = () => {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      initialRouteName="Mapa"
      screenOptions={({ route }) => ({
        headerShown: false,

        // ✅ Ícono + NOMBRE del apartado
        tabBarShowLabel: true,
        tabBarLabel: route.name, // “Mapa”, “Reportar”, “Reportes”
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginBottom: 6,
        },

        // ✅ Íconos
        tabBarIcon: ({ focused, color, size }) => {
          const icons: Record<keyof TabParamList, string> = {
            Mapa:     focused ? 'map'           : 'map-outline',
            Reportar: focused ? 'add-circle'    : 'add-circle-outline',
            Reportes: focused ? 'list'          : 'list-outline',
          };
          return <Icon name={icons[route.name]} size={size} color={color} />;
        },

        // ✅ Estilo de la barra
        tabBarActiveTintColor:   '#3b82f6',
        tabBarInactiveTintColor: '#99A1B3',
        tabBarStyle: {
          height: 64 + insets.bottom,
          paddingTop: 8,
          paddingBottom: insets.bottom,
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          position: 'absolute',
          backgroundColor: '#FFFFFF',
          elevation: 12,
        },
      })}
    >
      <Tab.Screen name="Mapa"     component={WelcomeScreen} />
      <Tab.Screen name="Reportar" component={ReportScreen} />
      <Tab.Screen name="Reportes" component={ListaReportesScreen} />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;
