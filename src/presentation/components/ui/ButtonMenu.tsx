// src/presentation/components/ui/ButtonMenu.tsx

import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { MenuIcon } from '../../icons/icons';

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
      <View style = {styles.button}>
        <MenuIcon/>
      </View>
   
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: 'rgba(255, 255, 255, 0.89)',
    borderRadius: 20,
    //width:40,
    //height:40,
    alignItems:'center',
    alignContent: 'center',
    alignSelf: 'center',
    
  
  },
});

