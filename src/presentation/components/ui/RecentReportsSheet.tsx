// src/presentation/components/ui/RecentReportsSheet.tsx
import React, { useMemo, useRef, useContext } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import BottomSheet, { BottomSheetFlatList } from '@gorhom/bottom-sheet';
import MI from 'react-native-vector-icons/MaterialIcons';
import { MarkersContext, Marker as ReportMarker } from '../../../context/MarkersContext';
import { useTheme } from '../../../theme/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const TAB_BAR_HEIGHT = 64;

const toMs = (t: unknown) => {
  if (typeof t === 'number') return t;
  const n = Date.parse(String(t));
  if (!Number.isNaN(n)) return n;
  const m = Number(t);
  return Number.isNaN(m) ? 0 : m;
};

const RecentReportsSheet: React.FC<{
  onPressItem: (m: ReportMarker) => void;
  collapsedPx?: number;
}> = ({ onPressItem, collapsedPx = 150 }) => {         // ⬅️ subimos el default
  const { markers } = useContext(MarkersContext);
  const { colors, typography } = useTheme();
  const sheetRef = useRef<BottomSheet>(null);
  const insets = useSafeAreaInsets();

  const snapPoints = useMemo(() => [collapsedPx, '50%', '88%'] as const, [collapsedPx]);

  const data = useMemo(
    () => [...markers].sort((a, b) => toMs(b.timestamp) - toMs(a.timestamp)).slice(0, 50),
    [markers]
  );

  const timeAgo = (ms: number) => {
    const s = Math.max(1, Math.floor((Date.now() - ms) / 1000));
    if (s < 60) return `${s}s`;
    const m = Math.floor(s / 60);
    if (m < 60) return `${m}m`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h`;
    const d = Math.floor(h / 24);
    return `${d}d`;
  };

  return (
    <BottomSheet
      ref={sheetRef}
      snapPoints={snapPoints as unknown as (string | number)[]}
      index={1} // ⬅️ arranca en medio
      enablePanDownToClose={false}
      bottomInset={insets.bottom + TAB_BAR_HEIGHT + 12} // ⬅️ despega de la tab bar
      handleIndicatorStyle={{ backgroundColor: colors.border, width: 44, height: 4 }}
      backgroundStyle={{ backgroundColor: colors.surface, borderRadius: 16 }}
    >
      <View style={styles.header}>
        <Text style={[typography.h2, { color: colors.text }]}>Reportes recientes</Text>
        <MI name="history" size={18} color={colors.muted} />
      </View>

      <BottomSheetFlatList
        data={data}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ paddingBottom: 24 }}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => {
              onPressItem(item);
              sheetRef.current?.snapToIndex(0);
            }}
            style={({ pressed }) => [
              styles.row,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                opacity: pressed ? 0.96 : 1,
              },
            ]}
          >
            <View style={[styles.dot, { backgroundColor: item.color || colors.primary }]} />
            <View style={{ flex: 1 }}>
              <Text numberOfLines={1} style={{ fontSize: 14, fontWeight: '700', color: colors.text }}>
                {item.title || 'Reporte'}
              </Text>
              <Text numberOfLines={2} style={{ fontSize: 12, color: colors.muted }}>
                {item.description || '—'}
              </Text>
            </View>
            <Text style={{ fontSize: 12, color: colors.muted, marginRight: 4 }}>
              {timeAgo(toMs(item.timestamp))}
            </Text>
            <MI name="chevron-right" size={20} color={colors.muted} />
          </Pressable>
        )}
      />
    </BottomSheet>
  );
};

export default RecentReportsSheet;

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  row: {
    marginHorizontal: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: 2 },
});
