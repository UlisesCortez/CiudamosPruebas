// src/components/MarkerComponent.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Marker, Callout } from 'react-native-maps';
import { Marker as ReportMarker } from '../context/MarkersContext';

interface Props {
  marker: ReportMarker;
}

export default function MarkerComponent({ marker }: Props) {
  const [visible, setVisible] = useState(false);
  const open = () => setVisible(true);
  const close = () => setVisible(false);

  return (
    <>
      <Marker
        coordinate={{ latitude: marker.latitude, longitude: marker.longitude }}
        pinColor={marker.color || 'red'}
        tracksViewChanges={false}
      >
        <Callout tooltip onPress={open}>
          <View style={styles.callout}>
            <Text style={styles.calloutTitle}>{marker.title}</Text>
            <Text numberOfLines={2} style={styles.calloutDesc}>
              {marker.description}
            </Text>
            <Text style={styles.calloutHint}>Toca para expandir</Text>
          </View>
        </Callout>
      </Marker>

      <Modal
        visible={visible}
        animationType="slide"
        transparent={true}
        onRequestClose={close}
      >
        <View style={styles.overlay}>
          {/* Área oscura que cierra al tocar */}
          <TouchableOpacity style={styles.backdrop} onPress={close} />

          <View style={styles.sheet}>
            {/* ─────── Handle ─────── */}
            <View style={styles.handleContainer}>
              <View style={styles.handle} />
            </View>

            <ScrollView
              style={styles.content}
              contentContainerStyle={{ paddingBottom: 24 }}
              showsVerticalScrollIndicator
            >
              <Text style={styles.sheetTitle}>{marker.title}</Text>
              <Text style={styles.sheetTime}>
                {new Date(marker.timestamp).toLocaleString()}
              </Text>
              <Text style={styles.sheetDesc}>{marker.description}</Text>
              {marker.photoUri && (
                <Image
                  source={{ uri: marker.photoUri }}
                  style={styles.sheetImage}
                />
              )}

              <TouchableOpacity style={styles.closeBtn} onPress={close}>
                <Text style={styles.closeBtnText}>Cerrar</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  callout: {
    width: 160,
    padding: 6,
    backgroundColor: 'white',
    borderRadius: 6,
    elevation: 4,
  },
  calloutTitle: { fontWeight: '700', marginBottom: 4 },
  calloutDesc: { fontSize: 12 },
  calloutHint: { marginTop: 4, fontSize: 10, color: '#007AFF', textAlign: 'center' },

  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '70%',
    overflow: 'hidden',
  },

  handleContainer: {
    alignItems: 'center',
    paddingVertical: 8,
    backgroundColor: '#fff',
  },
  handle: {
    width: 40,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#ccc',
  },

  content: {
    paddingHorizontal: 16,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  sheetTime: {
    fontSize: 12,
    color: '#666',
    marginBottom: 12,
  },
  sheetDesc: {
    fontSize: 16,
    marginBottom: 12,
  },
  sheetImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },

  closeBtn: {
    alignSelf: 'center',
    marginTop: 8,
    paddingVertical: 10,
    paddingHorizontal: 24,
    backgroundColor: '#eee',
    borderRadius: 20,
  },
  closeBtnText: {
    fontSize: 14,
    color: '#333',
  },
});
