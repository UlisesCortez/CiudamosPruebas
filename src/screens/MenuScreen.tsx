// src/screens/MenuScreen.tsx

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert
} from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../presentation/navigator/RootNavigator';

type MenuOption = {
  label: string;
  route?: keyof RootStackParamList;
  action?: () => void;
};

export default function MenuScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const options: MenuOption[] = [
    { label: 'Mi Perfil', route: 'Profile' },
    { label: 'Recompensas', route: 'Rewards' },
    { label: 'Configuración',  action: () => Alert.alert('Próximamente') },
    { label: 'Ayuda',          action: () => Alert.alert('Próximamente') },
    {
      label: 'Cerrar Sesión',
      action: () => Alert.alert('Sesión', 'Cerrando sesión...'),
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Menú</Text>

      {options.map(opt => (
        <TouchableOpacity
          key={opt.label}
          style={styles.option}
          onPress={() => {
            if (opt.route) {
              navigation.navigate(opt.route);
            } else if (opt.action) {
              opt.action();
            }
          }}
        >
          <Text style={styles.optionText}>{opt.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 24,
  },
  option: {
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#ccc',
  },
  optionText: {
    fontSize: 16,
  },
});
