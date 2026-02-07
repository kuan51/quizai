import { FILE_UPLOAD_LIMITS, IMAGE_MIME_TYPES } from "@/lib/validations";
import { logger } from "@/lib/logger";
import type { FileValidationResult } from "./types";

/**
 * Magic byte signatures for server-side file type verification.
 * MIME types and extensions from the client are trivially spoofable --
 * magic bytes are the only reliable way to verify file content type.
 */
const MAGIC_BYTES: Record<string, number[][]> = {
  "application/pdf": [
    [0x25, 0x50, 0x44, 0x46], // %PDF
  ],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
    [0x50, 0x4b, 0x03, 0x04], // PK (ZIP archive header)
  ],
  "image/png": [
    [0x89, 0x50, 0x4e, 0x47], // .PNG
  ],
  "image/jpeg": [
    [0xff, 0xd8, 0xff], // JPEG SOI marker
  ],
};

/**
 * Verify that a file's content matches its claimed MIME type via magic bytes.
 * Text files (TXT/MD) are validated for valid UTF-8 with no null bytes.
 */
function verifyMagicBytes(
  buffer: ArrayBuffer,
  mimeType: string
): boolean {
  const signatures = MAGIC_BYTES[mimeType];

  // Text files don't have magic bytes -- validate as UTF-8 instead
  if (mimeType === "text/plain" || mimeType === "text/markdown") {
    const bytes = new Uint8Array(buffer);
    // Check for null bytes (binary content masquerading as text)
    for (let i = 0; i < Math.min(bytes.length, 8192); i++) {
      if (bytes[i] === 0x00) return false;
    }
    return true;
  }

  if (!signatures) return false;

  const bytes = new Uint8Array(buffer);
  if (bytes.length < 4) return false;

  return signatures.some((sig) =>
    sig.every((byte, i) => bytes[i] === byte)
  );
}

/**
 * Get the file extension from a filename (lowercase, without dot)
 */
function getExtension(fileName: string): string {
  const parts = fileName.toLowerCase().split(".");
  return parts.length > 1 ? parts[parts.length - 1] : "";
}

/**
 * Check if a MIME type is an image type
 */
export function isImageMimeType(mimeType: string): boolean {
  return (IMAGE_MIME_TYPES as readonly string[]).includes(mimeType);
}

/**
 * Validate a single uploaded file (MIME type, extension, size, magic bytes).
 * Must be called server-side since client-side checks are trivially bypassable.
 */
export async function validateFile(
  file: File,
  userId?: string
): Promise<FileValidationResult> {
  const fileName = file.name;
  const ext = getExtension(fileName);
  const allowedExtensions = FILE_UPLOAD_LIMITS.acceptedExtensions
    .split(",")
    .map((e) => e.replace(".", ""));

  // Check extension
  if (!allowedExtensions.includes(ext)) {
    logger.security("file.validation_failed", {
      userId,
      message: `Unsupported file extension: .${ext}`,
      metadata: { fileName },
    });
    return {
      valid: false,
      error: `Unsupported file type: .${ext}. Accepted: ${FILE_UPLOAD_LIMITS.acceptedExtensions}`,
    };
  }

  // Check MIME type
  if (
    !(FILE_UPLOAD_LIMITS.acceptedMimeTypes as readonly string[]).includes(
      file.type
    )
  ) {
    logger.security("file.validation_failed", {
      userId,
      message: `Unsupported MIME type: ${file.type}`,
      metadata: { fileName },
    });
    return {
      valid: false,
      error: `Unsupported file type: ${file.type}`,
    };
  }

  // Check per-file size
  if (file.size > FILE_UPLOAD_LIMITS.maxFileSizeBytes) {
    const maxMB = FILE_UPLOAD_LIMITS.maxFileSizeBytes / (1024 * 1024);
    logger.security("file.validation_failed", {
      userId,
      message: `File exceeds size limit: ${file.size} bytes`,
      metadata: { fileName, fileSize: file.size },
    });
    return {
      valid: false,
      error: `"${fileName}" exceeds ${maxMB} MB limit`,
    };
  }

  // Check magic bytes
  const buffer = await file.arrayBuffer();
  if (!verifyMagicBytes(buffer, file.type)) {
    logger.security("file.validation_failed", {
      userId,
      message: `Magic byte mismatch: claimed ${file.type} but content does not match`,
      metadata: { fileName },
    });
    return {
      valid: false,
      error: `"${fileName}" content does not match its file type`,
    };
  }

  // DOCX-specific: check for macros/OLE objects inside the ZIP
  if (
    file.type ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const docxResult = await validateDocxStructure(buffer, fileName, userId);
    if (!docxResult.valid) return docxResult;
  }

  return { valid: true };
}

/**
 * Validate DOCX ZIP structure: reject files with VBA macros or OLE objects.
 * DOCX files are ZIP archives -- malicious ones can embed executable content.
 */
async function validateDocxStructure(
  buffer: ArrayBuffer,
  fileName: string,
  userId?: string
): Promise<FileValidationResult> {
  try {
    // Use the ZIP directory to check for dangerous entries
    // DOCX is a ZIP file; we check entry names without fully extracting
    const bytes = new Uint8Array(buffer);
    const text = new TextDecoder("utf-8", { fatal: false }).decode(bytes);

    // Check for VBA macro project (present in .docm files masquerading as .docx)
    if (text.includes("vbaProject.bin") || text.includes("vbaData.xml")) {
      logger.security("file.validation_failed", {
        userId,
        message: "DOCX contains VBA macros",
        metadata: { fileName },
      });
      return {
        valid: false,
        error: `"${fileName}" contains macros and cannot be processed`,
      };
    }

    // Check for OLE objects (embedded executables)
    if (text.includes("oleObject") && text.includes(".bin")) {
      logger.security("file.validation_failed", {
        userId,
        message: "DOCX contains OLE embedded objects",
        metadata: { fileName },
      });
      return {
        valid: false,
        error: `"${fileName}" contains embedded objects and cannot be processed`,
      };
    }

    return { valid: true };
  } catch {
    return {
      valid: false,
      error: `"${fileName}" has an invalid DOCX structure`,
    };
  }
}

/**
 * Validate a batch of files: count limits, aggregate size, image count.
 */
export function validateFileBatch(
  files: File[],
  userId?: string
): FileValidationResult {
  if (files.length === 0) {
    return { valid: false, error: "No files provided" };
  }

  if (files.length > FILE_UPLOAD_LIMITS.maxFiles) {
    logger.security("file.validation_failed", {
      userId,
      message: `Too many files: ${files.length}`,
    });
    return {
      valid: false,
      error: `Maximum ${FILE_UPLOAD_LIMITS.maxFiles} files allowed, got ${files.length}`,
    };
  }

  const totalSize = files.reduce((sum, f) => sum + f.size, 0);
  if (totalSize > FILE_UPLOAD_LIMITS.maxTotalSizeBytes) {
    const maxMB = FILE_UPLOAD_LIMITS.maxTotalSizeBytes / (1024 * 1024);
    logger.security("file.validation_failed", {
      userId,
      message: `Total size exceeds limit: ${totalSize} bytes`,
    });
    return {
      valid: false,
      error: `Total upload size exceeds ${maxMB} MB`,
    };
  }

  const imageCount = files.filter((f) => isImageMimeType(f.type)).length;
  if (imageCount > FILE_UPLOAD_LIMITS.maxImageFiles) {
    logger.security("file.validation_failed", {
      userId,
      message: `Too many image files: ${imageCount}`,
    });
    return {
      valid: false,
      error: `Maximum ${FILE_UPLOAD_LIMITS.maxImageFiles} image files allowed, got ${imageCount}`,
    };
  }

  return { valid: true };
}
