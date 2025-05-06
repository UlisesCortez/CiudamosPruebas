// src/components/MapViewComponent.tsx

import React, { useState, useEffect, useContext } from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import MapView, { PROVIDER_GOOGLE, Region } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import { MarkersContext } from '../context/MarkersContext';

// 1) Importa tu componente personalizado
import MarkerComponent from './MarkerComponent';

export default function MapViewComponent() {
  const [region, setRegion] = useState<Region | null>(null);
  const { markers } = useContext(MarkersContext);

  useEffect(() => {
    (async () => {
      // …permiso y ubicación…
      Geolocation.getCurrentPosition(
        ({ coords }) => {
          setRegion({
            latitude: coords.latitude,
            longitude: coords.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          });
        },
        console.error,
        { enableHighAccuracy: true }
      );
    })();
  }, []);

  if (!region) {
    return <View style={styles.loadingContainer}><ActivityIndicator /></View>;
  }

  return (
    <MapView
      provider={PROVIDER_GOOGLE}
      style={styles.map}
      region={region}
      showsUserLocation
      onRegionChangeComplete={setRegion}
    >
      {
        // 2) Recorre tu array de marcadores y renderiza
        markers.map(m => (
          <MarkerComponent key={m.id} marker={m} />
        ))
      }
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: { flex: 1 },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
