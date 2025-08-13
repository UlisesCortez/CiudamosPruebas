import React, { useEffect, useState, useContext } from 'react';
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
import ProfileCircle from '../presentation/components/ui/ProfileCircle';
import { MarkersContext, Marker as ReportMarker } from '../context/MarkersContext';
import ButtonSheet from '../presentation/components/ui/ButtonSheet';
import IconMI from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../presentation/navigator/RootNavigator';

const UI = {
  bg: '#F4F7FC',
  card: '#FFFFFF',
  muted: '#6B7280',
  border: '#D7DDE5',
  primary: '#0AC5C5',
  text: '#0D1313',
};

const { width: SCREEN_W } = Dimensions.get('window');
const PANEL_HEIGHT = 800;

/** Estilo de mapa claro y legible */
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
   FAB RADIAL (sin etiquetas)
   ========================= */
const FabRadial = ({
  actions,
}: {
  actions: Array<{ key: string; icon: string; onPress: () => void }>;
}) => {
  const [open, setOpen] = React.useState(false);
  const anim = React.useRef(new Animated.Value(0)).current;

  const toggle = () => {
    setOpen(o => !o);
    Animated.spring(anim, {
      toValue: open ? 0 : 1,
      useNativeDriver: true,
      friction: 6,
      tension: 60,
    }).start();
  };

  // Distancia (cerca) y separación angular entre mini-burbujas
  const R = 56;          // distancia desde la burbuja principal (ajusta 52–60)
  const CENTER = -100;   // -90=arriba, -180=izquierda (mueve el abanico sin labels)
  const SPREAD = 100;    // apertura total: más grande = más separadas entre sí

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
              style={styles.smallFab}
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

      <Pressable style={styles.fabMain} onPress={toggle}>
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
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        region={region}
        customMapStyle={MAP_STYLE}
        mapPadding={{ top: 8, right: 8, bottom: 24, left: 8 }}
      >
        {/* Mi ubicación */}
        {region && (
          <Marker coordinate={region} anchor={{ x: 0.5, y: 0.5 }}>
            <View style={styles.meOuter}>
              <View style={styles.meInner} />
            </View>
          </Marker>
        )}

        {/* Marcadores del contexto */}
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

      {/* Perfil arriba-derecha */}
      <View style={styles.headerOverlay}>
        <ProfileCircle />
      </View>

      {/* Menú radial (burbuja) */}
      <FabRadial
        actions={[
          { key: 'center',  icon: 'my-location',      onPress: handleRecenter },
          { key: 'report',  icon: 'add-location-alt', onPress: () => navigation.navigate('Report') },
          { key: 'reports', icon: 'list-alt',         onPress: () => navigation.navigate('Reports') },
        ]}
      />

      {/* Panel detalle */}
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

  /** Perfil */
  headerOverlay: { position: 'absolute', top: 16, right: 16 },

  /** FAB y radial */
  fabArea: { position: 'absolute', right: 12, bottom: 150 },
  fabMain: {
    width: 60,
    height: 60,
    borderRadius: 28,
    backgroundColor: UI.primary,
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
    backgroundColor: UI.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // origen pegado a la principal
  fabItem: { position: 'absolute', right: 20, bottom: 52, alignItems: 'center' },

  /** Panel */
  handleBar: { width: 44, height: 4, borderRadius: 2, backgroundColor: UI.border, alignSelf: 'center', marginBottom: 8 },
  panelTitle: { fontSize: 20, fontWeight: '800', color: UI.text, marginBottom: 6 },
  panelDesc: { fontSize: 16, color: '#1f2937', marginBottom: 6 },
  panelTime: { fontSize: 12, color: UI.muted },
});
