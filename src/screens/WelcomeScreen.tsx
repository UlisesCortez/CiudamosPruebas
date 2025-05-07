import React, { useEffect, useState, useContext } from 'react';
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
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import ProfileCircle from '../presentation/components/ui/ProfileCircle';
import BottonMenu from '../presentation/components/ui/ButtonMenu';
import { MarkersContext, Marker as ReportMarker } from '../context/MarkersContext';
import ButtonSheet from '../presentation/components/ui/ButtonSheet';

const PANEL_HEIGHT = 800;

const WelcomeScreen: React.FC = () => {
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

          const fineLocationGranted = granted[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION] === PermissionsAndroid.RESULTS.GRANTED;
          const coarseLocationGranted = granted[PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION] === PermissionsAndroid.RESULTS.GRANTED;

          if (!fineLocationGranted && !coarseLocationGranted) {
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
          {
            enableHighAccuracy: true,
            timeout: 20000,
          }
        );

        const watchId = Geolocation.watchPosition(
          ({ coords }) => {
            setRegion((prev) =>
              prev
                ? { ...prev, latitude: coords.latitude, longitude: coords.longitude }
                : null
            );
          },
          (error) => console.error('Error de ubicación continua:', error),
          {
            enableHighAccuracy: false,
            distanceFilter: 10,
            interval: 5000,
          }
        );

        return () => {
          Geolocation.clearWatch(watchId);
        };
      } catch (err) {
        console.error('Error pidiendo permisos de ubicación:', err);
        setLoading(false);
      }
    };

    requestLocationPermission();
  }, []);

  // Calcula el tamaño de la imagen seleccionada
  useEffect(() => {
    if (selected?.photoUri) {
      Image.getSize(selected.photoUri, (width, height) => {
        const screenWidth = Dimensions.get('window').width - 32; // márgenes horizontales
        const scaleFactor = width / screenWidth;
        const imageHeight = height / scaleFactor;
        setImageSize({ width: screenWidth, height: imageHeight });
      }, (error) => {
        console.warn('No se pudo obtener el tamaño de la imagen:', error);
      });
    }
  }, [selected]);

  if (!region || loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        region={region}
      >
        {region && (
          <Marker
            coordinate={region}
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <View style={styles.userDot} />
          </Marker>
        )}

        {markers.map(m => (
          <Marker
            key={m.id}
            coordinate={{ latitude: m.latitude, longitude: m.longitude }}
            pinColor={m.color || 'red'}
            onPress={() => setSelected(m)}
          />
        ))}
      </MapView>

      <ProfileCircle />

      <View style={styles.floatingButtonMenu}>
        <BottonMenu />
      </View>

      {selected && (
        <ButtonSheet onClose={() => setSelected(null)} initialHeight={PANEL_HEIGHT}>
          <ScrollView>
            <Text style={styles.panelTitle}>{selected.title}</Text>
            <Text style={styles.panelDesc}>{selected.description}</Text>
            <Text style={styles.panelTime}>
              {new Date(selected.timestamp).toLocaleString()}
            </Text>

            {selected.photoUri && (
              <Image
                source={{ uri: selected.photoUri }}
                style={{
                  width: imageSize.width,
                  height: imageSize.height,
                  borderRadius: 12,
                  marginBottom: 16,
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
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  map: {
    flex: 1,
  },
  userDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#007AFF',
    borderWidth: 2,
    borderColor: '#fff',
  },
  floatingButtonMenu: {
    position: 'absolute',
    top: '3%',
    left: '5%',
  },
  panelTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  panelDesc: {
    fontSize: 16,
    marginBottom: 8,
  },
  panelTime: {
    fontSize: 12,
    color: '#666',
    marginBottom: 12,
  },
});
