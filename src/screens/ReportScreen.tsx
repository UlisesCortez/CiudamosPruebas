// src/screens/ReportScreen.tsx
import React, { useEffect, useState, useContext, useMemo, useCallback } from 'react';
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
  ActivityIndicator,
} from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useNavigation, useRoute } from '@react-navigation/native';
import notifee, { AndroidImportance } from '@notifee/react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { launchImageLibrary } from 'react-native-image-picker';

import { analyzeReportImage, AiAutofill } from '../services/ai';

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

// Categorías canónicas de REPORTE
const REPORT_CATEGORIES = [
  'Infraestructura',
  'Salubridad',
  'Seguridad',
  'Movilidad',
  'Ambiente',
  'Emergencias',
] as const;
type ReportCategory = typeof REPORT_CATEGORIES[number];

// Normaliza cualquier string de la IA a nuestras categorías canónicas
const normalizeCategory = (raw?: string): ReportCategory | '' => {
  if (!raw) return '';
  const s = raw.trim().toLowerCase();

  // mapas rápidos por palabra clave/sinónimos (agrega más si lo necesitas)
  if (/(infra|bache|banqueta|alcantarilla|poste|pavimento|coladera)/.test(s)) return 'Infraestructura';
  if (/(salubr|salud|higien|basura|residu|plaga)/.test(s)) return 'Salubridad';
  if (/(seguri|robo|vandal|violenc|sospech|delito|asalt)/.test(s)) return 'Seguridad';
  if (/(movil|tr[aá]fico|transit|transpor|sema[fó|fo]ro|estacionamiento|v[ií]a)/.test(s)) return 'Movilidad';
  if (/(ambiente|medio ambiente|ecol|contamina|smog|ruido|arbol|fauna)/.test(s)) return 'Ambiente';
  if (/(emergen|incend|choque|acciden|inund|siniestro|auxilio)/.test(s)) return 'Emergencias';

  // match exacto por si viene ya “bien”
  const exact = REPORT_CATEGORIES.find(c => c.toLowerCase() === s);
  if (exact) return exact;

  // mapeos directos comunes
  const map: Record<string, ReportCategory> = {
    'medio ambiente': 'Ambiente',
    'environment': 'Ambiente',
    'security': 'Seguridad',
    'mobility': 'Movilidad',
    'infrastructure': 'Infraestructura',
    'emergency': 'Emergencias',
    'emergencia': 'Emergencias',
    'health': 'Salubridad',
  };
  if (map[s as keyof typeof map]) return map[s as keyof typeof map];

  return ''; // si no estamos seguros, no autoseleccionamos
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
  const [urgency, setUrgency] = useState(''); // Alta | Media | Baja
  const [category, setCategory] = useState<string>(markerFromList?.title ?? '');
  const [showUrgencyOptions, setShowUrgencyOptions] = useState(false);
  const [showCategoryOptions, setShowCategoryOptions] = useState(false);
  const [photo, setPhoto] = useState<Asset | { uri: string } | null>(
    imageUri ? { uri: imageUri } : markerFromList?.photoUri ? { uri: markerFromList.photoUri } : null
  );

  // IA
  const [aiLoading, setAiLoading] = useState(false);
  const [aiConfidence, setAiConfidence] = useState<number | null>(null);

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

  // Elegir/Cambiar foto (solo crear)
  const onPickImage = useCallback(async () => {
    if (isDetail) return;
    const res = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.9,
      selectionLimit: 1,
    });
    const uri = res.assets?.[0]?.uri;
    if (!uri) return;
    setPhoto({ uri });
  }, [isDetail]);

  // Cuando hay foto (y no es detalle), llama a la IA para autollenar
  useEffect(() => {
    const runAI = async () => {
      if (isDetail || !photo?.uri) return;
      try {
        setAiLoading(true);
        // Llama a tu backend de IA
        const ai: AiAutofill = await analyzeReportImage(photo.uri);

        // Autollenar campos usando normalización a 6 categorías
        const canon = normalizeCategory(ai.categoria);
        if (canon) setCategory(canon);
        setUrgency(ai.gravedad); // "Alta" | "Media" | "Baja"

        // Si ya había texto del usuario, no lo pisamos; si estaba vacío, usamos el de IA
        setDescription(prev => (prev?.trim()?.length ? prev : ai.descripcion));
        setAiConfidence(ai.confianza);

        if (ai.confianza < 0.55) {
          Alert.alert(
            'Revisa los datos',
            'La confianza de la IA es baja. Ajusta categoría o descripción si es necesario.'
          );
        }
      } catch (e: any) {
        console.error('IA error:', e?.message || e);
        Alert.alert('Error de IA', e?.message ?? 'No se pudo analizar la imagen.');
      } finally {
        setAiLoading(false);
      }
    };
    runAI();
  }, [photo?.uri, isDetail]);

  const canSubmit = !!photo && !!category && !!coords && !isDetail;

  const handleSubmit = async () => {
    if (!canSubmit || !coords) return;

// src/screens/ReportScreen.tsx  (fragmento donde confirmas el reporte)
addMarker({
  id: Date.now().toString(),
  title: category,               // ⬅️ usa aquí tu estado real de tipo/categoría
  description: description.trim(),
  latitude: coords.latitude,
  longitude: coords.longitude,
  photoUri: imageUri ?? undefined,
  timestamp: new Date().toISOString(), // evita “Invalid Date”
  status: 'NUEVO',                     // “Enviado”
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
                    style={[styles.input, styles.rowBetween, aiLoading && { opacity: 0.6 }]}
                    disabled={aiLoading}
                  >
                    <Text style={[styles.inputText, !category && styles.placeholder]}>
                      {category || 'Selecciona categoría'}
                    </Text>
                    <Text style={styles.chevron}>▾</Text>
                  </Pressable>

                  {showCategoryOptions && (
                    <View style={styles.menu}>
                      {REPORT_CATEGORIES.map((cat) => (
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
                  style={[styles.input, styles.rowBetween, aiLoading && { opacity: 0.6 }]}
                  disabled={aiLoading}
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
                style={[styles.input, styles.textArea, aiLoading && { opacity: 0.7 }]}
                placeholderTextColor={UI.muted}
                placeholder="Escribe detalles del incidente..."
                multiline
                numberOfLines={4}
                value={description}
                onChangeText={setDescription}
                editable={!aiLoading}
              />
            )}

            {/* FOTO */}
            <View style={styles.card}>
              <View style={[styles.rowBetween, { marginBottom: 10 }]}>
                <Text style={styles.sectionLabel}>Foto</Text>
                {!isDetail && (
                  <Pressable
                    onPress={onPickImage}
                    style={({ pressed }) => [
                      styles.btnChip,
                      pressed && { opacity: 0.85 },
                      aiLoading && { opacity: 0.6 },
                    ]}
                    disabled={aiLoading}
                    hitSlop={6}
                  >
                    <Text style={styles.btnChipText}>{photo ? 'Cambiar foto' : 'Elegir foto'}</Text>
                  </Pressable>
                )}
              </View>

              {photo ? (
                <>
                  <Image
                    source={{ uri: (photo as any).uri }}
                    style={styles.previewImage}
                    resizeMode="cover"
                  />
                  {!!aiConfidence && (
                    <Text style={styles.aiHint}>
                      Sugerido por IA · Confianza: {aiConfidence.toFixed(2)}
                    </Text>
                  )}
                  {aiLoading && (
                    <View style={styles.aiOverlay}>
                      <ActivityIndicator size="large" />
                      <Text style={{ color: UI.muted, marginTop: 6 }}>Analizando imagen…</Text>
                    </View>
                  )}
                </>
              ) : (
                !isDetail && (
                  <Text style={{ color: UI.muted }}>
                    Agrega una foto para habilitar el autollenado con IA.
                  </Text>
                )
              )}
            </View>
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
                disabled={!canSubmit || aiLoading}
                style={({ pressed }) => [
                  styles.btnPrimary,
                  (!canSubmit || aiLoading) && { opacity: 0.5 },
                  pressed && canSubmit && !aiLoading && { opacity: 0.9 },
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

  aiHint: {
    marginTop: 8,
    color: UI.muted,
    fontSize: 12,
  },
  aiOverlay: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
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
  btnChip: {
    backgroundColor: UI.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: UI.border,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  btnChipText: {
    color: UI.text,
    fontWeight: '700',
  },
});
