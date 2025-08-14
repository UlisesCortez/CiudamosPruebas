// src/screens/ReportScreen.tsx
import React, { useEffect, useState, useContext, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Image,
  ScrollView,
  Alert,
  Platform,
  KeyboardAvoidingView,
  Pressable,
} from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useNavigation, useRoute } from '@react-navigation/native';
import notifee, { AndroidImportance } from '@notifee/react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { MarkersContext, Marker as ReportMarker } from '../context/MarkersContext';
// Tipos opcionales
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../presentation/navigator/RootNavigator';
import type { Asset } from 'react-native-image-picker';

const UI = {
  bg: '#F4F7FC',
  card: '#FFFFFF',
  muted: '#6B7280',
  border: '#E7E9ED',
  primary: '#0AC5C5',
  text: '#0D1313',
};

// Si tu Root define 'Reportar', mantenlo
type ReportNav   = NativeStackNavigationProp<RootStackParamList, 'Reportar'>;
type ReportRoute = RouteProp<RootStackParamList, 'Reportar'>;

const ReportScreen: React.FC = () => {
  const { markers, addMarker } = useContext(MarkersContext);
  const navigation = useNavigation<ReportNav>();
  const route = useRoute<ReportRoute>();
  const insets = useSafeAreaInsets();

  // ----- MODO -----
  // imageUri → modo Crear;  markerId → modo Detalle
  const imageUri = (route?.params as any)?.imageUri as string | undefined;
  const markerId = (route?.params as any)?.markerId as string | undefined;

  const markerFromList = useMemo<ReportMarker | undefined>(
    () => (markerId ? markers.find(m => String(m.id) === String(markerId)) : undefined),
    [markerId, markers]
  );
  const isDetail = !!markerFromList;

  // ----- STATE -----
  const [description, setDescription] = useState<string>(markerFromList?.description ?? '');
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(
    markerFromList ? { latitude: markerFromList.latitude, longitude: markerFromList.longitude } : null
  );
  const [urgency, setUrgency] = useState(''); // opcional
  const [category, setCategory] = useState<string>(markerFromList?.title ?? '');
  const [showUrgencyOptions, setShowUrgencyOptions] = useState(false);
  const [showCategoryOptions, setShowCategoryOptions] = useState(false);
  const [photo, setPhoto] = useState<Asset | { uri: string } | null>(
    imageUri ? { uri: imageUri } : markerFromList?.photoUri ? { uri: markerFromList.photoUri } : null
  );

  // Colores del pin en el mapa según urgencia (para modo crear)
  const getPinColor = (level: string): string => {
    switch (level) {
      case 'Alta':  return '#EF4444';
      case 'Media': return '#F59E0B';
      case 'Baja':  return '#10B981';
      default:      return UI.primary;
    }
  };

  // Posición actual (solo si no venimos de un marker existente)
  useEffect(() => {
    if (isDetail) return;
    Geolocation.getCurrentPosition(
      ({ coords }) => setCoords({ latitude: coords.latitude, longitude: coords.longitude }),
      (error) => console.error('Error obteniendo coordenadas:', error),
      { enableHighAccuracy: true }
    );
  }, [isDetail]);

  // Canal de notificaciones (Android) solo si vas a crear
  useEffect(() => {
    const bootstrap = async () => {
      if (!isDetail && Platform.OS === 'android') {
        await notifee.requestPermission();
        await notifee.createChannel({
          id: 'ciudamos-alertas',
          name: 'Alertas de incidentes',
          importance: AndroidImportance.HIGH,
        });
      }
    };
    bootstrap();
  }, [isDetail]);

  const canSubmit = !!photo && !!category && !!coords && !isDetail;

  const handleSubmit = async () => {
    if (!canSubmit || !coords) return;

    addMarker({
      id: Date.now().toString(),
      latitude: coords.latitude,
      longitude: coords.longitude,
      title: category || 'Incidente',
      description,
      photoUri: (photo as any)?.uri,
      color: getPinColor(urgency),
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
    navigation.goBack();
  };

  return (
    <SafeAreaView style={[styles.safe, { paddingBottom: insets.bottom || 8 }]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
      >
        <View style={styles.container}>
          <ScrollView
            contentContainerStyle={{ paddingBottom: isDetail ? 24 : 140 }} // espacio para footer solo en crear
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.headerBlock}>
              <Text style={styles.title}>
                {isDetail ? 'Detalle del reporte' : 'Reportar Incidente'}
              </Text>
              <Text style={styles.subtitle}>
                {isDetail ? 'Consulta la información del incidente' : 'Completa los siguientes datos'}
              </Text>
            </View>

            {/* MAPA + UBICACIÓN */}
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
                    <Marker coordinate={coords} title={isDetail ? category || 'Reporte' : 'Mi ubicación'} />
                  </MapView>
                </View>

                <View style={styles.locBox}>
                  <Text style={styles.sectionLabel}>Ubicación</Text>
                  <Text style={styles.locText}>Latitud: {coords.latitude.toFixed(6)}</Text>
                  <Text style={styles.locText}>Longitud: {coords.longitude.toFixed(6)}</Text>
                </View>
              </View>
            )}

            {/* CATEGORÍA */}
            <View style={styles.fieldBlock}>
              <Text style={styles.sectionLabel}>Categoría</Text>

              {isDetail ? (
                <View style={[styles.input, styles.readonly]}>
                  <Text style={styles.inputText}>{category || '—'}</Text>
                </View>
              ) : (
                <>
                  <Pressable
                    onPress={() => setShowCategoryOptions((s) => !s)}
                    style={[styles.input, styles.rowBetween]}
                  >
                    <Text style={[styles.inputText, !category && styles.placeholder]}>
                      {category || 'Selecciona categoría'}
                    </Text>
                    <Text style={styles.chevron}>▾</Text>
                  </Pressable>

                  {showCategoryOptions && (
                    <View style={styles.menu}>
                      {['Seguridad', 'Infraestructura', 'Ambiente'].map((cat) => (
                        <Pressable
                          key={cat}
                          onPress={() => {
                            setCategory(cat);
                            setShowCategoryOptions(false);
                          }}
                          style={({ pressed }) => [styles.menuItem, pressed && { opacity: 0.7 }]}
                        >
                          <Text style={styles.menuText}>{cat}</Text>
                        </Pressable>
                      ))}
                    </View>
                  )}
                </>
              )}
            </View>

            {/* URGENCIA (solo en crear) */}
            {!isDetail && (
              <View style={styles.fieldBlock}>
                <Text style={styles.sectionLabel}>Nivel de urgencia</Text>

                <Pressable
                  onPress={() => setShowUrgencyOptions((s) => !s)}
                  style={[styles.input, styles.rowBetween]}
                >
                  <Text style={[styles.inputText, !urgency && styles.placeholder]}>
                    {urgency || 'Selecciona urgencia'}
                  </Text>
                  <Text style={styles.chevron}>▾</Text>
                </Pressable>

                {showUrgencyOptions && (
                  <View style={styles.menu}>
                    {['Alta', 'Media', 'Baja'].map((opt) => (
                      <Pressable
                        key={opt}
                        onPress={() => {
                          setUrgency(opt);
                          setShowUrgencyOptions(false);
                        }}
                        style={({ pressed }) => [styles.menuItem, pressed && { opacity: 0.7 }]}
                      >
                        <View style={[styles.dot, { backgroundColor: getPinColor(opt) }]} />
                        <Text style={styles.menuText}>{opt}</Text>
                      </Pressable>
                    ))}
                  </View>
                )}
              </View>
            )}

            {/* DETALLES */}
            <Text style={styles.sectionLabel}>Detalles</Text>
            {isDetail ? (
              <View style={[styles.input, styles.readonly, { minHeight: 80 }]}>
                <Text style={[styles.inputText, { lineHeight: 20 }]}>
                  {description || '—'}
                </Text>
              </View>
            ) : (
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholderTextColor={UI.muted}
                placeholder="Escribe detalles del incidente..."
                multiline
                numberOfLines={4}
                value={description}
                onChangeText={setDescription}
              />
            )}

            {/* FOTO */}
            {photo && (
              <View style={styles.card}>
                <Text style={[styles.sectionLabel, { marginBottom: 10 }]}>Foto</Text>
                <Image
                  source={{ uri: (photo as any).uri }}
                  style={styles.previewImage}
                  resizeMode="cover"
                />
              </View>
            )}
          </ScrollView>

          {/* FOOTER (solo modo crear) */}
          {!isDetail && (
            <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 10) }]}>
              <Pressable
                onPress={() => navigation.goBack()}
                style={({ pressed }) => [styles.btnOutline, pressed && { opacity: 0.85 }]}
                hitSlop={6}
              >
                <Text style={styles.btnOutlineText}>Cancelar</Text>
              </Pressable>

              <Pressable
                onPress={handleSubmit}
                disabled={!canSubmit}
                style={({ pressed }) => [
                  styles.btnPrimary,
                  !canSubmit && { opacity: 0.5 },
                  pressed && canSubmit && { opacity: 0.9 },
                ]}
                hitSlop={6}
              >
                <Text style={styles.btnPrimaryText}>Subir reporte</Text>
              </Pressable>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ReportScreen;

/* -------------------------------- Styles -------------------------------- */

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: UI.bg,
  },
  container: {
    flex: 1,
    backgroundColor: UI.bg,
    paddingHorizontal: 16,
    paddingTop: 8,
  },

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
  readonly: {
    opacity: 0.95,
  },
  inputText: { color: UI.text, fontSize: 16 },
  placeholder: { color: UI.muted },

  textArea: {
    minHeight: 120,
    textAlignVertical: 'top',
  },

  menu: {
    backgroundColor: UI.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: UI.border,
    borderRadius: 12,
    marginTop: 8,
    overflow: 'hidden',
  },
  menuItem: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: UI.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  menuText: { color: UI.text, fontSize: 16 },
  dot: { width: 10, height: 10, borderRadius: 5 },

  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  chevron: { color: UI.muted, fontSize: 16 },

  previewImage: {
    width: '100%',
    height: 220,
    borderRadius: 12,
    backgroundColor: '#EAEAEA',
  },

  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingTop: 10,
    backgroundColor: 'rgba(244,247,252,0.96)',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: UI.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  btnOutline: {
    flex: 1,
    backgroundColor: UI.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: UI.border,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
  },
  btnOutlineText: {
    color: UI.text,
    fontWeight: '800',
  },
  btnPrimary: {
    flex: 1,
    backgroundColor: UI.primary,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
  },
  btnPrimaryText: {
    color: '#fff',
    fontWeight: '900',
    letterSpacing: 0.2,
  },
});
