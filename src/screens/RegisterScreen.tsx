import React, { useState } from 'react';
import { Image, Text, View, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { EyeIcon, EyeOffIcon } from '../presentation/icons/icons';
import { colors } from '../config/theme/theme';
import MyButton from '../presentation/components/ui/MyButton';

export const RegisterScreen = () => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={{ marginTop: 25 }}>
        <Image source={require('../presentation/assets/images/LogoDark.png')} style={styles.logo} />

        <View style={{ marginTop: '50%' }}>
          <TextInput placeholder="Nombre completo" placeholderTextColor="#555" style={styles.input} />
          <TextInput placeholder="Nombre de usuario" placeholderTextColor="#555" style={styles.input} />
          <TextInput placeholder="Correo electrónico" placeholderTextColor="#555" keyboardType="email-address" style={styles.input} />
          <TextInput placeholder="RFC" placeholderTextColor="#555" style={styles.input} />
          <TextInput placeholder="Teléfono" placeholderTextColor="#555" keyboardType="phone-pad" style={styles.input} />
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

          <MyButton title="Registrarse" navigateTo="Login" />

          <View>
            <Text style={styles.link}>¿Ya tienes cuenta? Inicia sesión</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default RegisterScreen;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
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
  logo: {
    width: 170,
    height: 170,
    borderRadius: 120,
    borderWidth: 3,
    alignSelf: 'center',
    position: 'absolute',
    top: -50,
  },
});
