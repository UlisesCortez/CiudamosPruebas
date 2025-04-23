// src/components/MapViewComponent.js

import React, { useState, useEffect, useContext } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import LocationService from '../services/LocationService';
import MarkerComponent from './MarkerComponent';
import { MarkersContext } from '../context/MarkersContext';

export default function MapViewComponent() {
  const [region, setRegion] = useState(null);
  const { markers } = useContext(MarkersContext);

  useEffect(() => {
    (async () => {
      const granted = await LocationService.requestPermission();
      if (granted) {
        const { latitude, longitude } = await LocationService.getCurrentPosition();
        setRegion({ latitude, longitude, latitudeDelta: 0.05, longitudeDelta: 0.05 });
      }
    })();
  }, []);

  if (!region) return <View style={styles.loadingContainer} />;

  return (
    <MapView
      provider={PROVIDER_GOOGLE}
      style={styles.map}
      initialRegion={region}
      showsUserLocation
      onRegionChangeComplete={setRegion}
    >
      {markers.map(m => (
        <MarkerComponent key={m.id} marker={m} />
      ))}
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