export interface ExtractionResult {
  /** Concatenated text from all successfully extracted files */
  text: string;
  /** Number of files that extracted successfully */
  successCount: number;
  /** Number of files that failed extraction */
  failureCount: number;
  /** Details about each failed file */
  failures: Array<{ fileName: string; reason: string }>;
  /** Total character count of extracted text */
  totalCharacters: number;
}

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}
