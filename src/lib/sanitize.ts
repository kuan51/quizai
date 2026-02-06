import { logger } from "./logger";

/**
 * Patterns that may indicate prompt injection attempts
 * These patterns try to manipulate AI behavior
 */
const INJECTION_PATTERNS = [
  // Instruction override attempts
  /ignore\s+(all\s+)?(previous|above|prior)\s+(instructions?|prompts?|rules?)/gi,
  /disregard\s+(all\s+)?(previous|above|prior)/gi,
  /forget\s+(everything|all|what)/gi,
  // System/role manipulation
  /you\s+are\s+(now|actually|really)\s+a/gi,
  /act\s+as\s+(if\s+you\s+are|a)/gi,
  /pretend\s+(to\s+be|you\s+are)/gi,
  /your\s+(new\s+)?role\s+is/gi,
  /switch\s+(to|into)\s+(a\s+)?(new\s+)?mode/gi,
  // Direct injection markers
  /\[system\]/gi,
  /\[instruction\]/gi,
  /\[admin\]/gi,
  /<system>/gi,
  /<instruction>/gi,
  /```system/gi,
  // Output manipulation
  /output\s+only/gi,
  /respond\s+with\s+only/gi,
  /return\s+(only|just)\s+the/gi,
  // JSON/format manipulation
  /return\s+this\s+(exact\s+)?json/gi,
  /output\s+this\s+(exact\s+)?json/gi,
];

/**
 * Characters that could be used to break out of quoted contexts
 * or hide malicious content
 */
const ESCAPE_SEQUENCES = [
  /\\n\\n/g, // Escaped newlines that might be interpreted
  /\x00/g, // Null bytes
  /\x1b/g, // Escape characters
  // Zero-width characters that can hide content
  /[\u200B-\u200D\u2060\uFEFF]/g, // Zero-width space, joiner, non-joiner, word joiner, BOM
  /[\u2028\u2029]/g, // Line/paragraph separators (can break parsing)
  /[\u202A-\u202E]/g, // Bidirectional text control characters
  /[\u2066-\u2069]/g, // Bidirectional isolate characters
];

interface SanitizationResult {
  text: string;
  wasModified: boolean;
  patternsDetected: string[];
}

/**
 * Sanitize user input before including in AI prompts
 * OWASP A03:2021 - Injection Prevention
 */
export function sanitizeForPrompt(
  input: string,
  options: {
    maxLength?: number;
    userId?: string;
  } = {}
): SanitizationResult {
  const { maxLength = 50000, userId } = options;
  const patternsDetected: string[] = [];
  let text = input;
  let wasModified = false;

  // 1. Truncate to max length
  if (text.length > maxLength) {
    text = text.substring(0, maxLength);
    wasModified = true;
    patternsDetected.push("length_exceeded");
  }

  // 2. Remove null bytes and escape sequences
  for (const pattern of ESCAPE_SEQUENCES) {
    if (pattern.test(text)) {
      text = text.replace(pattern, "");
      wasModified = true;
      patternsDetected.push("escape_sequence");
    }
  }

  // 3. Detect and neutralize injection patterns
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(text)) {
      // Don't remove, but wrap in a way that's clearly user content
      // This preserves the text while making it clear it's data, not instructions
      patternsDetected.push(pattern.source.substring(0, 30));
    }
    // Reset lastIndex for global patterns
    pattern.lastIndex = 0;
  }

  // 3b. Actively neutralize dangerous injection patterns
  const injectionPatternsFound = patternsDetected.filter(
    (p) => !["length_exceeded", "escape_sequence", "excessive_newlines"].includes(p)
  );

  if (injectionPatternsFound.length > 0) {
    // Strip system/instruction marker patterns that attempt to break prompt boundaries
    text = text.replace(/\[(system|instruction|admin)\]/gi, "[blocked]");
    text = text.replace(/<(system|instruction)>/gi, "[blocked]");
    text = text.replace(/```system/gi, "```blocked");
    wasModified = true;
  }

  // 4. Normalize whitespace (remove excessive newlines that might break formatting)
  const normalizedText = text.replace(/\n{4,}/g, "\n\n\n");
  if (normalizedText !== text) {
    text = normalizedText;
    wasModified = true;
    patternsDetected.push("excessive_newlines");
  }

  // Log if suspicious patterns detected
  if (patternsDetected.length > 0) {
    logger.security("input.sanitized", {
      userId,
      message: "Potentially malicious input patterns detected",
      metadata: {
        patternsDetected,
        inputLength: input.length,
        outputLength: text.length,
      },
    });
  }

  return {
    text,
    wasModified,
    patternsDetected,
  };
}

/**
 * Validate that AI response matches expected structure
 * Prevents AI from being manipulated into returning malicious content
 */
export function validateQuizResponse(response: unknown): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!response || typeof response !== "object") {
    errors.push("Response must be an object");
    return { valid: false, errors };
  }

  const resp = response as Record<string, unknown>;

  // Validate title
  if (typeof resp.title !== "string") {
    errors.push("Missing or invalid title");
  } else if (resp.title.length > 500) {
    errors.push("Title exceeds maximum length");
  }

  // Validate questions array
  if (!Array.isArray(resp.questions)) {
    errors.push("Missing or invalid questions array");
    return { valid: false, errors };
  }

  if (resp.questions.length === 0) {
    errors.push("Questions array is empty");
  }

  if (resp.questions.length > 100) {
    errors.push("Too many questions");
  }

  // Validate each question
  const validTypes = [
    "multiple_choice",
    "essay",
    "short_answer",
    "true_false",
    "select_all",
  ];

  for (let i = 0; i < Math.min(resp.questions.length, 100); i++) {
    const q = resp.questions[i] as Record<string, unknown>;

    if (!q || typeof q !== "object") {
      errors.push(`Question ${i} is not an object`);
      continue;
    }

    if (typeof q.type !== "string" || !validTypes.includes(q.type)) {
      errors.push(`Question ${i} has invalid type`);
    }

    if (typeof q.content !== "string" || q.content.length === 0) {
      errors.push(`Question ${i} has missing or empty content`);
    }

    if (q.content && (q.content as string).length > 5000) {
      errors.push(`Question ${i} content exceeds maximum length`);
    }

    if (q.correctAnswer === undefined || q.correctAnswer === null) {
      errors.push(`Question ${i} has no correct answer`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Safely parse JSON with error handling
 */
export function safeJsonParse<T>(
  text: string,
  fallback: T
): { data: T; error?: string } {
  try {
    return { data: JSON.parse(text) as T };
  } catch (e) {
    return {
      data: fallback,
      error: e instanceof Error ? e.message : "JSON parse error",
    };
  }
}
