import { extractText, getDocumentProxy } from "unpdf";

/** Maximum number of pages to extract from a single PDF */
const MAX_PAGES = 500;

/**
 * Extract text from a PDF file using unpdf.
 * unpdf wraps a current version of pdfjs-dist and does not execute
 * embedded JavaScript (unlike the unmaintained pdf-parse package).
 */
export async function extractFromPdf(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const pdf = await getDocumentProxy(new Uint8Array(buffer));

  if (pdf.numPages > MAX_PAGES) {
    throw new Error(
      `"${file.name}" has ${pdf.numPages} pages (maximum ${MAX_PAGES})`
    );
  }

  const { text } = await extractText(pdf, { mergePages: true });

  const cleaned = typeof text === "string" ? text.trim() : "";

  if (cleaned.length === 0) {
    throw new Error(
      `"${file.name}" contains no extractable text (it may be scanned/image-based)`
    );
  }

  return cleaned;
}
