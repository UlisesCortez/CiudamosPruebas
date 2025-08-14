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

type Props = {
  title?: string;
  style?: StyleProp<ViewStyle>;
  backgroundColor?: string;  // por defecto blanco sutil
  textColor?: string;        // por defecto #0D1313
  accentColor?: string;      // color de acento para pressed state
  showBack?: boolean;
  onBackPress?: () => void;
  onSearchPress?: () => void;
  onBellPress?: () => void;
  onProfilePress?: () => void;
};

const TopBar: React.FC<Props> = ({
  title = 'Ciudamos',
  style,
  backgroundColor = 'rgba(255,255,255,0.96)',
  textColor = '#0D1313',
  accentColor = '#0AC5C5',
  showBack = false,
  onBackPress,
  onSearchPress,
  onBellPress,
  onProfilePress,
}) => {
  return (
    <SafeAreaView edges={['top']} style={{ backgroundColor: 'transparent' }}>
      <View style={[styles.bar, { backgroundColor }, style]}>
        {/* Izquierda: back o icono de app */}
        {showBack ? (
          <IconBtn name="arrow-back" onPress={onBackPress} />
        ) : (
          <View style={styles.leftLogo}>
            <MI name="explore" size={20} color={accentColor} />
          </View>
        )}

        {/* Título */}
        <Text numberOfLines={1} style={[styles.title, { color: textColor }]}>
          {title}
        </Text>

        {/* Acciones */}
        <View style={styles.actions}>
          <IconBtn name="search" onPress={onSearchPress} />
          <IconBtn name="notifications-none" onPress={onBellPress} />
          <IconBtn name="person" onPress={onProfilePress} />
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
}: {
  name: string;
  onPress?: () => void;
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
      <MI name={name as any} size={22} color="#0D1313" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bar: {
    height: APPBAR_HEIGHT,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    // sombra/elevación sutil tipo app bar
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E7E9ED',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  leftLogo: {
    height: 32,
    width: 32,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E7E9ED',
  },
  title: {
    flex: 1,
    marginLeft: 10,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  iconBtn: {
    height: 36,
    width: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
