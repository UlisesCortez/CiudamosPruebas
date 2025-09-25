// src/context/MarkersContext.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useEffect, useState } from 'react';
import type { ReportStatus } from '../types/type';

export type Marker = {
  id: string;
  latitude: number;
  longitude: number;
  title: string;        // categoría o título corto
  description?: string;
  photoUri?: string;
  color?: string;
  timestamp?: string;

  // NUEVO: para flujo de autoridad
  status?: ReportStatus; // 'NUEVO' | 'VISTO' | 'EN_PROCESO' | 'FINALIZADO'
  area?: string;         // área de autoridad (ej. 'Infraestructura')
  evidenceUri?: string;  // foto de evidencia cuando finaliza la autoridad
};

type Ctx = {
  markers: Marker[];
  addMarker: (m: Marker) => void;
  removeMarker: (id: string) => void;
  clearMarkers: () => void;
  updateMarker: (id: string, patch: Partial<Marker>) => void; // NUEVO
};

export const MarkersContext = createContext<Ctx>({
  markers: [],
  addMarker: () => {},
  removeMarker: () => {},
  clearMarkers: () => {},
  updateMarker: () => {},
});

const STORAGE_KEY = '@CiudamosMaps:markers';

export const MarkersProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [markers, setMarkers] = useState<Marker[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed: Marker[] = JSON.parse(raw);
          setMarkers(parsed);
        }
      } catch (e) {
        console.error('Error leyendo markers:', e);
      }
    })();
  }, []);

  const persist = async (list: Marker[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      console.error('Error guardando markers:', e);
    }
  };

  const addMarker = (m: Marker) => {
    const list = [m, ...markers];
    setMarkers(list);
    persist(list);
  };

  const removeMarker = (id: string) => {
    const list = markers.filter(x => x.id !== id);
    setMarkers(list);
    persist(list);
  };

  const clearMarkers = () => {
    setMarkers([]);
    persist([]);
  };

  const updateMarker = (id: string, patch: Partial<Marker>) => {
    const list = markers.map(m => (m.id === id ? { ...m, ...patch } : m));
    setMarkers(list);
    persist(list);
  };

  return (
    <MarkersContext.Provider
      value={{ markers, addMarker, removeMarker, clearMarkers, updateMarker }}
    >
      {children}
    </MarkersContext.Provider>
  );
};
