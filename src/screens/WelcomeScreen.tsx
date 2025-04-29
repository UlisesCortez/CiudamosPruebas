// src/screens/WelcomeScreen.tsx

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
  ScrollView
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import ProfileCircle from '../presentation/components/ui/ProfileCircle';
import BottonMenu from '../presentation/components/ui/ButtonMenu';
import { MarkersContext, Marker as ReportMarker } from '../context/MarkersContext';
import ButtonSheet from '../presentation/components/ui/ButtonSheet';


const PANEL_HEIGHT = 600;

const WelcomeScreen: React.FC = () => {
  const [region, setRegion] = useState<Region | null>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ReportMarker | null>(null);
  const { markers } = useContext(MarkersContext);

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
            enableHighAccuracy: true,
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
        {/* Dot azul para la ubicación actual */}
        {region && (
          <Marker
            coordinate={region}
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <View style={styles.userDot} />
          </Marker>
        )}

        {/* Pins de reportes */}
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

      {/* Botón de menú */}
      <View style={styles.floatingButtonMenu}>
        <BottonMenu />
      </View>

      {/* Panel inferior con detalle del reporte */}
      {selected && (
       
          <ButtonSheet onClose={() => setSelected(null)}
            initialHeight={PANEL_HEIGHT}>
            
          <ScrollView>
          <Text style={styles.panelTitle}>{selected.title}</Text>
          <Text style={styles.panelDesc}>{selected.description}</Text>
          <Text style={styles.panelTime}>
            {new Date(selected.timestamp).toLocaleString()}
          </Text>
          {selected.photoUri && (
            <Image source={{ uri: selected.photoUri }} style={styles.panelImage} />
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
  bottomPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: PANEL_HEIGHT,
    backgroundColor: '#fff',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: -2 },
    elevation: 5,
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
  panelImage: {
    width: '100%',
    height: 120,
    borderRadius: 6,
    marginBottom: 12,
  },
  closeButton: {
    alignSelf: 'center',
    marginTop: 4,
    paddingVertical: 6,
    paddingHorizontal: 20,
    backgroundColor: '#eee',
    borderRadius: 20,
  },
  closeText: {
    color: '#333',
    fontWeight: '600',
  },
});
