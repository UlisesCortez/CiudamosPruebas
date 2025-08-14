import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import MI from 'react-native-vector-icons/MaterialIcons';

const UI = {
  bg: '#F4F7FC',
  card: '#FFFFFF',
  muted: '#6B7280',
  border: '#E7E9ED',
  text: '#0D1313',
};

const DATA = [
  { id: '1', title: 'Luz intermitente en la Av. Central', body: 'Varias noches seguidas sin alumbrado.' },
  { id: '2', title: 'Taller de reciclaje', body: 'Sábado 10am en la casa de cultura.' },
  { id: '3', title: 'Perro perdido', body: 'Mestizo café visto cerca del parque.' },
];

const CommunityScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <FlatList
        contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
        data={DATA}
        keyExtractor={i => i.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <MI name="campaign" size={18} color="#0AC5C5" />
              <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
            </View>
            <Text style={styles.body}>{item.body}</Text>
          </View>
        )}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      />
    </View>
  );
};

export default CommunityScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: UI.bg },
  card: {
    backgroundColor: UI.card,
    borderRadius: 16,
    padding: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: UI.border,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  title: { marginLeft: 8, fontWeight: '800', color: UI.text, fontSize: 16, flex: 1 },
  body: { color: UI.muted, fontSize: 14 },
});
