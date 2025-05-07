// src/screens/LoginScreen.tsx

import React, { useState } from 'react';
import {
  Image,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { EyeIcon, EyeOffIcon } from '../presentation/icons/icons';
import { colors } from '../config/theme/theme';
import MyButton from '../presentation/components/ui/MyButton';
import MyButtonRegister from '../presentation/components/ui/MyButtonRegister';

export const LoginScreen: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={styles.container}>

      {/* Logo */}
      <Image
        source={require('../presentation/assets/images/LogoDark.png')}
        style={styles.logo}
      />

      {/* Texto debajo del logo */}
      <Text style={styles.appName}>Ciudamos</Text>

      <View style={styles.formContainer}>

        <TextInput
          placeholder="Usuario"
          placeholderTextColor="#555"
          style={styles.input}
        />

        <TextInput
          placeholder="Contraseña"
          placeholderTextColor="#555"
          secureTextEntry={!showPassword}
          style={styles.input}
        />

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

        <Text style={styles.link}>¿Olvidaste tu contraseña?</Text>

      </View>

      
          <Text style={styles.footer}>
            ¿No tienes cuenta?{' '}
            <MyButtonRegister title=" Regístrate aquí" navigateTo="Register" />
          </Text>
        

    </View>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.cardBackground,
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  logo: {
    width: 170,
    height: 170,
    borderRadius: 120,
    borderWidth: 3,
    alignSelf: 'center',
    position: 'absolute',
    top: 50,
  },
  appName: {
    marginTop: 240,
    fontSize: 32,
    fontFamily: 'sans-serif',   // ← Aquí la nueva tipografía
    color: colors.text,
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
    marginTop: 24,
  },
  input: {
    backgroundColor: '#ddd',
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 16,
    borderRadius: 8,
    color: 'black',
    fontFamily: 'Poppins-Regular', // ← también en inputs si quieres
  },
  iconContainer: {
    position: 'absolute',
    right: 16,
    top: 112,
  },
  link: {
    color: '#00bfff',
    textAlign: 'center',
    marginTop: 16,
    fontFamily: 'Poppins-Medium',  // ← y en links
  },
  footer: {
    position: 'absolute',
    bottom: 32,
    color: colors.text,
    textAlign: 'center',
    fontFamily: 'Poppins-Regular',
  },
  register: {
    color: '#00bfff',
    fontFamily: 'Poppins-SemiBold',
  },
});
