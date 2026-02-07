import mammoth from "mammoth";

/**
 * Extract text from a DOCX file using mammoth.
 * IMPORTANT: mammoth must be >= 1.11.0 to fix CVE-2025-11849
 * (directory traversal via crafted r:link attributes).
 *
 * Extracts raw text (not HTML) and strips any residual markup.
 */
export async function extractFromDocx(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();

  const result = await mammoth.extractRawText({
    buffer: Buffer.from(buffer),
  });

  let text = result.value.trim();

  // Strip any residual HTML tags that might leak through
  text = text.replace(/<[^>]*>/g, "");

  // Strip suspicious data: URIs (potential data exfiltration from CVE)
  text = text.replace(/data:[^;]+;base64,[A-Za-z0-9+/=]+/g, "[removed]");

  if (text.length === 0) {
    throw new Error(
      `"${file.name}" contains no extractable text`
    );
  }

  // Log warnings from mammoth (e.g., unsupported features)
  if (result.messages.length > 0) {
    // Warnings are non-fatal, just informational
  }

  return text;
}
