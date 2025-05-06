// src/components/MarkerComponent.tsx

import React from 'react';
import { Marker, Callout } from 'react-native-maps';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Marker as MarkerType } from '../context/MarkersContext';

interface Props {
  marker: MarkerType;
}

export default function MarkerComponent({ marker }: Props) {
  // Normalizamos el título a minúsculas para comparar sin errores de casing
  const category = marker.title.trim().toLowerCase();

  const getIcon = () => {
    switch (category) {
      case 'seguridad':
        return require('../presentation/icons/seguridad.png');
      case 'infraestructura':
        return require('../presentation/icons/infraestructura.png');
      case 'ambiente':
        return require('../presentation/icons/ambiente.png');
      default:
        // fallback si no coincide
        return require('../presentation/icons/seguridad.png');
    }
  };

  return (
    <Marker
      coordinate={{
        latitude:  marker.latitude,
        longitude: marker.longitude,
      }}
      anchor={{ x: 0.5, y: 1 }}
    >
      {/* Pin personalizado según categoría */}
      <Image
        source={getIcon()}
        style={styles.pin}
        resizeMode="contain"
      />

      {/* Callout con info */}
      <Callout tooltip>
        <View style={styles.callout}>
          <Text style={styles.title}>{marker.title}</Text>
          <Text style={styles.desc}>{marker.description}</Text>
          {marker.photoUri && (
            <Image
              source={{ uri: marker.photoUri }}
              style={styles.photo}
              resizeMode="cover"
            />
          )}
        </View>
      </Callout>
    </Marker>
  );
}

const styles = StyleSheet.create({
  pin: {
    width: 40,
    height: 40,
  },
  callout: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 8,
    width: 200,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  title: {
    fontWeight: '600',
    marginBottom: 4,
  },
  desc: {
    fontSize: 12,
    marginBottom: 6,
  },
  photo: {
    width: '100%',
    height: 100,
    borderRadius: 6,
  },
});

