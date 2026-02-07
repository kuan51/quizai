import { sanitizeForPrompt } from "@/lib/sanitize";
import { logger } from "@/lib/logger";
import type { AIProvider } from "@/types";
import type { ExtractionResult } from "./types";
import { validateFile, isImageMimeType } from "./validation";
import { extractFromPdf } from "./strategies/pdf";
import { extractFromDocx } from "./strategies/docx";
import { extractFromText } from "./strategies/text";
import { extractFromImage } from "./strategies/image";

export type { ExtractionResult } from "./types";
export { validateFile, validateFileBatch, isImageMimeType } from "./validation";

/** Timeout per file for local extraction (PDF, DOCX, TXT) */
const LOCAL_TIMEOUT_MS = 15_000;
/** Timeout per file for AI vision extraction (images) */
const IMAGE_TIMEOUT_MS = 30_000;
/** Maximum combined text length (matches sanitizeForPrompt maxLength) */
const MAX_COMBINED_TEXT_LENGTH = 50_000;

/**
 * Extract text from a batch of files.
 *
 * Non-image files (PDF, DOCX, TXT) are processed in parallel since they are
 * CPU-bound local operations. Image files are processed sequentially after
 * because they hit the AI vision API and must respect rate limits.
 *
 * Each file's extracted text is individually sanitized via sanitizeForPrompt()
 * before concatenation, defending against cross-file prompt injection.
 *
 * Partial failure strategy: if some files fail but others succeed and
 * total text >= 50 chars, the result is usable. The caller decides
 * whether to proceed based on successCount and totalCharacters.
 */
export async function extractTextFromFiles(
  files: File[],
  options: { aiProvider?: AIProvider; userId?: string } = {}
): Promise<ExtractionResult> {
  const { aiProvider, userId } = options;
  const segments: string[] = [];
  const failures: ExtractionResult["failures"] = [];
  let successCount = 0;

  logger.security("file.upload_started", {
    userId,
    message: `Processing ${files.length} files`,
    metadata: {
      fileCount: files.length,
      totalSize: files.reduce((sum, f) => sum + f.size, 0),
      fileTypes: files.map((f) => f.type),
    },
  });

  // Partition files: non-images can run in parallel, images must be sequential
  const nonImageFiles = files.filter((f) => !isImageMimeType(f.type));
  const imageFiles = files.filter((f) => isImageMimeType(f.type));

  // Helper to process a single file (validate, extract, sanitize)
  async function processFile(file: File): Promise<
    | { status: "success"; segment: string }
    | { status: "failure"; fileName: string; reason: string }
  > {
    try {
      const validation = await validateFile(file, userId);
      if (!validation.valid) {
        return { status: "failure", fileName: file.name, reason: validation.error! };
      }

      const timeoutMs = isImageMimeType(file.type) ? IMAGE_TIMEOUT_MS : LOCAL_TIMEOUT_MS;

      const rawText = await withTimeout(
        extractSingleFile(file, aiProvider),
        timeoutMs,
        `"${file.name}" extraction timed out after ${timeoutMs / 1000}s`
      );

      const sanitized = sanitizeForPrompt(rawText, {
        maxLength: MAX_COMBINED_TEXT_LENGTH,
        userId,
      });

      return {
        status: "success",
        segment: `--- ${sanitizeFileName(file.name)} ---\n\n${sanitized.text}`,
      };
    } catch (err) {
      const reason = err instanceof Error ? err.message : "Unknown extraction error";
      logger.security("file.extraction_failed", {
        userId,
        message: `Failed to extract text from "${file.name}"`,
        metadata: { fileName: file.name, reason },
      });
      return { status: "failure", fileName: file.name, reason };
    }
  }

  // Process non-image files in parallel
  const nonImageResults = await Promise.allSettled(
    nonImageFiles.map((file) => processFile(file))
  );

  for (const result of nonImageResults) {
    const value = result.status === "fulfilled" ? result.value : {
      status: "failure" as const,
      fileName: "unknown",
      reason: result.status === "rejected" ? String(result.reason) : "Unknown error",
    };
    if (value.status === "success") {
      segments.push(value.segment);
      successCount++;
    } else {
      failures.push({ fileName: value.fileName, reason: value.reason });
    }
  }

  // Process image files sequentially (AI API rate limits)
  for (const file of imageFiles) {
    const result = await processFile(file);
    if (result.status === "success") {
      segments.push(result.segment);
      successCount++;
    } else {
      failures.push({ fileName: result.fileName, reason: result.reason });
    }
  }

  // Concatenate all segments
  let combinedText = segments.join("\n\n");

  // Enforce total length limit
  if (combinedText.length > MAX_COMBINED_TEXT_LENGTH) {
    combinedText = combinedText.substring(0, MAX_COMBINED_TEXT_LENGTH);
  }

  logger.security("file.extraction_complete", {
    userId,
    message: `Extraction complete: ${successCount} succeeded, ${failures.length} failed`,
    metadata: {
      successCount,
      failureCount: failures.length,
      totalCharacters: combinedText.length,
    },
  });

  return {
    text: combinedText,
    successCount,
    failureCount: failures.length,
    failures,
    totalCharacters: combinedText.length,
  };
}

/**
 * Route a single file to the appropriate extraction strategy based on MIME type.
 */
async function extractSingleFile(
  file: File,
  aiProvider?: AIProvider
): Promise<string> {
  switch (file.type) {
    case "application/pdf":
      return extractFromPdf(file);

    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      return extractFromDocx(file);

    case "text/plain":
    case "text/markdown":
      return extractFromText(file);

    case "image/png":
    case "image/jpeg":
      return extractFromImage(file, aiProvider);

    default:
      throw new Error(`Unsupported file type: ${file.type}`);
  }
}

/**
 * Wrap a promise with a timeout. Rejects if the promise doesn't resolve in time.
 */
function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  message: string
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(message)), ms)
    ),
  ]);
}

/**
 * Sanitize a filename for safe inclusion in text output.
 * Strips path components and limits length to prevent log/text injection.
 */
function sanitizeFileName(name: string): string {
  // Remove path separators
  const baseName = name.replace(/[/\\]/g, "_");
  // Limit length
  return baseName.length > 100 ? baseName.substring(0, 100) + "..." : baseName;
}
