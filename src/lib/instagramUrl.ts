const INSTAGRAM_URL_PATTERN = /https?:\/\/(www\.)?instagram\.com\/[^\s"']+/;
const INSTAGRAM_SHORTCODE_PATTERN = /\/(?:p|reel|tv)\/([A-Za-z0-9_-]+)/;

export function extractInstagramUrl(text: string): string | null {
  const match = text.match(INSTAGRAM_URL_PATTERN);
  return match ? match[0] : null;
}

// Instagram has several equivalent URL shapes for the same post (/p/, /reel/,
// /tv/, with or without a username prefix, with or without tracking query
// params) — comparing raw URLs for duplicate detection misses that they're
// the same post, so we match on this shortcode instead.
export function extractInstagramShortcode(url: string): string | null {
  const match = url.match(INSTAGRAM_SHORTCODE_PATTERN);
  return match ? match[1] : null;
}
