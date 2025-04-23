import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

interface Props {
  navigateTo: string;
}

const MenuIconButton = ({ navigateTo }: Props) => {
   const navigation = useNavigation<NavigationProp<any>>();
  
      const handlePress = () => {
        navigation.navigate(navigateTo);
        
      };

  return (
    <TouchableOpacity style={styles.button} onPress={handlePress}>
      <Icon name="menu" size={28} color="#fff" />
    </TouchableOpacity>
  );
};

export default MenuIconButton;

const styles = StyleSheet.create({
  button: {
    backgroundColor: 'rgba(1, 1, 1, 0.5)',
    padding: 12,
    borderRadius: 50,
    //width: 50,
   // height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    elevation: 3,
    color: "#000"
  },
});

