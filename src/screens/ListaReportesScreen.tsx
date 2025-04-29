// src/screens/ListaReportesScreen.tsx

import React, { useContext, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { MarkersContext, Marker } from '../context/MarkersContext';

const GOOGLE_API_KEY = 'AIzaSyC39TwhA5GplXYRHTQ2Ao-s-pmuGyvXjJ0';

const ListaReportesScreen: React.FC = () => {
  const { markers } = useContext(MarkersContext);
  // guardamos direcciones por id de marcador
  const [addresses, setAddresses] = useState<Record<string, string>>({});

  // Reverse-geocode al montar / cuando cambian marcadores
  useEffect(() => {
    markers.forEach((m) => {
      if (!addresses[m.id]) {
        fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${m.latitude},${m.longitude}&key=${GOOGLE_API_KEY}`
        )
          .then((res) => res.json())
          .then((json) => {
            const calle =
              json.results?.[0]?.formatted_address ||
              `${m.latitude.toFixed(5)}, ${m.longitude.toFixed(5)}`;
            setAddresses((a) => ({ ...a, [m.id]: calle }));
          })
          .catch(() => {
            setAddresses((a) => ({
              ...a,
              [m.id]: `${m.latitude.toFixed(5)}, ${m.longitude.toFixed(5)}`,
            }));
          });
      }
    });
  }, [markers]);

  const formatDate = (id: string) => {
    const fecha = new Date(parseInt(id, 10));
    return fecha.toLocaleString('es-MX', {
      day:   '2-digit',
      month: '2-digit',
      year:  'numeric',
      hour:    '2-digit',
      minute:  '2-digit',
    });
  };

  const renderItem = ({ item }: { item: Marker }) => (
    <View style={styles.card}>
      <Text style={styles.type}>{item.title}</Text>
      <Text style={styles.address}>
        {addresses[item.id] ?? 'Cargando dirección...'}
      </Text>
      <Text style={styles.date}>{formatDate(item.id)}</Text>
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
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={styles.spacer} />}
        ListFooterComponent={() =>
          markers.some((m) => !addresses[m.id]) ? (
            <ActivityIndicator style={{ marginTop: 16 }} />
          ) : null
        }
      />
    </View>
  );
};

export default ListaReportesScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  header: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 12,
    color: '#333',
  },
  card: {
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 14,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  type: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111',
    marginBottom: 4,
  },
  address: {
    fontSize: 14,
    color: '#555',
    marginBottom: 6,
  },
  date: {
    fontSize: 12,
    color: '#888',
  },
  spacer: {
    height: 12,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
});
