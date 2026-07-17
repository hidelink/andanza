import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

export type StructuredPlace = {
  name: string;
  description: string;
  locationStatus: "confirmed" | "inferred";
  geocodeQuery: string;
};

export async function structurePlace(input: {
  caption: string | null;
  transcript: string | null;
  locationTag: string | null;
}): Promise<StructuredPlace> {
  const prompt = `Un usuario guardó un reel de Instagram sobre un lugar que quiere visitar. Extrae la información del lugar a partir de estos datos.

Descripción/caption del post:
${input.caption ?? "(sin descripción)"}

Transcripción del audio narrado por el autor:
${input.transcript ?? "(sin narración)"}

Ubicación tageada en el post por Instagram:
${input.locationTag ?? "(sin ubicación tageada)"}

Responde en español.`;

  const response = await client.messages.create({
    model: "claude-opus-4-8",
    max_tokens: 1024,
    output_config: {
      format: {
        type: "json_schema",
        schema: {
          type: "object",
          properties: {
            name: {
              type: "string",
              description: "Nombre conciso y específico del lugar o punto de interés mencionado",
            },
            description: {
              type: "string",
              description:
                "Resumen de 2 a 4 oraciones combinando por qué vale la pena, tips prácticos y detalles mencionados en la descripción o narración",
            },
            location_status: {
              type: "string",
              enum: ["confirmed", "inferred"],
              description:
                "confirmed solo si la ubicación tageada nombra el lugar/punto específico en sí (no solo una ciudad, región o país); en cualquier otro caso, inferred",
            },
            geocode_query: {
              type: "string",
              description:
                "La mejor dirección o descripción de búsqueda posible para geocodificar este lugar en Google Maps, combinando el nombre del lugar con la ciudad/región/país mencionados en la descripción, narración o ubicación tageada (ej. 'Cañón del Volcán Malacara, Malargüe, Mendoza, Argentina'). Sé lo más específico posible con la información disponible.",
            },
          },
          required: ["name", "description", "location_status", "geocode_query"],
          additionalProperties: false,
        },
      },
    },
    messages: [{ role: "user", content: prompt }],
  });

  const block = response.content[0];
  if (block.type !== "text") {
    throw new Error("Unexpected response format from Claude");
  }

  const parsed = JSON.parse(block.text);
  return {
    name: parsed.name,
    description: parsed.description,
    locationStatus: parsed.location_status,
    geocodeQuery: parsed.geocode_query,
  };
}
