// src/presentation/navigator/MainTabNavigator.tsx
import React from 'react';
import { Pressable, Text, StyleSheet, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MI from 'react-native-vector-icons/MaterialIcons';
import MCI from 'react-native-vector-icons/MaterialCommunityIcons';

import WelcomeScreen from '../../screens/WelcomeScreen';
import CommunityScreen from '../../screens/CommunityScreen';
import ServicesScreen from '../../screens/ServicesScreen';

export type MainTabsParamList = {
  Mapa: undefined;
  Comunidad: undefined;
  Servicios: undefined;
};

const Tab = createBottomTabNavigator<MainTabsParamList>();

const BUBBLE_BLUE = '#0AC5C5';
const LABEL_BLACK = '#0D1313';

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
    minWidth: 220,
    maxWidth: 320,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E7E9ED',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  pillText: { fontSize: 16, color: '#6B7280' },
  rightBtns: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginRight: 8,
  },
  rightBtn: {
    height: 36,
    width: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E7E9ED',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
});

const MainTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
        headerShadowVisible: false,
        headerTitleAlign: 'left',
        tabBarHideOnKeyboard: true,

        // Barra blanca
        tabBarStyle: {
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
          backgroundColor: '#FFFFFF',
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: '#E7E9ED',
        },

        // Labels negras (activo e inactivo)
        tabBarActiveTintColor: LABEL_BLACK,
        tabBarInactiveTintColor: LABEL_BLACK,
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
      }}
    >
      {/* MAPA */}
      <Tab.Screen
        name="Mapa"
        component={WelcomeScreen}
        options={({ navigation }) => ({
          sceneContainerStyle: { backgroundColor: 'transparent' },
          headerTransparent: true,
          headerStyle: { backgroundColor: 'transparent' },
          headerBackground: () => null,
          headerLeft: () => null,
          headerTitleContainerStyle: { width: '100%' },
          headerTitle: () => (
            <Pressable
              onPress={() => { /* abrir búsqueda/filtros del mapa */ }}
              style={({ pressed }) => [styles.pill, pressed && { opacity: 0.9 }]}
              hitSlop={8}
            >
              <MI name="search" size={20} style={{ marginRight: 8, color: '#6B7280' }} />
              <Text numberOfLines={1} style={styles.pillText}>Buscar aquí</Text>
            </Pressable>
          ),
          headerRight: () => (
            <View style={styles.rightBtns}>
              <Pressable
                onPress={() => navigation.getParent()?.navigate('Rewards' as never)}
                style={({ pressed }) => [styles.rightBtn, pressed && { opacity: 0.85 }]}
                hitSlop={8}
              >
                <MI name="emoji-events" size={20} color="#0D1313" />
              </Pressable>
              <Pressable
                onPress={() => navigation.getParent()?.navigate('Profile' as never)}
                style={({ pressed }) => [styles.rightBtn, pressed && { opacity: 0.85 }]}
                hitSlop={8}
              >
                <MI name="person" size={22} color="#0D1313" />
              </Pressable>
            </View>
          ),
          // Activo = filled | Inactivo = outline (azul)
          tabBarIcon: ({ size, focused }) =>
            <MCI name={focused ? 'map' : 'map-outline'} size={size} color={BUBBLE_BLUE} />,
        })}
      />

      {/* COMUNIDAD */}
      <Tab.Screen
        name="Comunidad"
        component={CommunityScreen}
        options={{
          headerTitle: 'Comunidad',
          tabBarIcon: ({ size, focused }) =>
            <MCI name={focused ? 'forum' : 'forum-outline'} size={size} color={BUBBLE_BLUE} />,
        }}
      />

      {/* SERVICIOS */}
      <Tab.Screen
        name="Servicios"
        component={ServicesScreen}
        options={{
          headerTitle: 'Servicios y emergencias',
          tabBarIcon: ({ size, focused }) =>
            <MCI name={focused ? 'medical-bag' : 'medical-bag-outline'} size={size} color={BUBBLE_BLUE} />,
        }}
      />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;
