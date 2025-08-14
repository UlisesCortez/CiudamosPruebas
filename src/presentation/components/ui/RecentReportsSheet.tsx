// src/presentation/components/ui/RecentReportsSheet.tsx
import React, { useMemo, useRef, useCallback, useContext } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import BottomSheet, { BottomSheetFlatList } from '@gorhom/bottom-sheet';
import MI from 'react-native-vector-icons/MaterialIcons';

import { MarkersContext, Marker as ReportMarker } from '../../../context/MarkersContext';
// @ts-ignore — tolerante si no existe el tema
import { useTheme } from '../../../theme/theme';

type Props = {
  onPressItem: (m: ReportMarker) => void;
  /** Altura colapsada inicial de la sheet (px) */
  collapsedPx?: number;
  /** Espacio extra inferior (safe area + tab bar) para evitar solaparse */
  bottomInset?: number;
  /** Índice inicial (0 / 1 / 2) */
  startIndex?: 0 | 1 | 2;

  /** Notifica cambios de índice para animar/ocultar FAB, etc. */
  onIndexChange?: (index: number) => void;
  /** Permite sobreescribir los puntos de anclaje; por defecto: [collapsed, '50%', '85%'] */
  snapPoints?: Array<number | string>;
};

const RecentReportsSheet: React.FC<Props> = ({
  onPressItem,
  collapsedPx = 96,
  bottomInset = 0,
  startIndex = 0,
  onIndexChange,
  snapPoints,
}) => {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const { markers } = useContext(MarkersContext);

  // Theme tolerante
  let theme: any = undefined;
  try { theme = useTheme?.(); } catch { /* noop */ }
  const colors = {
    text: theme?.colors?.text ?? '#111827',
    muted: theme?.colors?.muted ?? '#6b7280',
    border: theme?.colors?.border ?? '#e5e7eb',
    surface: theme?.colors?.surface ?? '#ffffff',
  };

  // Puntos de anclaje (por defecto: colapsado, 50% y 85%)
  const defaultSnapPoints = useMemo<Array<number | string>>(() => {
    const min = Math.max(64, collapsedPx);
    return [min, '50%', '85%'];
  }, [collapsedPx]);

  const renderItem = useCallback(
    ({ item }: { item: ReportMarker }) => {
      const cat =
        (item as any)?.category ??
        (item as any)?.tipo ??
        (item as any)?.type ??
        '—';

      const rawDate =
        (item as any)?.date ??
        (item as any)?.fecha ??
        (item as any)?.createdAt ??
        (item as any)?.timestamp;

      let whenText = '';
      if (rawDate) {
        const d = new Date(rawDate);
        whenText = Number.isNaN(d.getTime()) ? String(rawDate) : d.toLocaleString();
      }

      const subtitle = whenText ? `${cat} · ${whenText}` : String(cat);

      return (
        <Pressable
          onPress={() => onPressItem(item)}
          style={[styles.item, { borderColor: colors.border }]}
        >
          <View style={styles.itemLeft}>
            <MI name="place" size={20} />
          </View>

          <View style={styles.itemBody}>
            <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
              {(item as any)?.title ?? 'Reporte'}
            </Text>
            <Text style={[styles.subtitle, { color: colors.muted }]} numberOfLines={1}>
              {subtitle}
            </Text>
          </View>

          <MI name="chevron-right" size={20} />
        </Pressable>
      );
    },
    [onPressItem, colors.border, colors.text, colors.muted]
  );

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={startIndex}
      snapPoints={snapPoints ?? defaultSnapPoints}
      detached
      style={[
        styles.sheet,
        { marginBottom: bottomInset },
      ]}
      backgroundStyle={{ backgroundColor: colors.surface }}
      handleIndicatorStyle={{ backgroundColor: colors.border }}
      enablePanDownToClose={false}
      // 👇 Muy importante para animar/ocultar el FAB desde Welcome
      onChange={(idx) => onIndexChange?.(idx)}
    >
      <BottomSheetFlatList
        data={markers}
        keyExtractor={(m, i) => String((m as any)?.id ?? (m as any)?.IdReporte ?? i)}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 16 }}
      />
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  sheet: {
    marginHorizontal: 1,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  itemLeft: {
    width: 28,
    alignItems: 'center',
  },
  itemBody: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
});

export default RecentReportsSheet;
