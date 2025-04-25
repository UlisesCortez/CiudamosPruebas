// src/screens/ListaReportesScreen.tsx

import React, { useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ListRenderItem
} from 'react-native';
import { MarkersContext, Marker as ReportMarker } from '../context/MarkersContext';

const ListaReportesScreen: React.FC = () => {
  const { markers } = useContext(MarkersContext);

  const renderItem: ListRenderItem<ReportMarker> = ({ item }) => (
    <View style={styles.row}>
      <Text style={styles.cell}>{item.title}</Text>
      <Text style={styles.cell}>
        {item.latitude.toFixed(5)}, {item.longitude.toFixed(5)}
      </Text>
      <Text style={styles.cell}>
        {new Date(item.timestamp).toLocaleString()}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reportes Generados</Text>
      <View style={[styles.row, styles.headerRow]}>
        <Text style={[styles.cell, styles.headerCell]}>Tipo</Text>
        <Text style={[styles.cell, styles.headerCell]}>Ubicación</Text>
        <Text style={[styles.cell, styles.headerCell]}>Hora</Text>
      </View>
      <FlatList
        data={markers}
        keyExtractor={i => i.id}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No hay reportes aún</Text>
        }
      />
    </View>
  );
};

export default ListaReportesScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title:     { fontSize: 18, fontWeight: '600', marginBottom: 12 },
  row:       { flexDirection: 'row', paddingVertical: 8, borderBottomWidth: 1, borderColor: '#ccc' },
  headerRow: { borderBottomWidth: 2 },
  cell:      { flex: 1, fontSize: 14 },
  headerCell:{ fontWeight: '700' },
  emptyText: { textAlign: 'center', marginTop: 20, color: 'gray' },
});
