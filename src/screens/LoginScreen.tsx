// src/screens/LoginScreen.tsx
import React, { useState } from 'react';
import {
  Image,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Dimensions,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../presentation/navigator/RootNavigator';

import { EyeIcon, EyeOffIcon } from '../presentation/icons/icons';
import { colors } from '../config/theme/theme';

const UI = {
  bg: '#F4F7FC',
  card: '#FFFFFF',
  muted: '#797C8A',
  border: '#E9E9E9',
  primary: '#0AC5C5',
};

const { height: SCREEN_H } = Dimensions.get('screen');

const LoginScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [rfc, setRfc] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const onIngresar = async () => {
    const userTrim = rfc.trim();
    const passTrim = password.trim();


    // 🔐 Caso especial: autoridad -> Admin / admin
    if (userTrim.toLowerCase() === 'admin' && passTrim === 'admin') {
      const authUser = {
        id: 'auth-001',
        nombre: 'Administración',
        email: 'admin@ciudamos.app',
        role: 'autoridad' as const,
        authorityAreas: ['Infraestructura', 'Seguridad'], // ajusta las áreas que debe ver
      };
      await AsyncStorage.setItem('user', JSON.stringify(authUser));
      await AsyncStorage.setItem('authToken', 'token-demo');

      // Ir directo a la pantalla de Autoridad y limpiar el stack
      return navigation.reset({ index: 0, routes: [{ name: 'AuthorityReports' }] });
    }

    // 👤 Resto: ciudadano normal → Tabs
    const citizenUser = {
      id: `cit-${Date.now()}`,
      nombre: userTrim,
      email: `${userTrim.toLowerCase()}@ciudamos.app`,
      role: 'ciudadano' as const,
    };
    await AsyncStorage.setItem('user', JSON.stringify(citizenUser));
    await AsyncStorage.setItem('authToken', 'token-demo');

    // Si ya usas tabs como home:
    navigation.reset({ index: 0, routes: [{ name: 'Tabs' }] });
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: UI.bg }}
      behavior={Platform.select({ ios: 'padding', android: undefined })}
    >
      {/* Usamos minHeight=SCREEN_H para que el footer NO se mueva con el teclado */}
      <View style={[styles.container, { minHeight: SCREEN_H }]}>
        {/* Logo */}
        <Image
          source={require('../presentation/assets/images/Logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        {/* Título sin degradado */}
        <Text style={styles.title}>Iniciar sesión</Text>

        {/* Subtítulo */}
        <Text style={styles.subtitle}>
          Accede para reportar y seguir incidentes en tu zona.
        </Text>

        {/* Línea divisora suave */}
        <View style={styles.hr} />

        {/* RFC */}
        <View style={styles.inputWrap}>
          <TextInput
            value={rfc}
            onChangeText={setRfc}
            placeholder="RFC / Usuario"
            placeholderTextColor={UI.muted}
            autoCorrect={false}
            autoCapitalize="none"
            style={styles.inputField}
            returnKeyType="next"
          />
        </View>

        {/* Contraseña */}
        <View style={[styles.inputWrap, { marginTop: 12 }]}>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Contraseña"
            placeholderTextColor={UI.muted}
            secureTextEntry={!showPassword}
            style={[styles.inputField, { paddingRight: 44 }]}
            returnKeyType="done"
            onSubmitEditing={onIngresar}
          />
          <TouchableOpacity
            accessibilityLabel={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            onPress={() => setShowPassword(prev => !prev)}
            style={styles.eyeButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            {showPassword ? <EyeOffIcon /> : <EyeIcon />}
          </TouchableOpacity>
        </View>

        {/* ¿Olvidaste tu contraseña? */}
        <Text style={styles.linkRight}>¿Olvidaste tu contraseña?</Text>

        {/* Botón "Ingresar" estilo píldora teal */}
        <Pressable style={styles.primaryBtn} onPress={onIngresar}>
          <Text style={styles.primaryTxt}>Ingresar</Text>
        </Pressable>

        {/* Footer fijo (no se mueve) */}
        <View style={styles.footerRow}>
          <Text style={styles.footerText}>¿No tienes cuenta?</Text>
          <Pressable onPress={() => navigation.navigate('Register')}>
            <Text style={styles.footerLink}> Regístrate</Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;

const MAX_W = 460;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: UI.bg,
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingTop: 72,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 14,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    color: UI.primary,
    fontFamily: 'Poppins-Medium',
  },
  subtitle: {
    color: UI.muted,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 18,
    lineHeight: 20,
    paddingHorizontal: 10,
    fontFamily: 'Poppins-Regular',
    maxWidth: MAX_W,
  },
  hr: {
    height: 1,
    backgroundColor: UI.border,
    width: '100%',
    maxWidth: MAX_W,
    marginVertical: 10,
  },
  inputWrap: {
    backgroundColor: UI.card,
    borderRadius: 24,
    borderWidth: 1.2,
    borderColor: UI.border,
    paddingHorizontal: 16,
    height: 54,
    alignItems: 'center',
    flexDirection: 'row',
    width: '100%',
    maxWidth: MAX_W,
  },
  inputField: {
    flex: 1,
    paddingHorizontal: 2,
    color: colors.text,
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
  },
  eyeButton: {
    position: 'absolute',
    right: 14,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  linkRight: {
    color: UI.muted,
    alignSelf: 'flex-end',
    marginTop: 10,
    marginRight: (Platform.OS === 'android' ? 2 : 0),
    fontFamily: 'Poppins-Medium',
  },
  primaryBtn: {
    width: '100%',
    maxWidth: MAX_W,
    height: 56,
    borderRadius: 28,
    backgroundColor: UI.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    shadowColor: UI.primary,
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  primaryTxt: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    letterSpacing: 0.2,
  },
  footerRow: {
    position: 'absolute',
    bottom: 90,
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerText: {
    color: UI.muted,
    fontFamily: 'Poppins-Regular',
  },
  footerLink: {
    color: UI.primary,
    fontFamily: 'Poppins-Medium',
    fontWeight: '800',
  },
});
