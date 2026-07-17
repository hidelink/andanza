export async function transcribeVideoUrl(videoUrl: string): Promise<string> {
  const form = new FormData();
  form.append("source_url", videoUrl);
  form.append("model_id", "scribe_v1");

  const response = await fetch("https://api.elevenlabs.io/v1/speech-to-text", {
    method: "POST",
    headers: {
      "xi-api-key": process.env.ELEVENLABS_API_KEY!,
    },
    body: form,
  });

  if (!response.ok) {
    throw new Error(`ElevenLabs transcription failed: ${response.status} ${await response.text()}`);
  }

  const data = await response.json();
  return data.text as string;
}
