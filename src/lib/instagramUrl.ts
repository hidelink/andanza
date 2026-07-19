const INSTAGRAM_URL_PATTERN = /https?:\/\/(www\.)?instagram\.com\/[^\s"']+/;

export function extractInstagramUrl(text: string): string | null {
  const match = text.match(INSTAGRAM_URL_PATTERN);
  return match ? match[0] : null;
}
