// src/screens/ReportScreen.tsx
import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Image,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useNavigation, useRoute } from '@react-navigation/native';
import notifee, { AndroidImportance } from '@notifee/react-native';

import { MarkersContext } from '../context/MarkersContext';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../presentation/navigator/RootNavigator';
import type { Asset } from 'react-native-image-picker'; // solo para el tipo

const UI = {
  bg: '#F4F7FC',
  card: '#FFFFFF',
  muted: '#6B7280',
  border: '#E7E9ED',
  primary: '#0AC5C5',
  text: '#0D1313',
};

type ReportNav   = NativeStackNavigationProp<RootStackParamList, 'Reportar'>;
type ReportRoute = RouteProp<RootStackParamList, 'Reportar'>;

const ReportScreen: React.FC = () => {
  const { addMarker } = useContext(MarkersContext);
  const navigation = useNavigation<ReportNav>();
  const route = useRoute<ReportRoute>();

  const [description, setDescription] = useState<string>('');
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [urgency, setUrgency] = useState('');
  const [category, setCategory] = useState('');
  const [showUrgencyOptions, setShowUrgencyOptions] = useState(false);
  const [showCategoryOptions, setShowCategoryOptions] = useState(false);
  const [photo, setPhoto] = useState<Asset | { uri: string } | null>(null);

  // Pre-carga la imagen si llega desde Welcome (burbujas)
  useEffect(() => {
    const uri = route?.params?.imageUri;
    if (uri) setPhoto({ uri });
  }, [route?.params?.imageUri]);

  // Colores del pin en el mapa según urgencia
  const getPinColor = (level: string): string => {
    switch (level) {
      case 'Alta':  return '#EF4444';
      case 'Media': return '#F59E0B';
      case 'Baja':  return '#10B981';
      default:      return UI.primary;
    }
  };

  // Posición actual
  useEffect(() => {
    Geolocation.getCurrentPosition(
      ({ coords }) => setCoords({ latitude: coords.latitude, longitude: coords.longitude }),
      (error) => console.error('Error obteniendo coordenadas:', error),
      { enableHighAccuracy: true }
    );
  }, []);

  // Canal de notificaciones (Android)
  useEffect(() => {
    const bootstrap = async () => {
      if (Platform.OS === 'android') {
        await notifee.requestPermission();
        await notifee.createChannel({
          id: 'ciudamos-alertas',
          name: 'Alertas de incidentes',
          importance: AndroidImportance.HIGH,
        });
      }
    };
    bootstrap();
  }, []);

  const canSubmit = !!photo && !!category;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        <View style={styles.headerBlock}>
          <Text style={styles.title}>Reportar Incidente</Text>
          <Text style={styles.subtitle}>Completa los siguientes datos</Text>
        </View>

        {coords && (
          <View style={styles.card}>
            <View style={styles.mapContainer}>
              <MapView
                style={styles.map}
                provider={PROVIDER_GOOGLE}
                initialRegion={{
                  latitude: coords.latitude,
                  longitude: coords.longitude,
                  latitudeDelta: 0.002,
                  longitudeDelta: 0.002,
                }}
                showsUserLocation
              >
                <Marker coordinate={coords} title="Mi ubicación" />
              </MapView>
            </View>

            <View style={styles.locBox}>
              <Text style={styles.sectionLabel}>Ubicación actual</Text>
              <Text style={styles.locText}>Latitud: {coords.latitude.toFixed(6)}</Text>
              <Text style={styles.locText}>Longitud: {coords.longitude.toFixed(6)}</Text>
            </View>
          </View>
        )}

        {/* Urgencia */}
        <View style={styles.fieldBlock}>
          <Text style={styles.sectionLabel}>Nivel de urgencia</Text>
          <Text
            onPress={() => setShowUrgencyOptions((s) => !s)}
            style={[styles.input, styles.inputText, !urgency && styles.placeholder]}
          >
            {urgency || 'Selecciona urgencia'}
          </Text>

          {showUrgencyOptions && (
            <View style={styles.menu}>
              {['Alta', 'Media', 'Baja'].map((opt) => (
                <Text
                  key={opt}
                  style={styles.menuItemText}
                  onPress={() => {
                    setUrgency(opt);
                    setShowUrgencyOptions(false);
                  }}
                >
                  {opt}
                </Text>
              ))}
            </View>
          )}
        </View>

        {/* Categoría */}
        <View style={styles.fieldBlock}>
          <Text style={styles.sectionLabel}>Categoría</Text>
          <Text
            onPress={() => setShowCategoryOptions((s) => !s)}
            style={[styles.input, styles.inputText, !category && styles.placeholder]}
          >
            {category || 'Selecciona categoría'}
          </Text>

          {showCategoryOptions && (
            <View style={styles.menu}>
              {['Seguridad', 'Infraestructura', 'Ambiente'].map((cat) => (
                <Text
                  key={cat}
                  style={styles.menuItemText}
                  onPress={() => {
                    setCategory(cat);
                    setShowCategoryOptions(false);
                  }}
                >
                  {cat}
                </Text>
              ))}
            </View>
          )}
        </View>

        {/* Detalles */}
        <Text style={styles.sectionLabel}>Detalles</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholderTextColor={UI.muted}
          placeholder="Escribe detalles del incidente..."
          multiline
          numberOfLines={4}
          value={description}
          onChangeText={setDescription}
        />

        {/* Preview (sin botones de cámara/galería) */}
        {photo && (
          <View style={styles.imagePreviewBox}>
            <Image source={{ uri: (photo as any).uri }} style={styles.previewImage} resizeMode="cover" />
          </View>
        )}

        {/* Submit */}
        <Text
          style={[styles.submitButton, !canSubmit && { opacity: 0.5 }]}
          onPress={async () => {
            if (!canSubmit) return;
            if (!coords) {
              Alert.alert('Ubicación', 'No se pudo obtener la ubicación actual.');
              return;
            }
            const pinColor = getPinColor(urgency);

            addMarker({
              id: Date.now().toString(),
              latitude: coords.latitude,
              longitude: coords.longitude,
              title: category || 'Incidente',
              description,
              photoUri: (photo as any)?.uri,
              color: pinColor,
              timestamp: new Date().toISOString(),
            });

            await notifee.displayNotification({
              title: '🚨 Nuevo incidente reportado',
              body: `Tipo: ${category} — Ubicación: ${coords.latitude.toFixed(3)}, ${coords.longitude.toFixed(3)}`,
              android: {
                channelId: 'ciudamos-alertas',
                smallIcon: 'ic_launcher',
                importance: AndroidImportance.HIGH,
                pressAction: { id: 'default' },
              },
            });

            Alert.alert('Listo', 'Reporte enviado correctamente.');
            setDescription('');
            setCategory('');
            setUrgency('');
            setPhoto(null);
            setShowUrgencyOptions(false);
            setShowCategoryOptions(false);
            navigation.goBack();
          }}
        >
          Subir reporte
        </Text>
      </ScrollView>
    </View>
  );
};

export default ReportScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: UI.bg,
    paddingHorizontal: 16,
    paddingTop: 12,
  },

  /* Header */
  headerBlock: {
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: UI.text,
  },
  subtitle: {
    fontSize: 14,
    color: UI.muted,
    marginTop: 4,
  },

  /* Map + ubicación card */
  card: {
    backgroundColor: UI.card,
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: UI.border,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  mapContainer: {
    height: 180,
    borderRadius: 12,
    overflow: 'hidden',
  },
  map: { flex: 1 },
  locBox: { marginTop: 10 },
  locText: { color: UI.text, fontSize: 12 },

  /* Fields */
  sectionLabel: {
    fontWeight: '800',
    color: UI.text,
    marginBottom: 6,
  },
  fieldBlock: { marginBottom: 16 },
  input: {
    backgroundColor: UI.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: UI.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  inputText: { color: UI.text, fontSize: 16 },
  placeholder: { color: UI.muted },

  textArea: {
    minHeight: 120,
    textAlignVertical: 'top',
  },

  /* Dropdown simple */
  menu: {
    backgroundColor: UI.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: UI.border,
    borderRadius: 12,
    marginTop: 8,
    overflow: 'hidden',
  },
  menuItemText: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: UI.border,
    color: UI.text,
    fontSize: 16,
  },

  /* Preview */
  imagePreviewBox: {
    marginTop: 16,
    alignItems: 'center',
  },
  previewImage: {
    width: '100%',
    height: 220,
    borderRadius: 12,
  },

  /* Submit como botón de texto estilizado */
  submitButton: {
    marginTop: 16,
    backgroundColor: UI.primary,
    paddingVertical: 14,
    borderRadius: 14,
    textAlign: 'center',
    color: '#fff',
    fontWeight: '900',
    letterSpacing: 0.2,
    fontSize: 16,
  },
});
