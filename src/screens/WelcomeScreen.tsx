import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text,Image, PermissionsAndroid, Platform, ActivityIndicator } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import ButtonReportAccidents from '../presentation/components/ui/ButtonReportAccident';
import ProfileCircle from '../presentation/components/ui/ProfileCircle';
import BottonMenu from '../presentation/components/ui/ButtonMenu';


const WelcomeScreen = () => {
  const [region, setRegion] = useState<Region | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const requestLocationPermission = async () => {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Permiso de ubicación',
            message: 'La app necesita acceder a tu ubicación.',
            buttonPositive: 'Aceptar',
          }
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) return;
      }

      // Obtener ubicación inmediatamente
      Geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setRegion({
            latitude,
            longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          });
          setLoading(false);
        },
        (error) => {
          console.error('Error al obtener ubicación inicial:', error);
          setLoading(false);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );

      const watchId = Geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setRegion({
            latitude,
            longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          });
        },
        (error) => console.error('Error de actualización de ubicación:', error),
        { enableHighAccuracy: true, distanceFilter: 10, interval: 5000, fastestInterval: 2000 }
      );

      return () => Geolocation.clearWatch(watchId);
    };

    requestLocationPermission();
  }, []);

  return (
    <View style={styles.container}>
      {region ? (
        <MapView
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          region={region}
          showsUserLocation
        >
          <Marker coordinate={region} title="Tú encuentras aquí" />

        </MapView>

        
      ) : (
        <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
      )}
      
      <ProfileCircle />
      
      <View style={styles.floatingButton}>
        <ButtonReportAccidents navigateTo='Report'/>
      </View>

      <View  style={styles.floatingButtonMenu} >
      <BottonMenu navigateTo='Menu' />
      </View>



    </View>
  );
};

export default WelcomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  floatingButton: {
    position: 'absolute',
    top: '85%',
    alignSelf: 'center',
  },

  floatingButtonMenu: {
    position: 'absolute',
    top: '3%',
    left:'5%',
  },
  
});
