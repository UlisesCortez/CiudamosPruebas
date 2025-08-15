import express from "express";
import cors from "cors";
import multer from "multer";
import "dotenv/config";
import OpenAI from "openai";

const app = express();
app.use(cors());

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 6 * 1024 * 1024 },
});

const openaiKey = process.env.OPENAI_API_KEY || "";
const openai = openaiKey ? new OpenAI({ apiKey: openaiKey }) : null;

// JSON Schema (solo el esquema)
const schema = {
  type: "object",
  additionalProperties: false,
  properties: {
    categoria: { type: "string", enum: ["Seguridad","Movilidad","Infraestructura","Medio ambiente"] },
    gravedad:  { type: "string", enum: ["Baja","Media","Alta"] },
    descripcion:{ type: "string", minLength: 12, maxLength: 240 },
    confianza:  { type: "number", minimum: 0, maximum: 1 }
  },
  required: ["categoria","gravedad","descripcion","confianza"]
};

const systemPrompt = `
Eres analista urbano de CIUDAMOS. Dada UNA foto, devuelve SOLO un JSON plano (sin texto extra) con las claves:
- "categoria": una de {"Infraestructura","Salubridad","Seguridad","Movilidad","Ambiente","Emergencias"}.
- "gravedad": una de {"Baja","Media","Alta"} según impacto/riesgo visible.
- "descripcion": 1 sola oración, clara y específica en español (≤140 caracteres) que incluya qué es, dónde/ubicación contextual y efecto/riesgo. Evita adjetivos vagos.
- "confianza": número entre 0 y 1 (1–2 decimales) que refleje seguridad del análisis.

Criterios de categoría:
- Infraestructura: baches, alcantarillas, banquetas, postes, daños viales/urbanos.
- Salubridad: basura, agua estancada, plagas, desechos, focos de infección.
- Seguridad: vandalismo, evidencia de delito/violencia, objetos peligrosos.
- Movilidad: choques, obstrucciones viales, semáforos fallando, tráfico detenido.
- Ambiente: humo/quema, tala, fauna herida, contaminación visible.
- Emergencias: incendio activo, inundación severa, accidente grave, personas heridas.

Reglas:
- No inventes: si hay ambigüedad, escoge la categoría más conservadora y baja "confianza".
- Nunca incluyas saltos de línea ni comentarios; solo JSON válido con esas 4 claves.
- No uses nombres propios ni datos personales.

Ejemplo de salida:
{"categoria":"Movilidad","gravedad":"Alta","descripcion":"Auto volcado bloquea carril derecho en avenida; riesgo de choque en cadena.","confianza":0.82}
`;


app.post("/ai/analyze-report", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "Falta imagen" });

    // MODO MOCK si no hay API key
    if (!openai) {
      return res.json({
        categoria: "Infraestructura",
        gravedad: "Media",
        descripcion: "Bache visible que afecta la circulación.",
        confianza: 0.45
      });
    }

    // Convierte imagen a data URL para visión
    const b64 = req.file.buffer.toString("base64");
    const dataUrl = `data:${req.file.mimetype};base64,${b64}`;

    // Responses API: text.format con json_schema y name obligatorio
    const r = await openai.responses.create({
      model: "gpt-4o-mini",
      temperature: 0.2,
      text: {
        format: {
          type: "json_schema",
          name: "AutofillReporte", // 👈 requerido
          schema,                  // 👈 tu JSON Schema
          strict: true             // 👈 validación estricta del schema
        }
      },
      input: [
        { role: "system", content: [{ type: "input_text", text: systemPrompt }] },
        {
          role: "user",
          content: [
            { type: "input_text", text: "Analiza la foto y devuelve SOLO el JSON solicitado." },
            { type: "input_image", image_url: dataUrl }
          ]
        }
      ]
    });

    const text = r.output_text; // respuesta como texto JSON válido
    return res.json(JSON.parse(text));

  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e?.message || "Error IA" });
  }
});

const PORT = process.env.PORT || 3333;
app.listen(PORT, () => console.log(`IA server en http://localhost:${PORT}`));
