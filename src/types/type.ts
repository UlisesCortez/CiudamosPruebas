// src/types.ts
export type ReportStatus = 'NUEVO' | 'VISTO' | 'EN_PROCESO' | 'FINALIZADO';

export interface UserAuth {
  id: string;
  nombre: string;
  email: string;
  role: 'ciudadano' | 'autoridad';
  authorityAreas?: string[]; // p.ej.: ['Infraestructura', 'Seguridad']
}

// Mapea categoría -> área de autoridad (ajústalo a tu lógica real)
export const categoryToArea = (category: string): string => (category || '').trim();
