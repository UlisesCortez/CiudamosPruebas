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
  timestamp: string;
}

interface MarkersContextData {
  markers: Marker[];
  addMarker: (marker: Marker) => void;
  removeMarker: (id: string) => void;   // ← Nuevo
  clearMarkers: () => void;
}

export const MarkersContext = createContext<MarkersContextData>({
  markers: [],
  addMarker: () => {},
  removeMarker: () => {},
  clearMarkers: () => {},
});

interface Props { children: ReactNode; }
export const MarkersProvider: FC<Props> = ({ children }) => {
  const [markers, setMarkers] = useState<Marker[]>([]);
  const STORAGE_KEY = '@CiudamosMaps:markers';

  useEffect(() => {
    (async () => {
      try {
        const json = await AsyncStorage.getItem(STORAGE_KEY);
        if (json) setMarkers(JSON.parse(json));
      } catch (err) {
        console.error('Error cargando marcadores:', err);
      }
    })();
  }, []);

  const persist = async (list: Marker[]) => {
    setMarkers(list);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (err) {
      console.error('Error guardando marcadores:', err);
    }
  };

  const addMarker = (marker: Marker) => {
    persist([...markers, marker]);
  };

  const removeMarker = (id: string) => {
    const filtered = markers.filter(m => m.id !== id);
    persist(filtered);
  };

  const clearMarkers = () => {
    persist([]);
  };

  return (
    <MarkersContext.Provider value={{ markers, addMarker, removeMarker, clearMarkers }}>
      {children}
    </MarkersContext.Provider>
  );
};
