// src/screens/RewardsScreen.tsx

import React, { useContext, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
} from 'react-native';
import { MarkersContext, Marker } from '../context/MarkersContext';
import { colors } from '../config/theme/theme';

const REWARD_PER_REPORT = 5; // $5 por reporte

const RewardsScreen: React.FC = () => {
  const { markers } = useContext(MarkersContext);

  // Calcula total
  const totalReward = useMemo(
    () => markers.length * REWARD_PER_REPORT,
    [markers.length]
  );

  // Formatea fecha desde el id (timestamp)
  const formatDate = (ts: string) =>
    new Date(parseInt(ts, 10)).toLocaleDateString('es-MX', {
      day:   '2-digit',
      month: '2-digit',
      year:  'numeric',
    });

  const renderItem = ({ item }: { item: Marker }) => (
    <View style={styles.card}>
      <View style={styles.cardLeft}>
        <Text style={styles.cardType}>{item.title}</Text>
        <Text style={styles.cardDate}>{formatDate(item.id)}</Text>
      </View>
      <Text style={styles.cardReward}>+Token {REWARD_PER_REPORT}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Mis Recompensas</Text>

      <View style={styles.totalContainer}>
        <Text style={styles.totalLabel}>Total ganado</Text>
        <Text style={styles.totalAmount}>{totalReward} Token </Text>
      </View>

      {markers.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            Aún no has generado recompensas.
          </Text>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.cardBackground,
    paddingHorizontal: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginVertical: 16,
  },
  totalContainer: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 6,
  },
  totalAmount: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
  },
  card: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderRadius: 10,
    marginVertical: 6,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
  },
  cardLeft: {
    flex: 1,
  },
  cardType: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  cardDate: {
    fontSize: 12,
    color: '#666',
  },
  cardReward: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
  },
});
