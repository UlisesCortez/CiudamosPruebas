import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigator/RootNavigator';

interface Props {
  title: string;
  navigateTo?: keyof RootStackParamList;
  onPress?: () => void;
}

const MyButtonRegister: React.FC<Props> = ({ title, navigateTo, onPress }) => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else if (navigateTo) {
      navigation.navigate(navigateTo); 
    }
  };

  return (
    <TouchableOpacity onPress={handlePress}>
      <Text style={styles.register}>{title}</Text>
    </TouchableOpacity>
  );
};

export default MyButtonRegister;

const styles = StyleSheet.create({
    register: {
        top:5,
        color: '#00bfff',
        fontWeight: 'bold',
      },
});