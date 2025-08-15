// src/services/ai.ts

export type AiAutofill = {
  categoria: "Seguridad" | "Movilidad" | "Infraestructura" | "Medio ambiente";
  gravedad: "Baja" | "Media" | "Alta";
  descripcion: string;
  confianza: number;
};

// En desarrollo con dispositivo físico usamos 127.0.0.1 (requiere adb reverse)
const API_BASE = __DEV__ ? "http://127.0.0.1:3333" : "https://TU-DOMINIO";

export async function analyzeReportImage(uri: string): Promise<AiAutofill> {
  const form = new FormData();
  form.append("image", {
    uri,
    name: "photo.jpg",
    type: "image/jpeg",
  } as any); // RN types

  const res = await fetch(`${API_BASE}/ai/analyze-report`, {
    method: "POST",
    body: form,
    headers: { Accept: "application/json" },
  });

  if (!res.ok) {
    const msg = await res.text();
    throw new Error(msg || `HTTP ${res.status}`);
  }
  return (await res.json()) as AiAutofill;
}
