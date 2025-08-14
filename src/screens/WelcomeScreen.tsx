// src/screens/WelcomeScreen.tsx
import React, { useEffect, useState, useContext } from 'react';
import {
  StyleSheet,
  View,
  ActivityIndicator,
  PermissionsAndroid,
  Platform,
  Text,
  Image,
  Dimensions,
  Pressable,
  Animated,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import Geolocation from 'react-native-geolocation-service';
import MI from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { launchCamera, launchImageLibrary, Asset } from 'react-native-image-picker';
import Toast from 'react-native-toast-message';
import ButtonSheet from '../presentation/components/ui/ButtonSheet';
import RecentReportsSheet from '../presentation/components/ui/RecentReportsSheet';
import { MarkersContext, Marker as ReportMarker } from '../context/MarkersContext';
import { useTheme } from '../theme/theme';
import { BottomTabBarHeightContext } from '@react-navigation/bottom-tabs';

const UI = { primary: '#0AC5C5' };
const { width: SCREEN_W } = Dimensions.get('window');
const PANEL_HEIGHT = 800;

// Sube la burbuja de forma estática (sin animaciones con la sheet)
const FAB_EXTRA_BOTTOM = 96; // súbelo más/menos si lo quieres ajustar

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

/** ========== FAB RADIAL ========== */
const FabRadial: React.FC<{
  actions: Array<{ key: string; icon: string; onPress: () => void }>;
  tabBarSpace: number;
  extraBottom?: number; // ⬅️ nuevo: elevar sin animaciones
}> = ({ actions, tabBarSpace, extraBottom = 0 }) => {
  const [open, setOpen] = React.useState(false);
  const anim = React.useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();

  const toggle = () => {
    setOpen(o => !o);
    Animated.spring(anim, {
      toValue: open ? 0 : 1,
      useNativeDriver: true,
      friction: 6,
      tension: 60,
    }).start();
  };

  const R = 60;
  const CENTER = -100;
  const SPREAD = 100;
  const angles =
    actions.length === 1
      ? [CENTER]
      : actions.map((_, i) => CENTER - SPREAD / 1 + (SPREAD / (actions.length - 1.5)) * i);

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.fabArea,
        { bottom: insets.bottom + tabBarSpace + 24 + extraBottom },
      ]}
    >
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
              <MI name={a.icon as any} size={20} color="#fff" />
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
          <MI name="add" size={28} color="#fff" />
        </Animated.View>
      </Pressable>
    </View>
  );
};

const WelcomeScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { markers } = useContext(MarkersContext);
  const { colors } = useTheme();

  const tabBarHeight = React.useContext(BottomTabBarHeightContext) ?? 0;
  const insets = useSafeAreaInsets();

  const [region, setRegion] = useState<Region | null>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ReportMarker | null>(null);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });

  /* ===== permisos y acciones cámara/galería ===== */
  const requestCameraPermission = async () => {
    if (Platform.OS !== 'android') return true;
    const res = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA, {
      title: 'Permiso de cámara',
      message: 'Necesitamos acceder a tu cámara para tomar fotos de los reportes.',
      buttonPositive: 'Aceptar',
    });
    return res === PermissionsAndroid.RESULTS.GRANTED;
  };

  const requestMediaPermission = async () => {
    if (Platform.OS !== 'android') return true;
    const perm =
      Platform.Version >= 33
        ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
        : PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;

    const res = await PermissionsAndroid.request(perm, {
      title: 'Permiso de fotos',
      message: 'Necesitamos acceder a tus fotos para adjuntar al reporte.',
      buttonPositive: 'Aceptar',
    });
    return res === PermissionsAndroid.RESULTS.GRANTED;
  };

  const goToReportWithAsset = (asset?: Asset) => {
    if (!asset?.uri) {
      Toast.show({ type: 'error', text1: 'No se obtuvo la imagen' });
      return;
    }
    // Ajusta el nombre de la ruta si tu stack usa 'Report' o 'Reportar'
    navigation.getParent()?.navigate('Reportar' as never, { imageUri: asset.uri } as never);
  };

  const openCamera = async () => {
    const ok = await requestCameraPermission();
    if (!ok) {
      Toast.show({ type: 'info', text1: 'Permiso de cámara denegado' });
      return;
    }
    const result = await launchCamera({
      mediaType: 'photo',
      cameraType: 'back',
      quality: 0.8 as const,
      saveToPhotos: false,
      includeBase64: false,
      presentationStyle: 'fullScreen',
    });
    if (result.didCancel) return;
    if (result.errorCode) {
      Toast.show({ type: 'error', text1: 'Error de cámara', text2: result.errorMessage });
      return;
    }
    goToReportWithAsset(result.assets?.[0]);
  };

  const openGallery = async () => {
    const ok = await requestMediaPermission();
    if (!ok) {
      Toast.show({ type: 'info', text1: 'Permiso de fotos denegado' });
      return;
    }
    const result = await launchImageLibrary({
      mediaType: 'photo',
      selectionLimit: 1,
      quality: 0.8 as const,
      includeBase64: false,
    });
    if (result.didCancel) return;
    if (result.errorCode) {
      Toast.show({ type: 'error', text1: 'Error al abrir galería', text2: result.errorMessage });
      return;
    }
    goToReportWithAsset(result.assets?.[0]);
  };
  /* ============================================== */

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
          () => setLoading(false),
          { enableHighAccuracy: true, timeout: 20000 }
        );

        const watchId = Geolocation.watchPosition(
          ({ coords }) => {
            setRegion(prev =>
              prev ? { ...prev, latitude: coords.latitude, longitude: coords.longitude } : null
            );
          },
          () => {},
          { enableHighAccuracy: false, distanceFilter: 10, interval: 5000 }
        );

        return () => Geolocation.clearWatch(watchId);
      } catch {
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
      <View style={[styles.loaderContainer, { backgroundColor: colors.bg }]}>
        <ActivityIndicator size="large" color={UI.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        region={region}
        customMapStyle={MAP_STYLE}
        mapPadding={{ top: 88, right: 8, bottom: 24, left: 8 }}
      >
        {region && (
          <Marker coordinate={region} anchor={{ x: 0.5, y: 0.5 }}>
            <View style={styles.meOuter}>
              <View style={styles.meInner} />
            </View>
          </Marker>
        )}

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

      {/* FAB fijo, más arriba para no tapar la sheet */}
      <FabRadial
        tabBarSpace={tabBarHeight}
        extraBottom={FAB_EXTRA_BOTTOM}
        actions={[
          { key: 'camera',  icon: 'photo-camera',  onPress: openCamera },
          { key: 'gallery', icon: 'photo-library', onPress: openGallery },
          { key: 'center',  icon: 'my-location',   onPress: handleRecenter },
        ]}
      />

      <RecentReportsSheet
        collapsedPx={150}
        onPressItem={(m) => setSelected(m)}
        bottomInset={insets.bottom + (tabBarHeight ?? 0) + 12}
        startIndex={0}
        // sin onIndexChange ni animaciones
      />

      {selected && (
        <ButtonSheet onClose={() => setSelected(null)} initialHeight={PANEL_HEIGHT}>
          <View style={{ paddingBottom: 24 }}>
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
          </View>
        </ButtonSheet>
      )}
    </View>
  );
};

export default WelcomeScreen;

/* ========== styles ========== */
const styles = StyleSheet.create({
  container: { flex: 1 },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  map: { flex: 1 },

  meOuter: {
    width: 20, height: 20, borderRadius: 10, backgroundColor: '#ffffff',
    borderWidth: 2, borderColor: UI.primary, alignItems: 'center', justifyContent: 'center',
  },
  meInner: { width: 8, height: 8, borderRadius: 4, backgroundColor: UI.primary },

  pinWrap: { alignItems: 'center' },
  pinHead: {
    width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: '#fff',
    shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  pinStem: {
    width: 0, height: 0, borderLeftWidth: 5, borderRightWidth: 5, borderTopWidth: 8,
    borderLeftColor: 'transparent', borderRightColor: 'transparent', marginTop: -1,
  },

  fabArea: { position: 'absolute', right: 12 },
  fabMain: {
    width: 60, height: 60, borderRadius: 28, backgroundColor: UI.primary,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: UI.primary, shadowOpacity: 0.25, shadowRadius: 10,
    shadowOffset: { width: 0, height: 8 }, elevation: 4,
  },
  smallFab: {
    width: 50, height: 50, borderRadius: 25, backgroundColor: UI.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  fabItem: { position: 'absolute', right: 20, bottom: 52, alignItems: 'center' },

  handleBar: { width: 44, height: 4, borderRadius: 2, backgroundColor: '#D7DDE5', alignSelf: 'center', marginBottom: 8 },
  panelTitle: { fontSize: 20, fontWeight: '800', color: '#0D1313', marginBottom: 6 },
  panelDesc: { fontSize: 16, color: '#1f2937', marginBottom: 6 },
  panelTime: { fontSize: 12, color: '#6B7280' },
});
