import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

export async function labelItineraryDays(
  days: { day: number; placeNames: string[] }[],
): Promise<Record<number, string>> {
  if (days.length === 0) return {};

  const prompt = `Estos son los lugares agrupados por día de un itinerario de viaje, agrupados por cercanía geográfica. Para cada día, da un título corto (2 a 4 palabras) que describa la zona o el tema del día, en español.

${days.map((d) => `Día ${d.day}: ${d.placeNames.join(", ")}`).join("\n")}`;

  const response = await client.messages.create({
    model: "claude-opus-4-8",
    max_tokens: 512,
    output_config: {
      format: {
        type: "json_schema",
        schema: {
          type: "object",
          properties: {
            days: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  day: { type: "integer" },
                  title: { type: "string" },
                },
                required: ["day", "title"],
                additionalProperties: false,
              },
            },
          },
          required: ["days"],
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

  const parsed = JSON.parse(block.text) as { days: { day: number; title: string }[] };
  const map: Record<number, string> = {};
  for (const d of parsed.days) map[d.day] = d.title;
  return map;
}
