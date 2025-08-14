import React, { useEffect, useState, useContext, useRef } from 'react';
import {
  StyleSheet,
  View,
  ActivityIndicator,
  PermissionsAndroid,
  Platform,
  Text,
  Image,
  ScrollView,
  Dimensions,
  Pressable,
  Animated,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import Geolocation from 'react-native-geolocation-service';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MarkersContext, Marker as ReportMarker } from '../context/MarkersContext';
import ButtonSheet from '../presentation/components/ui/ButtonSheet';
import RecentReportsSheet from '../presentation/components/ui/RecentReportsSheet';
import TopBar, { APPBAR_HEIGHT } from '../presentation/components/ui/TopBar';

import IconMI from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../presentation/navigator/RootNavigator';

const { width: SCREEN_W } = Dimensions.get('window');
const PANEL_HEIGHT = 800;

const UI = {
  bg: '#F4F7FC',
  card: '#FFFFFF',
  muted: '#6B7280',
  border: '#D7DDE5',
  primary: '#0AC5C5',
  text: '#0D1313',
};

const MAP_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#E7E9ED' }] },
  { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#1F2937' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#FFFFFF' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#D1E2EA' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#BFC7D2' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#FFFFFF' }] },
  { featureType: 'road.local', elementType: 'labels.text.fill', stylers: [{ color: '#334155' }] },
];

/* =========================
   FAB RADIAL (compacto)
   ========================= */
const FabRadial = ({
  actions,
  tint = UI.primary,
}: {
  actions: Array<{ key: string; icon: string; onPress: () => void }>;
  tint?: string;
}) => {
  const [open, setOpen] = React.useState(false);
  const anim = useRef(new Animated.Value(0)).current;

  const toggle = () => {
    setOpen(o => !o);
    Animated.spring(anim, {
      toValue: open ? 0 : 1,
      useNativeDriver: true,
      friction: 6,
      tension: 60,
    }).start();
  };

  // abanico hacia arriba-izquierda
  const R = 56;
  const CENTER = -100;
  const SPREAD = 100;

  const angles =
    actions.length === 1
      ? [CENTER]
      : actions.map((_, i) => CENTER - SPREAD / 1 + (SPREAD / (actions.length - 1.5)) * i);

  return (
    <View pointerEvents="box-none" style={styles.fabArea}>
      {open && <Pressable style={StyleSheet.absoluteFill} onPress={toggle} />}
      {actions.map((a, i) => {
        const theta = (angles[i] * Math.PI) / 180;
        const tx = anim.interpolate({ inputRange: [0, 1], outputRange: [0, R * Math.cos(theta)] });
        const ty = anim.interpolate({ inputRange: [0, 1], outputRange: [0, R * Math.sin(theta)] });
        const scale = anim.interpolate({ inputRange: [0, 1], outputRange: [0.88, 1] });
        return (
          <Animated.View
            key={a.key}
            style={[
              styles.fabItem,
              { transform: [{ translateX: tx }, { translateY: ty }, { scale }], opacity: anim },
            ]}
          >
            <Pressable
              style={[styles.smallFab, { backgroundColor: tint }]}
              onPress={() => {
                toggle();
                a.onPress();
              }}
            >
              <IconMI name={a.icon as any} size={20} color="#fff" />
            </Pressable>
          </Animated.View>
        );
      })}
      <Pressable style={[styles.fabMain, { backgroundColor: tint }]} onPress={toggle}>
        <Animated.View
          style={{
            transform: [{ rotate: anim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '45deg'] }) }],
          }}
        >
          <IconMI name="add" size={28} color="#fff" />
        </Animated.View>
      </Pressable>
    </View>
  );
};

const WelcomeScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();

  const [region, setRegion] = useState<Region | null>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ReportMarker | null>(null);
  const { markers } = useContext(MarkersContext);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const requestLocationPermission = async () => {
      try {
        if (Platform.OS === 'android') {
          const granted = await PermissionsAndroid.requestMultiple([
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
          ]);
          const fine =
            granted[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION] ===
            PermissionsAndroid.RESULTS.GRANTED;
          const coarse =
            granted[PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION] ===
            PermissionsAndroid.RESULTS.GRANTED;
          if (!fine && !coarse) {
            console.warn('Permisos de ubicación no concedidos');
            setLoading(false);
            return;
          }
        }

        Geolocation.getCurrentPosition(
          ({ coords }) => {
            setRegion({
              latitude: coords.latitude,
              longitude: coords.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            });
            setLoading(false);
          },
          (error) => {
            console.error('Error al obtener ubicación:', error);
            setLoading(false);
          },
          { enableHighAccuracy: true, timeout: 20000 }
        );

        const watchId = Geolocation.watchPosition(
          ({ coords }) => {
            setRegion(prev =>
              prev ? { ...prev, latitude: coords.latitude, longitude: coords.longitude } : null
            );
          },
          (error) => console.error('Error de ubicación continua:', error),
          { enableHighAccuracy: false, distanceFilter: 10, interval: 5000 }
        );

        return () => Geolocation.clearWatch(watchId);
      } catch (err) {
        console.error('Error pidiendo permisos de ubicación:', err);
        setLoading(false);
      }
    };

    requestLocationPermission();
  }, []);

  useEffect(() => {
    if (selected?.photoUri) {
      Image.getSize(
        selected.photoUri,
        (width, height) => {
          const w = SCREEN_W - 32;
          const h = (height / width) * w;
          setImageSize({ width: w, height: h });
        },
        () => {}
      );
    }
  }, [selected]);

  const handleRecenter = () => {
    Geolocation.getCurrentPosition(
      ({ coords }) => {
        setRegion(prev =>
          prev
            ? { ...prev, latitude: coords.latitude, longitude: coords.longitude }
            : {
                latitude: coords.latitude,
                longitude: coords.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }
        );
      },
      () => {},
      { enableHighAccuracy: true, timeout: 12000 }
    );
  };

  if (!region || loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={UI.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* TopBar compacto */}
      <View style={styles.topOverlay}>
        <TopBar
          title="Ciudamos"
          onProfilePress={() => navigation.navigate('Profile')}
          onSearchPress={() => navigation.navigate('Reports')}
          onBellPress={() => navigation.navigate('Reports')}
        />
      </View>

      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        region={region}
        customMapStyle={MAP_STYLE}
        mapPadding={{
          top: insets.top + APPBAR_HEIGHT + 6,    // espacio exacto para el app bar
          right: 8,
          bottom: 200,                             // deja ver la sheet levantada
          left: 8,
        }}
      >
        {/* Mi ubicación */}
        {region && (
          <Marker coordinate={region} anchor={{ x: 0.5, y: 0.5 }}>
            <View style={styles.meOuter}>
              <View style={styles.meInner} />
            </View>
          </Marker>
        )}

        {/* Marcadores */}
        {markers.map(m => (
          <Marker
            key={m.id}
            coordinate={{ latitude: m.latitude, longitude: m.longitude }}
            anchor={{ x: 0.5, y: 1 }}
            onPress={() => setSelected(m)}
          >
            <View style={styles.pinWrap}>
              <View style={[styles.pinHead, { backgroundColor: m.color || UI.primary }]} />
              <View style={[styles.pinStem, { borderTopColor: m.color || UI.primary }]} />
            </View>
          </Marker>
        ))}
      </MapView>

      {/* FAB radial */}
      <FabRadial
        tint={UI.primary}
        actions={[
          { key: 'center',  icon: 'my-location',      onPress: handleRecenter },
          { key: 'report',  icon: 'add-location-alt', onPress: () => navigation.navigate('Report') },
          { key: 'reports', icon: 'list-alt',         onPress: () => navigation.navigate('Reports') },
        ]}
      />

      {/* Sheet de reportes recientes (colapsada más alta) */}
      <RecentReportsSheet
        collapsedPx={170}
        onPressItem={(m) => setSelected(m)}
      />

      {/* Panel detalle de un reporte */}
      {selected && (
        <ButtonSheet onClose={() => setSelected(null)} initialHeight={PANEL_HEIGHT}>
          <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
            <View style={styles.handleBar} />
            <Text style={styles.panelTitle}>{selected.title}</Text>
            <Text style={styles.panelDesc}>{selected.description}</Text>
            <Text style={styles.panelTime}>{new Date(selected.timestamp).toLocaleString()}</Text>

            {selected.photoUri && (
              <Image
                source={{ uri: selected.photoUri }}
                style={{
                  width: imageSize.width,
                  height: imageSize.height,
                  borderRadius: 16,
                  marginTop: 12,
                  alignSelf: 'center',
                  backgroundColor: '#eaeaea',
                }}
                resizeMode="contain"
              />
            )}
          </ScrollView>
        </ButtonSheet>
      )}
    </View>
  );
};

export default WelcomeScreen;

/* =========================
   Styles
   ========================= */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: UI.bg },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: UI.bg },
  map: { flex: 1 },

  topOverlay: { position: 'absolute', left: 0, right: 0, top: 0, zIndex: 10 },

  /** Punto de usuario */
  meOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: UI.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  meInner: { width: 8, height: 8, borderRadius: 4, backgroundColor: UI.primary },

  /** Pin de reporte */
  pinWrap: { alignItems: 'center' },
  pinHead: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  pinStem: {
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: -1,
  },

  /** FAB y radial */
  fabArea: { position: 'absolute', right: 12, bottom: 295 }, // evita chocar con la sheet
  fabMain: {
    width: 60,
    height: 60,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: UI.primary,
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  smallFab: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabItem: { position: 'absolute', right: 20, bottom: 52, alignItems: 'center' },

  /** Panel detalle */
  handleBar: { width: 44, height: 4, borderRadius: 2, backgroundColor: UI.border, alignSelf: 'center', marginBottom: 8 },
  panelTitle: { fontSize: 20, fontWeight: '800', color: UI.text, marginBottom: 6 },
  panelDesc: { fontSize: 16, color: '#1f2937', marginBottom: 6 },
  panelTime: { fontSize: 12, color: UI.muted },
});
