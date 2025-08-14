import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, Linking, Alert } from 'react-native';
import MI from 'react-native-vector-icons/MaterialIcons';

const UI = {
  bg: '#F4F7FC',
  card: '#FFFFFF',
  muted: '#6B7280',
  border: '#E7E9ED',
  primary: '#0AC5C5',
  text: '#0D1313',
};

type Service = { id: string; name: string; phone: string; icon: string };

const SERVICES: Service[] = [
  { id: '911', name: 'Emergencias 911', phone: '911', icon: 'warning-amber' },
  { id: 'policia', name: 'Policía municipal', phone: '1234567890', icon: 'local-police' },
  { id: 'bomberos', name: 'Bomberos', phone: '1234567891', icon: 'local-fire-department' },
  { id: 'cruz', name: 'Cruz Roja', phone: '1234567892', icon: 'medical-services' },
  { id: 'municipio', name: 'Atención ciudadana', phone: '1234567893', icon: 'support-agent' },
];

const ServicesScreen: React.FC = () => {
  const [q, setQ] = useState('');

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return SERVICES;
    return SERVICES.filter(v => v.name.toLowerCase().includes(s));
  }, [q]);

  const call = async (phone: string) => {
    try {
      const url = `tel:${phone}`;
      const ok = await Linking.canOpenURL(url);
      if (!ok) throw new Error('No se pudo iniciar la llamada');
      await Linking.openURL(url);
    } catch (e: any) {
      Alert.alert('Llamada', e?.message || 'No se pudo iniciar la llamada');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchBox}>
        <MI name="search" size={20} color={UI.muted} />
        <TextInput
          placeholder="Buscar servicio o teléfono"
          placeholderTextColor={UI.muted}
          style={styles.searchInput}
          value={q}
          onChangeText={setQ}
        />
      </View>

      {filtered.map(s => (
        <View key={s.id} style={styles.row}>
          <View style={styles.left}>
            <View style={styles.iconWrap}>
              <MI name={s.icon as any} size={20} color={UI.primary} />
            </View>
            <View>
              <Text style={styles.name}>{s.name}</Text>
              <Text style={styles.phone}>{s.phone}</Text>
            </View>
          </View>

          <Pressable style={({ pressed }) => [styles.callBtn, pressed && { opacity: 0.8 }]} onPress={() => call(s.phone)}>
            <MI name="call" size={20} color="#fff" />
          </Pressable>
        </View>
      ))}
    </View>
  );
};

export default ServicesScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: UI.bg, padding: 16 },
  searchBox: {
    height: 44,
    borderRadius: 12,
    paddingHorizontal: 12,
    backgroundColor: UI.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: UI.border,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  searchInput: { marginLeft: 8, color: UI.text, flex: 1 },
  row: {
    backgroundColor: UI.card,
    borderRadius: 16,
    padding: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: UI.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconWrap: {
    height: 36, width: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(10,197,197,0.12)',
  },
  name: { color: UI.text, fontWeight: '800' },
  phone: { color: UI.muted, fontSize: 12, marginTop: 2 },
  callBtn: {
    height: 40, width: 40, borderRadius: 20,
    backgroundColor: UI.primary,
    alignItems: 'center', justifyContent: 'center',
  },
});
