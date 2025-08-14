// src/screens/ListaReportesScreen.tsx
import React, { useContext, useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Image,
  Pressable,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MI from 'react-native-vector-icons/MaterialIcons';

import { MarkersContext, Marker } from '../context/MarkersContext';
import type { RootStackParamList } from '../presentation/navigator/RootNavigator';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

const UI = {
  bg: '#F4F7FC',
  card: '#FFFFFF',
  muted: '#6B7280',
  border: '#E7E9ED',
  primary: '#0AC5C5',
  text: '#0D1313',
};

// ⚠️ Coloca aquí tu API Key (o mejor resuélvelo en backend/proxy)
const GEOCODE_KEY = 'YOUR_GOOGLE_API_KEY';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const ListaReportesScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { markers, removeMarker } = useContext(MarkersContext);
  const [addresses, setAddresses] = useState<Record<string, string>>({});

  // Resuelve una dirección "bonita" para cada marker
  useEffect(() => {
    if (!markers.length) return;

    markers.forEach((m) => {
      if (addresses[m.id]) return;

      const fallback = `${m.latitude.toFixed(5)}, ${m.longitude.toFixed(5)}`;

      // Si no hay key, evita fetch y usa fallback
      if (!GEOCODE_KEY || GEOCODE_KEY === 'YOUR_GOOGLE_API_KEY') {
        setAddresses((a) => ({ ...a, [m.id]: fallback }));
        return;
      }

      fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${m.latitude},${m.longitude}&key=${GEOCODE_KEY}`
      )
        .then((res) => res.json())
        .then((json) => {
          const dir = json.results?.[0]?.formatted_address ?? fallback;
          setAddresses((a) => ({ ...a, [m.id]: dir }));
        })
        .catch(() => setAddresses((a) => ({ ...a, [m.id]: fallback })));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [markers]);

  const formatWhen = (m: Marker) => {
    // Usa id numérico como timestamp, o m.timestamp si existe
    const raw = (m as any)?.timestamp ?? m.id;
    const d = new Date(Number.isNaN(+raw) ? raw : Number(raw));
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const confirmDelete = useCallback((id: string) => {
    Alert.alert('Eliminar reporte', '¿Seguro que quieres borrar este reporte?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Borrar', style: 'destructive', onPress: () => removeMarker(id) },
    ]);
  }, [removeMarker]);

  const openDetail = useCallback((m: Marker) => {
    navigation.navigate('DetalleReporte', { marker: m });
  }, [navigation]);

  const renderItem = ({ item }: { item: Marker }) => {
    const address = addresses[item.id] ?? 'Cargando dirección…';
    const when = formatWhen(item);

    return (
      <Pressable
        onPress={() => openDetail(item)}
        onLongPress={() => confirmDelete(item.id)}
        style={({ pressed }) => [styles.card, pressed && { opacity: 0.95 }]}
      >
        {/* Miniatura opcional */}
        {!!item.photoUri && (
          <Image source={{ uri: item.photoUri }} style={styles.thumb} />
        )}

        <View style={styles.cardBody}>
          <View style={styles.titleRow}>
            <View style={styles.typeRow}>
              <MI name="place" size={18} color={UI.primary} style={{ marginRight: 6 }} />
              <Text style={styles.type} numberOfLines={1}>
                {item.title || 'Incidente'}
              </Text>
            </View>

            <MI name="chevron-right" size={20} color="#9AA3AF" />
          </View>

          {!!item.description && (
            <Text style={styles.desc} numberOfLines={2}>
              {item.description}
            </Text>
          )}

          <Text style={styles.address} numberOfLines={1}>
            {address}
          </Text>

          {!!when && <Text style={styles.date}>{when}</Text>}
        </View>

        {/* Botón eliminar */}
        <TouchableOpacity
          onPress={() => confirmDelete(item.id)}
          hitSlop={8}
          style={styles.deleteBtn}
        >
          <MI name="close" size={16} color="#C0332B" />
        </TouchableOpacity>
      </Pressable>
    );
  };

  if (!markers.length) {
    return (
      <View style={styles.emptyWrap}>
        <View style={styles.emptyIcon}>
          <MI name="list-alt" size={28} color={UI.primary} />
        </View>
        <Text style={styles.emptyTitle}>Aún no hay reportes</Text>
        <Text style={styles.emptyText}>
          Cuando generes un reporte aparecerá aquí.
        </Text>
      </View>
    );
  }

  const isLoadingAny = markers.some((m) => !addresses[m.id]);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Mis reportes</Text>

      <FlatList
        data={markers}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={styles.spacer} />}
        contentContainerStyle={{ paddingBottom: 24 }}
        ListFooterComponent={
          isLoadingAny ? (
            <ActivityIndicator style={{ marginTop: 12 }} color={UI.primary} />
          ) : null
        }
      />
    </View>
  );
};

export default ListaReportesScreen;

/* ----------------------------- styles ----------------------------- */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: UI.bg,
    padding: 16,
  },
  header: {
    fontSize: 22,
    fontWeight: '900',
    color: UI.text,
    marginBottom: 8,
  },

  card: {
    flexDirection: 'row',
    alignItems: 'stretch',
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
  thumb: {
    width: 68,
    height: 68,
    borderRadius: 12,
    marginRight: 12,
    backgroundColor: '#eaeaea',
  },
  cardBody: { flex: 1 },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  typeRow: { flexDirection: 'row', alignItems: 'center', maxWidth: '86%' },
  type: { fontSize: 16, fontWeight: '800', color: UI.text },
  desc: { color: UI.text, opacity: 0.9, marginTop: 4 },
  address: { fontSize: 12, color: UI.muted, marginTop: 6 },
  date: { fontSize: 11, color: UI.muted, marginTop: 2 },

  deleteBtn: {
    alignSelf: 'flex-start',
    marginLeft: 8,
    height: 28,
    width: 28,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: UI.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },

  spacer: { height: 12 },

  emptyWrap: {
    flex: 1,
    backgroundColor: UI.bg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyIcon: {
    height: 56,
    width: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(10,197,197,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyTitle: { fontSize: 18, fontWeight: '900', color: UI.text },
  emptyText: { marginTop: 6, color: UI.muted, textAlign: 'center' },
});
