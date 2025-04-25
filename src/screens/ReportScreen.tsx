// src/screens/ReportScreen.tsx

import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import { launchCamera, CameraOptions } from 'react-native-image-picker';
import MapView, { Marker } from 'react-native-maps';
import { useNavigation } from '@react-navigation/native';
import { MarkersContext } from '../context/MarkersContext';
import ProfileCircle from '../presentation/components/ui/ProfileCircle';

export const ReportScreen: React.FC = () => {
  const { addMarker } = useContext(MarkersContext);
  const navigation    = useNavigation();

  const [description, setDescription] = useState<string>('');
  const [coords, setCoords]           = useState<{ latitude: number; longitude: number } | null>(null);
  const [urgency, setUrgency]         = useState('');
  const [category, setCategory]       = useState('');
  const [showUrgencyOptions, setShowUrgencyOptions]   = useState(false);
  const [showCategoryOptions, setShowCategoryOptions] = useState(false);
  const [photo, setPhoto]             = useState<any>(null);

  // Función para determinar el color del pin según urgencia
  const getPinColor = (level: string): string => {
    switch (level) {
      case 'Alta':  return 'red';
      case 'Media': return 'orange';
      case 'Baja':  return 'yellow';
      default:      return 'blue';
    }
  };

  // Obtiene la ubicación al montar
  useEffect(() => {
    Geolocation.getCurrentPosition(
      ({ coords }) => {
        setCoords({ latitude: coords.latitude, longitude: coords.longitude });
      },
      (error) => console.error('Error obteniendo coordenadas:', error),
      { enableHighAccuracy: true }
    );
  }, []);

  // Abre la cámara
  const openCamera = () => {
    const options: CameraOptions = {
      mediaType: 'mixed',
      cameraType: 'back',
      saveToPhotos: false,
      videoQuality: 'high',
      durationLimit: 30,
    };
    launchCamera(options, (response) => {
      if (response.didCancel) {
        console.log('Usuario canceló la cámara');
      } else if (response.errorCode) {
        console.error('Error al abrir la cámara:', response.errorMessage);
      } else {
        setPhoto(response.assets?.[0]);
      }
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView>

        <View style={styles.profileContainer}>
          <ProfileCircle />
        </View>

        <View style={styles.headerContainer}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Reportar Incidente</Text>
            <Text style={styles.subtitle}>Completa los siguientes datos</Text>
          </View>
        </View>

        {coords && (
          <View style={styles.mapContainer}>
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: coords.latitude,
                longitude: coords.longitude,
                latitudeDelta: 0.002,
                longitudeDelta: 0.002,
              }}
              showsUserLocation
              provider="google"
            >
              <Marker
                coordinate={coords}
                title="Mi ubicación"
              />
            </MapView>
          </View>
        )}

        <View style={styles.locationBox}>
          <Text style={styles.sectionTitle}>Ubicación actual</Text>
          {coords ? (
            <>
              <Text style={{ color: '#fff' }}>
                Latitud: {coords.latitude.toFixed(6)}
              </Text>
              <Text style={{ color: '#fff' }}>
                Longitud: {coords.longitude.toFixed(6)}
              </Text>
            </>
          ) : (
            <Text>Obteniendo ubicación...</Text>
          )}
        </View>

        {/* Urgencia */}
        <View style={styles.row}>
          <Text style={styles.sectionTitle}>Nivel de urgencia</Text>
          <TouchableOpacity
            style={styles.dropdownButton}
            onPress={() => setShowUrgencyOptions(!showUrgencyOptions)}
          >
            <Text style={{ color: '#fff' }}>
              {urgency || 'Selecciona urgencia'}
            </Text>
          </TouchableOpacity>
          {showUrgencyOptions && (
            <View style={styles.dropdownOptions}>
              {['Alta', 'Media', 'Baja'].map((opt) => (
                <TouchableOpacity
                  key={opt}
                  style={styles.dropdownOption}
                  onPress={() => {
                    setUrgency(opt);
                    setShowUrgencyOptions(false);
                  }}
                >
                  <Text>{opt}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Categoría */}
        <View style={styles.row}>
          <Text style={styles.sectionTitle}>Categoría</Text>
          <TouchableOpacity
            style={styles.dropdownButton}
            onPress={() => setShowCategoryOptions(!showCategoryOptions)}
          >
            <Text style={{ color: '#fff' }}>
              {category || 'Selecciona categoría'}
            </Text>
          </TouchableOpacity>
          {showCategoryOptions && (
            <View style={styles.dropdownOptions}>
              {['Seguridad', 'Infraestructura', 'Ambiente'].map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={styles.dropdownOption}
                  onPress={() => {
                    setCategory(cat);
                    setShowCategoryOptions(false);
                  }}
                >
                  <Text>{cat}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Detalles */}
        <Text style={styles.sectionTitle}>Detalles</Text>
        <TextInput
          style={styles.textArea}
          placeholderTextColor="#aaa"
          placeholder="Escribe detalles del incidente..."
          multiline
          numberOfLines={4}
          value={description}
          onChangeText={setDescription}
        />

        <TouchableOpacity style={styles.uploadButton} onPress={openCamera}>
          <Text style={styles.uploadButtonText}>Agregar foto/video</Text>
        </TouchableOpacity>

        {photo && (
          <View style={styles.imagePreviewBox}>
            <Image
              source={{ uri: photo.uri }}
              style={styles.previewImage}
              resizeMode="cover"
            />
            <TouchableOpacity
              style={styles.submitButton}
              onPress={() => {
                if (!category.trim()) {
                  Alert.alert(
                    'Atención',
                    'Por favor selecciona una categoría'
                  );
                  return;
                }
                const pinColor = getPinColor(urgency);

                addMarker({
                  id: Date.now().toString(),
                  latitude:  coords!.latitude,
                  longitude: coords!.longitude,
                  title:    category,
                  description,
                  photoUri: photo.uri,
                  color:    pinColor,
                });
                navigation.goBack();
              }}
            >
              <Text style={styles.submitButtonText}>
                Subir reporte
              </Text>
            </TouchableOpacity>
          </View>
        )}

      </ScrollView>
    </View>
  );
};

export default ReportScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#1E1E1E',
  },
  headerContainer: {
    marginTop: 90,
    marginBottom: 15,
  },
  profileContainer: {
    top: -30,
    right: -40,
  },
  titleContainer: {
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#fff',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 16,
    color: '#999',
  },
  locationBox: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 20,
    borderRadius: 8,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#fff',
  },
  row: {
    marginBottom: 20,
  },
  dropdownButton: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
    marginTop: 6,
  },
  dropdownOptions: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    marginTop: 6,
    backgroundColor: '#f9f9f9',
  },
  dropdownOption: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
    textAlignVertical: 'top',
    color: '#fff',
  },
  uploadButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  uploadButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  imagePreviewBox: {
    marginTop: 20,
    alignItems: 'center',
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
  },
  submitButton: {
    marginTop: 20,
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  mapContainer: {
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
  },
  map: {
    flex: 1,
  },
});
