import pino from "pino";

// Security event types for structured logging
export type SecurityEventType =
  | "auth.signin"
  | "auth.signout"
  | "auth.failed"
  | "api.access"
  | "api.error"
  | "api.rate_limited"
  | "input.validation_failed"
  | "input.sanitized"
  | "quiz.created"
  | "quiz.deleted"
  | "ai.request"
  | "ai.response"
  | "ai.error";

// Create base logger with security-focused configuration
const baseLogger = pino({
  level: process.env.LOG_LEVEL || "info",
  // Redact sensitive fields from logs
  redact: {
    paths: [
      "password",
      "token",
      "apiKey",
      "secret",
      "authorization",
      "cookie",
      "access_token",
      "refresh_token",
      "id_token",
      "session_token",
      "studyMaterial", // May contain sensitive content
      "userAnswer", // Privacy
    ],
    censor: "[REDACTED]",
  },
  // Add timestamp and format
  timestamp: pino.stdTimeFunctions.isoTime,
  formatters: {
    level: (label) => ({ level: label }),
  },
  // Use pino-pretty in development
  transport:
    process.env.NODE_ENV === "development"
      ? {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "SYS:standard",
            ignore: "pid,hostname",
          },
        }
      : undefined,
});

// Security-focused logger wrapper
export const logger = {
  // Standard logging methods
  info: baseLogger.info.bind(baseLogger),
  warn: baseLogger.warn.bind(baseLogger),
  error: baseLogger.error.bind(baseLogger),
  debug: baseLogger.debug.bind(baseLogger),

  // Security event logging
  // Note: Pino automatically adds timestamp via stdTimeFunctions.isoTime
  security: (
    event: SecurityEventType,
    data: {
      userId?: string;
      ip?: string;
      userAgent?: string;
      path?: string;
      method?: string;
      statusCode?: number;
      message?: string;
      metadata?: Record<string, unknown>;
    }
  ) => {
    baseLogger.info({
      securityEvent: event,
      ...data,
    });
  },

  // Audit logging for compliance
  // Note: Pino automatically adds timestamp via stdTimeFunctions.isoTime
  audit: (
    action: string,
    data: {
      userId: string;
      resourceType: string;
      resourceId?: string;
      changes?: Record<string, unknown>;
    }
  ) => {
    baseLogger.info({
      audit: true,
      action,
      ...data,
    });
  },
};

// Helper to extract request context for logging
export function getRequestContext(request: Request) {
  const url = new URL(request.url);
  return {
    path: url.pathname,
    method: request.method,
    userAgent: request.headers.get("user-agent") || undefined,
    ip:
      request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      request.headers.get("x-real-ip") ||
      "unknown",
  };
}

export default logger;
