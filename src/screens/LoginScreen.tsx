import { Image, Text, View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { EyeIcon, EyeOffIcon } from '../presentation/icons/icons';
import { colors } from '../config/theme/theme';
import MyButton from '../presentation/components/ui/MyButton';
import React, { useState } from 'react';



export const LoginScreen = () => {
  const [showPassword, setShowPassword] = useState(false);
  return (   
    <View style={styles.container}>
      <View style = {{marginTop: 1}}>
       
          <Image source={require('../presentation/assets/images/LogoDark.png')} style={styles.logo}/>

            <View style = {{marginTop: '70%'}}>
              <TextInput placeholder="Usuario" placeholderTextColor="#555" style={styles.input} />
              <TextInput placeholder="Contraseña" placeholderTextColor="#555" secureTextEntry={!showPassword} style={styles.input} />
        
              <View style={styles.iconContainer}>
                {showPassword ? (
                  <TouchableOpacity onPress={() => setShowPassword(false)}>
                    <EyeOffIcon />
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity onPress={() => setShowPassword(true)}>
                    <EyeIcon />
                  </TouchableOpacity>
                 )}
              </View>

              <MyButton title="Ingresar" navigateTo="Tabs" />

     
              <View >
                <Text style={styles.link}>¿Olvidaste tu contraseña?</Text>
              </View>

            </View>
            
          <View>
            <Text style={styles.footer}>
              ¿No tienes cuenta? <Text style={styles.register}>Regístrate aquí</Text>
            </Text>
          </View>

         </View>
          
    </View>
  );
};
  
export default LoginScreen;

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.cardBackground,
      justifyContent: 'center',
      padding: 40,
      
    },
    input: {
      backgroundColor: '#ddd',
      padding: 20,
      marginBottom: 10,
      borderRadius: 10,
      color: 'black',
      
    },
    
    iconContainer: {
      flexDirection: 'row',
      justifyContent: 'flex-start',
      marginBottom: 20,
   
    },
    link: {
      color: '#00bfff',
      textAlign: 'center',
      marginBottom: 20,
     
    },
    footer: {
      textAlign: 'center',
      color: colors.text,
    },
    register: {
      color: '#00bfff',
      fontWeight: 'bold',
    },
    ellipse: {
      width: 600, 
      height: 300,
      backgroundColor: 'black',
      borderBottomLeftRadius: 300,
      borderBottomRightRadius: 300,
      alignSelf: 'center',
      position: 'absolute',
      top: -150,
      
    },
    logo: {
      width: 170,
      height: 170,
      borderRadius: 120, 
      borderWidth: 3,
      //borderColor: '#00BFFF', 
      alignItems: 'center',
      alignSelf: 'center',
      position: 'absolute',
      top: -50,
      
    },
} );