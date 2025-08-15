// src/screens/RewardsScreen.tsx
import React, { useContext, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MI from 'react-native-vector-icons/MaterialIcons';

import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../presentation/navigator/RootNavigator';

import { MarkersContext, Marker } from '../context/MarkersContext';

const UI = {
  bg: '#F4F7FC',
  card: '#FFFFFF',
  muted: '#6B7280',
  border: '#E7E9ED',
  primary: '#0AC5C5',
  text: '#0D1313',
};

type Nav = NativeStackNavigationProp<RootStackParamList, any>;

const REWARD_PER_REPORT = 5; // 5 tokens por reporte

const RewardsScreen: React.FC = () => {
  const { markers } = useContext(MarkersContext);
  const navigation = useNavigation<Nav>();

  // Total de tokens
  const totalReward = useMemo(
    () => markers.length * REWARD_PER_REPORT,
    [markers.length]
  );

  // Fecha amigable (usa timestamp si existe; si no, intenta con id numérico)
  const formatDate = (m: Marker) => {
    const ts =
      (m as any).timestamp ??
      (Number.isFinite(+m.id) ? +m.id : Date.now());
    return new Date(ts).toLocaleString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderItem = ({ item }: { item: Marker }) => (
    <View style={styles.rowCard}>
      <View style={styles.rowLeft}>
        <View style={styles.iconWrap}>
          <MI name="emoji-events" size={20} color={UI.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.rowTitle} numberOfLines={1}>
            {item.title || 'Reporte'}
          </Text>
          <Text style={styles.rowSub}>{formatDate(item)}</Text>
        </View>
      </View>

      <Text style={styles.rowReward}>+{REWARD_PER_REPORT} Token</Text>
    </View>
  );

  const goDeals = () => navigation.navigate('Descuentos');

  return (
    <SafeAreaView style={styles.container}>
      {/* Encabezado */}
      <Text style={styles.header}>Mis recompensas</Text>

      {/* Resumen total */}
      <View style={styles.totalCard}>
        <View style={styles.totalIcon}>
          <MI name="military-tech" size={24} color={UI.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.totalLabel}>Total ganado</Text>
          <Text style={styles.totalAmount}>{totalReward} Token</Text>
        </View>
      </View>

      {/* Botón para ver descuentos */}
      <Pressable
        onPress={goDeals}
        style={({ pressed }) => [styles.ctaBtn, pressed && { opacity: 0.9 }]}
        hitSlop={6}
      >
        <Text style={styles.ctaText}>Ver descuentos disponibles</Text>
      </Pressable>

      {/* Lista o estado vacío */}
      {markers.length === 0 ? (
        <View style={styles.emptyBox}>
          <View style={styles.emptyIcon}>
            <MI name="star-border" size={28} color={UI.muted} />
          </View>
          <Text style={styles.emptyTitle}>Aún no has generado recompensas</Text>
          <Text style={styles.emptyText}>
            Reporta incidentes en tu zona para comenzar a ganar tokens.
          </Text>

          {/* CTA también en estado vacío */}
          <Pressable
            onPress={goDeals}
            style={({ pressed }) => [styles.ctaGhost, pressed && { opacity: 0.9 }]}
            hitSlop={6}
          >
            <Text style={styles.ctaGhostText}>Explorar descuentos</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={markers}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 24 }}
        />
      )}
    </SafeAreaView>
  );
};

export default RewardsScreen;

/* ----------------------------- styles ----------------------------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: UI.bg,
    paddingHorizontal: 16,
  },

  header: {
    fontSize: 22,
    fontWeight: '900',
    color: UI.text,
    marginTop: 8,
    marginBottom: 12,
  },

  totalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: UI.card,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: UI.border,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  totalIcon: {
    height: 44,
    width: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(10,197,197,0.12)',
    marginRight: 12,
  },
  totalLabel: { color: UI.muted, fontSize: 12, marginBottom: 2 },
  totalAmount: { color: UI.text, fontSize: 24, fontWeight: '900' },

  // CTA principal
  ctaBtn: {
    backgroundColor: UI.primary,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  ctaText: { color: '#fff', fontWeight: '900', letterSpacing: 0.2 },

  rowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: UI.card,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginVertical: 6,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: UI.border,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
    justifyContent: 'space-between',
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 12 },
  iconWrap: {
    height: 36,
    width: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(10,197,197,0.12)',
    marginRight: 10,
  },
  rowTitle: { fontSize: 16, fontWeight: '700', color: UI.text },
  rowSub: { fontSize: 12, color: UI.muted, marginTop: 2 },
  rowReward: { fontSize: 16, fontWeight: '900', color: UI.primary },

  emptyBox: {
    marginTop: 24,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  emptyIcon: {
    height: 60,
    width: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEF6F6',
    marginBottom: 10,
  },
  emptyTitle: { fontSize: 16, fontWeight: '800', color: UI.text, marginBottom: 4 },
  emptyText: { fontSize: 13, color: UI.muted, textAlign: 'center', marginBottom: 10 },

  // CTA secundario (ghost)
  ctaGhost: {
    marginTop: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: UI.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: UI.border,
  },
  ctaGhostText: {
    color: UI.text,
    fontWeight: '800',
  },
});
