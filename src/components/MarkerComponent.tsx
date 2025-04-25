// src/components/MarkerComponent.tsx

import React from 'react';
import { Marker, Callout } from 'react-native-maps';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Marker as ReportMarker } from '../context/MarkersContext';

interface Props {
  marker: ReportMarker;
}

const MarkerComponent: React.FC<Props> = ({ marker }) => {
  return (
    <Marker
      coordinate={{ latitude: marker.latitude, longitude: marker.longitude }}
      pinColor={marker.color || 'red'}
      tracksViewChanges={false}
    >
      <Callout tooltip>
        <View style={styles.calloutContainer}>
          <Text style={styles.title}>{marker.title}</Text>
          <Text style={styles.timestamp}>
            {new Date(marker.timestamp).toLocaleString()}
          </Text>
          <Text style={styles.description}>{marker.description}</Text>
          {marker.photoUri ? (
            <Image source={{ uri: marker.photoUri }} style={styles.photo} />
          ) : null}
        </View>
      </Callout>
    </Marker>
  );
};

export default MarkerComponent;

const styles = StyleSheet.create({
  calloutContainer: {
    width: 220,
    padding: 8,
    backgroundColor: 'white',
    borderRadius: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 2,
  },
  title: {
    fontWeight: '700',
    marginBottom: 4,
    fontSize: 16,
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
    marginBottom: 6,
  },
  description: {
    fontSize: 14,
    marginBottom: 6,
  },
  photo: {
    width: '100%',
    height: 120,
    borderRadius: 6,
  },
});
