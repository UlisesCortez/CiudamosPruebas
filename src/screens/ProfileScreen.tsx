// src/screens/ProfileScreen.tsx
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Switch,
  ScrollView,
  Alert,
} from 'react-native';
import MI from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import TopBar from '../presentation/components/ui/TopBar';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../presentation/navigator/RootNavigator';

const UI = {
  bg: '#F4F7FC',
  card: '#FFFFFF',
  muted: '#6B7280',
  border: '#E7E9ED',
  primary: '#0AC5C5',
  text: '#0D1313',
};

type Nav = NativeStackNavigationProp<RootStackParamList>;

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();

  // estados de ejemplo (conecta con tu store cuando quieras)
  const [pushEnabled, setPushEnabled] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const handleEditProfile = () => {
    Alert.alert('Editar perfil', 'Aquí abriremos el editor de perfil ✏️');
  };

  const handleSignOut = async () => {
    try {
      await AsyncStorage.multiRemove(['authToken', 'user']);
      navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    } catch (e) {
      Alert.alert('Ups', 'No se pudo cerrar sesión. Intenta de nuevo.');
    }
  };

  return (
    // 👇 Solo bottom safe area; el TopBar ya aplica el top, así evitamos doble espacio
    <SafeAreaView style={{ flex: 1, backgroundColor: UI.bg }} edges={['bottom']}>
      <TopBar title="Mi perfil" showBack={false} onPressProfile={() => {}} />

      <ScrollView contentContainerStyle={styles.content}>
        {/* Card superior */}
        <View style={styles.card}>
          <View style={styles.headerRow}>
            <Avatar initials="UC" />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.name}>Ulises Cortez</Text>
              <Text style={styles.muted}>ulises@ciudamos.app</Text>
            </View>

            <Pressable style={styles.iconChip} onPress={handleEditProfile} hitSlop={8}>
              <MI name="edit" size={18} color={UI.text} />
            </Pressable>
          </View>

          <View style={styles.statsRow}>
            <Stat label="Reportes" value="18" />
            <Divider />
            <Stat label="Aprobados" value="14" />
            <Divider />
            <Stat label="Pendientes" value="4" />
          </View>
        </View>

        {/* Preferencias */}
        <Section title="Preferencias">
          <RowSwitch
            icon="notifications-none"
            label="Notificaciones"
            value={pushEnabled}
            onValueChange={setPushEnabled}
          />
          <RowSwitch
            icon="my-location"
            label="Permitir ubicación"
            value={locationEnabled}
            onValueChange={setLocationEnabled}
          />
          <RowSwitch
            icon="dark-mode"
            label="Modo oscuro"
            value={darkMode}
            onValueChange={setDarkMode}
          />
        </Section>

        {/* Cuenta */}
        <Section title="Cuenta">
          <RowItem icon="security" label="Privacidad" onPress={() => Alert.alert('Privacidad')} />
          <RowItem icon="help-outline" label="Ayuda" onPress={() => Alert.alert('Ayuda')} />
          <RowItem icon="logout" label="Cerrar sesión" danger onPress={handleSignOut} />
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;

/* -------------------------------- Helpers UI -------------------------------- */

function Avatar({ initials = 'US' }: { initials?: string }) {
  return (
    <View style={styles.avatar}>
      <Text style={styles.avatarText}>{initials}</Text>
    </View>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ alignItems: 'center', flex: 1 }}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ marginTop: 16 }}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.card}>{children}</View>
    </View>
  );
}

function RowItem({
  icon,
  label,
  right,
  onPress,
  danger,
}: {
  icon: string;
  label: string;
  right?: string;
  onPress?: () => void;
  danger?: boolean;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.row, { opacity: pressed ? 0.6 : 1 }]}>
      <View style={styles.rowLeft}>
        <View style={[styles.rowIconWrap, { backgroundColor: 'rgba(10,197,197,0.12)' }]}>
          <MI name={icon as any} size={20} color={UI.primary} />
        </View>
        <Text style={[styles.rowLabel, danger && { color: '#C0332B', fontWeight: '800' }]}>{label}</Text>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        {!!right && <Text style={styles.rowRightText}>{right}</Text>}
        <MI name="chevron-right" size={22} color="#9AA3AF" />
      </View>
    </Pressable>
  );
}

function RowSwitch({
  icon,
  label,
  value,
  onValueChange,
}: {
  icon: string;
  label: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.rowLeft}>
        <View style={[styles.rowIconWrap, { backgroundColor: 'rgba(10,197,197,0.12)' }]}>
          <MI name={icon as any} size={20} color={UI.primary} />
        </View>
        <Text style={styles.rowLabel}>{label}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        thumbColor="#fff"
        trackColor={{ false: '#D1D5DB', true: UI.primary }}
      />
    </View>
  );
}

/* -------------------------------- Styles -------------------------------- */

const styles = StyleSheet.create({
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: UI.card,
    borderRadius: 16,
    padding: 14,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: UI.border,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    height: 64,
    width: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(10,197,197,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: UI.border,
  },
  avatarText: { color: UI.primary, fontWeight: '900', fontSize: 22, letterSpacing: 0.5 },
  name: { fontSize: 18, fontWeight: '900', color: UI.text },
  muted: { color: UI.muted, fontSize: 12, marginTop: 2 },
  iconChip: {
    height: 32,
    width: 32,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: UI.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },

  statsRow: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statValue: { fontWeight: '900', fontSize: 18, color: UI.text },
  statLabel: { color: UI.muted, fontSize: 12, marginTop: 2 },
  divider: {
    width: 1,
    height: 26,
    backgroundColor: UI.border,
  },

  sectionTitle: { marginTop: 8, marginBottom: 8, fontWeight: '800', color: UI.muted, fontSize: 12 },
  row: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rowIconWrap: {
    height: 34,
    width: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: { fontSize: 16, color: UI.text, fontWeight: '600' },
  rowRightText: { color: UI.muted, fontSize: 12 },
});
