import { NextResponse } from "next/server";

const VARS_TO_CHECK = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "ANTHROPIC_API_KEY",
  "GOOGLE_MAPS_API_KEY",
  "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY",
  "BRIGHT_DATA_API_TOKEN",
  "ELEVENLABS_API_KEY",
];

export async function GET() {
  const results = VARS_TO_CHECK.map((name) => {
    const value = process.env[name];
    if (value === undefined) return { name, status: "missing" };

    for (let i = 0; i < value.length; i++) {
      const code = value.charCodeAt(i);
      if (code > 255) {
        return {
          name,
          status: "bad-char",
          length: value.length,
          index: i,
          charCode: code,
          context: JSON.stringify(value.slice(Math.max(0, i - 5), i + 5)),
        };
      }
    }
    return { name, status: "ok", length: value.length };
  });

  return NextResponse.json(results);
}
