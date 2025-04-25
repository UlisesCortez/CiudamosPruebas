// src/presentation/components/ui/ButtonMenu.tsx

import React from 'react';
import { TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

interface Props {
  // ya no necesitamos navigateTo genérico, siempre va a Menu
}

export default function ButtonMenu(_: Props) {
  const navigation = useNavigation();

  return (
    <TouchableOpacity
      onPress={() => {
        // getParent() sube al stack raíz y abre "Menu"
        navigation.getParent()?.navigate('Menu');
      }}
    >
      <Icon name="menu" size={28} color="#000" />
    </TouchableOpacity>
  );
}
