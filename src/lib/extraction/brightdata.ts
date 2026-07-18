const DATASET_ID = "gd_lk5ns7kz21pck8jpis";
const BASE_URL = "https://api.brightdata.com/datasets/v3";

function authHeaders() {
  return {
    Authorization: `Bearer ${process.env.BRIGHT_DATA_API_TOKEN}`,
    "Content-Type": "application/json",
  };
}

export type InstagramPost = {
  description: string | null;
  hashtags: string[] | null;
  user_posted: string | null;
  location: string[] | null;
  location_details: { name?: string; lat?: number; lng?: number } | null;
  videos: string[] | null;
};

async function triggerScrape(url: string): Promise<string> {
  const response = await fetch(
    `${BASE_URL}/trigger?dataset_id=${DATASET_ID}&format=json`,
    {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ input: [{ url }] }),
    },
  );

  if (!response.ok) {
    throw new Error(`Bright Data trigger failed: ${response.status} ${await response.text()}`);
  }

  const data = await response.json();
  return data.snapshot_id as string;
}

async function waitForSnapshot(snapshotId: string): Promise<void> {
  // Budget capped so the scrape leaves room for transcription/structuring/geocoding
  // within the route's 60s Vercel function limit (see maxDuration in route.ts).
  const maxAttempts = 20;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const response = await fetch(`${BASE_URL}/progress/${snapshotId}`, {
      headers: authHeaders(),
    });
    const data = await response.json();

    if (data.status === "ready") return;
    if (data.status === "failed") {
      throw new Error(`Bright Data snapshot failed (snapshot_id: ${snapshotId}): ${JSON.stringify(data)}`);
    }

    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
  throw new Error(
    `Bright Data snapshot timed out (snapshot_id: ${snapshotId}) — revisa su estado en https://api.brightdata.com/datasets/v3/progress/${snapshotId}`,
  );
}

async function getSnapshot(snapshotId: string): Promise<InstagramPost> {
  const response = await fetch(`${BASE_URL}/snapshot/${snapshotId}?format=json`, {
    headers: authHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Bright Data snapshot fetch failed: ${response.status}`);
  }

  const data = await response.json();
  const post = Array.isArray(data) ? data[0] : data;
  if (!post) throw new Error("Bright Data returned no results for this URL");
  return post as InstagramPost;
}

export async function scrapeInstagramPost(url: string): Promise<InstagramPost> {
  const snapshotId = await triggerScrape(url);
  await waitForSnapshot(snapshotId);
  return getSnapshot(snapshotId);
}
