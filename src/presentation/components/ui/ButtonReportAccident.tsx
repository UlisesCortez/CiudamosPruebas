import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { WarningIcon } from '../../icons/icons';
import { useNavigation, NavigationProp } from '@react-navigation/native';


interface Props {
  navigateTo: string;
}

const ReportAccidents = ({navigateTo}: Props) => {

  const navigation = useNavigation<NavigationProp<any>>();

    const handlePress = () => {
      navigation.navigate(navigateTo);
      
    };

  return (
    <TouchableOpacity style={styles.button} onPress={handlePress}>
      <View style={styles.content}>
        <WarningIcon />
        <Text style={styles.text}>Reportar Incidente</Text>
      </View>
    </TouchableOpacity>
  );
};

export default ReportAccidents;

const styles = StyleSheet.create({
  button: {
    backgroundColor: 'rgba(1, 1, 1, 0.5)',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    alignSelf: 'center',
    elevation: 4,
    marginBottom: 10,
    width:150,
    height:100,
  },
  content: {
    flexDirection: 'column', // 🔄 cambio clave: de row a column
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#fff',
    fontWeight: 'bold',
    marginTop: 8, // espacio entre ícono y texto
    fontSize: 14,
  },
 
});
