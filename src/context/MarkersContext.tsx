// src/context/MarkersContext.tsx

import React, { createContext, useState, useEffect, ReactNode, FC } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Extiende tu tipo Marker para incluir timestamp
export interface Marker {
  id: string;
  latitude: number;
  longitude: number;
  title: string;
  description: string;
  photoUri?: string;
  color?: string;
  timestamp: number;       // <-- hora en ms desde 1970
}

// El addMarker ahora recibe todo excepto timestamp
type NewMarker = Omit<Marker, 'timestamp'>;

interface MarkersContextData {
  markers: Marker[];
  addMarker: (marker: NewMarker) => void;
}

export const MarkersContext = createContext<MarkersContextData>({
  markers: [],
  addMarker: () => {},
});

interface Props { children: ReactNode; }
export const MarkersProvider: FC<Props> = ({ children }) => {
  const [markers, setMarkers] = useState<Marker[]>([]);

  const STORAGE_KEY = '@CiudamosMaps:markers';

  // Al montar, carga marcadores del storage
  useEffect(() => {
    (async () => {
      try {
        const json = await AsyncStorage.getItem(STORAGE_KEY);
        if (json) {
          const stored: Marker[] = JSON.parse(json);
          setMarkers(stored);
        }
      } catch (err) {
        console.error('Error cargando marcadores de storage:', err);
      }
    })();
  }, []);

  // Añade timestamp y persiste
  const addMarker = async (markerData: NewMarker) => {
    const newMarker: Marker = {
      ...markerData,
      timestamp: Date.now(), 
    };
    const updated = [...markers, newMarker];
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
