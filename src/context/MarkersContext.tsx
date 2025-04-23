// src/context/MarkersContext.tsx

import React, { createContext, useState, useEffect, ReactNode, FC } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Marker {
  id: string;
  latitude: number;
  longitude: number;
  title: string;
  description: string;
  photoUri?: string;
  color?: string;
}

interface MarkersContextData {
  markers: Marker[];
  addMarker: (marker: Marker) => void;
}

export const MarkersContext = createContext<MarkersContextData>({
  markers: [],
  addMarker: () => {},
});

interface Props { children: ReactNode; }
export const MarkersProvider: FC<Props> = ({ children }) => {
  const [markers, setMarkers] = useState<Marker[]>([]);

  // Clave para AsyncStorage
  const STORAGE_KEY = '@CiudamosMaps:markers';

  // 1) Al montar, carga los marcadores guardados
  useEffect(() => {
    (async () => {
      try {
        const json = await AsyncStorage.getItem(STORAGE_KEY);
        if (json) setMarkers(JSON.parse(json));
      } catch (err) {
        console.error('Error cargando marcadores de storage:', err);
      }
    })();
  }, []);

  // 2) Función que añade un marcador y lo persiste
  const addMarker = async (marker: Marker) => {
    const updated = [...markers, marker];
    setMarkers(updated);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (err) {
      console.error('Error guardando marcador en storage:', err);
    }
  };

  return (
    <MarkersContext.Provider value={{ markers, addMarker }}>
      {children}
    </MarkersContext.Provider>
  );
};