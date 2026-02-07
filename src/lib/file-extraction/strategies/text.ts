/**
 * Extract text from TXT and MD files.
 * Reads as UTF-8 string and strips null bytes.
 */
export async function extractFromText(file: File): Promise<string> {
  const text = await file.text();

  // Strip any null bytes that slipped past validation
  const cleaned = text.replace(/\0/g, "");

  if (cleaned.trim().length === 0) {
    throw new Error(`"${file.name}" is empty or contains no readable text`);
  }

  return cleaned;
}
