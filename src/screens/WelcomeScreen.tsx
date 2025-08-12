import React, { useEffect, useState, useContext, useRef } from 'react';
import {
  StyleSheet,
  View,
  ActivityIndicator,
  PermissionsAndroid,
  Platform,
  TouchableOpacity,
  Text,
  Image,
  ScrollView,
  Dimensions,
  Pressable,
  Animated,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import ProfileCircle from '../presentation/components/ui/ProfileCircle';
import { MarkersContext, Marker as ReportMarker } from '../context/MarkersContext';
import ButtonSheet from '../presentation/components/ui/ButtonSheet';
import IconMI from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';

const UI = {
  bg: '#F4F7FC',
  card: '#FFFFFF',
  muted: '#6B7280',
  border: '#D7DDE5',
  primary: '#0AC5C5',
  text: '#0D1313',
};

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const PANEL_HEIGHT = 800;

/** Estilo de mapa: menos brillo, más contraste suave (desaturado) */
const MAP_STYLE = [
  { elementType: "geometry", stylers: [{ color: "#E7E9ED" }] },
  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#1F2937" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#FFFFFF" }] },

  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },

  { featureType: "water", elementType: "geometry", stylers: [{ color: "#D1E2EA" }] },

  { featureType: "road", elementType: "geometry", stylers: [{ color: "#BFC7D2" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#FFFFFF" }] },
  { featureType: "road.local", elementType: "labels.text.fill", stylers: [{ color: "#334155" }] },
];


const WelcomeScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [region, setRegion] = useState<Region | null>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ReportMarker | null>(null);
  const { markers } = useContext(MarkersContext);

  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });

  // FAB (bolita de opciones)
  const [fabOpen, setFabOpen] = useState(false);
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const requestLocationPermission = async () => {
      try {
        if (Platform.OS === 'android') {
          const granted = await PermissionsAndroid.requestMultiple([
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
          ]);

          const fine = granted[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION] === PermissionsAndroid.RESULTS.GRANTED;
          const coarse = granted[PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION] === PermissionsAndroid.RESULTS.GRANTED;
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
            setRegion((prev) =>
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

  // Tamaño de la imagen del reporte seleccionado
  useEffect(() => {
    if (selected?.photoUri) {
      Image.getSize(
        selected.photoUri,
        (width, height) => {
          const screenWidth = SCREEN_W - 32;
          const scaleFactor = width / screenWidth;
          const imageHeight = height / scaleFactor;
          setImageSize({ width: screenWidth, height: imageHeight });
        },
        (error) => console.warn('No se pudo obtener el tamaño de la imagen:', error)
      );
    }
  }, [selected]);

  const handleRecenter = () => {
    Geolocation.getCurrentPosition(
      ({ coords }) => {
        setRegion((prev) =>
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
      (error) => console.warn('No se pudo recentrar:', error),
      { enableHighAccuracy: true, timeout: 12000 }
    );
  };

  // FAB open/close
  const toggleFab = () => {
    setFabOpen((s) => !s);
    Animated.timing(anim, {
      toValue: fabOpen ? 0 : 1,
      duration: 180,
      useNativeDriver: true,
    }).start();
  };

  // Acciones del FAB (ajusta los nombres de rutas si difieren)
  const goReportar = () => navigation.navigate('Tabs', { screen: 'Report' });   // o 'Reportar'
  const goReportes = () => navigation.navigate('Tabs', { screen: 'Reports' });  // o 'Reportes'

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
      >
        {/* Ubicación actual */}
        {region && (
          <Marker coordinate={region} anchor={{ x: 0.5, y: 0.5 }}>
            <View style={styles.meOuter}>
              <View style={styles.meInner} />
            </View>
          </Marker>
        )}

        {/* Reportes */}
        {markers.map((m) => (
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

      {/* Header flotante: solo perfil (quitamos el menú inferior) */}
      <View style={styles.headerOverlay}>
        <ProfileCircle />
      </View>

      {/* FAB de opciones (bolita) */}
      <View pointerEvents="box-none" style={styles.fabArea}>
        {/* Fondo para cerrar al tocar fuera cuando está abierto */}
        {fabOpen && (
          <Pressable style={StyleSheet.absoluteFill} onPress={toggleFab} />
        )}

        {/* Botoncitos (animados) */}
        <Animated.View
          style={[
            styles.fabItem,
            {
              transform: [
                { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [0, -70] }) },
                { scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }) },
              ],
              opacity: anim,
            },
          ]}
        >
          <Pressable style={styles.smallFab} onPress={handleRecenter}>
            <IconMI name="my-location" size={20} color="#fff" />
          </Pressable>
          <Text style={styles.fabLabel}>Centrar</Text>
        </Animated.View>

        <Animated.View
          style={[
            styles.fabItem,
            {
              transform: [
                { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [0, -140] }) },
                { scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }) },
              ],
              opacity: anim,
            },
          ]}
        >
          <Pressable style={styles.smallFab} onPress={goReportar}>
            <IconMI name="add-location-alt" size={20} color="#fff" />
          </Pressable>
          <Text style={styles.fabLabel}>Reportar</Text>
        </Animated.View>

        <Animated.View
          style={[
            styles.fabItem,
            {
              transform: [
                { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [0, -210] }) },
                { scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }) },
              ],
              opacity: anim,
            },
          ]}
        >
          <Pressable style={styles.smallFab} onPress={goReportes}>
            <IconMI name="list-alt" size={20} color="#fff" />
          </Pressable>
          <Text style={styles.fabLabel}>Reportes</Text>
        </Animated.View>

        {/* Botón principal (bolita) */}
        <Pressable style={styles.fabMain} onPress={toggleFab}>
          <Animated.View
            style={{
              transform: [
                {
                  rotate: anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '45deg'],
                  }),
                },
              ],
            }}
          >
            <IconMI name="add" size={28} color="#fff" />
          </Animated.View>
        </Pressable>
      </View>

      {/* Panel detalle del reporte */}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: UI.bg,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: UI.bg,
  },
  map: { flex: 1 },

  /** Dot de usuario */
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
  meInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: UI.primary,
  },

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
    width: 0, height: 0,
    borderLeftWidth: 5, borderRightWidth: 5, borderTopWidth: 8,
    borderLeftColor: 'transparent', borderRightColor: 'transparent',
    marginTop: -1,
  },

  /** Header (solo perfil) */
  headerOverlay: {
    position: 'absolute',
    top: 16,
    right: 16,
  },

  /** Zona del FAB */
  fabArea: {
    position: 'absolute',
    right: 16,
    bottom: 24,
  },
  fabMain: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: UI.primary,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: UI.primary,
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  smallFab: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: UI.primary,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 10,
  },
  fabItem: {
    position: 'absolute',
    right: 6, // pequeño offset para alinear con el main
    bottom: 60, // base desde donde se animan
    alignItems: 'center',
  },
  fabLabel: {
    marginTop: 4,
    fontSize: 12,
    color: UI.muted,
    backgroundColor: UI.card,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: UI.border,
  },

  /** Panel detalle */
  handleBar: {
    width: 44, height: 4, borderRadius: 2,
    backgroundColor: UI.border, alignSelf: 'center', marginBottom: 8,
  },
  panelTitle: {
    fontSize: 20, fontWeight: '800', color: UI.text, marginBottom: 6,
  },
  panelDesc: {
    fontSize: 16, color: '#1f2937', marginBottom: 6,
  },
  panelTime: {
    fontSize: 12, color: UI.muted,
  },
});
