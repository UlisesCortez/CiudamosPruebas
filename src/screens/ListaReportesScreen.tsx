// src/screens/ListaReportesScreen.tsx

import React, { useContext, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { MarkersContext, Marker } from '../context/MarkersContext';

const ListaReportesScreen: React.FC = () => {
  const { markers, removeMarker } = useContext(MarkersContext);
  const [addresses, setAddresses] = useState<Record<string, string>>({});

  useEffect(() => {
    markers.forEach(m => {
      if (!addresses[m.id]) {
        fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${m.latitude},${m.longitude}&key=YOUR_GOOGLE_API_KEY`
        )
          .then(res => res.json())
          .then(json => {
            const dir =
              json.results?.[0]?.formatted_address ??
              `${m.latitude.toFixed(5)}, ${m.longitude.toFixed(5)}`;
            setAddresses(a => ({ ...a, [m.id]: dir }));
          })
          .catch(() =>
            setAddresses(a => ({
              ...a,
              [m.id]: `${m.latitude.toFixed(5)}, ${m.longitude.toFixed(5)}`,
            }))
          );
      }
    });
  }, [markers]);

  const formatDate = (id: string) =>
    new Date(parseInt(id, 10)).toLocaleString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  const confirmDelete = (id: string) => {
    Alert.alert(
      'Eliminar reporte',
      '¿Seguro que quieres borrar este reporte?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Borrar', style: 'destructive', onPress: () => removeMarker(id) },
      ]
    );
  };

  const renderItem = ({ item }: { item: Marker }) => (
    <View style={styles.card}>
      <View style={styles.cardLeft}>
        <Text style={styles.type}>{item.title}</Text>
        <Text style={styles.address}>
          {addresses[item.id] ?? 'Cargando dirección...'}
        </Text>
        <Text style={styles.date}>{formatDate(item.id)}</Text>
      </View>

      {/* Botón X para borrar */}
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => confirmDelete(item.id)}
      >
        <Text style={styles.deleteText}>✕</Text>
      </TouchableOpacity>
    </View>
  );

  if (!markers.length) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>No hay reportes aún.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Reportes Generados</Text>
      <FlatList
        data={markers}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={styles.spacer} />}
        ListFooterComponent={() =>
          markers.some(m => !addresses[m.id]) ? (
            <ActivityIndicator style={{ marginTop: 16 }} />
          ) : null
        }
      />
    </View>
  );
};

export default ListaReportesScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  header: { fontSize: 22, fontWeight: '700', marginBottom: 12, color: '#333' },
  card: {
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 3,
  },
  cardLeft: { flex: 1 },
  type: { fontSize: 18, fontWeight: '600', color: '#111', marginBottom: 4 },
  address: { fontSize: 14, color: '#555', marginBottom: 6 },
  date: { fontSize: 12, color: '#888' },
  deleteButton: {
    marginLeft: 12,
    padding: 4,
  },
  deleteText: {
    fontSize: 18,
    color: '#ef4444',
    fontWeight: '700',
  },
  spacer: { height: 12 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 16, color: '#666' },
});
