// src/screens/AuthorityReportsScreen.tsx
import React, { useCallback, useEffect, useMemo, useRef, useState, useContext } from 'react';
import {
  View, Text, StyleSheet, Pressable, Image, Platform, FlatList,
  PermissionsAndroid, Dimensions, StatusBar, PanResponder, GestureResponderEvent, PanResponderGestureState
} from 'react-native';
import MapView, { Marker as RNMarker, Region } from 'react-native-maps';
import Geolocation from 'react-native-geolocation-service';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MI from 'react-native-vector-icons/MaterialIcons';
import { launchImageLibrary } from 'react-native-image-picker';
import { MarkersContext, Marker } from '../context/MarkersContext';
import { colors } from '../config/theme/theme';

const UI = {
  bg: '#F4F7FC',
  card: '#FFFFFF',
  text: colors?.text || '#0D1313',
  muted: '#6B7280',
  border: '#E5E7EB',
  primary: '#0AC5C5',
};

type UserAuth = {
  id: string;
  nombre: string;
  email: string;
  role: 'ciudadano' | 'autoridad';
  authorityAreas?: string[]; // tipos visibles (p.ej. ['Seguridad','Infraestructura'])
};

const { height: SCREEN_H, width: SCREEN_W } = Dimensions.get('screen');
const MIN_SHEET = Math.round(0.28 * SCREEN_H);
const MAX_SHEET = Math.round(0.75 * SCREEN_H);

const norm = (s: string = '') =>
  s.normalize('NFD').replace(/\p{Diacritic}/gu, '').trim().toLowerCase();

// Heurística por si aún no guardas urgency en el marker
function inferUrgency(m: Marker): 'ALTA' | 'MEDIA' | 'BAJA' {
  const u = (m as any)?.urgency as ('ALTA'|'MEDIA'|'BAJA'|undefined);
  if (u === 'ALTA' || u === 'MEDIA' || u === 'BAJA') return u;

  const text = `${m.title ?? ''} ${m.description ?? ''}`.toLowerCase();
  const alta = ['balacera','arma','incendio','fuego','herido','asalto','explosion','explosión','derrumbe'];
  const media = ['bache','fuga','luz','semaforo','semáforo','poste','accidente','inundacion','inundación','choque'];
  if (alta.some(w => text.includes(w))) return 'ALTA';
  if (media.some(w => text.includes(w))) return 'MEDIA';
  return 'BAJA';
}

export default function AuthorityReportsScreen() {
  const { markers, updateMarker } = useContext(MarkersContext);
  const mapRef = useRef<MapView | null>(null);

  const [areas, setAreas] = useState<string[]>([]);
  const [region, setRegion] = useState<Region | null>(null);
  const [myPos, setMyPos] = useState<{ lat: number; lon: number } | null>(null);
  const [selected, setSelected] = useState<Marker | null>(null);

  // filtro por urgencia
  const [urgencyFilter, setUrgencyFilter] =
    useState<'TODAS' | 'ALTA' | 'MEDIA' | 'BAJA'>('TODAS');

  // bottom sheet drag
  const [sheetH, setSheetH] = useState<number>(MIN_SHEET);
  const startH = useRef<number>(MIN_SHEET);
  const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => { startH.current = sheetH; },
      onPanResponderMove: (_e: GestureResponderEvent, g: PanResponderGestureState) => {
        const next = clamp(startH.current - g.dy, MIN_SHEET, MAX_SHEET);
        setSheetH(next);
      },
      onPanResponderRelease: (_e, g) => {
        const mid = (MIN_SHEET + MAX_SHEET) / 2;
        const projected = clamp(startH.current - g.dy + g.vy * 60, MIN_SHEET, MAX_SHEET);
        setSheetH(projected < mid ? MIN_SHEET : MAX_SHEET);
      },
    })
  ).current;

  // cargar usuario autoridad
  useEffect(() => {
    (async () => {
      const raw = await AsyncStorage.getItem('user');
      if (raw) {
        const u: UserAuth = JSON.parse(raw);
        setAreas(u?.role === 'autoridad' ? (u.authorityAreas || []) : []);
      }
    })();
  }, []);

  // ubicación inicial
  useEffect(() => {
    (async () => {
      if (Platform.OS === 'android') {
        await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
        ]);
      }
      Geolocation.getCurrentPosition(
        pos => {
          const { latitude, longitude } = pos.coords;
          setMyPos({ lat: latitude, lon: longitude });
          setRegion({
            latitude,
            longitude,
            latitudeDelta: 0.04,
            longitudeDelta: 0.04,
          });
        },
        _err => {
          setRegion({
            latitude: 23.6345,
            longitude: -102.5528,
            latitudeDelta: 15,
            longitudeDelta: 15,
          });
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
      );
    })();
  }, []);

  // filtrar por tipo/categoría (usa title existente)
  const areasNorm = useMemo(() => areas.map(norm), [areas]);

  const myReportsBase = useMemo(() => {
    if (!areasNorm.length) return [];
    return markers
      .filter(m => m.title && areasNorm.includes(norm(m.title)))
      .sort((a, b) => (b.timestamp || '').localeCompare(a.timestamp || ''));
  }, [markers, areasNorm]);

  // aplicar filtro de urgencia
  const myReports = useMemo(() => {
    if (urgencyFilter === 'TODAS') return myReportsBase;
    return myReportsBase.filter(m => inferUrgency(m) === urgencyFilter);
  }, [myReportsBase, urgencyFilter]);

  const handleRecenter = useCallback(() => {
    if (!mapRef.current || !myPos) return;
    mapRef.current.animateToRegion({
      latitude: myPos.lat,
      longitude: myPos.lon,
      latitudeDelta: 0.04,
      longitudeDelta: 0.04,
    }, 300);
  }, [myPos]);

  // marcar VISTO al abrir detalle
// ✅ Marca VISTO una sola vez cuando cambie el reporte seleccionado
useEffect(() => {
  if (!selected?.id) return;

  // si ya no está NUEVO, no hagas nada
  if (selected.status && selected.status !== 'NUEVO') return;

  // actualiza en store
  updateMarker(selected.id, { status: 'VISTO' });

  // optimista: actualiza el seleccionado local para evitar re-disparos
  setSelected(s => (s ? { ...s, status: 'VISTO' } : s));

// 👇 OJO: Dependemos SOLO del id seleccionado para que no se re-ejecute por cambios en updateMarker
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [selected?.id]);

  // acciones autoridad
  const setEnProceso = useCallback(() => {
    if (!selected) return;
    if (selected.status === 'FINALIZADO') return;
    updateMarker(selected.id, { status: 'EN_PROCESO' });
    setSelected(prev => (prev ? { ...prev, status: 'EN_PROCESO' } : prev));
  }, [selected, updateMarker]);

  const finalizarConEvidencia = useCallback(async () => {
    if (!selected) return;
    if (selected.status === 'FINALIZADO') return;
    const pick = await launchImageLibrary({ mediaType: 'photo', quality: 0.8, selectionLimit: 1 });
    const asset = pick?.assets?.[0];
    if (!asset?.uri) return;
    updateMarker(selected.id, { status: 'FINALIZADO', evidenceUri: asset.uri });
    setSelected(prev => (prev ? { ...prev, status: 'FINALIZADO', evidenceUri: asset.uri } : prev));
  }, [selected, updateMarker]);

  const renderMarker = (m: Marker) => (
    <RNMarker
      key={m.id}
      coordinate={{ latitude: m.latitude, longitude: m.longitude }}
      onPress={() => setSelected(m)}
    >
      <View style={styles.pin}>
        <View style={[styles.pinHead, { backgroundColor: m.color || UI.primary }]} />
        <View style={[styles.pinTip, { borderTopColor: m.color || UI.primary }]} />
      </View>
    </RNMarker>
  );

  const StatusPill = ({ status }: { status?: Marker['status'] }) => {
    const s = status || 'NUEVO';
    const color =
      s === 'FINALIZADO' ? '#10B981' :
      s === 'EN_PROCESO' ? '#F59E0B' :
      s === 'VISTO' ? '#3B82F6' : '#9CA3AF';
    return (
      <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, backgroundColor: color + '22' }}>
        <Text style={{ color, fontWeight: '700' }}>{s}</Text>
      </View>
    );
  };

  const ListItem = ({ item }: { item: Marker }) => (
    <Pressable style={styles.item} onPress={() => setSelected(item)}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        {item.photoUri ? (
          <Image source={{ uri: item.photoUri }} style={styles.thumb} />
        ) : (
          <View style={[styles.thumb, styles.thumbEmpty]}>
            <MI name="image-not-supported" size={20} color={UI.muted} />
          </View>
        )}
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{item.title || 'Incidente'}</Text>
          <Text style={styles.meta}>
            {new Date(item.timestamp || Date.now()).toLocaleString()}
          </Text>
          <Text numberOfLines={2} style={styles.desc}>{item.description || 'Sin descripción'}</Text>
        </View>
        <StatusPill status={item.status} />
      </View>
    </Pressable>
  );

  // etiqueta legible del filtro activo
  const labelUrg = urgencyFilter === 'TODAS'
    ? 'Todas'
    : urgencyFilter[0] + urgencyFilter.slice(1).toLowerCase();

  return (
    <View style={styles.root}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

      {/* MAPA full */}
      {region && (
        <MapView
          ref={(ref) => { mapRef.current = ref; }}
          style={StyleSheet.absoluteFillObject}
          initialRegion={region}
          showsCompass={false}
          toolbarEnabled={false}
          loadingEnabled
          loadingIndicatorColor={UI.primary}
        >
          {myPos && (
            <RNMarker coordinate={{ latitude: myPos.lat, longitude: myPos.lon }}>
              <View style={styles.meDotOuter}>
                <View style={styles.meDotInner} />
              </View>
            </RNMarker>
          )}
          {myReports.map(renderMarker)}
        </MapView>
      )}

      {/* TOP OVERLAYS (para que no se vea vacío) */}
      <View style={styles.topRow}>
        <View style={styles.glassPill}>
          <MI name="assignment" size={16} color={UI.text} />
          <Text style={styles.glassTxt}>{myReportsBase.length} asignados</Text>
        </View>
        <View style={styles.glassPill}>
          <MI name="filter-list" size={16} color={UI.text} />
          <Text style={styles.glassTxt}>Urgencia: {labelUrg}</Text>
        </View>
      </View>

      {/* FAB recentrar */}
      <Pressable style={styles.fab} onPress={handleRecenter}>
        <MI name="my-location" size={22} color="#FFF" />
      </Pressable>

      {/* BOTTOM SHEET */}
      <View style={[styles.bottomSheet, { height: sheetH }]}>
        <View style={styles.dragHandle} {...panResponder.panHandlers}>
          <View style={styles.dragBar} />
        </View>

        <View style={styles.bsHeader}>
          <Text style={styles.bsTitle}>Reportes</Text>
          <Text style={styles.bsCount}>{myReports.length}</Text>
        </View>

        <FlatList
          data={myReports}
          keyExtractor={(x) => x.id}
          renderItem={ListItem}
          ListHeaderComponent={
            <View style={styles.chipsRow}>
              {(['TODAS','ALTA','MEDIA','BAJA'] as const).map(v => (
                <Pressable
                  key={v}
                  onPress={() => setUrgencyFilter(v)}
                  style={[
                    styles.chip,
                    urgencyFilter === v ? styles.chipActive : null,
                  ]}
                >
                  <Text style={[
                    styles.chipTxt,
                    urgencyFilter === v ? styles.chipTxtActive : null,
                  ]}>
                    {v === 'TODAS' ? 'Todas' : v[0] + v.slice(1).toLowerCase()}
                  </Text>
                </Pressable>
              ))}
            </View>
          }
          contentContainerStyle={{ paddingBottom: 16 }}
          ListEmptyComponent={<Text style={styles.empty}>No hay reportes para este filtro.</Text>}
          showsVerticalScrollIndicator
        />
      </View>

      {/* PANEL DETALLE */}
      {selected && (
        <View style={[styles.detailSheet, { bottom: sheetH + 12 }]}>
          <View style={styles.detailHeader}>
            <Text style={styles.detailTitle}>{selected.title || 'Incidente'}</Text>
            <Pressable onPress={() => setSelected(null)} hitSlop={8}>
              <MI name="close" size={22} color={UI.muted} />
            </Pressable>
          </View>
          <Text style={styles.detailMeta}>
            {new Date(selected.timestamp || Date.now()).toLocaleString()}
          </Text>
          {selected.photoUri ? (
            <Image source={{ uri: selected.photoUri }} style={styles.detailImg} />
          ) : (
            <View style={[styles.detailImg, styles.thumbEmpty]}>
              <MI name="image-not-supported" size={28} color={UI.muted} />
            </View>
          )}
          {selected.description && (
            <>
              <Text style={styles.label}>Descripción</Text>
              <Text style={styles.detailDesc}>{selected.description}</Text>
            </>
          )}
          {(selected as any)?.evidenceUri && (
            <>
              <Text style={styles.label}>Evidencia</Text>
              <Image source={{ uri: (selected as any).evidenceUri }} style={[styles.detailImg, { borderColor: '#10B981' }]} />
            </>
          )}
          <View style={styles.detailStatusRow}>
            <Text style={styles.label}>Estado</Text>
            <StatusPill status={selected.status} />
          </View>
          <View style={styles.actionsRow}>
            <Pressable
              onPress={setEnProceso}
              disabled={selected.status === 'FINALIZADO'}
              style={[styles.btn, { backgroundColor: '#F59E0B' + (selected.status === 'FINALIZADO' ? '66' : '') }]}
            >
              <Text style={styles.btnTxt}>En proceso</Text>
            </Pressable>
            <Pressable
              onPress={finalizarConEvidencia}
              disabled={selected.status === 'FINALIZADO'}
              style={[styles.btn, { backgroundColor: '#10B981' + (selected.status === 'FINALIZADO' ? '66' : '') }]}
            >
              <Text style={styles.btnTxt}>Finalizar (+foto)</Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: 'transparent' },

  // --- Top glass pills (para que no se vea vacío) ---
  topRow: {
    position: 'absolute',
    top: (StatusBar.currentHeight || 10) + 10,
    left: 12,
    right: 12,
    flexDirection: 'row',
    gap: 8,
  },
  glassPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderWidth: 1,
    borderColor: UI.border,
  },
  glassTxt: { color: UI.text, fontWeight: '700' },

  // Pin
  pin: { alignItems: 'center' },
  pinHead: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: '#FFF' },
  pinTip: { width: 0, height: 0, borderLeftWidth: 6, borderRightWidth: 6, borderTopWidth: 9, borderLeftColor: 'transparent', borderRightColor: 'transparent' },

  // my location
  meDotOuter: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: UI.primary },
  meDotInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: UI.primary },

  // FAB
  fab: { position: 'absolute', right: 16, bottom: 180, width: 48, height: 48, borderRadius: 24, backgroundColor: UI.primary, alignItems: 'center', justifyContent: 'center', elevation: 4 },

  // Bottom sheet
  bottomSheet: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    backgroundColor: UI.card, borderTopLeftRadius: 16, borderTopRightRadius: 16,
    borderTopWidth: 1, borderColor: UI.border,
    paddingHorizontal: 12, paddingTop: 6, paddingBottom: 8,
  },
  dragHandle: { alignItems: 'center', paddingVertical: 6 },
  dragBar: { width: 46, height: 5, borderRadius: 5, backgroundColor: '#D1D5DB' },

  bsHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 4, marginBottom: 8 },
  bsTitle: { fontSize: 14, fontWeight: '700', color: UI.text },
  bsCount: { fontSize: 12, color: UI.muted },

  // Chips
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 4, marginBottom: 8 },
  chip: {
    paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: 999, borderWidth: 1, borderColor: UI.border,
    backgroundColor: '#F3F4F6',
  },
  chipActive: {
    backgroundColor: UI.primary, borderColor: UI.primary,
    shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 }, elevation: 3,
  },
  chipTxt: { fontWeight: '700', color: UI.text },
  chipTxtActive: { color: '#fff' },

  // List item
  item: { backgroundColor: UI.card, padding: 10, borderRadius: 12, borderWidth: 1, borderColor: UI.border, marginVertical: 6 },
  thumb: { width: 52, height: 52, borderRadius: 8 },
  thumbEmpty: { backgroundColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 15, fontWeight: '700', color: UI.text },
  meta: { fontSize: 12, color: UI.muted, marginTop: 2 },
  desc: { fontSize: 13, color: UI.text, marginTop: 4 },
  empty: { textAlign: 'center', color: UI.muted, marginTop: 10 },

  // Detail sheet
  detailSheet: {
    position: 'absolute', left: 12, right: 12,
    backgroundColor: UI.card, borderRadius: 16,
    padding: 12, borderWidth: 1, borderColor: UI.border,
  },
  detailHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  detailTitle: { fontSize: 16, fontWeight: '800', color: UI.text },
  detailMeta: { fontSize: 12, color: UI.muted, marginTop: 4, marginBottom: 8 },
  detailImg: { width: '100%', height: 180, borderRadius: 12, borderWidth: 1, borderColor: UI.border, marginTop: 6, backgroundColor: '#F3F4F6' },
  label: { fontSize: 12, color: UI.muted, marginTop: 10, marginBottom: 4 },
  detailDesc: { fontSize: 14, color: UI.text },

  detailStatusRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 },
  actionsRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
  btn: { flex: 1, height: 44, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  btnTxt: { color: '#FFF', fontWeight: '700' },
});
