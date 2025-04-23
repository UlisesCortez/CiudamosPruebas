// src/components/MarkerComponent.js

import React from 'react';
import { Marker, Callout } from 'react-native-maps';
import { View, Text, Image, StyleSheet } from 'react-native';


export default function MarkerComponent({ marker }) {
  return (
    <Marker
      coordinate={{ latitude: marker.latitude, longitude: marker.longitude }}
      pinColor={marker.color || 'red'}
    >
      <Callout tooltip>
        <View style={styles.calloutContainer}>
          <Text style={styles.title}>{marker.title}</Text>
          <Text style={styles.description}>{marker.description}</Text>
          {marker.photoUri ? (
            <Image source={{ uri: marker.photoUri }} style={styles.photo} />
          ) : null}
        </View>
      </Callout>
    </Marker>
  );
}

const styles = StyleSheet.create({
  calloutContainer: {
    width: 200,
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
    fontWeight: '600',
    marginBottom: 4,
  },
  description: {
    fontSize: 12,
    marginBottom: 6,
  },
  photo: {
    width: '100%',
    height: 100,
    borderRadius: 6,
  },
});