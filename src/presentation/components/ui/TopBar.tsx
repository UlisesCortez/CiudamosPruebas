// src/presentation/components/ui/TopBar.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MI from 'react-native-vector-icons/MaterialIcons';

export const APPBAR_HEIGHT = 56;

export type TopBarProps = {
  /** Si lo pasas, se muestra el título; si no, se muestra la pill de búsqueda */
  title?: string;

  /** Estilo externo del contenedor de la barra */
  style?: StyleProp<ViewStyle>;
  /** Fondo de la app bar (por defecto transparente-sutil) */
  backgroundColor?: string;
  /** Color principal de texto/íconos */
  textColor?: string;
  /** Color de acento (logo, etc.) */
  accentColor?: string;

  /** Muestra flecha atrás (si no, muestra el logo) */
  showBack?: boolean;
  onBackPress?: () => void;

  /** Texto de la pill de búsqueda (cuando no hay title) */
  placeholder?: string;
  /** Tap en la pill de búsqueda */
  onPressSearch?: () => void;

  /** Tap en el botón de perfil (headerRight) */
  onPressProfile?: () => void;

  /** Compatibilidad: no usamos micrófono, pero se permite la prop */
  hideMic?: boolean;

  /** Mostrar/ocultar campana (por si la quieres luego) */
  hideBell?: boolean;
};

const TopBar: React.FC<TopBarProps> = ({
  title, // <- NUEVO: si viene, muestra título
  style,
  backgroundColor = 'transparent',
  textColor = '#0D1313',
  accentColor = '#0AC5C5',
  showBack = false,
  onBackPress,

  placeholder = 'Buscar aquí',
  onPressSearch,

  onPressProfile,
  hideMic = true, // no usamos mic
  hideBell = true,
}) => {
  return (
    <SafeAreaView edges={['top']} style={{ backgroundColor: 'transparent' }}>
      <View style={[styles.bar, { backgroundColor }, style]}>
        {/* Izquierda: back o icono de app */}
        {showBack ? (
          <IconBtn name="arrow-back" onPress={onBackPress} color={textColor} />
        ) : (
          <View style={[styles.leftLogo, { borderColor: '#E7E9ED' }]}>
            <MI name="explore" size={20} color={accentColor} />
          </View>
        )}

        {/* Centro: si hay title, lo mostramos; si no, pill de búsqueda */}
        {title ? (
          <Text numberOfLines={1} style={[styles.titleText, { color: textColor }]}>
            {title}
          </Text>
        ) : (
          <Pressable
            onPress={onPressSearch}
            style={({ pressed }) => [
              styles.searchPill,
              { borderColor: '#E7E9ED' },
              pressed && { opacity: 0.9 },
            ]}
            hitSlop={8}
          >
            <MI name="search" size={20} color="#6B7280" style={{ marginRight: 8 }} />
            <Text numberOfLines={1} style={styles.searchPlaceholder}>
              {placeholder}
            </Text>
          </Pressable>
        )}

        {/* Derecha: (opcional) campana y perfil */}
        <View style={styles.actions}>
          {!hideBell && <IconBtn name="notifications-none" onPress={() => {}} color={textColor} />}
          <IconBtn name="person" onPress={onPressProfile} color={textColor} />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default TopBar;

/** Botón de icono minimal */
function IconBtn({
  name,
  onPress,
  color = '#0D1313',
}: {
  name: string;
  onPress?: () => void;
  color?: string;
}) {
  return (
    <Pressable
      hitSlop={8}
      onPress={onPress}
      style={({ pressed }) => [
        styles.iconBtn,
        { opacity: pressed ? 0.6 : 1 },
      ]}
    >
      <MI name={name as any} size={22} color={color} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bar: {
    height: APPBAR_HEIGHT,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    // borde/sombra sutil opcional; al ser transparente apenas se nota
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(231, 233, 237, 0.0)',
  },
  leftLogo: {
    height: 32,
    width: 32,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    marginRight: 10,
  },
  titleText: {
    flex: 1,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  searchPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    borderWidth: StyleSheet.hairlineWidth,
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: 16,
    color: '#6B7280',
    includeFontPadding: false,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  iconBtn: {
    height: 36,
    width: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
});
