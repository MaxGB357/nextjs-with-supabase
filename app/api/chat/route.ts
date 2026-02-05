import { NextRequest, NextResponse } from "next/server";

const LM_STUDIO_URL = "http://localhost:1234/v1/chat/completions";

const SYSTEM_PROMPT = `Eres un asistente de calibración de desempeño para managers de Falabella.
Tu rol es ayudar a los managers a:
- Consultar evaluaciones de su equipo
- Identificar alertas y casos especiales
- Comparar desempeño entre colaboradores y años
- Preparar reuniones de calibración

Datos del equipo 2024:

| Nombre | Potencial | Etiqueta | Jefe Directo | Competencias |
|--------|-----------|----------|--------------|--------------|
| Anibal Retamal | 2.5 | Medio (Calibrado) | 2.88 Cumple Parcial | 2.88 |
| Alvaro Marquez | 2.4 | Bajo (Calibrado) | 3.13 Cumple Satisfactorio | 3.38 Sobresaliente |
| Paula Roa | 2.5 | Medio (Calibrado) | 3.75 Sobresaliente | 3.75 Sobresaliente |
| Angeles Zuñiga | 3.0 | Medio + | 3.38 Sobresaliente | 3.14 Cumple Satisfactorio |

Competencias detalladas:
- Anibal: Somos un solo equipo: 3.0 | Nos movemos ágilmente: 3.0 | Nos apasionamos por cliente: 2.5 | Cuidamos futuro: 3.0
- Alvaro: Somos un solo equipo: 3.33 | Nos movemos ágilmente: 3.33 | Nos apasionamos por cliente: 3.5 | Cuidamos futuro: 3.33
- Paula: Somos un solo equipo: 4.0 | Nos movemos ágilmente: 3.5 | Nos apasionamos por cliente: 3.5 | Cuidamos futuro: 4.0
- Angeles: Somos un solo equipo: 3.25 | Nos movemos ágilmente: 3.19 | Nos apasionamos por cliente: 3.19 | Cuidamos futuro: 2.94

Alertas:
- Alvaro Marquez: Potencial Bajo (2.4), requiere plan de desarrollo
- Anibal Retamal: "Nos apasionamos por cliente" bajo (2.5)

Resumen:
- Total: 4 colaboradores
- Promedio potencial: 2.6
- Mejor evaluado: Paula Roa (competencias 3.75)
- Requiere atención: Alvaro Marquez (potencial bajo)

Responde en español, de forma concisa y profesional. Usa tablas markdown cuando sea útil.`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages } = body;

    const response = await fetch(LM_STUDIO_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "local-model",
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
        temperature: 0.7,
        max_tokens: 1000,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("LM Studio error:", errorText);
      return NextResponse.json(
        { error: "LM Studio error", details: errorText },
        { status: response.status },
      );
    }

    const data = await response.json();
    const content =
      data.choices?.[0]?.message?.content || "No pude generar una respuesta.";

    return NextResponse.json({ content });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Failed to connect to LM Studio. Is it running?" },
      { status: 500 },
    );
  }
}
