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
  Platform,
} from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import { launchCamera, CameraOptions } from 'react-native-image-picker';
import MapView, { Marker } from 'react-native-maps';
import { useNavigation } from '@react-navigation/native';
import { MarkersContext } from '../context/MarkersContext';
import ProfileCircle from '../presentation/components/ui/ProfileCircle';
import notifee, { AndroidImportance } from '@notifee/react-native';

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

  const getPinColor = (level: string): string => {
    switch (level) {
      case 'Alta':  return 'red';
      case 'Media': return 'orange';
      case 'Baja':  return 'yellow';
      default:      return 'blue';
    }
  };

  useEffect(() => {
    Geolocation.getCurrentPosition(
      ({ coords }) => {
        setCoords({ latitude: coords.latitude, longitude: coords.longitude });
      },
      (error) => console.error('Error obteniendo coordenadas:', error),
      { enableHighAccuracy: true }
    );
  }, []);

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

  const requestPermissionAndCreateChannel = async () => {
    if (Platform.OS === 'android') {
      await notifee.requestPermission();

      await notifee.createChannel({
        id: 'ciudamos-alertas',
        name: 'Alertas de incidentes',
        importance: AndroidImportance.HIGH,
      });
    }
  };

  useEffect(() => {
    requestPermissionAndCreateChannel();
  }, []);

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
              <Text style={{ color: '#000' }}>
                Latitud: {coords.latitude.toFixed(6)}
              </Text>
              <Text style={{ color: '#000' }}>
                Longitud: {coords.longitude.toFixed(6)}
              </Text>
            </>
          ) : (
            <Text>Obteniendo ubicación...</Text>
          )}
        </View>

        <View style={styles.row}>
          <Text style={styles.sectionTitle}>Nivel de urgencia</Text>
          <TouchableOpacity
            style={styles.dropdownButton}
            onPress={() => setShowUrgencyOptions(!showUrgencyOptions)}
          >
            <Text style={{ color: '#666' }}>
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

        <View style={styles.row}>
          <Text style={styles.sectionTitle}>Categoría</Text>
          <TouchableOpacity
            style={styles.dropdownButton}
            onPress={() => setShowCategoryOptions(!showCategoryOptions)}
          >
            <Text style={{ color: '#666' }}>
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

        <Text style={styles.sectionTitle}>Detalles</Text>
        <TextInput
          style={styles.textArea}
          placeholderTextColor="#666"
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
          </View>
        )}

        {photo && (
          <TouchableOpacity
            style={styles.submitButton}
            onPress={async () => {
              if (!category.trim()) {
                Alert.alert('Atención', 'Por favor selecciona una categoría');
                return;
              }

              const pinColor = getPinColor(urgency);

              addMarker({
                id: Date.now().toString(),
                latitude: coords!.latitude,
                longitude: coords!.longitude,
                title: category,
                description,
                photoUri: photo.uri,
                color: pinColor,
                timestamp: new Date().toISOString() 
              });

              await notifee.displayNotification({
                title: '🚨 Nuevo incidente reportado',
                body: `Tipo: ${category} — Ubicación: ${coords?.latitude.toFixed(3)}, ${coords?.longitude.toFixed(3)}`,
                android: {
                  channelId: 'ciudamos-alertas',
                  smallIcon: 'ic_launcher',
                  importance: AndroidImportance.HIGH,
                  pressAction: { id: 'default' },
                },
              });

              Alert.alert('Reporte Completo');

              setDescription('');
              setCategory('');
              setUrgency('');
              setPhoto(null);
              setShowUrgencyOptions(false);
              setShowCategoryOptions(false);
              navigation.goBack();
            }}
          >
            <Text style={styles.submitButtonText}>Subir reporte</Text>
          </TouchableOpacity>
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
    backgroundColor: '#fff',
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
    color: '#000',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 16,
    color: '#666',
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
    color: '#000',
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
    backgroundColor: '#fff',
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
    color: '#000',
    backgroundColor: '#fff',
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
